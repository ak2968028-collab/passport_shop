"use client";

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
  if (!isOpen) {
    return null;
  }

  const adjustCrop = (
    side: keyof CropSettings,
    delta: number
  ) => {
    onChange({
      ...crop,
      [side]: clampCrop(crop[side] + delta)
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="crop-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Crop photo"
      >
        <div className="crop-modal-header">
          <div>
            <h2>Crop photo</h2>
            <p>Adjust the photo once. All passport prints will use this crop.</p>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="crop-preview-frame">
          <div className="crop-editor-shell">
            <div className="crop-preview-card">
              <img
                alt="Crop preview"
                src={imageUrl}
                style={{
                  ...getCropImageStyle(crop)
                }}
              />
            </div>
          </div>
        </div>

        <div className="crop-controls">
          <p className="hand-note">Crop each side manually, like picture crop tools in document editors.</p>
          <div className="crop-side-grid">
            <div className="crop-side-card">
              <span>Top</span>
              <div className="crop-side-actions">
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("top", -2)}>
                  Expand
                </button>
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("top", 2)}>
                  Crop
                </button>
              </div>
            </div>
            <div className="crop-side-card">
              <span>Right</span>
              <div className="crop-side-actions">
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("right", -2)}>
                  Expand
                </button>
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("right", 2)}>
                  Crop
                </button>
              </div>
            </div>
            <div className="crop-side-card">
              <span>Bottom</span>
              <div className="crop-side-actions">
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("bottom", -2)}>
                  Expand
                </button>
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("bottom", 2)}>
                  Crop
                </button>
              </div>
            </div>
            <div className="crop-side-card">
              <span>Left</span>
              <div className="crop-side-actions">
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("left", -2)}>
                  Expand
                </button>
                <button className="crop-action-button" type="button" onClick={() => adjustCrop("left", 2)}>
                  Crop
                </button>
              </div>
            </div>
          </div>
          <div className="crop-readout-grid">
            <div className="crop-readout">Top: {crop.top}%</div>
            <div className="crop-readout">Right: {crop.right}%</div>
            <div className="crop-readout">Bottom: {crop.bottom}%</div>
            <div className="crop-readout">Left: {crop.left}%</div>
          </div>
          <div className="zoom-button-row">
            <button
              className="crop-action-button"
              type="button"
              onClick={() =>
                onChange({
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0
                })
              }
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function clampCrop(value: number) {
  return Math.min(Math.max(value, 0), 35);
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
