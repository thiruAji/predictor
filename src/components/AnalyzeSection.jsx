import React from "react";
import { useApp } from "../context/AppContext.jsx";

export function AnalyzeSection() {
  const {
    analyzeData,
    setActiveAnalyzeChat,
    setCurrentView,
    runAnalysis,
    clearAnalyzeChat
  } = useApp();

  const handleOpenAnalyzeChat = (chatNum) => {
    setActiveAnalyzeChat(chatNum);
    setCurrentView("analyze_chat");
  };

  return (
    <div className="section-container">
      <div className="section-header-box">
        <h2 className="section-title">ANALYZE Rooms</h2>
        <p className="section-desc">Each room builds an independent sequence pattern to search across all historical DATA.</p>
      </div>

      <div className="analyze-rooms-grid">
        {[1, 2, 3, 4].map(chatNum => {
          const patternList = analyzeData[String(chatNum)] || [];
          const count = patternList.length;

          return (
            <div key={chatNum} className="analyze-room-card">
              <div className="analyze-card-top" onClick={() => handleOpenAnalyzeChat(chatNum)}>
                <div className="analyze-room-avatar">
                  <span>A{chatNum}</span>
                </div>
                <div className="analyze-room-info">
                  <h3 className="analyze-room-title">Analyze Chat {chatNum}</h3>
                  <span className="analyze-room-badge">{count} query message{count === 1 ? "" : "s"}</span>
                </div>
                <div className="chat-room-chevron">›</div>
              </div>

              {/* SEQUENCE PREVIEW STRIP */}
              <div className="analyze-sequence-preview" onClick={() => handleOpenAnalyzeChat(chatNum)}>
                {count === 0 ? (
                  <span className="preview-empty">No pattern set. Tap to add 3-digit queries...</span>
                ) : (
                  <div className="preview-pills">
                    {patternList.slice(0, 5).map((code, idx) => (
                      <span key={idx} className="preview-pill">{code}</span>
                    ))}
                    {count > 5 && <span className="preview-more">+{count - 5} more</span>}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="analyze-card-actions">
                <button
                  className="btn-action-primary"
                  onClick={() => runAnalysis(chatNum)}
                  disabled={count === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <span>Analyze Chat {chatNum}</span>
                </button>

                {count > 0 && (
                  <button
                    className="btn-action-secondary"
                    onClick={() => {
                      if (confirm(`Clear pattern in Analyze Chat ${chatNum}?`)) {
                        clearAnalyzeChat(chatNum);
                      }
                    }}
                    title="Clear query pattern"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
