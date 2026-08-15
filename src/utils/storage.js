export const STORAGE_KEY = "sequence_analyzer_v3_data";
export const ANALYZE_KEY = "sequence_analyzer_v3_analyze";
export const THEME_KEY = "sequence_analyzer_theme";
export const LEGACY_KEY = "sequence-analyzer-history-v2";

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(date.getTime())) return dateStr;
  
  const day = parts[2];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  const year = parts[0];
  
  return `${day} ${month} ${year}`;
}

export function getMonthYearDisplay(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthIndex = Number(parts[1]) - 1;
  return `${monthNames[monthIndex] || ""} ${parts[0]}`;
}

export function isValidSequence(str) {
  return /^[1-6]{3}$/.test(String(str || "").trim());
}

export function getDigitTotal(str) {
  if (!isValidSequence(str)) return 0;
  const s = String(str).trim();
  return Number(s[0]) + Number(s[1]) + Number(s[2]);
}

export function createEmptyDayStructure() {
  return {
    "1": [],
    "2": [],
    "3": [],
    "4": []
  };
}

export function createEmptyAnalyzeStructure() {
  return {
    "1": [],
    "2": [],
    "3": [],
    "4": []
  };
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse stored data", e);
  }

  // Attempt legacy data migration
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacyArr = JSON.parse(legacyRaw);
      if (Array.isArray(legacyArr) && legacyArr.length > 0) {
        const today = getTodayString();
        const initial = { [today]: createEmptyDayStructure() };
        
        legacyArr.forEach(item => {
          if (item && item.col >= 0 && item.col < 4) {
            const seq = `${item.a || ""}${item.b || ""}${item.c || ""}`;
            if (isValidSequence(seq)) {
              const colKey = String(item.col + 1);
              initial[today][colKey].push(seq);
            }
          }
        });

        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
    }
  } catch (e) {
    console.error("Failed to migrate legacy data", e);
  }

  // Default with sample dataset if empty
  const defaultData = generateSampleData();
  saveData(defaultData);
  return defaultData;
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data to localStorage", e);
  }
}

export function loadAnalyzeData() {
  try {
    const raw = localStorage.getItem(ANALYZE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return {
          "1": Array.isArray(parsed["1"]) ? parsed["1"] : [],
          "2": Array.isArray(parsed["2"]) ? parsed["2"] : [],
          "3": Array.isArray(parsed["3"]) ? parsed["3"] : [],
          "4": Array.isArray(parsed["4"]) ? parsed["4"] : []
        };
      }
    }
  } catch (e) {
    console.error("Failed to parse analyze data", e);
  }

  const empty = createEmptyAnalyzeStructure();
  // Pre-fill Analyze Chat 1 with an example pattern
  empty["1"] = ["245", "334", "551"];
  return empty;
}

export function saveAnalyzeData(data) {
  try {
    localStorage.setItem(ANALYZE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save analyze data to localStorage", e);
  }
}

export function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme", e);
  }
}

export function generateSampleData() {
  const result = {};

  // Generate multi-date sample data for July & August 2026
  const dates = ["2026-07-01", "2026-07-15", "2026-07-31", "2026-08-01", "2026-08-15"];
  
  const samplesByDate = {
    "2026-07-01": {
      "1": ["245", "334", "551", "234", "112", "123", "451", "362"],
      "2": ["126", "331", "115", "256", "112", "116", "226", "112"],
      "3": ["245", "334", "551", "123", "533", "126", "331", "115"],
      "4": ["156", "256", "123", "451", "362", "214", "533", "126"]
    },
    "2026-07-15": {
      "1": ["126", "331", "115", "256", "112", "156", "256", "123"],
      "2": ["245", "334", "551", "123", "214", "533", "126", "331"],
      "3": ["116", "226", "112", "156", "256", "123", "451", "362"],
      "4": ["245", "334", "551", "245", "334", "551", "123", "112"]
    },
    "2026-07-31": {
      "1": ["156", "256", "123", "451", "362", "214", "533", "126"],
      "2": ["126", "331", "115", "256", "112", "116", "226", "112"],
      "3": ["245", "334", "551", "245", "112", "123", "245", "334"],
      "4": ["334", "551", "234", "112", "156", "256", "123", "451"]
    },
    "2026-08-01": {
      "1": ["245", "334", "551", "245", "334", "551", "123", "245"],
      "2": ["126", "331", "115", "256", "112", "156", "256", "123"],
      "3": ["156", "256", "123", "451", "362", "214", "533", "126"],
      "4": ["245", "334", "551", "123", "533", "126", "331", "115"]
    },
    "2026-08-15": {
      "1": ["245", "334", "551", "234", "112", "156", "256", "123"],
      "2": ["126", "331", "115", "256", "112", "116", "226", "112"],
      "3": ["245", "334", "551", "123", "451", "362", "214", "533"],
      "4": ["156", "256", "123", "451", "362", "214", "533", "126"]
    }
  };

  dates.forEach(d => {
    result[d] = samplesByDate[d] || createEmptyDayStructure();
  });

  return result;
}

export function exportJSON(data, analyzeData) {
  const payload = {
    app: "Sequence Analyzer Chat",
    version: "3.0",
    exportedAt: new Date().toISOString(),
    dates: data || {},
    analyze: analyzeData || {}
  };
  return JSON.stringify(payload, null, 2);
}

export function importJSON(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON data format.");
  }

  let dates = parsed.dates;
  let analyze = parsed.analyze;

  // Handle case where raw dates structure was exported directly
  if (!dates && typeof parsed === "object" && !Array.isArray(parsed)) {
    dates = parsed;
  }

  if (!dates || typeof dates !== "object") {
    throw new Error("Missing dates object in JSON payload.");
  }

  // Validate dates structure
  const cleanDates = {};
  Object.keys(dates).forEach(dateKey => {
    const dayData = dates[dateKey];
    if (dayData && typeof dayData === "object") {
      cleanDates[dateKey] = {
        "1": Array.isArray(dayData["1"]) ? dayData["1"].filter(isValidSequence) : [],
        "2": Array.isArray(dayData["2"]) ? dayData["2"].filter(isValidSequence) : [],
        "3": Array.isArray(dayData["3"]) ? dayData["3"].filter(isValidSequence) : [],
        "4": Array.isArray(dayData["4"]) ? dayData["4"].filter(isValidSequence) : []
      };
    }
  });

  const cleanAnalyze = createEmptyAnalyzeStructure();
  if (analyze && typeof analyze === "object") {
    ["1", "2", "3", "4"].forEach(col => {
      if (Array.isArray(analyze[col])) {
        cleanAnalyze[col] = analyze[col].filter(isValidSequence);
      }
    });
  }

  return {
    dates: cleanDates,
    analyze: cleanAnalyze
  };
}
