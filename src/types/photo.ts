export type PaperSize = "A3" | "A4" | "A5" | "A6" | "Letter" | "Legal" | "4R";
export type PaperOrientation = "portrait" | "landscape";

export interface LayoutItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  imageOffsetX: number;
  imageOffsetY: number;
}

export interface PaperDimensions {
  width: number;
  height: number;
}

export interface PrintSettings {
  quantity: number;
  showBorder: boolean;
  borderColor: string;
  borderWidth: number;
  paperSize: PaperSize;
  orientation: PaperOrientation;
  margin: number;
}

export interface CropSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
