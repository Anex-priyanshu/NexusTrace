"use client";
import React, { useState, useEffect } from "react";
import { getMarketPrices, getLiveAlerts } from "../lib/api";
import { validateAddress, generateRandomValidAddress } from "../lib/addressValidator";
import { getRecentCases, UserCase } from "../lib/casesStore";

interface TopbarProps {
  onSearch?: (query: string) => void;
  showToast?: (msg: string) => void;
  placeholder?: string;
}

export default function Topbar({ onSearch, showToast, placeholder = "Enter Wallet, TXID, or Contract to begin tracing..." }: TopbarProps) {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [prices, setPrices] = useState<any>({ ETH: 3120, BTC: 64500, SOL: 145 });
  const [recentCasesList, setRecentCasesList] = useState<UserCase[]>([]);
  const [liveAlertsList, setLiveAlertsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadPrices() {
      const data = await getMarketPrices();
      if (data && data.prices) {
        setPrices(data.prices);
      }
    }
    loadPrices();
    const interval = setInterval(loadPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showHistory) {
      setRecentCasesList(getRecentCases());
    }
  }, [showHistory]);

  useEffect(() => {
    if (showNotifications) {
      async function loadAlerts() {
        const alerts = await getLiveAlerts();
        if (alerts && Array.isArray(alerts)) {
          setLiveAlertsList(alerts);
        }
      }
      loadAlerts();
    }
  }, [showNotifications]);

  const handleExecuteSearch = (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;

    const val = validateAddress(clean);
    if (!val.isValid) {
      if (showToast) {
        showToast(`❌ ${val.error}`);
      }
      return;
    }

    if (onSearch) onSearch(clean);
    if (showToast) showToast(`Tracing ${val.formatName}: ${clean.slice(0, 10)}...`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleExecuteSearch(query);
    }
  };

  const handleGenerateRandomTestAddress = () => {
    const chains = ["eth", "btc", "sol", "tron"];
    const randomChain = chains[Math.floor(Math.random() * chains.length)];
    const generated = generateRandomValidAddress(randomChain);
    setQuery(generated);
    handleExecuteSearch(generated);
  };

  const handleAuthToggle = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      setShowProfile(false);
      if (showToast) showToast("🔒 Logged out of investigator session");
    } else {
      setIsLoggedIn(true);
      if (showToast) showToast("⚡ Authenticated: Investigator #9402 (Lead Cyber Forensics Analyst)");
    }
  };

  return (
    <header
      style={{
        height: 56,
        background: "#0d0d0d",
        borderBottom: "1px solid #1f1f1f",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Live Market Ticker */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginRight: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: "#888" }}>ETH:</span>
          <span style={{ color: "#4caf50", fontWeight: 700 }}>${prices.ETH ? prices.ETH.toLocaleString() : "3,120"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: "#888" }}>BTC:</span>
          <span style={{ color: "#4caf50", fontWeight: 700 }}>${prices.BTC ? prices.BTC.toLocaleString() : "64,500"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>
          <span style={{ color: "#888" }}>SOL:</span>
          <span style={{ color: "#4caf50", fontWeight: 700 }}>${prices.SOL ? prices.SOL.toLocaleString() : "145"}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          flex: 1,
          maxWidth: 620,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "#111",
          border: "1px solid #2a2a2a",
          padding: "7px 14px",
        }}
      >
        <span
          onClick={() => handleExecuteSearch(query)}
          className="material-symbols-outlined"
          style={{ fontSize: 18, color: "#555", cursor: "pointer" }}
        >
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#ccc",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
          }}
        />
        <button
          onClick={handleGenerateRandomTestAddress}
          title="Generate a cryptographically valid random test address"
          style={{
            padding: "4px 8px",
            fontSize: 9,
            background: "#1e1e1e",
            border: "1px solid #333",
            color: "#aaa",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            whiteSpace: "nowrap"
          }}
        >
          🎲 GEN TEST ADDR
        </button>
        <button
          onClick={() => handleExecuteSearch(query)}
          className="btn-red"
          style={{ padding: "4px 10px", fontSize: 9, textTransform: "uppercase", whiteSpace: "nowrap" }}
        >
          SEARCH
        </button>
      </div>

      {/* Topbar Action Buttons & Popovers */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
        {/* Notifications Icon Button */}
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowHistory(false);
            setShowHelp(false);
            setShowProfile(false);
          }}
          title="Notifications & Live Alerts"
          style={{
            width: 36, height: 36,
            background: "#111", border: "1px solid #2a2a2a",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", position: "relative",
            color: showNotifications ? "#e53935" : "#888",
            transition: "all 0.15s"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
          <span
            style={{
              position: "absolute", top: 6, right: 6,
              width: 7, height: 7, background: "#e53935",
              boxShadow: "0 0 6px #e53935"
            }}
          />
        </button>

        {/* Live Notifications Popover */}
        {showNotifications && (
          <div style={{
            position: "absolute", top: 48, right: 120, width: 320,
            background: "#111", border: "1px solid #333", zIndex: 100,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)", padding: 14
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #222" }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: "#e53935", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>notifications_active</span>
                LIVE THREAT ALERTS
              </span>
              <span style={{ fontSize: 9, background: "rgba(229,57,53,0.15)", color: "#e53935", padding: "1px 6px", fontWeight: 800 }}>
                {liveAlertsList.length} NEW
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
              {liveAlertsList.length === 0 ? (
                <div style={{ fontSize: 11, color: "#666", textAlign: "center", padding: "12px 0" }}>No unread security alerts</div>
              ) : (
                liveAlertsList.map((alt: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onSearch) onSearch(alt.fullAddress);
                      setShowNotifications(false);
                    }}
                    style={{ background: "#161616", border: "1px solid #282828", padding: "8px 10px", cursor: "pointer", borderRadius: 3 }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 900, color: "#e53935" }}>{alt.level || "CRITICAL"}</span>
                      <span style={{ fontSize: 9, color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>{alt.time || "Just Now"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#eee", fontWeight: 600, marginBottom: 2 }}>{alt.desc}</div>
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#888" }}>{alt.wallet}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* History / Traces Icon Button */}
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            setShowNotifications(false);
            setShowHelp(false);
            setShowProfile(false);
          }}
          title="Recent Tracing History"
          style={{
            width: 36, height: 36,
            background: "#111", border: "1px solid #2a2a2a",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: showHistory ? "#e53935" : "#888",
            transition: "all 0.15s"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>history</span>
        </button>

        {/* History Popover */}
        {showHistory && (
          <div style={{
            position: "absolute", top: 48, right: 80, width: 280,
            background: "#111", border: "1px solid #333", zIndex: 100,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)", padding: 14
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: "#e53935" }}>history</span>
              RECENT INVESTIGATION TRACES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
              {recentCasesList.length === 0 ? (
                <div style={{ fontSize: 11, color: "#666", textAlign: "center", padding: "12px 0" }}>
                  No recent investigation history. Search any wallet to start.
                </div>
              ) : (
                recentCasesList.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      if (onSearch) onSearch(c.fullAddress);
                      setShowHistory(false);
                    }}
                    style={{
                      padding: "8px 10px", background: "#161616", border: "1px solid #222",
                      cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 10, color: "#e53935", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", display: "block" }}>{c.id}</span>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>{c.wallet}</span>
                    </div>
                    <span style={{ fontSize: 9, color: "#666" }}>{c.activity}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Help / Shortcuts Icon Button */}
        <button
          onClick={() => {
            setShowHelp(!showHelp);
            setShowNotifications(false);
            setShowHistory(false);
            setShowProfile(false);
          }}
          title="Help & Hotkeys"
          style={{
            width: 36, height: 36,
            background: "#111", border: "1px solid #2a2a2a",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: showHelp ? "#e53935" : "#888",
            transition: "all 0.15s"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>help</span>
        </button>

        {/* Help & Hotkeys Popover */}
        {showHelp && (
          <div style={{
            position: "absolute", top: 48, right: 40, width: 260,
            background: "#111", border: "1px solid #333", zIndex: 100,
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)", padding: 14
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: "#fff", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>
              INVESTIGATOR SHORTCUTS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc" }}>
                <span>Focus Search Bar</span>
                <span style={{ background: "#222", padding: "1px 6px", fontSize: 10, fontFamily: "monospace", color: "#e53935" }}>Enter</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc" }}>
                <span>Generate Test Addr</span>
                <span style={{ background: "#222", padding: "1px 6px", fontSize: 10, fontFamily: "monospace", color: "#aaa" }}>🎲 Button</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc" }}>
                <span>Direct Node Trace</span>
                <span style={{ background: "#222", padding: "1px 6px", fontSize: 10, fontFamily: "monospace", color: "#aaa" }}>View Graph</span>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#2a2a2a", margin: "0 4px" }} />

        {/* User Profile Avatar Button (Matching Screenshot EXACTLY) */}
        <button
          onClick={() => {
            setShowProfile(!showProfile);
            setShowNotifications(false);
            setShowHistory(false);
            setShowHelp(false);
          }}
          title="Investigator Profile"
          style={{
            width: 36, height: 36,
            background: isLoggedIn ? "#e53935" : "#333",
            border: "none",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, fontWeight: 800, color: "#fff",
            cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {isLoggedIn ? "IN" : "OFF"}
        </button>

        {/* Investigator Profile Card Dropdown (Matching Screenshot EXACTLY) */}
        {showProfile && (
          <div style={{
            position: "absolute", top: 48, right: 0, width: 250,
            background: "#0d0d0d", border: "1px solid #222", zIndex: 100,
            padding: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.9)"
          }}>
            {isLoggedIn ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Inter', sans-serif", marginBottom: 2 }}>
                  Investigator #9402
                </div>
                <div style={{ fontSize: 11, color: "#777", marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>
                  Role: Lead Cyber Forensics Analyst
                </div>
                <button
                  onClick={handleAuthToggle}
                  style={{
                    width: "100%", padding: "10px",
                    background: "transparent", border: "1px solid #333",
                    color: "#fff", fontFamily: "'Inter', sans-serif",
                    fontSize: 11, fontWeight: 800, letterSpacing: "0.08em",
                    textTransform: "uppercase", cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.borderColor = "#e53935")}
                  onMouseOut={(e) => (e.currentTarget.style.borderColor = "#333")}
                >
                  LOG OUT
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#e53935", marginBottom: 2 }}>
                  SESSION OFFLINE
                </div>
                <div style={{ fontSize: 11, color: "#777", marginBottom: 16 }}>
                  Investigator #9402 session terminated.
                </div>
                <button
                  onClick={handleAuthToggle}
                  className="btn-red"
                  style={{ width: "100%", padding: "10px", fontSize: 11, fontWeight: 800 }}
                >
                  AUTHENTICATE SESSION
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
