import {
  LayoutItem,
  PaperDimensions,
  PaperOrientation,
  PaperSize
} from "@/types/photo";

const PAPER_PRESETS: Record<PaperSize, PaperDimensions> = {
  A4: { width: 794, height: 1123 },
  Letter: { width: 816, height: 1056 }
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

export function createInitialLayout(
  quantity: number,
  paper: PaperDimensions,
  margin: number
): LayoutItem[] {
  if (quantity <= 0) {
    return [];
  }

  const safeMargin = Math.max(MIN_PRINT_MARGIN, margin);
  const innerWidth = paper.width - safeMargin * 2;
  const { width, height } = PASSPORT_SIZE;
  const columns = Math.max(1, Math.floor((innerWidth + SHEET_GAP) / (width + SHEET_GAP)));
  const startX = safeMargin;
  const startY = safeMargin;

  return Array.from({ length: quantity }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);

    return {
      id: `photo-${index + 1}`,
      x: startX + column * (width + SHEET_GAP),
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
