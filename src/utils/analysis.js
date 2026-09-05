import { formatDateDisplay, getDigitTotal } from "./storage.js";

export function analyzeSequencePattern(analyzeChatNum, patternSequence, datesData) {
  if (!patternSequence || patternSequence.length < 2) {
    return {
      error: "Minimum 2 pattern sequence rows required for prediction.",
      analyzeChatNum,
      pattern: patternSequence || [],
      matches: [],
      predictionCandidates: []
    };
  }

  // Ensure dates are sorted chronologically
  const sortedDates = Object.keys(datesData || {}).sort((a, b) => a.localeCompare(b));

  const matches = [];

  // Flatten streams per chat number to allow continuous sequence matching across dates
  const chatStreams = { "1": [], "2": [], "3": [], "4": [] };

  sortedDates.forEach(dateStr => {
    const dayData = datesData[dateStr];
    if (dayData) {
      ["1", "2", "3", "4"].forEach(chatNum => {
        const messages = dayData[chatNum] || [];
        messages.forEach((code, index) => {
          chatStreams[chatNum].push({
            date: dateStr,
            formattedDate: formatDateDisplay(dateStr),
            chatNum: Number(chatNum),
            rowIndex: index + 1, // 1-indexed row inside date's chat
            code
          });
        });
      });
    }
  });

  const patternLength = patternSequence.length;

  // Search each DATA Chat stream independently
  ["1", "2", "3", "4"].forEach(chatNum => {
    const stream = chatStreams[chatNum];
    const streamLength = stream.length;

    for (let i = 0; i <= streamLength - patternLength; i++) {
      let isMatch = true;

      for (let p = 0; p < patternLength; p++) {
        if (stream[i + p].code !== patternSequence[p]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        const startItem = stream[i];
        const endItem = stream[i + patternLength - 1];
        const nextItem = i + patternLength < streamLength ? stream[i + patternLength] : null;

        // Context before match (up to 2 items before match start)
        const beforeContext = [];
        for (let b = Math.max(0, i - 2); b < i; b++) {
          beforeContext.push({
            date: stream[b].date,
            formattedDate: stream[b].formattedDate,
            rowIndex: stream[b].rowIndex,
            code: stream[b].code,
            type: "before"
          });
        }

        // Matched input pattern items
        const matchedContext = [];
        for (let m = i; m < i + patternLength; m++) {
          matchedContext.push({
            date: stream[m].date,
            formattedDate: stream[m].formattedDate,
            rowIndex: stream[m].rowIndex,
            code: stream[m].code,
            type: "matched"
          });
        }

        // Context after match (predicted next item + 1 optional context item after)
        const afterContext = [];
        if (nextItem) {
          afterContext.push({
            date: nextItem.date,
            formattedDate: nextItem.formattedDate,
            rowIndex: nextItem.rowIndex,
            code: nextItem.code,
            type: "predicted"
          });

          if (i + patternLength + 1 < streamLength) {
            const nextNextItem = stream[i + patternLength + 1];
            afterContext.push({
              date: nextNextItem.date,
              formattedDate: nextNextItem.formattedDate,
              rowIndex: nextNextItem.rowIndex,
              code: nextNextItem.code,
              type: "after"
            });
          }
        }

        matches.push({
          id: `${startItem.date}-${chatNum}-${startItem.rowIndex}-${i}`,
          date: startItem.date,
          formattedDate: startItem.formattedDate,
          dataChat: Number(chatNum),
          startRow: startItem.rowIndex,
          endRow: endItem.rowIndex,
          sameDate: startItem.date === endItem.date,
          endDate: endItem.date,
          endFormattedDate: endItem.formattedDate,
          beforeContext,
          matchedContext,
          afterContext,
          fullContext: [...beforeContext, ...matchedContext, ...afterContext],
          historicalNext: nextItem ? nextItem.code : null,
          nextDate: nextItem ? nextItem.formattedDate : null,
          nextRow: nextItem ? nextItem.rowIndex : null,
          digitTotal: nextItem ? getDigitTotal(nextItem.code) : null
        });
      }
    }
  });

  // Calculate prediction candidate frequencies
  const candidateCounts = {};
  matches.forEach(m => {
    if (m.historicalNext) {
      const code = m.historicalNext;
      if (!candidateCounts[code]) {
        candidateCounts[code] = {
          code,
          count: 0,
          total: m.digitTotal
        };
      }
      candidateCounts[code].count += 1;
    }
  });

  const predictionCandidates = Object.values(candidateCounts).sort((a, b) => b.count - a.count);

  return {
    analyzeChatNum: Number(analyzeChatNum),
    pattern: patternSequence,
    matches,
    predictionCandidates,
    totalMatches: matches.length
  };
}
