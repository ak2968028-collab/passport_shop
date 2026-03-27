import {
  LayoutItem,
  PaperDimensions,
  PaperOrientation,
  PaperSize
} from "@/types/photo";

// All sizes in portrait orientation (width × height) at 96 dpi
const PAPER_PRESETS: Record<PaperSize, PaperDimensions> = {
  A3:     { width: 1123, height: 1587 }, // 297 × 420 mm
  A4:     { width: 794,  height: 1123 }, // 210 × 297 mm
  A5:     { width: 559,  height: 794  }, // 148 × 210 mm
  A6:     { width: 397,  height: 559  }, // 105 × 148 mm
  Letter: { width: 816,  height: 1056 }, // 8.5 × 11 in
  Legal:  { width: 816,  height: 1344 }, // 8.5 × 14 in
  "4R":   { width: 384,  height: 576  }, // 4 × 6 in
};

const SHEET_GAP = 8;
const MIN_PRINT_MARGIN = 0.13 * 96;

// Standard passport size: 3.5 × 4.5 cm at 96 dpi (35 × 45 mm)
// Recommended image upload resolution: 630 × 810 px (≈ 457 dpi)
const PASSPORT_SIZE = { width: 132, height: 170 };

export function getPaperDimensions(
  paperSize: PaperSize,
  orientation: PaperOrientation
): PaperDimensions {
  const base = PAPER_PRESETS[paperSize];
  return orientation === "portrait"
    ? base
    : { width: base.height, height: base.width };
}

/**
 * Find the largest divisor of `quantity` in the 3–6 column range.
 * This keeps all rows equal and avoids very wide or very narrow grids.
 *
 * Results for preset quantities:
 *   4 → 4 cols (1 row)   6 → 6 cols (1 row)
 *   8 → 4 cols (2 rows)  10 → 5 cols (2 rows)
 *  12 → 6 cols (2 rows)  16 → 4 cols (4 rows)
 *  20 → 5 cols (4 rows)
 */
function balancedCols(quantity: number): number {
  for (let cols = 6; cols >= 3; cols--) {
    if (quantity % cols === 0) return cols;
  }
  // Fallback for primes / unusual numbers
  return Math.min(quantity, 4);
}

export function createInitialLayout(
  quantity: number,
  paper: PaperDimensions,
  margin: number
): LayoutItem[] {
  if (quantity <= 0) return [];

  const safeMargin = Math.max(MIN_PRINT_MARGIN, margin);
  const innerWidth  = paper.width - safeMargin * 2;

  const cols = balancedCols(quantity);

  // Scale photo width so `cols` photos always fit in innerWidth.
  // If standard size already fits, no scaling happens (min keeps it at PASSPORT_SIZE.width).
  const scaledW  = Math.floor((innerWidth - (cols - 1) * SHEET_GAP) / cols);
  const photoW   = Math.min(PASSPORT_SIZE.width, scaledW);
  const photoH   = Math.round(photoW * PASSPORT_SIZE.height / PASSPORT_SIZE.width);

  const startX = safeMargin;
  const startY = safeMargin;

  return Array.from({ length: quantity }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      id: `photo-${index + 1}`,
      x: startX + col * (photoW + SHEET_GAP),
      y: startY + row * (photoH + SHEET_GAP),
      width:  photoW,
      height: photoH,
      imageOffsetX: 50,
      imageOffsetY: 50
    };
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampOffset(value: number) {
  return clamp(value, 0, 100);
}
