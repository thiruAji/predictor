import React from "react";
import { createRoot } from "react-dom/client";
import { AppProvider, useApp } from "./context/AppContext.jsx";
import { Header } from "./components/Header.jsx";
import { HomeScreen } from "./components/HomeScreen.jsx";
import { DataSection } from "./components/DataSection.jsx";
import { DataChatRoom } from "./components/DataChatRoom.jsx";
import { AnalyzeSection } from "./components/AnalyzeSection.jsx";
import { AnalyzeChatRoom } from "./components/AnalyzeChatRoom.jsx";
import { ResultScreen } from "./components/ResultScreen.jsx";
import { DataManagementModal } from "./components/DataManagementModal.jsx";
import "./style.css";

function AppContent() {
  const { currentView } = useApp();

  const renderActiveView = () => {
    switch (currentView) {
      case "data":
        return <DataSection />;
      case "data_chat":
        return <DataChatRoom />;
      case "analyze":
        return <AnalyzeSection />;
      case "analyze_chat":
        return <AnalyzeChatRoom />;
      case "results":
        return <ResultScreen />;
      case "home":
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <div className="app-content">
        {renderActiveView()}
      </div>
      <DataManagementModal />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = `
    <div style="font-family:sans-serif;display:grid;place-items:center;height:100vh;color:#111827;text-align:center;padding:24px;">
      <h2>Sequence Analyzer failed to load</h2>
      <p>The app mount element #root was not found.</p>
    </div>
  `;
} else {
  createRoot(rootElement).render(<App />);
}
