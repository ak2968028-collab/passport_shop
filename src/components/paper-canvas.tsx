"use client";

import { CropSettings, LayoutItem, PaperDimensions } from "@/types/photo";

interface PaperCanvasProps {
  imageUrl: string | null;
  items: LayoutItem[];
  paper: PaperDimensions;
  orientation: "portrait" | "landscape";
  crop: CropSettings;
  borderColor: string;
  borderWidth: number;
}

export function PaperCanvas({
  imageUrl,
  items,
  paper,
  orientation,
  crop,
  borderColor,
  borderWidth
}: PaperCanvasProps) {
  return (
    <div className="paper-stage">
      <div
        className={`paper-sheet ${orientation === "landscape" ? "landscape" : ""}`}
      >
        <div className="paper-guides" />
        {items.map((item) => (
          <div
            key={item.id}
            className="photo-card"
            style={{
              left: `${(item.x / paper.width) * 100}%`,
              top: `${(item.y / paper.height) * 100}%`,
              width: `${(item.width / paper.width) * 100}%`,
              height: `${(item.height / paper.height) * 100}%`
            }}
          >
            {imageUrl ? (
              <div className="photo-image-wrap">
                <img
                  alt={`Passport print ${item.id}`}
                  src={imageUrl}
                  style={{
                    ...getCropImageStyle(crop)
                  }}
                />
              </div>
            ) : null}
            {borderWidth > 0 && imageUrl ? (
              <div
                className="photo-border"
                style={{
                  borderColor,
                  borderWidth: `${borderWidth}px`
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function getCropImageStyle(crop: CropSettings) {
  const visibleWidth = Math.max(20, 100 - crop.left - crop.right);
  const visibleHeight = Math.max(20, 100 - crop.top - crop.bottom);
  const width = 10000 / visibleWidth;
  const height = 10000 / visibleHeight;
  const left = (-crop.left / visibleWidth) * 100;
  const top = (-crop.top / visibleHeight) * 100;

  return {
    width: `${width}%`,
    height: `${height}%`,
    left: `${left}%`,
    top: `${top}%`
  };
}
