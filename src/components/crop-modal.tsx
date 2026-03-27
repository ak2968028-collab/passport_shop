"use client";

import { useRef } from "react";
import { CropSettings } from "@/types/photo";

interface CropModalProps {
  imageUrl: string;
  isOpen: boolean;
  crop: CropSettings;
  onChange: (crop: CropSettings) => void;
  onClose: () => void;
}

export function CropModal({
  imageUrl,
  isOpen,
  crop,
  onChange,
  onClose
}: CropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const boxLeft = crop.left;
  const boxTop = crop.top;
  const boxRight = 100 - crop.right;
  const boxBottom = 100 - crop.bottom;
  const midX = (boxLeft + boxRight) / 2;
  const midY = (boxTop + boxBottom) / 2;

  function makeHandleEvents(side: keyof CropSettings) {
    return {
      onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.setPointerCapture(e.pointerId);
      },
      onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = containerRef.current!.getBoundingClientRect();
        const x = clampPct((e.clientX - rect.left) / rect.width * 100);
        const y = clampPct((e.clientY - rect.top) / rect.height * 100);
        const next = { ...crop };
        if (side === "left")   next.left   = clampCrop(x);
        if (side === "right")  next.right  = clampCrop(100 - x);
        if (side === "top")    next.top    = clampCrop(y);
        if (side === "bottom") next.bottom = clampCrop(100 - y);
        onChange(next);
      },
      onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    };
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="crop-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Crop photo"
      >
        <div className="crop-modal-header">
          <div>
            <h2>Crop photo</h2>
            <p>Drag the edges to crop. All passport prints use this crop.</p>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div ref={containerRef} className="crop-drag-container">
          <img
            alt="Crop preview"
            src={imageUrl}
            className="crop-drag-image"
            draggable={false}
          />

          {/* Dark overlay outside crop area */}
          <div className="crop-overlay" style={{ top: 0, left: 0, right: 0, height: `${boxTop}%` }} />
          <div className="crop-overlay" style={{ top: `${boxBottom}%`, left: 0, right: 0, bottom: 0 }} />
          <div className="crop-overlay" style={{ top: `${boxTop}%`, left: 0, width: `${boxLeft}%`, height: `${boxBottom - boxTop}%` }} />
          <div className="crop-overlay" style={{ top: `${boxTop}%`, left: `${boxRight}%`, right: 0, height: `${boxBottom - boxTop}%` }} />

          {/* Crop box border */}
          <div
            className="crop-box"
            style={{
              left: `${boxLeft}%`,
              top: `${boxTop}%`,
              right: `${crop.right}%`,
              bottom: `${crop.bottom}%`
            }}
          />

          {/* Edge handles */}
          <div
            className="crop-handle"
            style={{ left: `${midX}%`, top: `${boxTop}%`, cursor: "ns-resize" }}
            {...makeHandleEvents("top")}
          />
          <div
            className="crop-handle"
            style={{ left: `${midX}%`, top: `${boxBottom}%`, cursor: "ns-resize" }}
            {...makeHandleEvents("bottom")}
          />
          <div
            className="crop-handle"
            style={{ left: `${boxLeft}%`, top: `${midY}%`, cursor: "ew-resize" }}
            {...makeHandleEvents("left")}
          />
          <div
            className="crop-handle"
            style={{ left: `${boxRight}%`, top: `${midY}%`, cursor: "ew-resize" }}
            {...makeHandleEvents("right")}
          />
        </div>

        <div className="crop-bottom-bar">
          <button
            className="crop-action-button"
            type="button"
            onClick={() => onChange({ top: 0, right: 0, bottom: 0, left: 0 })}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function clampPct(v: number) {
  return Math.min(Math.max(v, 0), 100);
}

function clampCrop(value: number) {
  return Math.min(Math.max(value, 0), 35);
}
