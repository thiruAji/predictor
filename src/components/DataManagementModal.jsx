import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext.jsx";

export function DataManagementModal() {
  const {
    isManagementOpen,
    setIsManagementOpen,
    handleExportJSON,
    handleImportJSON,
    resetAllData,
    loadSampleDataset
  } = useApp();

  const [importText, setImportText] = useState("");
  const [activeTab, setActiveTab] = useState("backup"); // backup, import, danger
  const fileInputRef = useRef(null);

  if (!isManagementOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        const success = handleImportJSON(content);
        if (success) {
          setIsManagementOpen(false);
          setImportText("");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleTextImport = (e) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const success = handleImportJSON(importText);
    if (success) {
      setIsManagementOpen(false);
      setImportText("");
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsManagementOpen(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Data Management</h3>
          <button
            className="modal-close-btn"
            onClick={() => setIsManagementOpen(false)}
            aria-label="Close Modal"
          >
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === "backup" ? "active" : ""}`}
            onClick={() => setActiveTab("backup")}
          >
            Export & Backup
          </button>
          <button
            className={`modal-tab ${activeTab === "import" ? "active" : ""}`}
            onClick={() => setActiveTab("import")}
          >
            Import JSON
          </button>
          <button
            className={`modal-tab ${activeTab === "danger" ? "active" : ""}`}
            onClick={() => setActiveTab("danger")}
          >
            Reset Data
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "backup" && (
            <div className="tab-content">
              <h4>Export JSON Backup</h4>
              <p className="tab-desc">
                Download a complete JSON backup of all your saved dates, DATA chat messages, and ANALYZE chat patterns.
              </p>

              <button className="btn-modal-primary" onClick={handleExportJSON}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export JSON File</span>
              </button>

              <div className="modal-divider" />

              <h4>Sample Dataset</h4>
              <p className="tab-desc">Load sample historical dates and sequences for quick testing.</p>
              <button className="btn-modal-secondary" onClick={loadSampleDataset}>
                Load Multi-Date Sample Data
              </button>
            </div>
          )}

          {activeTab === "import" && (
            <div className="tab-content">
              <h4>Import JSON File</h4>
              <p className="tab-desc">Select a JSON backup file or paste raw JSON text below.</p>

              <input
                type="file"
                accept=".json,application/json"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />

              <button
                className="btn-modal-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 Select JSON File to Upload
              </button>

              <div className="modal-divider" />

              <h4>Or Paste JSON Data</h4>
              <form onSubmit={handleTextImport}>
                <textarea
                  className="import-textarea"
                  placeholder="Paste JSON text here..."
                  rows={5}
                  value={importText}
                  onChange={e => setImportText(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-modal-secondary"
                  disabled={!importText.trim()}
                >
                  Import Pasted JSON
                </button>
              </form>
            </div>
          )}

          {activeTab === "danger" && (
            <div className="tab-content">
              <h4 className="danger-title">Danger Zone</h4>
              <p className="tab-desc">
                Permanently clear all historical DATA records and ANALYZE chat room queries stored in LocalStorage.
              </p>

              <button className="btn-modal-danger" onClick={resetAllData}>
                🗑️ Clear All Stored History
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
