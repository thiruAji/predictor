import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext.jsx";
import { formatDateDisplay, getDigitTotal, isValidSequence } from "../utils/storage.js";

export function DataChatRoom() {
  const {
    activeDate,
    activeDataChat,
    datesData,
    chatNames,
    updateChatName,
    addMessageToDataChat,
    editMessageInDataChat,
    deleteMessageFromDataChat,
    clearDataChat
  } = useApp();

  const [inputVal, setInputVal] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputVal, setTitleInputVal] = useState("");
  const messagesEndRef = useRef(null);

  const colKey = String(activeDataChat);
  const customRoomName = chatNames?.data?.[colKey] || `WhatsApp ${activeDataChat}`;
  const dayData = datesData[activeDate] || {};
  const chatMessages = dayData[colKey] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages.length]);

  const handleInputChange = (e) => {
    const cleaned = e.target.value.replace(/[^1-6]/g, "").slice(0, 3);
    setInputVal(cleaned);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (inputVal.length !== 3) return;
    if (!isValidSequence(inputVal)) {
      alert("Only digits 1–6 are allowed (e.g. 245, 334).");
      return;
    }

    const success = addMessageToDataChat(activeDate, activeDataChat, inputVal);
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
    editMessageInDataChat(activeDate, activeDataChat, index, editVal);
    setEditingIndex(null);
    setEditVal("");
  };

  const saveTitle = () => {
    if (titleInputVal.trim()) {
      updateChatName("data", activeDataChat, titleInputVal);
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="chat-room-container">
      {/* ROOM HEADER BAR */}
      <div className="chat-room-topbar">
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
          <span>{formatDateDisplay(activeDate)} • {chatMessages.length} records</span>
        </div>
        <button
          className="btn-danger-outline"
          onClick={() => {
            if (confirm(`Clear all messages in ${customRoomName} for ${formatDateDisplay(activeDate)}?`)) {
              clearDataChat(activeDate, activeDataChat);
            }
          }}
        >
          Clear Chat
        </button>
      </div>

      {/* MESSAGES DISPLAY AREA */}
      <div className="chat-messages-scroll">
        {chatMessages.length === 0 ? (
          <div className="empty-chat-placeholder">
            <div className="empty-chat-icon">💬</div>
            <h4>No records in {customRoomName}</h4>
            <p>Type exactly 3 digits (1–6 only, e.g. <code>245</code>) below to add rows for {formatDateDisplay(activeDate)}.</p>
          </div>
        ) : (
          chatMessages.map((code, index) => {
            const rowNum = index + 1;
            const isEditing = editingIndex === index;
            const digitSum = getDigitTotal(code);

            return (
              <div key={index} className="chat-bubble-wrapper">
                <span className="chat-row-tag">Row {rowNum}</span>
                
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
                  <div className="chat-bubble">
                    <div className="chat-bubble-digits">
                      {code.split("").map((digit, i) => (
                        <span key={i} className="digit-pill">{digit}</span>
                      ))}
                    </div>

                    <div className="chat-bubble-meta">
                      <span className="chat-bubble-total">Total: {digitSum}</span>
                      
                      <div className="chat-bubble-actions">
                        <button
                          className="chat-bubble-btn"
                          onClick={() => startEditMsg(index, code)}
                          title="Edit Message"
                        >
                          ✏️
                        </button>
                        <button
                          className="chat-bubble-btn danger"
                          onClick={() => deleteMessageFromDataChat(activeDate, activeDataChat, index)}
                          title="Delete Message"
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
            placeholder="Enter 3 digits (1–6)"
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
          title="Send message"
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
