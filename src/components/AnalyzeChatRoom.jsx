import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getDigitTotal, isValidSequence } from "../utils/storage.js";
import { analyzeSequencePattern } from "../utils/analysis.js";
import { useVoiceInput } from "../hooks/useVoiceInput.js";
import { VoiceVerificationModal } from "./VoiceVerificationModal.jsx";

export function AnalyzeChatRoom() {
  const {
    activeAnalyzeChat,
    analyzeData,
    datesData,
    chatNames,
    updateChatName,
    addMessageToAnalyzeChat,
    addMultipleMessagesToAnalyzeChat,
    editMessageInAnalyzeChat,
    deleteMessageFromAnalyzeChat,
    clearAnalyzeChat,
    runAnalysis
  } = useApp();

  const [inputVal, setInputVal] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputVal, setTitleInputVal] = useState("");
  const [voiceToast, setVoiceToast] = useState("");

  // Voice Verification Modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [pendingTriplets, setPendingTriplets] = useState([]);

  const messagesEndRef = useRef(null);

  const colKey = String(activeAnalyzeChat);
  const customRoomName = chatNames?.analyze?.[colKey] || `Business ${activeAnalyzeChat}`;
  const patternList = analyzeData[colKey] || [];

  // Real-time zero-click instant live prediction computation (requires AT LEAST 2 rows)
  const liveAnalysis = useMemo(() => {
    if (!patternList || patternList.length < 2) return null;
    return analyzeSequencePattern(activeAnalyzeChat, patternList, datesData);
  }, [activeAnalyzeChat, patternList, datesData]);

  const topPrediction = liveAnalysis?.predictionCandidates?.[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [patternList.length]);

  const handleVoiceTriplets = useCallback((triplets, remainder) => {
    if (!triplets || triplets.length === 0) return;

    setPendingTriplets(triplets);
    setIsVerifyModalOpen(true);

    if (remainder) {
      setInputVal(remainder);
    } else {
      setInputVal("");
    }
  }, []);

  const {
    isSupported: voiceSupported,
    isListening,
    startListening,
    toggleListening,
    voiceError
  } = useVoiceInput(handleVoiceTriplets);

  const handleConfirmSaveVoice = (verifiedTriplets) => {
    if (!verifiedTriplets || verifiedTriplets.length === 0) return;

    addMultipleMessagesToAnalyzeChat(activeAnalyzeChat, verifiedTriplets);
    setVoiceToast(`Saved ${verifiedTriplets.length} verified query row${verifiedTriplets.length === 1 ? "" : "s"}: ${verifiedTriplets.join(", ")}`);
    setTimeout(() => setVoiceToast(""), 3500);
    setIsVerifyModalOpen(false);
  };

  const handleInputChange = (e) => {
    const cleaned = e.target.value.replace(/[^1-6]/g, "").slice(0, 3);
    setInputVal(cleaned);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (inputVal.length !== 3) return;
    if (!isValidSequence(inputVal)) {
      alert("Only digits 1–6 are allowed (e.g. 126, 331).");
      return;
    }

    const success = addMessageToAnalyzeChat(activeAnalyzeChat, inputVal);
    if (success) {
      setInputVal("");
    }
  };

  const startEditMsg = (index, currentCode) => {
    setEditingIndex(index);
    setEditVal(currentCode);
  };

  const saveEditMsg = (index) => {
    if (editVal.length !== 3 || !isValidSequence(editVal)) {
      alert("Must be exactly 3 digits between 1–6.");
      return;
    }
    editMessageInAnalyzeChat(activeAnalyzeChat, index, editVal);
    setEditingIndex(null);
    setEditVal("");
  };

  const saveTitle = () => {
    if (titleInputVal.trim()) {
      updateChatName("analyze", activeAnalyzeChat, titleInputVal);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="chat-room-container">
      {/* TOP BAR WITH CUSTOM ROOM NAME & ANALYZE ACTION BUTTON */}
      <div className="chat-room-topbar analyze-topbar">
        <div className="chat-room-topbar-info">
          {isEditingTitle ? (
            <div className="chat-title-edit-row">
              <input
                type="text"
                value={titleInputVal}
                onChange={e => setTitleInputVal(e.target.value)}
                className="chat-name-input"
                autoFocus
              />
              <button className="btn-small primary" onClick={saveTitle}>Save</button>
            </div>
          ) : (
            <div className="chat-title-display-row">
              <h3>{customRoomName}</h3>
              <button
                className="btn-icon-rename"
                onClick={() => {
                  setTitleInputVal(customRoomName);
                  setIsEditingTitle(true);
                }}
                title="Rename Room"
              >
                ✏️
              </button>
            </div>
          )}
          <span>{patternList.length} sequence query row{patternList.length === 1 ? "" : "s"}</span>
        </div>

        <div className="analyze-topbar-actions">
          <button
            className="btn-analyze-execute"
            onClick={() => runAnalysis(activeAnalyzeChat)}
            disabled={patternList.length < 2}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Full Details</span>
          </button>

          {patternList.length > 0 && (
            <button
              className="btn-danger-outline"
              onClick={() => {
                if (confirm(`Clear all messages in ${customRoomName}?`)) {
                  clearAnalyzeChat(activeAnalyzeChat);
                }
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* SINGLE ROW GUIDANCE CARD */}
      {patternList.length === 1 && (
        <div className="single-row-guidance-card">
          <span className="guidance-icon">💡</span>
          <span>Add a 2nd sequence row (e.g. <code>334</code>) to predict the 3rd historical number.</span>
        </div>
      )}

      {/* REAL-TIME INSTANT LIVE PREDICTION BANNER (TRIGGERED ONLY WHEN 2+ ROWS EXIST) */}
      {liveAnalysis && (
        <div className="instant-prediction-card">
          <div className="instant-prediction-header">
            <div className="instant-header-left">
              <span className="instant-badge-icon">⚡</span>
              <div>
                <span className="instant-tag">Instant Live Prediction</span>
                <span className="instant-subtitle">Auto-scanned from historical sequence ({patternList.slice(0, 3).join(" ➔ ")})</span>
              </div>
            </div>
            <span className="instant-count-pill">{liveAnalysis.matches.length} Match{liveAnalysis.matches.length === 1 ? "" : "es"}</span>
          </div>

          {topPrediction ? (
            <div className="instant-prediction-body">
              <div className="instant-predicted-code">
                <span className="code-label">Top Predicted Next Number:</span>
                <div className="code-pills-row">
                  {topPrediction.code.split("").map((digit, i) => (
                    <span key={i} className="digit-pill live-pill">{digit}</span>
                  ))}
                </div>
              </div>
              <div className="instant-stat-details">
                <span>Matched <b>{topPrediction.count} time{topPrediction.count === 1 ? "" : "s"}</b> in history (Digit Sum: {topPrediction.total})</span>
              </div>
            </div>
          ) : (
            <div className="instant-no-match">
              {liveAnalysis.matches.length > 0 ? (
                <span>Matched {liveAnalysis.matches.length} location(s), but no historical next number was recorded after it yet.</span>
              ) : (
                <span>No historical match found for sequence pattern ({patternList.slice(0, 3).join(" ➔ ")}) yet.</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* MESSAGES DISPLAY AREA */}
      <div className="chat-messages-scroll">
        {patternList.length === 0 ? (
          <div className="empty-chat-placeholder">
            <div className="empty-chat-icon">🔎</div>
            <h4>{customRoomName} is empty</h4>
            <p>Send at least 2 sequence rows (e.g. <code>556</code> and <code>334</code>). Instant prediction will automatically appear!</p>
          </div>
        ) : (
          patternList.map((code, index) => {
            const rowNum = index + 1;
            const isEditing = editingIndex === index;
            const digitSum = getDigitTotal(code);

            return (
              <div key={index} className="chat-bubble-wrapper analyze-bubble-wrapper">
                <span className="chat-row-tag">Pattern #{rowNum}</span>
                
                {isEditing ? (
                  <div className="chat-bubble-edit-card">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="3"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value.replace(/[^1-6]/g, "").slice(0, 3))}
                      className="chat-edit-input"
                      autoFocus
                    />
                    <div className="chat-edit-actions">
                      <button className="btn-small primary" onClick={() => saveEditMsg(index)}>Save</button>
                      <button className="btn-small secondary" onClick={() => setEditingIndex(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="chat-bubble analyze-bubble">
                    <div className="chat-bubble-digits">
                      {code.split("").map((digit, i) => (
                        <span key={i} className="digit-pill analyze-pill">{digit}</span>
                      ))}
                    </div>

                    <div className="chat-bubble-meta">
                      <span className="chat-bubble-total">Total: {digitSum}</span>
                      
                      <div className="chat-bubble-actions">
                        <button
                          className="chat-bubble-btn"
                          onClick={() => startEditMsg(index, code)}
                          title="Edit message"
                        >
                          ✏️
                        </button>
                        <button
                          className="chat-bubble-btn danger"
                          onClick={() => deleteMessageFromAnalyzeChat(activeAnalyzeChat, index)}
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* VOICE TOAST NOTIFICATION BANNER */}
      {voiceToast && (
        <div className="voice-toast-banner">
          <span>{voiceToast}</span>
        </div>
      )}

      {/* LISTENING STATUS STRIP */}
      {isListening && (
        <div className="voice-listening-strip">
          <span className="recording-dot" />
          <span>Listening... Speak 3, 6, 9, or 12 digits (1–6)</span>
        </div>
      )}

      {voiceError && (
        <div className="voice-error-strip">
          <span>Mic error: {voiceError}</span>
        </div>
      )}

      {/* STICKY INPUT BAR */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        {voiceSupported && (
          <button
            type="button"
            className={`chat-mic-btn ${isListening ? "listening" : ""}`}
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Speak digits (e.g. 556334)"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </button>
        )}

        <div className="chat-input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            maxLength="3"
            placeholder={isListening ? "Listening digits..." : "Add 3-digit query (1–6)"}
            value={inputVal}
            onChange={handleInputChange}
            className="chat-text-input"
          />
          {inputVal.length > 0 && (
            <span className={`digit-counter ${inputVal.length === 3 ? "valid" : ""}`}>
              {inputVal.length}/3
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`chat-send-btn ${inputVal.length === 3 ? "active" : ""}`}
          disabled={inputVal.length !== 3}
          title="Send query message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>

      {/* VOICE RECORDING VERIFICATION MODAL */}
      <VoiceVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        roomName={customRoomName}
        recordedTriplets={pendingTriplets}
        onConfirmSave={handleConfirmSaveVoice}
        onRerecord={() => {
          setIsVerifyModalOpen(false);
          startListening();
        }}
      />
    </div>
  );
}
