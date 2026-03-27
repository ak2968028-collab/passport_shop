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

// 3.5 × 4.5 cm at 96 dpi  (35 × 45 mm = standard passport size)
// Image upload resolution recommendation: 630 × 810 px ≈ 457 dpi
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

function maxColsForPaper(paper: PaperDimensions, safeMargin: number): number {
  const inner = paper.width - safeMargin * 2;
  return Math.max(1, Math.floor((inner + SHEET_GAP) / (PASSPORT_SIZE.width + SHEET_GAP)));
}

/**
 * Return the largest divisor of `quantity` that is ≤ maxCols.
 * Produces equal-row layouts: 8 → 4 cols (4+4), 6 → 6 (single row),
 * 10 → 5 (5+5), 12 → 6 (6+6), etc.
 */
function bestColumns(quantity: number, maxCols: number): number {
  for (let cols = Math.min(quantity, maxCols); cols >= 1; cols--) {
    if (quantity % cols === 0) return cols;
  }
  return 1;
}

/**
 * Choose portrait unless the photos would fill exactly one row on landscape
 * but overflow portrait — i.e. landscape is the only way to get a single row.
 * Example: 6 photos on A4 → portrait maxCols=5, landscape maxCols=7 → landscape.
 *          8 photos on A4 → landscape maxCols=7 < 8 → stays portrait (4+4).
 */
export function getOptimalOrientation(
  quantity: number,
  paperSize: PaperSize,
  margin: number
): PaperOrientation {
  const safeMargin = Math.max(MIN_PRINT_MARGIN, margin);
  const portrait  = getPaperDimensions(paperSize, "portrait");
  const landscape = getPaperDimensions(paperSize, "landscape");
  const maxP = maxColsForPaper(portrait,  safeMargin);
  const maxL = maxColsForPaper(landscape, safeMargin);
  return (quantity > maxP && quantity <= maxL) ? "landscape" : "portrait";
}

export function createInitialLayout(
  quantity: number,
  paper: PaperDimensions,
  margin: number
): LayoutItem[] {
  if (quantity <= 0) return [];

  const safeMargin = Math.max(MIN_PRINT_MARGIN, margin);
  const { width, height } = PASSPORT_SIZE;

  const maxCols = maxColsForPaper(paper, safeMargin);
  const cols    = bestColumns(quantity, maxCols);

  const startX = safeMargin;
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
