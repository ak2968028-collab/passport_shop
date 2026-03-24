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

export function PhotoPrintStudio() {
  const [settings, setSettings] = useState<PrintSettings>(DEFAULT_SETTINGS);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("count");
  const { items, paper, resetLayout } = usePaperLayout(settings);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Silent fallback keeps the app usable even if SW registration is blocked.
    });
  }, []);

  const updateSettings = <K extends keyof PrintSettings>(
    key: K,
    value: PrintSettings[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setImageUrl((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }

      return getObjectUrl(file);
    });
    setCrop(DEFAULT_CROP);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="studio-shell">
      <div className="studio-frame">
        <header className="studio-header">
          <h1>Passport Photo Print Studio</h1>
          <p>
            Mobile-ready passport print layout with upload, quick quantity selection, drag setup,
            and one-tap printing.
          </p>
        </header>

        <div className="studio-grid">
          <aside className="panel controls-panel">
            <div className="mobile-summary-bar">
              <div className="summary-pill">
                <strong>{settings.quantity}</strong>
                <span>Photos</span>
              </div>
              <div className="summary-pill">
                <strong>{settings.paperSize}</strong>
                <span>Paper</span>
              </div>
              <div className="summary-pill">
                <strong>{settings.orientation}</strong>
                <span>Layout</span>
              </div>
            </div>
            <section className="controls-group">
              <div className="section-label">
                <span className="mini-badge">UP</span>
                <h2 className="group-title">Upload photo</h2>
              </div>
              <div className="upload-box">
                {imageUrl ? (
                  <img alt="Uploaded passport preview" className="upload-preview" src={imageUrl} />
                ) : (
                  <div>
                    <p>Select one passport photo.</p>
                    <p className="helper-text">The same image will fill all passport photo slots.</p>
                  </div>
                )}
                <input accept="image/*" type="file" onChange={handleImageUpload} />
                <div className="upload-actions">
                  <button
                    className="secondary-button"
                    disabled={!imageUrl}
                    type="button"
                    onClick={() => setIsCropOpen(true)}
                  >
                    Crop photo
                  </button>
                </div>
              </div>
            </section>

            <section className="controls-group">
              <div className="section-label">
                <span className="mini-badge">ST</span>
                <h2 className="group-title">Print settings</h2>
              </div>
              <div className="settings-tabbar">
                <button
                  className={`settings-tab ${activeTab === "count" ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab("count")}
                >
                  <span className="settings-tab-icon">#</span>
                  <span className="settings-tab-text">Count</span>
                </button>
                <button
                  className={`settings-tab ${activeTab === "paper" ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab("paper")}
                >
                  <span className="settings-tab-icon">P</span>
                  <span className="settings-tab-text">Paper</span>
                </button>
                <button
                  className={`settings-tab ${activeTab === "border" ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab("border")}
                >
                  <span className="settings-tab-icon">B</span>
                  <span className="settings-tab-text">Border</span>
                </button>
                <button
                  className={`settings-tab ${activeTab === "print" ? "active" : ""}`}
                  type="button"
                  onClick={() => setActiveTab("print")}
                >
                  <span className="settings-tab-icon">Go</span>
                  <span className="settings-tab-text">Print</span>
                </button>
              </div>
              <div className="settings-card">
                {activeTab === "count" ? (
                  <div className="field-grid">
                    <div className="field-row">
                      <label>Choose photo count</label>
                      <div className="chip-grid">
                        {QUANTITY_OPTIONS.map((option) => (
                          <button
                            key={option}
                            className={`chip-button ${
                              settings.quantity === option ? "active" : ""
                            }`}
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
                      <label htmlFor="paper-size">Paper size</label>
                      <select
                        id="paper-size"
                        value={settings.paperSize}
                        onChange={(event) =>
                          updateSettings("paperSize", event.target.value as PaperSize)
                        }
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                      </select>
                    </div>
                    <div className="field-row">
                      <label htmlFor="orientation">Paper orientation</label>
                      <select
                        id="orientation"
                        value={settings.orientation}
                        onChange={(event) =>
                          updateSettings("orientation", event.target.value as PaperOrientation)
                        }
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
                      <label htmlFor="border">Border</label>
                      <input
                        id="border"
                        checked={settings.showBorder}
                        type="checkbox"
                        onChange={(event) => updateSettings("showBorder", event.target.checked)}
                      />
                    </div>
                    <div className="field-row">
                      <label htmlFor="border-color">Border color</label>
                      <div className="color-row">
                        <input
                          id="border-color"
                          className="color-input"
                          type="color"
                          value={settings.borderColor}
                          onChange={(event) => updateSettings("borderColor", event.target.value)}
                        />
                        <input
                          className="text-input"
                          type="text"
                          value={settings.borderColor}
                          onChange={(event) => updateSettings("borderColor", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="field-row">
                      <label htmlFor="border-width">
                        Border weight: {settings.borderWidth}px
                      </label>
                      <input
                        id="border-width"
                        max={20}
                        min={0}
                        type="range"
                        value={settings.borderWidth}
                        onChange={(event) =>
                          updateSettings("borderWidth", Number(event.target.value))
                        }
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
                      Default print margin is 0.13 inch from top, left, and right.
                    </p>
                  </div>
                ) : null}
              </div>
              <p className="helper-text">
                Photos align from the top-left in row order with fixed size slots.
              </p>
            </section>
          </aside>

          <section className="panel workspace-panel">
            <div className="workspace-topbar">
              <div>
                <h2>Paper preview</h2>
                <p>
                  Passport {settings.paperSize} {settings.orientation}, {settings.quantity} copies
                </p>
              </div>
              <p className="print-note">Mobile fit preview</p>
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
