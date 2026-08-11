import React, {useEffect, useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

const KEY = "sequence-analyzer-history-v2";
const blank = () => ({a:"", b:"", c:""});
const valid = v => /^[1-6]$/.test(String(v));
const total = x => valid(x.a) && valid(x.b) && valid(x.c)
  ? Number(x.a) + Number(x.b) + Number(x.c)
  : "";
const code = x => `${x.a}${x.b}${x.c}`;

function App() {
  const [page, setPage] = useState("home");
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch { return []; }
  });
  const [query, setQuery] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(data));
  }, [data]);

  function addRow(setter, column) {
    setter(old => [...old, {col: column, ...blank()}]);
  }

  function updateCell(setter, arr, index, key, value, column, autoAdd) {
    const clean = value.replace(/[^1-6]/g, "").slice(0, 1);

    setter(old => {
      const next = old.map((x, i) => i === index ? {...x, [key]: clean} : x);

      if (autoAdd && clean && total(next[index]) !== "") {
        const sameColumn = next.filter(x => x.col === column);
        const isLastInColumn =
          sameColumn.length > 0 &&
          sameColumn[sameColumn.length - 1] === next[index];

        if (isLastInColumn) {
          next.push({col: column, ...blank()});
        }
      }
      return next;
    });
  }

  function clearData() {
    if (confirm("Clear all stored DATA?")) setData([]);
  }

  function loadExample() {
    const samples = [
      "245","334","551","234","112","156","256","123",
      "126","331","115","256","112","116","226","112",
      "156","256","123","451","362","214","533","126",
      "331","115","256","112","116","226","112","156"
    ];

    const cols = [[],[],[],[]];
    samples.forEach((s, i) => {
      cols[i % 4].push({col:i % 4, a:s[0], b:s[1], c:s[2]});
    });
    setData(cols.flat());
  }

  function completeColumns(arr) {
    const columns = [[], [], [], []];

    arr.forEach((x, index) => {
      if (x && x.col >= 0 && x.col < 4 && total(x) !== "") {
        columns[x.col].push({
          code: code(x),
          total: total(x),
          row: columns[x.col].length + 1,
          col: x.col + 1,
          originalIndex: index
        });
      }
    });

    return columns;
  }

  function analyzeColumn(columnNumber) {
    const queryColumn = query
      .filter(x => x.col === columnNumber)
      .filter(x => total(x) !== "");

    if (!queryColumn.length) {
      alert(`Enter complete entries in Analyze Column ${columnNumber + 1} first.`);
      return;
    }

    const dataColumns = [0,1,2,3].map(c =>
      data
        .filter(x => x.col === c)
        .filter(x => total(x) !== "")
        .map((x, i) => ({
          code: code(x),
          total: total(x),
          row: i + 1,
          col: c + 1
        }))
    );

    if (!dataColumns.some(c => c.length)) {
      alert("Enter DATA history first.");
      return;
    }

    const pattern = queryColumn.map(x => code(x));
    const matches = [];

    // Search this ONE analyze column independently against all 4 DATA columns.
    dataColumns.forEach((history, dataColumnIndex) => {
      for (let start = 0; start <= history.length - pattern.length; start++) {
        let matched = true;

        for (let j = 0; j < pattern.length; j++) {
          if (history[start + j].code !== pattern[j]) {
            matched = false;
            break;
          }
        }

        if (matched) {
          matches.push({
            dataColumn: dataColumnIndex + 1,
            startRow: start + 1,
            endRow: start + pattern.length,
            following: history[start + pattern.length] || null
          });
        }
      }
    });

    const frequency = {};
    matches.filter(x => x.following).forEach(x => {
      frequency[x.following.code] = (frequency[x.following.code] || 0) + 1;
    });

    setResult({
      analyzeColumn: columnNumber + 1,
      pattern,
      matches,
      frequency
    });
  }

  return (
    <>
      <header>
        <h1>Sequence Analyzer</h1>
        <p>Historical sequence matching</p>
      </header>

      {page === "home" && (
        <main className="home">
          <button className="homeCard" onClick={() => setPage("data")}>
            <span>📊</span>
            <b>DATA</b>
            <small>Store history</small>
          </button>

          <button className="homeCard" onClick={() => setPage("analyze")}>
            <span>🔎</span>
            <b>ANALYZE</b>
            <small>Search history</small>
          </button>

          <div className="info">
            <b>How it works</b>
            <p>
              Each column has its own rows. Enter 3 digits from 1–6 and,
              when the third digit is entered, a new blank row automatically
              opens directly underneath in that same column.
            </p>
          </div>
        </main>
      )}

      {page === "data" && (
        <main>
          <Top title="DATA — 4 Columns" back={() => setPage("home")} />
          <div className="toolbar">
            <button onClick={() => addRow(setData, 0)}>+ Column 1 row</button>
            <button onClick={() => addRow(setData, 1)}>+ Column 2 row</button>
            <button onClick={() => addRow(setData, 2)}>+ Column 3 row</button>
            <button onClick={() => addRow(setData, 3)}>+ Column 4 row</button>
            <button className="secondary" onClick={loadExample}>Load example</button>
            <button className="danger" onClick={clearData}>Clear</button>
          </div>

          <FourColumns
            rows={data}
            setRows={setData}
            autoAdd
            updateCell={updateCell}
            addRow={addRow}
          />
        </main>
      )}

      {page === "analyze" && (
        <main>
          <Top title="ANALYZE — 4 Columns" back={() => setPage("home")} />
          <div className="columnControls">
            {[0,1,2,3].map(column => (
              <div className="controlGroup" key={column}>
                <b>Analyze Column {column + 1}</b>
                <button onClick={() => analyzeColumn(column)}>
                  🔎 Analyze Column {column + 1}
                </button>
                <button onClick={() => addRow(setQuery, column)}>
                  + Add row
                </button>
                <button
                  className="secondary"
                  onClick={() => {
                    setQuery(old => old.filter(x => x.col !== column));
                    setResult(old =>
                      old && old.analyzeColumn === column + 1 ? null : old
                    );
                  }}
                >
                  Clear Column {column + 1}
                </button>
              </div>
            ))}
          </div>

          <div className="toolbar">
            <button className="secondary" onClick={() => {setQuery([]); setResult(null);}}>
              Clear all
            </button>
          </div>

          <FourColumns
            rows={query}
            setRows={setQuery}
            autoAdd
            updateCell={updateCell}
            addRow={addRow}
          />

          {result && <Results result={result} />}
        </main>
      )}

      <footer>
        Historical pattern analysis only.
      </footer>
    </>
  );
}

function Top({title, back}) {
  return (
    <div className="top">
      <button className="secondary" onClick={back}>← Back</button>
      <h2>{title}</h2>
    </div>
  );
}

function FourColumns({rows, setRows, autoAdd, updateCell, addRow}) {
  return (
    <div className="columns">
      {[0,1,2,3].map(column => {
        const items = rows
          .map((x, index) => ({...x, originalIndex:index}))
          .filter(x => x.col === column);

        return (
          <div className="column" key={column}>
            <h3>Column {column + 1}</h3>

            <div className="scroll">
              {items.map(item => (
                <Entry
                  key={item.originalIndex}
                  x={item}
                  onChange={(key, value) =>
                    updateCell(
                      setRows,
                      rows,
                      item.originalIndex,
                      key,
                      value,
                      column,
                      autoAdd
                    )
                  }
                />
              ))}
            </div>

            <button
              className="addSmall"
              onClick={() => addRow(setRows, column)}
            >
              + Add row to Column {column + 1}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Entry({x, onChange}) {
  return (
    <div className="entry">
      <div className="digits">
        {["a","b","c"].map(key => (
          <input
            key={key}
            inputMode="numeric"
            maxLength="1"
            placeholder="1–6"
            value={x[key]}
            onChange={e => onChange(key, e.target.value)}
          />
        ))}
      </div>
      <div className="total">Total: {total(x) || "—"}</div>
    </div>
  );
}

function Results({result}) {
  const sorted = Object.entries(result.frequency)
    .sort((a,b) => b[1] - a[1]);

  return (
    <section className="results">
      <h2>Analysis Result — Column {result.analyzeColumn}</h2>

      <div className="querySummary">
        <b>Analyzed sequence</b>
        <div className="sequence">{result.pattern.join(" → ")}</div>
        <span>{result.pattern.length} row(s)</span>
      </div>

      <div className="summaryGrid">
        <div><b>{result.matches.length}</b><small>Matches found</small></div>
        <div><b>{result.matches.filter(x => x.following).length}</b><small>With following data</small></div>
        <div><b>{sorted.length}</b><small>Different following values</small></div>
      </div>

      {sorted.length > 0 && (
        <>
          <h3>Historical following values</h3>
          <div className="frequency">
            {sorted.map(([value, count]) => (
              <div className="badge" key={value}>
                <b>{value}</b>
                <span>{count} time{count === 1 ? "" : "s"}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h3>Exact match locations</h3>

      {result.matches.length === 0 && (
        <p>No exact sequence was found in DATA Columns 1–4.</p>
      )}

      {result.matches.map((match, i) => (
        <div className="match" key={i}>
          <b>Match {i + 1}</b>
          <span className="location">
            DATA Column {match.dataColumn}, Rows {match.startRow}–{match.endRow}
          </span>

          {match.following ? (
            <div className="following">
              <b>Historical following value: {match.following.code}</b>
              <span>
                Total {match.following.total} • DATA Column {match.dataColumn} • Row {match.following.row}
              </span>
            </div>
          ) : (
            <div className="following none">
              No following row exists after this match.
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
