"use client";
import React, { useState, useEffect } from "react";
import { getLiveAlerts } from "../lib/api";

interface AlertsPageProps {
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

const mockAlerts = [
  { id: "ALT-1092", title: "OFAC Sanctions Match: 0x71C7656EC7...", severity: "CRITICAL", source: "US Treasury OFAC Feed", time: "10 mins ago", status: "UNACKNOWLEDGED", wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d89B83", summary: "Address added to SDN list under Cyber-Related Sanctions program." },
  { id: "ALT-1088", title: "Mixer Deposit Velocity Alert", severity: "HIGH", source: "On-Chain Heuristics Engine", time: "45 mins ago", status: "UNACKNOWLEDGED", wallet: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx89lq", summary: "14 high-value deposits routed into Tornado Cash within 30-minute window." },
  { id: "ALT-1045", title: "Darknet Forum Chatter Linkage", severity: "MEDIUM", source: "OSINT Crawler", time: "2 hours ago", status: "ACKNOWLEDGED", wallet: "0x89D2c4F192837192837192837192837192837192", summary: "Wallet handle mentioned on BreachForums selling database dumps." },
  { id: "ALT-1011", title: "Exchange Deposit Spike Flag", severity: "LOW", source: "Binance VASP Monitor", time: "5 hours ago", status: "ACKNOWLEDGED", wallet: "0x3c554e94ea88a0400db4681604a11f26f2a36b95", summary: "Unusual deposit volume exceeding 30-day moving average by 400%." },
];

export default function AlertsPage({ onNavigate, showToast }: AlertsPageProps) {
  const [alertsList, setAlertsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadAlerts() {
      const data = await getLiveAlerts();
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item: any) => ({
          id: item.id || `ALT-${Math.floor(Math.random()*8000+1000)}`,
          title: item.desc || "High Risk Transfer Detected",
          severity: item.level || "CRITICAL",
          source: `Realtime ${item.chain || 'ETH'} Monitor`,
          time: item.time || "Just Now",
          status: "UNACKNOWLEDGED",
          wallet: item.fullAddress || item.wallet || "0x71C7656EC7ab88b098defB751B7401B5f6d89B83",
          summary: `${item.category || 'Threat Intelligence'} alert triggered for target wallet.`
        }));
        setAlertsList(mapped);
      }
    }
    loadAlerts();
  }, []);

  const toggleAcknowledge = (id: string) => {
    setAlertsList(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === "UNACKNOWLEDGED" ? "ACKNOWLEDGED" : "UNACKNOWLEDGED";
        if (showToast) showToast(`Alert ${id} set to ${nextStatus}`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1f1f1f" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>OSINT & REAL-TIME ALERTS</h2>
          <p style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Live threat feeds, sanctions list updates, and automated watchlist triggers.</p>
        </div>
        <button onClick={() => showToast && showToast("Alert webhook trigger configured!")} className="btn-red" style={{ padding: "9px 18px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>notifications_active</span>CREATE ALERT RULE
        </button>
      </div>

      {/* Alerts Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {alertsList.map((alt) => (
          <div key={alt.id} style={{ background: "#111", border: `1px solid ${alt.status === "UNACKNOWLEDGED" ? "#e53935" : "#222"}`, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: alt.severity === "CRITICAL" ? "#e53935" : alt.severity === "HIGH" ? "#ff9800" : "#333", color: "#fff" }}>{alt.severity}</span>
                  <span style={{ fontSize: 10, color: "#e53935", fontWeight: 700 }}>{alt.source}</span>
                  <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>• {alt.time}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{alt.title}</h3>
              </div>
              <button
                onClick={() => toggleAcknowledge(alt.id)}
                style={{
                  fontSize: 9, fontWeight: 800, padding: "4px 10px",
                  background: alt.status === "UNACKNOWLEDGED" ? "#e53935" : "transparent",
                  border: alt.status === "UNACKNOWLEDGED" ? "none" : "1px solid #444",
                  color: "#fff", cursor: "pointer", letterSpacing: "0.08em"
                }}
              >
                {alt.status}
              </button>
            </div>

            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14 }}>{alt.summary}</p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1a1a1a", padding: "10px 14px", border: "1px solid #222" }}>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>Target: {alt.wallet}</span>
              <button onClick={() => onNavigate && onNavigate("wallet", alt.wallet)} className="btn-red" style={{ padding: "5px 12px", fontSize: 9 }}>
                INVESTIGATE TARGET
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
