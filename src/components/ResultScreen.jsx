import React from "react";
import { useApp } from "../context/AppContext.jsx";

export function ResultScreen() {
  const { analysisResult, setCurrentView } = useApp();

  if (!analysisResult) {
    return (
      <div className="section-container">
        <div className="empty-chat-placeholder">
          <h3>No analysis result available</h3>
          <button className="btn-small primary" onClick={() => setCurrentView("analyze")}>
            Go to Analyze Rooms
          </button>
        </div>
      </div>
    );
  }

  const {
    analyzeChatNum,
    pattern,
    matches,
    predictionCandidates,
    totalMatches
  } = analysisResult;

  return (
    <div className="results-container">
      {/* HEADER SUMMARY */}
      <div className="results-header-card">
        <span className="results-tag">Result for Analyze Chat {analyzeChatNum}</span>
        <h2 className="results-title">Pattern Match Analysis</h2>
        
        <div className="pattern-sequence-strip">
          <span className="strip-label">Searched Pattern ({pattern.length} rows):</span>
          <div className="strip-pills">
            {pattern.map((code, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="strip-arrow">→</span>}
                <span className="strip-pill">{code}</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="results-stat-bar">
          <div className="stat-box">
            <span className="stat-num">{totalMatches}</span>
            <span className="stat-label">Matches Found</span>
          </div>
          <div className="stat-box">
            <span className="stat-num">{predictionCandidates.length}</span>
            <span className="stat-label">Next Candidates</span>
          </div>
        </div>
      </div>

      {/* PREDICTION CANDIDATES CARD */}
      <div className="candidates-card">
        <h3 className="card-subtitle">Prediction Candidates</h3>

        {predictionCandidates.length === 0 ? (
          <div className="no-candidates-msg">
            No historical next values found (matches occurred at the very end of history).
          </div>
        ) : (
          <div className="candidates-list">
            {predictionCandidates.map((cand, idx) => (
              <div key={idx} className={`candidate-item ${idx === 0 ? "top-candidate" : ""}`}>
                <div className="candidate-left">
                  <span className="candidate-rank">#{idx + 1}</span>
                  <div className="candidate-code-box">
                    <span className="candidate-code">{cand.code}</span>
                    <span className="candidate-total">Digit Total: {cand.total}</span>
                  </div>
                </div>

                <div className="candidate-right">
                  <span className="candidate-count-badge">
                    {cand.count} {cand.count === 1 ? "time" : "times"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXACT MATCH LOCATIONS LIST */}
      <div className="match-locations-section">
        <h3 className="card-subtitle">Match Locations ({matches.length})</h3>

        {matches.length === 0 ? (
          <div className="empty-chat-placeholder">
            <p>No exact sequence pattern found across all saved DATA dates.</p>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map((m, idx) => (
              <div key={m.id || idx} className="match-detail-card">
                <div className="match-card-header">
                  <span className="match-number">Match #{idx + 1}</span>
                  <span className="match-chat-tag">DATA Chat {m.dataChat}</span>
                </div>

                <div className="match-card-body">
                  <div className="match-field-row">
                    <span className="field-label">Date:</span>
                    <span className="field-value highlight">{m.formattedDate}</span>
                  </div>

                  <div className="match-field-row">
                    <span className="field-label">DATA Chat:</span>
                    <span className="field-value">Chat {m.dataChat}</span>
                  </div>

                  <div className="match-field-row">
                    <span className="field-label">Rows:</span>
                    <span className="field-value">
                      Rows {m.startRow}–{m.endRow}
                      {!m.sameDate && ` (ended ${m.endFormattedDate})`}
                    </span>
                  </div>

                  <div className="match-field-divider" />

                  {m.historicalNext ? (
                    <div className="match-next-box">
                      <div className="next-box-left">
                        <span className="next-label">Historical Next:</span>
                        <span className="next-value-code">{m.historicalNext}</span>
                      </div>
                      <div className="next-box-right">
                        <span className="next-total-pill">Total: {m.digitTotal}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="match-no-next">
                      No following row exists after this match in historical data.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
