import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loadData,
  saveData,
  loadAnalyzeData,
  saveAnalyzeData,
  loadTheme,
  saveTheme,
  loadChatNames,
  saveChatNames,
  DEFAULT_CHAT_NAMES,
  getTodayString,
  createEmptyDayStructure,
  isValidSequence,
  generateSampleData,
  exportJSON,
  importJSON
} from "../utils/storage.js";
import { analyzeSequencePattern } from "../utils/analysis.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => loadTheme());
  const [datesData, setDatesData] = useState(() => loadData());
  const [analyzeData, setAnalyzeData] = useState(() => loadAnalyzeData());
  const [chatNames, setChatNames] = useState(() => loadChatNames());
  const [activeDate, setActiveDate] = useState(() => getTodayString());
  
  // Navigation & View state
  const [currentView, setCurrentView] = useState("home"); // home, data, data_chat, analyze, analyze_chat, results
  const [activeDataChat, setActiveDataChat] = useState(1);
  const [activeAnalyzeChat, setActiveAnalyzeChat] = useState(1);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  // Apply dark/light theme class to document body
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveTheme(theme);
  }, [theme]);

  // Ensure active date entry exists in data
  useEffect(() => {
    if (activeDate && (!datesData[activeDate] || typeof datesData[activeDate] !== "object")) {
      setDatesData(prev => {
        const next = { ...prev, [activeDate]: createEmptyDayStructure() };
        saveData(next);
        return next;
      });
    }
  }, [activeDate]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  // --- CUSTOM CHAT NAME HANDLER ---
  const updateChatName = (type, chatNum, newName) => {
    const trimmed = String(newName || "").trim();
    if (!trimmed) return;

    setChatNames(prev => {
      const colKey = String(chatNum);
      const nextNames = {
        ...prev,
        [type]: {
          ...(prev[type] || {}),
          [colKey]: trimmed
        }
      };
      saveChatNames(nextNames);
      return nextNames;
    });
  };

  // --- DATA CHAT HANDLERS ---
  const addMessageToDataChat = (dateStr, chatNum, code) => {
    if (!isValidSequence(code)) return false;

    setDatesData(prev => {
      const day = prev[dateStr] ? { ...prev[dateStr] } : createEmptyDayStructure();
      const colKey = String(chatNum);
      const updatedChat = [...(day[colKey] || []), code];
      const nextDay = { ...day, [colKey]: updatedChat };
      const nextData = { ...prev, [dateStr]: nextDay };
      saveData(nextData);
      return nextData;
    });

    return true;
  };

  const editMessageInDataChat = (dateStr, chatNum, index, newCode) => {
    if (!isValidSequence(newCode)) return false;

    setDatesData(prev => {
      const day = prev[dateStr] ? { ...prev[dateStr] } : createEmptyDayStructure();
      const colKey = String(chatNum);
      const chatArr = [...(day[colKey] || [])];
      if (index >= 0 && index < chatArr.length) {
        chatArr[index] = newCode;
        const nextDay = { ...day, [colKey]: chatArr };
        const nextData = { ...prev, [dateStr]: nextDay };
        saveData(nextData);
        return nextData;
      }
      return prev;
    });

    return true;
  };

  const deleteMessageFromDataChat = (dateStr, chatNum, index) => {
    setDatesData(prev => {
      const day = prev[dateStr] ? { ...prev[dateStr] } : createEmptyDayStructure();
      const colKey = String(chatNum);
      const chatArr = [...(day[colKey] || [])];
      if (index >= 0 && index < chatArr.length) {
        chatArr.splice(index, 1);
        const nextDay = { ...day, [colKey]: chatArr };
        const nextData = { ...prev, [dateStr]: nextDay };
        saveData(nextData);
        return nextData;
      }
      return prev;
    });
  };

  const clearDataChat = (dateStr, chatNum) => {
    setDatesData(prev => {
      const day = prev[dateStr] ? { ...prev[dateStr] } : createEmptyDayStructure();
      const colKey = String(chatNum);
      const nextDay = { ...day, [colKey]: [] };
      const nextData = { ...prev, [dateStr]: nextDay };
      saveData(nextData);
      return nextData;
    });
  };

  const clearDateData = (dateStr) => {
    setDatesData(prev => {
      const nextData = { ...prev, [dateStr]: createEmptyDayStructure() };
      saveData(nextData);
      return nextData;
    });
  };

  // --- ANALYZE CHAT HANDLERS ---
  const addMessageToAnalyzeChat = (chatNum, code) => {
    if (!isValidSequence(code)) return false;

    setAnalyzeData(prev => {
      const colKey = String(chatNum);
      const updated = [...(prev[colKey] || []), code];
      const nextData = { ...prev, [colKey]: updated };
      saveAnalyzeData(nextData);
      return nextData;
    });

    return true;
  };

  const editMessageInAnalyzeChat = (chatNum, index, newCode) => {
    if (!isValidSequence(newCode)) return false;

    setAnalyzeData(prev => {
      const colKey = String(chatNum);
      const arr = [...(prev[colKey] || [])];
      if (index >= 0 && index < arr.length) {
        arr[index] = newCode;
        const nextData = { ...prev, [colKey]: arr };
        saveAnalyzeData(nextData);
        return nextData;
      }
      return prev;
    });

    return true;
  };

  const deleteMessageFromAnalyzeChat = (chatNum, index) => {
    setAnalyzeData(prev => {
      const colKey = String(chatNum);
      const arr = [...(prev[colKey] || [])];
      if (index >= 0 && index < arr.length) {
        arr.splice(index, 1);
        const nextData = { ...prev, [colKey]: arr };
        saveAnalyzeData(nextData);
        return nextData;
      }
      return prev;
    });
  };

  const clearAnalyzeChat = (chatNum) => {
    setAnalyzeData(prev => {
      const colKey = String(chatNum);
      const nextData = { ...prev, [colKey]: [] };
      saveAnalyzeData(nextData);
      return nextData;
    });
  };

  // --- RUN PATTERN SEARCH ---
  const runAnalysis = (chatNum) => {
    const colKey = String(chatNum);
    const pattern = analyzeData[colKey] || [];
    
    if (pattern.length === 0) {
      const roomName = chatNames?.analyze?.[colKey] || `Business ${chatNum}`;
      alert(`${roomName} is empty. Enter sequence messages first.`);
      return;
    }

    const res = analyzeSequencePattern(chatNum, pattern, datesData);
    setAnalysisResult(res);
    setCurrentView("results");
  };

  // --- MANAGEMENT & DATA RESET ---
  const handleExportJSON = () => {
    const jsonStr = exportJSON(datesData, analyzeData, chatNames);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sequence_analyzer_backup_${getTodayString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (jsonString) => {
    try {
      const imported = importJSON(jsonString);
      setDatesData(imported.dates);
      setAnalyzeData(imported.analyze);
      if (imported.chatNames) {
        setChatNames(imported.chatNames);
        saveChatNames(imported.chatNames);
      }
      saveData(imported.dates);
      saveAnalyzeData(imported.analyze);
      alert("Data successfully imported!");
      return true;
    } catch (err) {
      alert(`Import Failed: ${err.message}`);
      return false;
    }
  };

  const resetAllData = () => {
    if (confirm("Are you sure you want to clear all stored history and analyze chats?")) {
      const emptyDates = { [getTodayString()]: createEmptyDayStructure() };
      const emptyAnalyze = { "1": [], "2": [], "3": [], "4": [] };
      setDatesData(emptyDates);
      setAnalyzeData(emptyAnalyze);
      setChatNames(DEFAULT_CHAT_NAMES);
      saveData(emptyDates);
      saveAnalyzeData(emptyAnalyze);
      saveChatNames(DEFAULT_CHAT_NAMES);
      setActiveDate(getTodayString());
      setCurrentView("home");
    }
  };

  const loadSampleDataset = () => {
    const samples = generateSampleData();
    setDatesData(samples);
    saveData(samples);
    alert("Sample dataset loaded successfully!");
  };

  const value = {
    theme,
    toggleTheme,
    datesData,
    analyzeData,
    chatNames,
    updateChatName,
    activeDate,
    setActiveDate,
    currentView,
    setCurrentView,
    activeDataChat,
    setActiveDataChat,
    activeAnalyzeChat,
    setActiveAnalyzeChat,
    analysisResult,
    setAnalysisResult,
    isManagementOpen,
    setIsManagementOpen,
    addMessageToDataChat,
    editMessageInDataChat,
    deleteMessageFromDataChat,
    clearDataChat,
    clearDateData,
    addMessageToAnalyzeChat,
    editMessageInAnalyzeChat,
    deleteMessageFromAnalyzeChat,
    clearAnalyzeChat,
    runAnalysis,
    handleExportJSON,
    handleImportJSON,
    resetAllData,
    loadSampleDataset
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
