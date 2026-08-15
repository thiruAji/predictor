import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { formatDateDisplay, getMonthYearDisplay, getTodayString } from "../utils/storage.js";

export function DataSection() {
  const {
    datesData,
    activeDate,
    setActiveDate,
    setActiveDataChat,
    setCurrentView,
    clearDateData
  } = useApp();

  const [dateSearchTerm, setDateSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateInput, setCustomDateInput] = useState(getTodayString());

  const allDates = Object.keys(datesData || {}).sort((a, b) => b.localeCompare(a)); // Descending order (recent first)

  // Filter dates by search query
  const filteredDates = allDates.filter(dateStr => {
    const formatted = formatDateDisplay(dateStr).toLowerCase();
    const raw = dateStr.toLowerCase();
    const query = dateSearchTerm.toLowerCase();
    return formatted.includes(query) || raw.includes(query);
  });

  const activeDayData = datesData[activeDate] || { "1": [], "2": [], "3": [], "4": [] };

  const handleSelectChat = (chatNum) => {
    setActiveDataChat(chatNum);
    setCurrentView("data_chat");
  };

  const handleAddCustomDate = (e) => {
    e.preventDefault();
    if (customDateInput) {
      setActiveDate(customDateInput);
      setShowDatePicker(false);
    }
  };

  return (
    <div className="section-container">
      {/* DATE SELECTOR BAR */}
      <div className="date-selector-card">
        <div className="date-selector-header">
          <div className="date-active-info">
            <span className="date-month-label">{getMonthYearDisplay(activeDate)}</span>
            <h2 className="date-active-display">{formatDateDisplay(activeDate)}</h2>
          </div>
          <button
            className="date-change-btn"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Change Date</span>
          </button>
        </div>

        {/* DATE PICKER & SEARCH DROPDOWN */}
        {showDatePicker && (
          <div className="date-picker-dropdown">
            <div className="date-search-input-wrapper">
              <input
                type="text"
                placeholder="Search dates (e.g. 15 Aug)..."
                value={dateSearchTerm}
                onChange={e => setDateSearchTerm(e.target.value)}
                className="date-search-input"
              />
            </div>

            <div className="custom-date-row">
              <input
                type="date"
                value={customDateInput}
                onChange={e => setCustomDateInput(e.target.value)}
                className="date-picker-field"
              />
              <button className="btn-small primary" onClick={handleAddCustomDate}>
                Select / Create
              </button>
            </div>

            <div className="date-list-scroll">
              {filteredDates.length === 0 ? (
                <div className="no-dates-msg">No saved dates match search.</div>
              ) : (
                filteredDates.map(dateStr => {
                  const count =
                    (datesData[dateStr]?.["1"]?.length || 0) +
                    (datesData[dateStr]?.["2"]?.length || 0) +
                    (datesData[dateStr]?.["3"]?.length || 0) +
                    (datesData[dateStr]?.["4"]?.length || 0);

                  const isSelected = dateStr === activeDate;

                  return (
                    <button
                      key={dateStr}
                      className={`date-list-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        setActiveDate(dateStr);
                        setShowDatePicker(false);
                      }}
                    >
                      <span className="date-item-text">{formatDateDisplay(dateStr)}</span>
                      <span className="date-item-count">{count} records</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* CHAT ROOM CARDS (Chat 1, Chat 2, Chat 3, Chat 4) */}
      <div className="chat-rooms-header">
        <h3 className="section-subtitle">DATA Chat Rooms</h3>
        <button
          className="btn-danger-link"
          onClick={() => {
            if (confirm(`Clear all 4 chats for ${formatDateDisplay(activeDate)}?`)) {
              clearDateData(activeDate);
            }
          }}
        >
          Clear Date
        </button>
      </div>

      <div className="chat-rooms-grid">
        {[1, 2, 3, 4].map(chatNum => {
          const messageList = activeDayData[String(chatNum)] || [];
          const count = messageList.length;
          const lastMessage = count > 0 ? messageList[count - 1] : "No records yet";

          return (
            <button
              key={chatNum}
              className="chat-room-card"
              onClick={() => handleSelectChat(chatNum)}
            >
              <div className="chat-room-avatar">
                <span>C{chatNum}</span>
              </div>
              <div className="chat-room-info">
                <div className="chat-room-title-row">
                  <h4 className="chat-room-name">Chat {chatNum}</h4>
                  <span className="chat-room-badge">{count} msg</span>
                </div>
                <p className="chat-room-preview">
                  {count > 0 ? `Latest: ${lastMessage}` : "Tap to open chat room..."}
                </p>
              </div>
              <div className="chat-room-chevron">›</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
