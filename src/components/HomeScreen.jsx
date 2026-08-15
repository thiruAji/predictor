import React from "react";
import { useApp } from "../context/AppContext.jsx";

export function HomeScreen() {
  const { setCurrentView, datesData, analyzeData } = useApp();

  // Compute stats for badges
  const totalDates = Object.keys(datesData || {}).length;
  let totalDataMessages = 0;
  Object.values(datesData || {}).forEach(day => {
    ["1", "2", "3", "4"].forEach(col => {
      totalDataMessages += (day[col] || []).length;
    });
  });

  return (
    <main className="home-container">
      <div className="home-welcome">
        <h2 className="home-welcome-title">Select Mode</h2>
        <p className="home-welcome-sub">Mobile pattern search & prediction engine</p>
      </div>

      <div className="home-grid">
        {/* WHATSAPP CARD (DATA) */}
        <button
          className="home-card card-data"
          onClick={() => setCurrentView("data")}
        >
          <div className="home-card-icon-wrapper">
            {/* WHATSAPP LOGO ICON */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.66 4.05 1.79 5.65L2 22l4.6-1.85a9.86 9.86 0 0 0 5.44 1.62c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 17.84c-1.7 0-3.32-.47-4.73-1.34l-.34-.21-3.52 1.41 1.44-3.44-.23-.36c-.95-1.5-1.46-3.24-1.46-5.02 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.96-8.09 8.96zm4.52-6.52c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/>
            </svg>
          </div>
          <div className="home-card-content">
            <h2 className="home-card-title">WhatsApp</h2>
            <p className="home-card-desc">Store digit sequences in 4 date-grouped WhatsApp chat rooms</p>
          </div>
          <div className="home-card-footer">
            <span className="home-card-badge">{totalDates} Dates • {totalDataMessages} Messages</span>
            <span className="home-card-arrow">→</span>
          </div>
        </button>

        {/* WHATSAPP BUSINESS CARD (ANALYZE) */}
        <button
          className="home-card card-analyze"
          onClick={() => setCurrentView("analyze")}
        >
          <div className="home-card-icon-wrapper">
            {/* WHATSAPP BUSINESS 'B' LOGO ICON */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.66 4.05 1.79 5.65L2 22l4.6-1.85a9.86 9.86 0 0 0 5.44 1.62c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 17.84c-1.7 0-3.32-.47-4.73-1.34l-.34-.21-3.52 1.41 1.44-3.44-.23-.36c-.95-1.5-1.46-3.24-1.46-5.02 0-4.46 3.63-8.09 8.09-8.09s8.09 3.63 8.09 8.09-3.63 8.96-8.09 8.96zm1.9-6.91c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-2.5v1.5h2.5c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-3.8V9.5h3.8c.64 0 1.15.51 1.15 1.15s-.51 1.15-1.15 1.15h-2.5v1.13h2.5z"/>
            </svg>
          </div>
          <div className="home-card-content">
            <h2 className="home-card-title">WhatsApp Business</h2>
            <p className="home-card-desc">Search patterns across all historical WhatsApp data</p>
          </div>
          <div className="home-card-footer">
            <span className="home-card-badge">4 Business Analyze Rooms</span>
            <span className="home-card-arrow">→</span>
          </div>
        </button>
      </div>

      <div className="home-info-box">
        <div className="home-info-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <b>How it works</b>
        </div>
        <p>
          Enter 3-digit messages into <b>WhatsApp</b> chat rooms. Use <b>WhatsApp Business</b> rooms to search sequences and predict historical next numbers across all saved dates.
        </p>
      </div>
    </main>
  );
}
