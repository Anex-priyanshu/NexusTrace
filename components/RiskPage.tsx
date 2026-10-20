"use client";
import React, { useState } from "react";
import { runBatchRiskScreening } from "../lib/api";
import { generateRandomValidAddress } from "../lib/addressValidator";


interface RiskPageProps {
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

const levelColor = (score: number) => score >= 80 ? "#e53935" : score >= 50 ? "#ff9800" : "#4caf50";

export default function RiskPage({ onNavigate, showToast }: RiskPageProps) {
  const [inputText, setInputText] = useState("0x28c6c06298d514db089934071355e5743bf21d60\n0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\n1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    runInitialScreening();
  }, []);

  const runInitialScreening = async () => {
    setLoading(true);
    const initialAddrs = [
      "0x28c6c06298d514db089934071355e5743bf21d60",
      "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    ];
    const apiRes = await runBatchRiskScreening(initialAddrs);
    if (apiRes && apiRes.results) {
      setResults(apiRes.results);
    }
    setLoading(false);
  };

  const handleRunAnalysis = async () => {
    const rawLines = inputText.split("\n").map(s => s.trim()).filter(Boolean);
    if (rawLines.length === 0) return;
    setLoading(true);

    const apiRes = await runBatchRiskScreening(rawLines);
    if (apiRes && apiRes.results) {
      setResults(apiRes.results);
      if (showToast) showToast(`Successfully screened ${apiRes.screened_count} addresses`);
    }
    setLoading(false);
  };

  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Address,Chain,RiskScore,RiskLevel,RiskFactors\n";
    results.forEach(r => {
      csvContent += `"${r.address}","${r.chain || 'ETH'}","${r.risk_score}","${r.risk_level}","${(r.risk_factors || []).join(';')}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `risk_screening_batch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (showToast) showToast("Batch risk results exported as CSV!");
  };

  const filtered = results.filter((r) => {
    if (filterRisk === "HIGH") return r.risk_score >= 80;
    if (filterRisk === "MEDIUM") return r.risk_score >= 50 && r.risk_score < 80;
    return true;
  });

  const highCount = results.filter(r => r.risk_score >= 80).length;
  const avgScore = results.length > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.risk_score, 0) / results.length) : 72;

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1f1f1f" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>RISK SCREENING</h2>
          <p style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Screen multiple addresses simultaneously against global threat intelligence feeds.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleExportCSV} className="btn-outline" style={{ padding: "9px 18px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>EXPORT CSV
          </button>
          <button onClick={() => onNavigate && onNavigate("reports")} className="btn-red" style={{ padding: "9px 18px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>summarize</span>GENERATE REPORT
          </button>
        </div>
      </div>

      {/* Bento Input + Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Batch Input */}
        <div style={{ background: "#111", border: "1px solid #222", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 18px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#e53935" }}>list_alt</span>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>BATCH INPUT</span>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: "#e53935", color: "#fff", letterSpacing: "0.08em" }}>MAX 500 LINES</span>
          </div>
          <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={"ENTER ADDRESSES (ONE PER LINE)...\ne.g., 0x71C7656EC7ab88b098defB751B7401B5f6d89B83\nbc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx89lq"}
              style={{
                flex: 1, minHeight: 140,
                background: "#0d0d0d", border: "1px solid #222",
                color: "#ccc", padding: 12,
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
                resize: "none", outline: "none",
                textTransform: "uppercase", letterSpacing: "0.04em",
              }}
            />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button
                  onClick={() => {
                    const sample1 = "0x71C7656EC7ab88b098defB751B7401B5f6d89B83";
                    const sample2 = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx89lq";
                    const sample3 = generateRandomValidAddress("eth");
                    const invalidSample = "INVALID_STRING_TEST";
                    setInputText(`${sample1}\n${sample2}\n${sample3}\n${invalidSample}`);
                  }}
                  style={{
                    padding: "7px 12px", fontSize: 10, background: "#1a1a1a", border: "1px solid #333", color: "#aaa", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
                  }}
                >
                  🎲 LOAD TEST ADDRESSES
                </button>
                <button
                  onClick={handleRunAnalysis}
                  className="btn-red"
                  style={{ padding: "9px 20px", fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}
                >
                  {loading ? "SCANNING..." : "RUN ANALYSIS"}{" "}
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                </button>
              </div>

          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Avg Risk */}
          <div style={{ background: "#111", border: "1px solid #222", padding: 16, flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>AVERAGE RISK SCORE</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#e53935", lineHeight: 1 }}>{avgScore}</span>
              <span style={{ fontSize: 13, color: "#444" }}>/ 100</span>
            </div>
          </div>

          {/* High Risk */}
          <div style={{ background: "#111", border: "1px solid #e53935", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flex: 1 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e53935", marginBottom: 8 }}>HIGH RISK DETECTED</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: "#e53935", lineHeight: 1 }}>{highCount}</span>
                <span style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>ADDRESSES</span>
              </div>
            </div>
            <div style={{ width: 44, height: 44, background: "rgba(229,57,53,0.15)", border: "1px solid #e53935", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 22, color: "#e53935" }}>warning</span>
            </div>
          </div>

          {/* Top Flagged */}
          <div style={{ background: "#111", border: "1px solid #222", padding: 16, flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>TOP FLAGGED ENTITIES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["TORNADO CASH", "(4)"], ["LAZARUS GRP", "(2)"], ["DARKNET", "(8)"]].map(([name, count]) => (
                <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: "#1a1a1a", border: "1px solid #222" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "#ccc" }}>{name}</span>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#e53935" }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results Table */}
      <div style={{ background: "#111", border: "1px solid #222" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#e53935" }}>table_rows</span>
            <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>ANALYSIS RESULTS</span>
          </div>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            style={{ background: "#0d0d0d", border: "1px solid #333", color: "#ccc", padding: "6px 12px", fontSize: 10, fontWeight: 700, outline: "none", cursor: "pointer", letterSpacing: "0.06em" }}
          >
            <option value="ALL">ALL RISKS</option>
            <option value="HIGH">HIGH RISK (&gt;80)</option>
            <option value="MEDIUM">MEDIUM RISK (50-80)</option>
          </select>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
              {["WALLET ADDRESS", "CHAIN", "RISK SCORE", "KEY RISK FACTORS", "ACTION"].map((h, i) => (
                <th key={h} style={{ padding: "10px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#444", textAlign: i === 4 ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 600 }}>{row.address}</td>
                <td style={{ padding: "14px 16px" }}>
                  <span className="chain-badge">{row.chain || "ETH"}</span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div className="risk-bar-track" style={{ width: 100 }}>
                      <div className="risk-bar-fill" style={{ width: `${row.risk_score}%`, background: levelColor(row.risk_score) }} />
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: levelColor(row.risk_score) }}>{row.risk_score}</span>
                  </div>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {(row.risk_factors || []).map((f: string) => (
                      <span key={f} style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", background: row.risk_score >= 80 ? "#e53935" : "#333", color: "#fff", letterSpacing: "0.06em" }}>{f}</span>
                    ))}
                  </div>
                </td>
                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                  <button
                    onClick={() => onNavigate && onNavigate("wallet", row.address)}
                    className="btn-outline"
                    style={{ padding: "5px 12px", fontSize: 9 }}
                  >
                    INVESTIGATE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 18px", borderTop: "1px solid #1f1f1f", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.06em", textTransform: "uppercase" }}>SHOWING {filtered.length} OF {results.length} SCREENED ADDRESSES</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} style={{ width: 28, height: 28, background: "#0d0d0d", border: "1px solid #333", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_left</span>
            </button>
            <button onClick={() => setCurrentPage(currentPage + 1)} style={{ width: 28, height: 28, background: "#0d0d0d", border: "1px solid #333", color: "#666", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
