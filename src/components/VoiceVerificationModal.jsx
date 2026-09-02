import React, { useState, useEffect } from "react";
import { isValidSequence } from "../utils/storage.js";

export function VoiceVerificationModal({
  isOpen,
  onClose,
  roomName,
  recordedTriplets = [],
  onConfirmSave,
  onRerecord
}) {
  const [editableList, setEditableList] = useState([]);

  useEffect(() => {
    if (recordedTriplets && recordedTriplets.length > 0) {
      setEditableList([...recordedTriplets]);
    } else {
      setEditableList([]);
    }
  }, [recordedTriplets, isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index, value) => {
    const cleaned = value.replace(/[^1-6]/g, "").slice(0, 3);
    setEditableList(prev => {
      const copy = [...prev];
      copy[index] = cleaned;
      return copy;
    });
  };

  const removeRow = (index) => {
    setEditableList(prev => prev.filter((_, i) => i !== index));
  };

  const addEmptyRow = () => {
    setEditableList(prev => [...prev, ""]);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const validTriplets = editableList.filter(isValidSequence);

    if (validTriplets.length === 0) {
      alert("No valid 3-digit sequences (digits 1–6) to save.");
      return;
    }

    if (onConfirmSave) {
      onConfirmSave(validTriplets);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content verification-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header verification-modal-header">
          <div className="verification-header-title">
            <span className="mic-badge-icon">🎙️</span>
            <div>
              <h3 className="modal-title">Verify Spoken Records</h3>
              <span className="verification-subtitle">Target: <b>{roomName}</b></span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSave} className="modal-body verification-modal-body">
          <p className="tab-desc">
            Review recorded numbers below. Edit any digit if misheard before saving into <b>{roomName}</b>.
          </p>

          <div className="verification-triplets-list">
            {editableList.length === 0 ? (
              <div className="no-dates-msg">No digits recognized. Tap Re-record to try speaking again.</div>
            ) : (
              editableList.map((code, index) => {
                const isValid = isValidSequence(code);
                return (
                  <div key={index} className="verification-row-item">
                    <span className="verification-row-index">Row #{index + 1}</span>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="3"
                      value={code}
                      onChange={e => handleDigitChange(index, e.target.value)}
                      className={`triplet-edit-input ${isValid ? "valid" : "invalid"}`}
                      placeholder="1–6"
                    />

                    <button
                      type="button"
                      className="chat-bubble-btn danger"
                      onClick={() => removeRow(index)}
                      title="Remove Row"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            className="btn-small secondary add-row-btn"
            onClick={addEmptyRow}
          >
            + Add Row
          </button>

          <div className="modal-divider" />

          <div className="verification-modal-actions">
            <button
              type="submit"
              className="btn-modal-primary"
              disabled={editableList.filter(isValidSequence).length === 0}
            >
              ✅ Save to {roomName}
            </button>

            <button
              type="button"
              className="btn-modal-secondary"
              onClick={() => {
                onClose();
                if (onRerecord) onRerecord();
              }}
            >
              🎙️ Re-record Voice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
