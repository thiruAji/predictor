import React from "react";
import { useApp } from "../context/AppContext.jsx";
import { formatDateDisplay } from "../utils/storage.js";

export function Header() {
  const {
    currentView,
    setCurrentView,
    activeDate,
    activeDataChat,
    activeAnalyzeChat,
    theme,
    toggleTheme,
    setIsManagementOpen
  } = useApp();

  const getHeaderTitle = () => {
    switch (currentView) {
      case "data":
        return "DATA Rooms";
      case "data_chat":
        return `DATA Chat ${activeDataChat}`;
      case "analyze":
        return "ANALYZE Rooms";
      case "analyze_chat":
        return `Analyze Chat ${activeAnalyzeChat}`;
      case "results":
        return "Prediction Results";
      default:
        return "Sequence Predictor";
    }
  };

  const handleBack = () => {
    if (currentView === "data_chat") setCurrentView("data");
    else if (currentView === "analyze_chat") setCurrentView("analyze");
    else if (currentView === "results") setCurrentView("analyze_chat");
    else setCurrentView("home");
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {currentView !== "home" && (
          <button className="nav-back-btn" onClick={handleBack} aria-label="Go Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="header-title-container">
          <h1 className="header-title">{getHeaderTitle()}</h1>
          {currentView === "data_chat" && (
            <span className="header-subtitle">{formatDateDisplay(activeDate)}</span>
          )}
        </div>
      </div>

      <div className="header-actions">
        <button
          className="header-icon-btn"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            /* Sun Icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon Icon */
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <button
          className="header-icon-btn"
          onClick={() => setIsManagementOpen(true)}
          title="Data Management & Backup"
          aria-label="Data Settings"
        >
          {/* Settings / Database Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        </button>
      </div>
    </header>
  );
}
