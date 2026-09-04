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

  // Full Page & Center Line Swipe gesture tracking state
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef(null);

  const pressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  // Compute total message stats
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
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }

    // Regular Short Tap -> Navigate inside specific chat room
    if (type === "data") {
      setActiveDataChat(chatNum);
      setCurrentView("data_chat");
    } else {
      setActiveAnalyzeChat(chatNum);
      setCurrentView("analyze_chat");
    }
  };

  // FULL PAGE SWIPE GESTURE HANDLERS (SWIPE LEFT-TO-RIGHT / RIGHT-TO-LEFT)
  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    touchStartXRef.current = touch.clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartXRef.current === null) return;
    const touch = e.touches ? e.touches[0] : e;
    const diffX = touch.clientX - touchStartXRef.current;
    if (diffX > 0) {
      setSwipeOffset(Math.min(diffX, 150));
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      // Swiped Left to Right -> Switch between WhatsApp & WhatsApp Business page!
      setHomeToast("↔ Opening WhatsApp Business...");
      setTimeout(() => {
        setCurrentView("analyze");
        setSwipeOffset(0);
        setHomeToast("");
      }, 180);
    } else {
      setSwipeOffset(0);
    }
    touchStartXRef.current = null;
  };

  // Confirm Save Voice Records from Verification Modal
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
    <main
      className="home-container minimal-home"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* MINIMAL HEADER */}
      <div className="home-welcome">
        <div className="home-title-row">
          <h2 className="home-welcome-title">Predictor Engine</h2>
          <div className="home-badge-pill">{totalDates} Dates • {totalDataMessages} Records</div>
        </div>
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

      {/* TOP SECTION: WHATSAPP DATA (4 HORIZONTAL ROUND COLORFUL BUTTONS) */}
      <section className="home-section-card data-section-theme">
        <div className="section-card-header" onClick={() => setCurrentView("data")}>
          <div className="header-icon-box data-color">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.66 4.05 1.79 5.65L2 22l4.6-1.85a9.86 9.86 0 0 0 5.44 1.62c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 17.84c-1.7 0-3.32-.47-4.73-1.34l-.34-.21-3.52 1.41 1.44-3.44-.23-.36c-.95-1.5-1.46-3.24-1.46-5.02 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.96-8.09 8.96z"/>
            </svg>
          </div>
          <h3 className="section-card-title">WhatsApp Data</h3>
          <span className="section-card-chevron">→</span>
        </div>

        {/* 4 TOP HORIZONTAL ROUND COLORFUL BUTTONS */}
        <div className="round-buttons-row">
          {[1, 2, 3, 4].map(chatNum => {
            const name = chatNames?.data?.[String(chatNum)] || `WhatsApp ${chatNum}`;
            const isTargetRecording = isListening && activeVoiceTarget?.type === "data" && activeVoiceTarget?.chatNum === chatNum;
            const colorClass = `round-color-data-${chatNum}`;

            return (
              <div key={chatNum} className="round-btn-item">
                <button
                  className={`round-shortcut-btn ${colorClass} ${isTargetRecording ? "active-recording" : ""}`}
                  onMouseDown={() => startPressTimer("data", chatNum, name)}
                  onMouseUp={cancelPressTimer}
                  onMouseLeave={cancelPressTimer}
                  onTouchStart={() => startPressTimer("data", chatNum, name)}
                  onTouchEnd={cancelPressTimer}
                  onClick={e => handleShortcutClick(e, "data", chatNum)}
                  title={`Tap to open ${name} • Hold to record voice`}
                >
                  <span className="round-btn-num">{chatNum}</span>
                  <span className="round-btn-mic">{isTargetRecording ? "🔴" : "🎙️"}</span>
                </button>
                <span className="round-btn-label">{name}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* CENTER INTERACTIVE SWIPE LINE */}
      <div
        className="center-swipe-container"
        onClick={() => setCurrentView("analyze")}
        title="Swipe line left-to-right to open WhatsApp Business"
      >
        <div className="swipe-line-track">
          <div
            className="swipe-line-fill"
            style={{ width: `${Math.max(20, (swipeOffset / 150) * 100)}%` }}
          />
          <div
            className="swipe-handle-badge"
            style={{ transform: `translateX(${swipeOffset}px)` }}
          >
            <span className="swipe-icon">👉</span>
            <span className="swipe-text">SWIPE LEFT TO RIGHT FOR BUSINESS</span>
            <span className="swipe-arrow">➜</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: WHATSAPP BUSINESS ANALYZE (4 HORIZONTAL ROUND COLORFUL BUTTONS) */}
      <section className="home-section-card analyze-section-theme">
        <div className="section-card-header" onClick={() => setCurrentView("analyze")}>
          <div className="header-icon-box analyze-color">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.66 4.05 1.79 5.65L2 22l4.6-1.85a9.86 9.86 0 0 0 5.44 1.62c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 17.84c-1.7 0-3.32-.47-4.73-1.34l-.34-.21-3.52 1.41 1.44-3.44-.23-.36c-.95-1.5-1.46-3.24-1.46-5.02 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.96-8.09 8.96zm1.9-6.91c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-2.5v1.5h2.5c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-3.8V9.5h3.8c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-2.5v1.13h2.5z"/>
            </svg>
          </div>
          <h3 className="section-card-title">WhatsApp Business</h3>
          <span className="section-card-chevron">→</span>
        </div>

        {/* 4 BOTTOM HORIZONTAL ROUND COLORFUL BUTTONS */}
        <div className="round-buttons-row">
          {[1, 2, 3, 4].map(chatNum => {
            const name = chatNames?.analyze?.[String(chatNum)] || `Business ${chatNum}`;
            const isTargetRecording = isListening && activeVoiceTarget?.type === "analyze" && activeVoiceTarget?.chatNum === chatNum;
            const colorClass = `round-color-analyze-${chatNum}`;

            return (
              <div key={chatNum} className="round-btn-item">
                <button
                  className={`round-shortcut-btn ${colorClass} ${isTargetRecording ? "active-recording" : ""}`}
                  onMouseDown={() => startPressTimer("analyze", chatNum, name)}
                  onMouseUp={cancelPressTimer}
                  onMouseLeave={cancelPressTimer}
                  onTouchStart={() => startPressTimer("analyze", chatNum, name)}
                  onTouchEnd={cancelPressTimer}
                  onClick={e => handleShortcutClick(e, "analyze", chatNum)}
                  title={`Tap to open ${name} • Hold to record voice`}
                >
                  <span className="round-btn-num">{chatNum}</span>
                  <span className="round-btn-mic">{isTargetRecording ? "🔴" : "🎙️"}</span>
                </button>
                <span className="round-btn-label">{name}</span>
              </div>
            );
          })}
        </div>
      </section>

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
