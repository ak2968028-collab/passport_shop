"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { usePaperLayout } from "@/hooks/use-paper-layout";
import { getObjectUrl } from "@/services/image.service";
import { CropSettings, PaperOrientation, PaperSize, PrintSettings } from "@/types/photo";
import { CropModal } from "./crop-modal";
import { PaperCanvas } from "./paper-canvas";

const QUANTITY_OPTIONS = [4, 6, 8, 12, 16];

const DEFAULT_SETTINGS: PrintSettings = {
  quantity: 4,
  showBorder: true,
  borderColor: "#000000",
  borderWidth: 1,
  paperSize: "A4",
  orientation: "landscape",
  margin: 0.13 * 96
};

const DEFAULT_CROP: CropSettings = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

type SettingsTab = "count" | "paper" | "border" | "print";

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1" width="6" height="6" rx="1"/>
      <rect x="9" y="1" width="6" height="6" rx="1"/>
      <rect x="1" y="9" width="6" height="6" rx="1"/>
      <rect x="9" y="9" width="6" height="6" rx="1"/>
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V6l-3.5-4.5z"/>
      <path d="M9.5 1.5V6H13.5"/>
    </svg>
  );
}

function FrameIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1" y="1" width="14" height="14" rx="1.5"/>
      <rect x="4" y="4" width="8" height="8" rx="0.5"/>
    </svg>
  );
}

function PrinterIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5V2h8v3"/>
      <path d="M4 11H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-2"/>
      <rect x="4" y="9" width="8" height="5"/>
    </svg>
  );
}

function CamIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function CutIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  );
}

export function PhotoPrintStudio() {
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("count");
  const { items, paper, resetLayout } = usePaperLayout(settings);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  const updateSettings = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return getObjectUrl(file);
    });
    setCrop(DEFAULT_CROP);
  };

  const handlePrint = () => window.print();

  return (
    <main className="studio-shell">
      <div className="studio-frame">
        <header className="studio-header">
          <span className="header-kicker">Passport Print Lab</span>
        </header>

        <div className="studio-grid">
          {/* Upload Panel */}
          <aside className="panel controls-panel upload-panel">
            <div className="upload-bar">
              <div className="upload-thumb-wrap">
                {imageUrl ? (
                  <img alt="Uploaded preview" className="upload-thumb" src={imageUrl} />
                ) : (
                  <div className="upload-thumb-empty"><CamIcon /></div>
                )}
              </div>
              <div className="upload-info">
                <span className="upload-info-title">
                  {imageUrl ? "Photo ready" : "No photo selected"}
                </span>
                <span className="upload-info-sub">
                  {imageUrl ? "Tap Change to update" : "Select a passport photo"}
                </span>
              </div>
              <div className="upload-btn-row">
                <label className="secondary-button upload-file-label" htmlFor="photo-upload">
                  {imageUrl ? "Change" : "Upload"}
                </label>
                <input
                  id="photo-upload"
                  accept="image/*"
                  className="upload-file-input"
                  type="file"
                  onChange={handleImageUpload}
                />
                <button
                  className="secondary-button crop-action-btn"
                  disabled={!imageUrl}
                  type="button"
                  onClick={() => setIsCropOpen(true)}
                >
                  <CutIcon />
                  <span>Crop</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Workspace / Preview */}
          <section className="panel workspace-panel">
            <div className="workspace-topbar">
              <div>
                <h2>Preview</h2>
                <p>{settings.paperSize} · {settings.orientation} · {settings.quantity}×</p>
              </div>
              <p className="print-note">Print preview</p>
            </div>
            <PaperCanvas
              imageUrl={imageUrl}
              items={items}
              orientation={settings.orientation}
              paper={paper}
              crop={crop}
              borderColor={settings.showBorder ? settings.borderColor : "transparent"}
              borderWidth={settings.showBorder ? settings.borderWidth : 0}
            />
          </section>

          {/* Settings Panel */}
          <aside className="panel controls-panel settings-panel">
            <div className="settings-tabbar">
              <button
                className={`settings-tab ${activeTab === "count" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("count")}
              >
                <span className="settings-tab-icon"><GridIcon /></span>
                <span className="settings-tab-text">Count</span>
              </button>
              <button
                className={`settings-tab ${activeTab === "paper" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("paper")}
              >
                <span className="settings-tab-icon"><DocIcon /></span>
                <span className="settings-tab-text">Paper</span>
              </button>
              <button
                className={`settings-tab ${activeTab === "border" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("border")}
              >
                <span className="settings-tab-icon"><FrameIcon /></span>
                <span className="settings-tab-text">Border</span>
              </button>
              <button
                className={`settings-tab ${activeTab === "print" ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTab("print")}
              >
                <span className="settings-tab-icon"><PrinterIcon /></span>
                <span className="settings-tab-text">Print</span>
              </button>
            </div>

            <div className="settings-card">
              {activeTab === "count" ? (
                <div className="field-grid">
                  <div className="field-row">
                    <label>Photo count</label>
                    <div className="chip-grid">
                      {QUANTITY_OPTIONS.map((option) => (
                        <button
                          key={option}
                          className={`chip-button ${settings.quantity === option ? "active" : ""}`}
                          type="button"
                          onClick={() => updateSettings("quantity", option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {activeTab === "paper" ? (
                <div className="field-grid">
                  <div className="field-row">
                    <label htmlFor="paper-size">Size</label>
                    <select
                      id="paper-size"
                      value={settings.paperSize}
                      onChange={(e) => updateSettings("paperSize", e.target.value as PaperSize)}
                    >
                      <option value="A4">A4</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  <div className="field-row">
                    <label htmlFor="orientation">Orientation</label>
                    <select
                      id="orientation"
                      value={settings.orientation}
                      onChange={(e) => updateSettings("orientation", e.target.value as PaperOrientation)}
                    >
                      <option value="landscape">Landscape</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>
                </div>
              ) : null}

              {activeTab === "border" ? (
                <div className="field-grid">
                  <div className="toggle-row">
                    <label htmlFor="border">Show border</label>
                    <input
                      id="border"
                      checked={settings.showBorder}
                      type="checkbox"
                      onChange={(e) => updateSettings("showBorder", e.target.checked)}
                    />
                  </div>
                  <div className="field-row">
                    <label htmlFor="border-color">Color</label>
                    <div className="color-row">
                      <input
                        id="border-color"
                        className="color-input"
                        type="color"
                        value={settings.borderColor}
                        onChange={(e) => updateSettings("borderColor", e.target.value)}
                      />
                      <input
                        className="text-input"
                        type="text"
                        value={settings.borderColor}
                        onChange={(e) => updateSettings("borderColor", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="field-row">
                    <label htmlFor="border-width">Weight: {settings.borderWidth}px</label>
                    <input
                      id="border-width"
                      max={20}
                      min={0}
                      type="range"
                      value={settings.borderWidth}
                      onChange={(e) => updateSettings("borderWidth", Number(e.target.value))}
                    />
                  </div>
                </div>
              ) : null}

              {activeTab === "print" ? (
                <div className="field-grid">
                  <div className="button-row">
                    <button className="secondary-button" type="button" onClick={resetLayout}>
                      Fit from top
                    </button>
                    <button
                      className="primary-button"
                      disabled={!imageUrl}
                      type="button"
                      onClick={handlePrint}
                    >
                      Print
                    </button>
                  </div>
                  <p className="helper-text">
                    Default margin: 0.13 inch top, left, right.
                  </p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {imageUrl ? (
        <CropModal
          crop={crop}
          imageUrl={imageUrl}
          isOpen={isCropOpen}
          onChange={setCrop}
          onClose={() => setIsCropOpen(false)}
        />
      ) : null}
    </main>
  );
}
