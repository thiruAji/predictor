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

  let totalAnalyzeQueries = 0;
  ["1", "2", "3", "4"].forEach(col => {
    totalAnalyzeQueries += (analyzeData[col] || []).length;
  });

  return (
    <main className="home-container">
      <div className="home-welcome">
        <h2 className="home-welcome-title">Select Mode</h2>
        <p className="home-welcome-sub">Mobile pattern search & prediction engine</p>
      </div>

      <div className="home-grid">
        {/* DATA CARD */}
        <button
          className="home-card card-data"
          onClick={() => setCurrentView("data")}
        >
          <div className="home-card-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="home-card-content">
            <h2 className="home-card-title">DATA</h2>
            <p className="home-card-desc">Store digit sequences in 4 date-grouped chat rooms</p>
          </div>
          <div className="home-card-footer">
            <span className="home-card-badge">{totalDates} Dates • {totalDataMessages} Messages</span>
            <span className="home-card-arrow">→</span>
          </div>
        </button>

        {/* ANALYZE CARD */}
        <button
          className="home-card card-analyze"
          onClick={() => setCurrentView("analyze")}
        >
          <div className="home-card-icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </div>
          <div className="home-card-content">
            <h2 className="home-card-title">ANALYZE</h2>
            <p className="home-card-desc">Search patterns across all historical data</p>
          </div>
          <div className="home-card-footer">
            <span className="home-card-badge">4 Independent Chat Rooms</span>
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
          Type 3-digit numbers (digits 1–6 only, e.g. <code>245</code>) into <b>DATA Chats</b>. Data is grouped automatically by date. Run sequence matching from <b>ANALYZE</b> to search the whole history for historical next predictions.
        </p>
      </div>
    </main>
  );
}
