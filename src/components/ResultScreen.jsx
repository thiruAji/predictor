import React from "react";
import { useApp } from "../context/AppContext.jsx";

export function ResultScreen() {
  const { analysisResult, chatNames, setCurrentView } = useApp();

  if (!analysisResult) {
    return (
      <div className="section-container">
        <div className="empty-chat-placeholder">
          <h3>No analysis result available</h3>
          <button className="btn-small primary" onClick={() => setCurrentView("analyze")}>
            Go to WhatsApp Business
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

  const analyzeRoomName = chatNames?.analyze?.[String(analyzeChatNum)] || `Business ${analyzeChatNum}`;

  return (
    <div className="results-container">
      {/* HEADER SUMMARY */}
      <div className="results-header-card">
        <span className="results-tag">Result for {analyzeRoomName}</span>
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
            <p>No exact sequence pattern found across all saved WhatsApp dates.</p>
          </div>
        ) : (
          <div className="matches-list">
            {matches.map((m, idx) => {
              const dataRoomName = chatNames?.data?.[String(m.dataChat)] || `WhatsApp ${m.dataChat}`;

              return (
                <div key={m.id || idx} className="match-detail-card">
                  <div className="match-card-header">
                    <span className="match-number">Match #{idx + 1}</span>
                    <span className="match-chat-tag">{dataRoomName}</span>
                  </div>

                  <div className="match-card-body">
                    <div className="match-field-row">
                      <span className="field-label">Date:</span>
                      <span className="field-value highlight">{m.formattedDate}</span>
                    </div>

                    <div className="match-field-row">
                      <span className="field-label">WhatsApp Room:</span>
                      <span className="field-value">{dataRoomName}</span>
                    </div>

                    <div className="match-field-row">
                      <span className="field-label">Matched Rows:</span>
                      <span className="field-value">
                        Rows {m.startRow}–{m.endRow}
                        {!m.sameDate && ` (ended ${m.endFormattedDate})`}
                      </span>
                    </div>

                    <div className="match-field-divider" />

                    {/* FULL SEQUENCE CONTEXT FLOW (BEFORE ➔ MATCHED INPUT ➔ PREDICTED RESULT) */}
                    <div className="match-sequence-flow-container">
                      <span className="flow-title">Full Location Context (Before ➔ Input Pattern ➔ Predicted Result)</span>
                      <div className="sequence-flow-strip">
                        {(m.fullContext || []).map((item, idx2) => {
                          const isBefore = item.type === "before";
                          const isMatched = item.type === "matched";
                          const isPredicted = item.type === "predicted";
                          const isAfter = item.type === "after";

                          let badgeClass = "flow-badge-default";
                          let labelText = `Row ${item.rowIndex}`;

                          if (isBefore) {
                            badgeClass = "flow-badge-before";
                            labelText = `Row ${item.rowIndex} (Before)`;
                          } else if (isMatched) {
                            badgeClass = "flow-badge-matched";
                            labelText = `Row ${item.rowIndex} (Input Match)`;
                          } else if (isPredicted) {
                            badgeClass = "flow-badge-predicted";
                            labelText = `Row ${item.rowIndex} (Predicted ⚡)`;
                          } else if (isAfter) {
                            badgeClass = "flow-badge-after";
                            labelText = `Row ${item.rowIndex} (After)`;
                          }

                          return (
                            <React.Fragment key={idx2}>
                              {idx2 > 0 && <span className="flow-arrow">➔</span>}
                              <div className={`flow-node-card ${badgeClass}`}>
                                <span className="node-label">{labelText}</span>
                                <span className="node-code">{item.code}</span>
                                {isPredicted && (
                                  <span className="node-tag-pill">Prediction Result</span>
                                )}
                              </div>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>

                    <div className="match-field-divider" />

                    {m.historicalNext ? (
                      <div className="match-next-box">
                        <div className="next-box-left">
                          <span className="next-label">Predicted After Number:</span>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
