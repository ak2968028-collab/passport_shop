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
  onMoveItem: (id: string, x: number, y: number) => void;
}

interface DragState {
  id: string;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startItemX: number;
  startItemY: number;
}

export function PaperCanvas({
  imageUrl,
  items,
  paper,
  orientation,
  crop,
  borderColor,
  borderWidth,
  onMoveItem
}: PaperCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [fitSize, setFitSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const compute = (stageW: number, stageH: number) => {
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

  function getPaperScale() {
    const el = paperRef.current;
    if (!el) return { sx: 1, sy: 1 };
    const rect = el.getBoundingClientRect();
    return {
      sx: paper.width / rect.width,
      sy: paper.height / rect.height
    };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, item: LayoutItem) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      id: item.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startItemX: item.x,
      startItemY: item.y
    };
    setDraggingId(item.id);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || !e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const { sx, sy } = getPaperScale();
    const dx = (e.clientX - drag.startClientX) * sx;
    const dy = (e.clientY - drag.startClientY) * sy;
    onMoveItem(drag.id, drag.startItemX + dx, drag.startItemY + dy);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragRef.current = null;
    setDraggingId(null);
  }

  return (
    <div ref={stageRef} className="paper-stage">
      <div
        ref={paperRef}
        className={`paper-sheet ${orientation === "landscape" ? "landscape" : ""}`}
        style={{
          "--pw": `${(paper.width  / 96 * 25.4).toFixed(2)}mm`,
          "--ph": `${(paper.height / 96 * 25.4).toFixed(2)}mm`,
          ...(fitSize ? { width: fitSize.width, height: fitSize.height } : {})
        } as React.CSSProperties}
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
              height: `${(item.height / paper.height) * 100}%`,
              cursor: draggingId === item.id ? "grabbing" : "grab",
              touchAction: "none"
            }}
            onPointerDown={(e) => handlePointerDown(e, item)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
