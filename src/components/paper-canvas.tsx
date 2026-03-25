"use client";

import { useEffect, useRef, useState } from "react";
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
  const stageRef = useRef<HTMLDivElement>(null);
  const [fitSize, setFitSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const compute = (stageW: number, stageH: number) => {
      // Desktop: paper-stage is content-sized so stageH is circular — let CSS handle it
      if (window.innerWidth > 720) {
        setFitSize(null);
        return;
      }
      if (stageW <= 0 || stageH <= 0) return;

      const isLandscape = orientation === "landscape";
      const ratio = isLandscape ? 1123 / 794 : 794 / 1123;
      const pad = 10;
      const aw = stageW - pad;
      const ah = stageH - pad;

      // Fit by width first; if too tall, fit by height instead
      const byWidth = { width: aw, height: aw / ratio };
      const size = byWidth.height <= ah
        ? byWidth
        : { width: ah * ratio, height: ah };

      setFitSize({
        width: Math.floor(size.width),
        height: Math.floor(size.height)
      });
    };

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      compute(width, height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [orientation]);

  return (
    <div ref={stageRef} className="paper-stage">
      <div
        className={`paper-sheet ${orientation === "landscape" ? "landscape" : ""}`}
        style={fitSize ? { width: fitSize.width, height: fitSize.height } : undefined}
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
                  style={{ ...getCropImageStyle(crop) }}
                />
              </div>
            ) : null}
            {borderWidth > 0 && imageUrl ? (
              <div
                className="photo-border"
                style={{ borderColor, borderWidth: `${borderWidth}px` }}
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
