/**
 * POST /api/remove-bg
 *
 * Removes the background from an uploaded image using a locally-running
 * ISNet / U2-Net ONNX model via @imgly/background-removal-node.
 * No external API key or network call is required — inference runs entirely
 * on this server.  The ONNX model weights (~40 MB) are downloaded once on the
 * first request and cached automatically by the library.
 */

import { NextRequest, NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";

// Force the Node.js runtime (not the Edge runtime) so that native ONNX
// bindings and the file-system model cache work correctly.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  /* ── 1. Parse the incoming image ──────────────────────────────────────── */
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data." }, { status: 400 });
  }

  const image = formData.get("image");
  if (!image || !(image instanceof Blob)) {
    return NextResponse.json({ error: "Field 'image' is missing or not a file." }, { status: 400 });
  }

  /* ── 2. Run background removal (ONNX inference, fully local) ───────────── */
  let resultBlob: Blob;
  try {
    resultBlob = await removeBackground(image, {
      // "large" uses the highest-quality model weights available.
      model: "large",
      output: {
        format: "image/png",
        quality: 1,
      },
    });
  } catch (err) {
    console.error("[remove-bg] inference error:", err);
    const message = err instanceof Error ? err.message : "Inference failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  /* ── 3. Stream the transparent PNG back to the client ─────────────────── */
  const buffer = await resultBlob.arrayBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
