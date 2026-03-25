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
 * Find the column count that fills each row completely (no wasted slots).
 * Prefers more columns (fewer rows) to match landscape orientation.
 */
function bestColumns(quantity: number, maxCols: number): number {
  let best = Math.min(quantity, maxCols);
  let bestWaste = Infinity;

  for (let cols = Math.min(quantity, maxCols); cols >= 1; cols--) {
    const rows = Math.ceil(quantity / cols);
    const waste = cols * rows - quantity;
    if (waste < bestWaste) {
      bestWaste = waste;
      best = cols;
    }
    if (waste === 0) break; // perfect fit found — prefer highest cols (we iterate high→low)
  }
  return best;
}

export function createInitialLayout(
  quantity: number,
  paper: PaperDimensions,
  margin: number
): LayoutItem[] {
  if (quantity <= 0) return [];

  const safeMargin = Math.max(MIN_PRINT_MARGIN, margin);
  const innerWidth = paper.width - safeMargin * 2;
  const { width, height } = PASSPORT_SIZE;

  const maxCols = Math.max(1, Math.floor((innerWidth + SHEET_GAP) / (width + SHEET_GAP)));
  const cols = bestColumns(quantity, maxCols);

  // Center the photo grid horizontally on the paper
  const gridWidth = cols * width + (cols - 1) * SHEET_GAP;
  const startX = (paper.width - gridWidth) / 2;
  const startY = safeMargin;

  return Array.from({ length: quantity }, (_, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      id: `photo-${index + 1}`,
      x: startX + col * (width + SHEET_GAP),
      y: startY + row * (height + SHEET_GAP),
      width,
      height,
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
