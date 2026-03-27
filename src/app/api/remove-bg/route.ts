import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// ─── Colour helpers ────────────────────────────────────────────────────────────

function colorDist(
  r1: number, g1: number, b1: number,
  r2: number, g2: number, b2: number
): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Sample background colour by averaging pixels from the image borders.
 * Passport backgrounds are always a solid colour (white / blue / grey),
 * so border pixels reliably represent the background.
 */
function sampleBackgroundColor(
  data: Buffer,
  width: number,
  height: number
): [number, number, number] {
  let r = 0, g = 0, b = 0, count = 0;

  const sample = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    r += data[i]; g += data[i + 1]; b += data[i + 2];
    count++;
  };

  // Top and bottom rows
  for (let x = 0; x < width; x++) {
    sample(x, 0);
    sample(x, height - 1);
  }
  // Left and right columns (skip corners already counted)
  for (let y = 1; y < height - 1; y++) {
    sample(0, y);
    sample(width - 1, y);
  }

  return [r / count, g / count, b / count];
}

// ─── Flood-fill from all 4 edges ──────────────────────────────────────────────

/**
 * Returns a Uint8Array (1 = background, 0 = foreground).
 * Seeds from every edge pixel and expands inward as long as the pixel colour
 * is within `tolerance` of the sampled background colour.
 */
function floodFillMask(
  data: Buffer,
  width: number,
  height: number,
  bg: [number, number, number],
  tolerance: number
): Uint8Array {
  const total = width * height;
  const visited = new Uint8Array(total);
  const mask    = new Uint8Array(total);

  // Use an explicit stack to avoid call-stack overflow on large images
  const stack: number[] = [];

  const enqueue = (idx: number) => {
    if (idx >= 0 && idx < total && !visited[idx]) {
      visited[idx] = 1;
      stack.push(idx);
    }
  };

  // Seed all 4 edges
  for (let x = 0; x < width; x++) {
    enqueue(x);                       // top row
    enqueue((height - 1) * width + x); // bottom row
  }
  for (let y = 1; y < height - 1; y++) {
    enqueue(y * width);               // left col
    enqueue(y * width + (width - 1)); // right col
  }

  while (stack.length > 0) {
    const idx = stack.pop()!;
    const pi  = idx * 4;
    const [br, bg2, bb] = bg;

    if (colorDist(data[pi], data[pi + 1], data[pi + 2], br, bg2, bb) > tolerance) {
      continue; // foreground — don't expand
    }

    mask[idx] = 1;
    const x = idx % width;
    const y = (idx - x) / width;

    if (x > 0)           enqueue(idx - 1);
    if (x < width - 1)   enqueue(idx + 1);
    if (y > 0)           enqueue(idx - width);
    if (y < height - 1)  enqueue(idx + width);
  }

  return mask;
}

// ─── Edge feathering ──────────────────────────────────────────────────────────

/**
 * Soften the hard mask edge by a 1-pixel erosion then a linear blend
 * for pixels on the boundary, reducing harsh jagged outlines.
 */
function featherMask(
  mask: Uint8Array,
  width: number,
  height: number
): Uint8Array {
  const alpha = new Uint8Array(mask.length);

  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) { alpha[i] = 255; continue; } // foreground: fully opaque

    // Check if any 4-connected neighbour is foreground
    const x = i % width;
    const y = (i - x) / width;
    const hasNeighbourFg =
      (x > 0           && !mask[i - 1]) ||
      (x < width - 1   && !mask[i + 1]) ||
      (y > 0           && !mask[i - width]) ||
      (y < height - 1  && !mask[i + width]);

    alpha[i] = hasNeighbourFg ? 128 : 0; // boundary → semi-transparent
  }

  return alpha;
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const image = formData.get("image");
  if (!image || !(image instanceof Blob)) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  try {
    const inputBuffer = Buffer.from(await image.arrayBuffer());

    // Decode to raw RGBA
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height } = info;
    const pixels = Buffer.from(data);

    // 1. Detect background colour from image borders
    const bgColor = sampleBackgroundColor(pixels, width, height);

    // 2. Flood-fill from edges to mark background
    //    Tolerance ~45 works well for clean passport backgrounds.
    //    Raise if the background isn't fully transparent; lower to protect detail.
    const TOLERANCE = 45;
    const mask = floodFillMask(pixels, width, height, bgColor, TOLERANCE);

    // 3. Feather the mask edge for a softer look
    const alpha = featherMask(mask, width, height);

    // 4. Apply the computed alpha channel
    for (let i = 0; i < width * height; i++) {
      pixels[i * 4 + 3] = alpha[i];
    }

    // 5. Encode as PNG (supports transparency)
    const result = await sharp(pixels, {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer();

    return new NextResponse(new Uint8Array(result), {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
