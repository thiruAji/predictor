import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { getDigitTotal, isValidSequence } from "../utils/storage.js";

export function AnalyzeChatRoom() {
  const {
    activeAnalyzeChat,
    analyzeData,
    chatNames,
    updateChatName,
    addMessageToAnalyzeChat,
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
  const messagesEndRef = useRef(null);

  const colKey = String(activeAnalyzeChat);
  const customRoomName = chatNames?.analyze?.[colKey] || `Business ${activeAnalyzeChat}`;
  const patternList = analyzeData[colKey] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [patternList.length]);

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
            disabled={patternList.length === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>Analyze {customRoomName}</span>
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

      {/* MESSAGES DISPLAY AREA */}
      <div className="chat-messages-scroll">
        {patternList.length === 0 ? (
          <div className="empty-chat-placeholder">
            <div className="empty-chat-icon">🔎</div>
            <h4>{customRoomName} is empty</h4>
            <p>Send 3-digit messages (e.g. <code>126</code>, <code>331</code>, <code>115</code>) to form a pattern sequence, then tap <b>Analyze {customRoomName}</b> to search.</p>
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

      {/* STICKY INPUT BAR */}
      <form className="chat-input-bar" onSubmit={handleSend}>
        <div className="chat-input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            maxLength="3"
            placeholder="Add 3-digit query (1–6)"
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
    </div>
  );
}
