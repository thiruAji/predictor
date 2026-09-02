import React, { useState, useEffect, useRef } from "react";
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
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (recordedTriplets && recordedTriplets.length > 0) {
      setEditableList([...recordedTriplets]);
    } else {
      setEditableList([]);
    }
    setEditingRowIndex(null);
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
    if (editingRowIndex === index) setEditingRowIndex(null);
  };

  const addEmptyRow = () => {
    setEditableList(prev => [...prev, ""]);
    setEditingRowIndex(editableList.length);
  };

  const saveSingleRow = (index) => {
    const code = editableList[index];
    if (!isValidSequence(code)) {
      alert("Must be exactly 3 digits between 1–6.");
      return;
    }
    if (onConfirmSave) {
      onConfirmSave([code]);
    }
    removeRow(index);
    if (editableList.length <= 1) {
      onClose();
    }
  };

  const saveAllRows = (e) => {
    if (e) e.preventDefault();
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
              <h3 className="modal-title">Verify Spoken Numbers</h3>
              <span className="verification-subtitle">Saving to: <b>{roomName}</b></span>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={saveAllRows} className="modal-body verification-modal-body">
          <p className="tab-desc">
            Check recorded numbers below. Use <b>✏️ Edit</b> to tweak digits or tap <b>✅ OK</b> to save into <b>{roomName}</b>.
          </p>

          <div className="verification-triplets-list">
            {editableList.length === 0 ? (
              <div className="no-dates-msg">No digits recognized. Tap Re-record to try speaking again.</div>
            ) : (
              editableList.map((code, index) => {
                const isValid = isValidSequence(code);
                const isEditing = editingRowIndex === index;

                return (
                  <div key={index} className="verification-row-item">
                    <span className="verification-row-index">Row #{index + 1}</span>

                    <input
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength="3"
                      value={code}
                      onChange={e => handleDigitChange(index, e.target.value)}
                      className={`triplet-edit-input ${isValid ? "valid" : "invalid"} ${isEditing ? "active-editing" : ""}`}
                      placeholder="1–6"
                    />

                    <div className="verification-row-actions">
                      <button
                        type="button"
                        className={`action-symbol-btn edit-symbol ${isEditing ? "active" : ""}`}
                        onClick={() => {
                          setEditingRowIndex(isEditing ? null : index);
                          if (!isEditing) {
                            setTimeout(() => inputRefs.current[index]?.focus(), 50);
                          }
                        }}
                        title="Edit digits"
                      >
                        ✏️
                      </button>

                      <button
                        type="button"
                        className="action-symbol-btn ok-symbol"
                        onClick={() => saveSingleRow(index)}
                        disabled={!isValid}
                        title="OK - Save this row inside chat"
                      >
                        ✅
                      </button>

                      <button
                        type="button"
                        className="action-symbol-btn delete-symbol"
                        onClick={() => removeRow(index)}
                        title="Delete row"
                      >
                        🗑️
                      </button>
                    </div>
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
              ✅ OK & Save All to {roomName}
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
