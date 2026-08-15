import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";

export function AnalyzeSection() {
  const {
    analyzeData,
    setActiveAnalyzeChat,
    setCurrentView,
    runAnalysis,
    clearAnalyzeChat,
    chatNames,
    updateChatName
  } = useApp();

  const [editingChatNum, setEditingChatNum] = useState(null);
  const [nameInputVal, setNameInputVal] = useState("");

  const handleOpenAnalyzeChat = (chatNum) => {
    setActiveAnalyzeChat(chatNum);
    setCurrentView("analyze_chat");
  };

  const startRenameChat = (e, chatNum, currentName) => {
    e.stopPropagation();
    setEditingChatNum(chatNum);
    setNameInputVal(currentName);
  };

  const saveRenameChat = (chatNum) => {
    if (nameInputVal.trim()) {
      updateChatName("analyze", chatNum, nameInputVal);
    }
    setEditingChatNum(null);
    setNameInputVal("");
  };

  return (
    <div className="section-container">
      <div className="section-header-box">
        <h2 className="section-title">WhatsApp Business Rooms</h2>
        <p className="section-desc">Each business room builds an independent pattern to search across all saved WhatsApp data.</p>
      </div>

      <div className="analyze-rooms-grid">
        {[1, 2, 3, 4].map(chatNum => {
          const colKey = String(chatNum);
          const customName = chatNames?.analyze?.[colKey] || `Business ${chatNum}`;
          const patternList = analyzeData[colKey] || [];
          const count = patternList.length;
          const isEditingName = editingChatNum === chatNum;

          return (
            <div key={chatNum} className="analyze-room-card">
              <div className="analyze-card-top" onClick={() => handleOpenAnalyzeChat(chatNum)}>
                <div className="analyze-room-avatar">
                  <span>B{chatNum}</span>
                </div>
                <div className="analyze-room-info">
                  {isEditingName ? (
                    <div className="chat-name-edit-inline" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={nameInputVal}
                        onChange={e => setNameInputVal(e.target.value)}
                        className="chat-name-input"
                        autoFocus
                      />
                      <button className="btn-small primary" onClick={() => saveRenameChat(chatNum)}>Save</button>
                    </div>
                  ) : (
                    <div className="chat-name-display-row">
                      <h3 className="analyze-room-title">{customName}</h3>
                      <button
                        className="btn-icon-rename"
                        onClick={e => startRenameChat(e, chatNum, customName)}
                        title="Rename Business Room"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
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
                  <span>Analyze {customName}</span>
                </button>

                {count > 0 && (
                  <button
                    className="btn-action-secondary"
                    onClick={() => {
                      if (confirm(`Clear pattern in ${customName}?`)) {
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
