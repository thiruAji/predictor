import React, { useState, useRef, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import { useVoiceInput } from "../hooks/useVoiceInput.js";
import { VoiceVerificationModal } from "./VoiceVerificationModal.jsx";

export function HomeScreen() {
  const {
    setCurrentView,
    datesData,
    activeDate,
    chatNames,
    setActiveDataChat,
    setActiveAnalyzeChat,
    addMultipleMessagesToDataChat,
    addMultipleMessagesToAnalyzeChat
  } = useApp();

  // Active home voice recording target state
  const [activeVoiceTarget, setActiveVoiceTarget] = useState(null); // { type: "data" | "analyze", chatNum: number, name: string }
  const [pendingTriplets, setPendingTriplets] = useState([]);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [homeToast, setHomeToast] = useState("");

  const pressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const totalDates = Object.keys(datesData || {}).length;
  let totalDataMessages = 0;
  Object.values(datesData || {}).forEach(day => {
    ["1", "2", "3", "4"].forEach(col => {
      totalDataMessages += (day[col] || []).length;
    });
  });

  // Voice recognition callback when spoken triplets arrive on Home Screen
  const handleVoiceTriplets = useCallback((triplets) => {
    if (!triplets || triplets.length === 0) return;
    setPendingTriplets(triplets);
    setIsVerifyModalOpen(true);
  }, []);

  const {
    isSupported: voiceSupported,
    isListening,
    startListening,
    stopListening,
    voiceError
  } = useVoiceInput(handleVoiceTriplets);

  // LONG PRESS DETECTION HANDLERS
  const startPressTimer = (type, chatNum, name) => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      // Trigger Direct Voice Recording on Home Screen for this room
      setActiveVoiceTarget({ type, chatNum, name });
      if (type === "data") setActiveDataChat(chatNum);
      if (type === "analyze") setActiveAnalyzeChat(chatNum);
      startListening();
    }, 400);
  };

  const cancelPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleShortcutClick = (e, type, chatNum) => {
    e.stopPropagation();
    // If it was a long press, ignore the click event navigation
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    // Regular Short Tap -> Navigate inside WhatsApp or WhatsApp Business chat room
    if (type === "data") {
      setActiveDataChat(chatNum);
      setCurrentView("data_chat");
    } else {
      setActiveAnalyzeChat(chatNum);
      setCurrentView("analyze_chat");
    }
  };

  // Confirm Save Voice Records from Verification Modal directly on Home Screen
  const handleConfirmSaveVoice = (verifiedTriplets) => {
    if (!activeVoiceTarget || !verifiedTriplets || verifiedTriplets.length === 0) return;

    const { type, chatNum, name } = activeVoiceTarget;
    let success = false;

    if (type === "data") {
      success = addMultipleMessagesToDataChat(activeDate, chatNum, verifiedTriplets);
    } else {
      success = addMultipleMessagesToAnalyzeChat(chatNum, verifiedTriplets);
    }

    if (success) {
      setHomeToast(`✅ Saved ${verifiedTriplets.length} row${verifiedTriplets.length === 1 ? "" : "s"} into ${name}`);
      setTimeout(() => setHomeToast(""), 4000);
    }

    setIsVerifyModalOpen(false);
  };

  return (
    <main className="home-container">
      <div className="home-welcome">
        <h2 className="home-welcome-title">Select Mode</h2>
        <p className="home-welcome-sub">Mobile pattern search & prediction engine</p>
      </div>

      {/* HOME RECORDING STATUS STRIP */}
      {isListening && activeVoiceTarget && (
        <div className="voice-listening-strip home-listening-banner">
          <span className="recording-dot" />
          <div className="home-listening-info">
            <b>🎙️ Recording for {activeVoiceTarget.name}...</b>
            <span>Speak 3, 6, 9, or 12 digits (1–6)</span>
          </div>
          <button className="btn-small secondary" onClick={stopListening}>Stop</button>
        </div>
      )}

      {/* HOME SUCCESS TOAST BANNER */}
      {homeToast && (
        <div className="voice-toast-banner home-toast">
          <span>{homeToast}</span>
        </div>
      )}

      {voiceError && (
        <div className="voice-error-strip">
          <span>Mic error: {voiceError}</span>
        </div>
      )}

      <div className="home-grid">
        {/* WHATSAPP CARD (DATA) */}
        <div
          className="home-card card-data"
          onClick={() => setCurrentView("data")}
        >
          <div className="home-card-header-row">
            <div className="home-card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.66 4.05 1.79 5.65L2 22l4.6-1.85a9.86 9.86 0 0 0 5.44 1.62c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 17.84c-1.7 0-3.32-.47-4.73-1.34l-.34-.21-3.52 1.41 1.44-3.44-.23-.36c-.95-1.5-1.46-3.24-1.46-5.02 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.96-8.09 8.96zm4.52-6.52c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
              </svg>
            </div>
            <span className="home-card-arrow">→</span>
          </div>

          <div className="home-card-content">
            <h2 className="home-card-title">WhatsApp</h2>
            <p className="home-card-desc">Store digit sequences in 4 date-grouped WhatsApp chat rooms</p>
          </div>

          {/* 4 CHAT SHORTCUT BUTTONS (TAP = OPEN, HOLD = DIRECT RECORD) */}
          <div className="home-shortcuts-box" onClick={e => e.stopPropagation()}>
            <span className="shortcuts-label">Tap to Open • Hold to Direct Record:</span>
            <div className="shortcuts-grid">
              {[1, 2, 3, 4].map(chatNum => {
                const name = chatNames?.data?.[String(chatNum)] || `WhatsApp ${chatNum}`;
                const isTargetRecording = isListening && activeVoiceTarget?.type === "data" && activeVoiceTarget?.chatNum === chatNum;

                return (
                  <button
                    key={chatNum}
                    className={`shortcut-btn data-shortcut ${isTargetRecording ? "active-voice-recording" : ""}`}
                    onMouseDown={() => startPressTimer("data", chatNum, name)}
                    onMouseUp={cancelPressTimer}
                    onMouseLeave={cancelPressTimer}
                    onTouchStart={() => startPressTimer("data", chatNum, name)}
                    onTouchEnd={cancelPressTimer}
                    onClick={e => handleShortcutClick(e, "data", chatNum)}
                    title="Tap to open chat room • Hold to record voice directly"
                  >
                    <span className="shortcut-num">{chatNum}</span>
                    <span className="shortcut-title">{name}</span>
                    <span className="shortcut-mic-icon">{isTargetRecording ? "🔴" : "🎙️"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="home-card-footer">
            <span className="home-card-badge">{totalDates} Dates • {totalDataMessages} Messages</span>
          </div>
        </div>

        {/* WHATSAPP BUSINESS CARD (ANALYZE) */}
        <div
          className="home-card card-analyze"
          onClick={() => setCurrentView("analyze")}
        >
          <div className="home-card-header-row">
            <div className="home-card-icon-wrapper">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.66 4.05 1.79 5.65L2 22l4.6-1.85a9.86 9.86 0 0 0 5.44 1.62c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 17.84c-1.7 0-3.32-.47-4.73-1.34l-.34-.21-3.52 1.41 1.44-3.44-.23-.36c-.95-1.5-1.46-3.24-1.46-5.02 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.96-8.09 8.96zm1.9-6.91c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-2.5v1.5h2.5c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-3.8V9.5h3.8c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-2.5v1.13h2.5z"/>
              </svg>
            </div>
            <span className="home-card-arrow">→</span>
          </div>

          <div className="home-card-content">
            <h2 className="home-card-title">WhatsApp Business</h2>
            <p className="home-card-desc">Search patterns across all historical WhatsApp data</p>
          </div>

          {/* 4 BUSINESS SHORTCUT BUTTONS */}
          <div className="home-shortcuts-box" onClick={e => e.stopPropagation()}>
            <span className="shortcuts-label">Tap to Open • Hold to Direct Record:</span>
            <div className="shortcuts-grid">
              {[1, 2, 3, 4].map(chatNum => {
                const name = chatNames?.analyze?.[String(chatNum)] || `Business ${chatNum}`;
                const isTargetRecording = isListening && activeVoiceTarget?.type === "analyze" && activeVoiceTarget?.chatNum === chatNum;

                return (
                  <button
                    key={chatNum}
                    className={`shortcut-btn analyze-shortcut ${isTargetRecording ? "active-voice-recording" : ""}`}
                    onMouseDown={() => startPressTimer("analyze", chatNum, name)}
                    onMouseUp={cancelPressTimer}
                    onMouseLeave={cancelPressTimer}
                    onTouchStart={() => startPressTimer("analyze", chatNum, name)}
                    onTouchEnd={cancelPressTimer}
                    onClick={e => handleShortcutClick(e, "analyze", chatNum)}
                    title="Tap to open chat room • Hold to record voice directly"
                  >
                    <span className="shortcut-num">{chatNum}</span>
                    <span className="shortcut-title">{name}</span>
                    <span className="shortcut-mic-icon">{isTargetRecording ? "🔴" : "🎙️"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="home-card-footer">
            <span className="home-card-badge">4 Business Analyze Rooms</span>
          </div>
        </div>
      </div>

      <div className="home-info-box">
        <div className="home-info-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <b>How to use shortcuts</b>
        </div>
        <p>
          <b>Tap</b> any button 1, 2, 3, 4 to open that chat room. <b>Long-press / hold</b> any button to record voice directly from the Main Menu, edit (✏️), and save (✅ OK) without entering WhatsApp!
        </p>
      </div>

      {/* VOICE RECORDING VERIFICATION MODAL ON HOME SCREEN */}
      <VoiceVerificationModal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        roomName={activeVoiceTarget?.name || "Chat Room"}
        recordedTriplets={pendingTriplets}
        onConfirmSave={handleConfirmSaveVoice}
        onRerecord={() => {
          setIsVerifyModalOpen(false);
          startListening();
        }}
      />
    </main>
  );
}
