"use client";
import React, { useState, useEffect } from "react";
import { getLiveAlerts } from "../lib/api";
import { getRecentCases, UserCase } from "../lib/casesStore";

interface DashboardProps {
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

const defaultAlerts = [
  {
    level: "CRITICAL",
    time: "Realtime Feed",
    wallet: "0x71c7...9b83",
    fullAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d89B83",
    desc: "Tornado Cash Privacy Mixer Router transaction detected on-chain",
    isDottedBg: true,
    btnWhite: true
  },
  {
    level: "CRITICAL",
    time: "Realtime Feed",
    wallet: "0x098b...2f96",
    fullAddress: "0x098b716b8aaf21512996dc57eb0615e2383e2f96",
    desc: "OFAC Sanctioned Lazarus Group cluster active movement",
    isDottedBg: false,
    btnWhite: false
  },
];

export default function DashboardPage({ onNavigate, showToast }: DashboardProps) {
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [userCases, setUserCases] = useState<UserCase[]>([]);

  useEffect(() => {
    setUserCases(getRecentCases());

    async function fetchAlerts() {
      const data = await getLiveAlerts();
      if (data && Array.isArray(data) && data.length > 0) {
        const mapped = data.slice(0, 2).map((item: any, i: number) => ({
          level: item.level || "CRITICAL",
          time: item.time || "Just Now",
          wallet: item.wallet ? `${item.wallet.slice(0, 6)}...` : "0x7a2...f8B",
          fullAddress: item.fullAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d89B83",
          desc: item.desc || "Mixer activity detected",
          isDottedBg: i % 2 === 0,
          btnWhite: i % 2 === 0
        }));
        setAlertsList(mapped);
      } else {
        setAlertsList(defaultAlerts);
      }
    }
    fetchAlerts();
  }, []);

  const dynamicKpis = [
    { label: "ACTIVE INVESTIGATIONS", value: userCases.length.toString(), icon: "trending_up", accent: false, targetPage: "wallet" },
    { label: "HIGH-RISK ALERTS", value: alertsList.filter(a => a.level === "CRITICAL" || a.level === "HIGH").length.toString(), icon: "warning", accent: true, targetPage: "risk" },
    { label: "SCAM DB ENTRIES", value: "18", tag: "LIVE THREATS", accent: false, targetPage: "scamdb" },
    { label: "NODES MONITORED", value: "3,482", icon: "dns", accent: false, targetPage: "graph" },
  ];

  return (
    <div style={{ padding: "32px 28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Welcome & Status */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "0.03em", textTransform: "uppercase", color: "#fff", marginBottom: 12 }}>
          GOOD MORNING, INVESTIGATOR.
        </h2>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#111", border: "1px solid #222", padding: "6px 12px" }}>
          <div style={{ width: 8, height: 8, background: "#e53935", flexShrink: 0 }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ddd", fontFamily: "'Inter', sans-serif" }}>
            SYSTEM STATUS: ALL CHAINS OPERATIONAL
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 36 }}>
        {dynamicKpis.map((kpi) => (
          <div
            key={kpi.label}
            onClick={() => onNavigate && onNavigate(kpi.targetPage)}
            style={{
              background: "#111",
              border: `1px solid ${kpi.accent ? "#e53935" : "#222"}`,
              padding: "18px 20px",
              position: "relative",
              cursor: "pointer",
              transition: "transform 0.15s, border-color 0.15s",
            }}
          >
            {kpi.accent && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#e53935" }} />
            )}
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", marginBottom: 12 }}>
              {kpi.label}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontSize: 34, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>
                {kpi.value}
              </span>
              {kpi.icon && (
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#e53935", marginBottom: 2 }}>
                  {kpi.icon}
                </span>
              )}
              {kpi.tag && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", background: "#e53935", color: "#fff", letterSpacing: "0.1em", marginBottom: 2 }}>
                  {kpi.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Alerts + Cases */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 24 }}>
        {/* Recent Alerts */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>RECENT ALERTS</span>
            <button
              onClick={() => onNavigate && onNavigate("alerts")}
              style={{ fontSize: 10, color: "#e53935", fontWeight: 800, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              VIEW ALL
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {alertsList.map((a, i) => (
              <div
                key={i}
                style={{
                  background: "#111",
                  backgroundImage: a.isDottedBg ? "radial-gradient(circle, #333 1.5px, transparent 1.5px)" : "none",
                  backgroundSize: "14px 14px",
                  border: "1px solid #222",
                  padding: 18,
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: "#e53935", color: "#fff", letterSpacing: "0.08em" }}>
                    {a.level}
                  </span>
                  <span style={{ fontSize: 10, color: "#777", fontFamily: "'JetBrains Mono', monospace", border: "1px solid #2a2a2a", padding: "2px 6px" }}>
                    {a.time}
                  </span>
                </div>

                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                  {a.wallet}
                </div>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>
                  {a.desc}
                </div>

                <button
                  onClick={() => onNavigate && onNavigate("wallet", a.fullAddress)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: a.btnWhite ? "#ffffff" : "#1f1f1f",
                    color: a.btnWhite ? "#000000" : "#ffffff",
                    border: a.btnWhite ? "none" : "1px solid #333333"
                  }}
                >
                  INVESTIGATE
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Cases */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>RECENT CASES</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["filter_list", "more_vert"].map((icon) => (
                <button
                  key={icon}
                  onClick={() => showToast && showToast(`Case Filter: ${icon}`)}
                  style={{ width: 32, height: 32, background: "#111", border: "1px solid #222", color: "#888", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#111", border: "1px solid #222" }}>
            {userCases.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center", color: "#888" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: "#e53935", display: "block", marginBottom: 10 }}>
                  folder_open
                </span>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>NO RECENT CASES FOUND</div>
                <div style={{ fontSize: 11, color: "#666", marginBottom: 16 }}>Search any wallet address or click "ADD TO CASE" to track your active investigations here.</div>
                <button
                  onClick={() => onNavigate && onNavigate("wallet")}
                  className="btn-red"
                  style={{ padding: "8px 18px", fontSize: 10 }}
                >
                  START INVESTIGATION
                </button>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #222" }}>
                    {["CASE ID", "SUBJECT (WALLET)", "ASSIGNEE", "LAST ACTIVITY", "STATUS"].map((h) => (
                      <th key={h} style={{ padding: "12px 14px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#555", textAlign: "left" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userCases.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => onNavigate && onNavigate("wallet", c.fullAddress)}
                      style={{ borderBottom: "1px solid #1a1a1a", cursor: "pointer" }}
                    >
                      <td style={{ padding: "14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#e53935", fontWeight: 700 }}>{c.id}</td>
                      <td style={{ padding: "14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>{c.wallet}</td>
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 24, height: 24, background: "rgba(229,57,53,0.15)", border: "1px solid #e53935", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 900, color: "#e53935", borderRadius: 3 }}>
                            {c.assignee}
                          </div>
                          <span style={{ fontSize: 11, color: "#ccc", fontWeight: 600 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px", fontSize: 11, color: "#888", fontFamily: "'JetBrains Mono', monospace" }}>{c.activity}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          fontSize: 9, fontWeight: 800, padding: "4px 8px", borderRadius: 3,
                          background: c.isRedStatus ? "#e53935" : "transparent",
                          border: c.isRedStatus ? "none" : "1px solid #444",
                          color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase",
                          display: "inline-block",
                        }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

