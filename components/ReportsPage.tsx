"use client";
import React, { useState, useEffect } from "react";
import { generateReport } from "../lib/api";

interface ReportsPageProps {
  caseIdParam?: string;
  addressParam?: string;
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

export default function ReportsPage({ caseIdParam = "CS-2941", addressParam = "0x28c6c06298d514db089934071355e5743bf21d60", onNavigate, showToast }: ReportsPageProps) {
  const [caseId, setCaseId] = useState(caseIdParam);
  const [wallet, setWallet] = useState(addressParam);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseIdParam) setCaseId(caseIdParam);
    if (addressParam) setWallet(addressParam);
    handleGenerateWithWallet(addressParam);
  }, [caseIdParam, addressParam]);

  const handleGenerateWithWallet = async (w: string) => {
    setLoading(true);
    const res = await generateReport(caseIdParam, w);
    if (res) {
      setReport(res);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    const res = await generateReport(caseId, wallet);
    if (res) {
      setReport(res);
      if (showToast) showToast(`Report ${res.report_id} generated successfully!`);
    }
    setLoading(false);
  };

  const handleDownloadCSV = () => {
    if (!report) return;
    const csvContent = `data:text/csv;charset=utf-8,ReportID,CaseID,Wallet,RiskScore,TracedVolume\n"${report.report_id}","${report.case_id}","${report.subject_wallet}","${report.risk_score}","${report.total_traced_volume_usd}"`;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `forensic_report_${report.case_id}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    if (showToast) showToast("Downloaded CSV report evidence file!");
  };

  const handleDownloadPDF = () => {
    window.print();
    if (showToast) showToast("Exporting PDF evidence file...");
  };

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1f1f1f" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>INVESTIGATION REPORTS</h2>
          <p style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Export court-ready forensic investigation reports with chain of custody hash logs.</p>
        </div>
      </div>

      {/* Generator Form */}
      <div style={{ background: "#111", border: "1px solid #222", padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e53935", marginBottom: 16 }}>GENERATE NEW CASE REPORT</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 9, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>CASE ID</label>
            <input
              type="text"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 9, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>SUBJECT WALLET ADDRESS</label>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, outline: "none" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              onClick={handleGenerate}
              className="btn-red"
              style={{ width: "100%", padding: "12px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {loading ? "GENERATING..." : "GENERATE REPORT"}
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Card */}
      {report && (
        <div className="card-red-border" style={{ background: "#111", border: "1px solid #222", borderLeft: "4px solid #e53935", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: "#e53935", color: "#fff", letterSpacing: "0.08em", display: "inline-block", marginBottom: 8 }}>
                CONFIDENTIAL FORENSIC EVIDENCE
              </span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>{report.report_id}</h3>
              <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>Subject: {report.subject_wallet} • Case ID: {report.case_id}</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDownloadCSV} className="btn-outline" style={{ padding: "8px 14px", fontSize: 10 }}>DOWNLOAD CSV</button>
              <button onClick={handleDownloadPDF} className="btn-red" style={{ padding: "8px 14px", fontSize: 10 }}>DOWNLOAD PDF</button>
            </div>
          </div>

          <div style={{ background: "#1a1a1a", padding: 16, border: "1px solid #222", marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#555", marginBottom: 6 }}>EXECUTIVE SUMMARY</div>
            <div style={{ fontSize: 13, color: "#ccc", lineHeight: 1.6 }}>{report.executive_summary}</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div style={{ background: "#0d0d0d", padding: 12, border: "1px solid #222" }}>
              <div style={{ fontSize: 9, color: "#555" }}>RISK SCORE</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#e53935" }}>{report.risk_score}/100</div>
            </div>
            <div style={{ background: "#0d0d0d", padding: 12, border: "1px solid #222" }}>
              <div style={{ fontSize: 9, color: "#555" }}>TRACED VOLUME</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'JetBrains Mono', monospace" }}>{report.total_traced_volume_usd}</div>
            </div>
            <div style={{ background: "#0d0d0d", padding: 12, border: "1px solid #222" }}>
              <div style={{ fontSize: 9, color: "#555" }}>GENERATED TIMESTAMP</div>
              <div style={{ fontSize: 11, color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>{report.generated_at}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
