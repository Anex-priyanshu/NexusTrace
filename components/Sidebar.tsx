"use client";
import React from "react";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "wallet", label: "Wallet Investigation", icon: "account_balance_wallet" },
  { id: "graph", label: "Graph Explorer", icon: "hub" },
  { id: "risk", label: "Risk Screening", icon: "security" },
  { id: "contracts", label: "Smart Contract Lab", icon: "terminal" },
  { id: "crosschain", label: "Cross-Chain Tracer", icon: "alt_route" },
  { id: "scamdb", label: "Scam Intelligence", icon: "database" },
  { id: "alerts", label: "OSINT & Alerts", icon: "notifications_active" },
  { id: "reports", label: "Reports", icon: "description" },
];

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <nav
      style={{
        width: 220,
        minWidth: 220,
        background: "#0d0d0d",
        borderRight: "1px solid #1f1f1f",
        display: "flex",
        flexDirection: "column",
        padding: "20px 0",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        onClick={() => onNavigate("dashboard")}
        style={{ padding: "0 20px 20px 20px", borderBottom: "1px solid #1f1f1f", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 32, height: 32,
              background: "#e53935",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 18, color: "#fff" }}>radar</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.05em", textTransform: "uppercase", color: "#fff" }}>Chronos Forensics</div>
            <div style={{ fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", fontWeight: 600 }}>Cyber Intelligence</div>
          </div>
        </div>
      </div>

      {/* Start Investigation CTA */}
      <div style={{ padding: "14px 14px 8px 14px" }}>
        <button
          onClick={() => onNavigate("wallet")}
          className="btn-red"
          style={{
            width: "100%", padding: "10px 12px", fontSize: 11,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontWeight: 800,
          }}
        >
          <span className="material-symbols-outlined icon-fill" style={{ fontSize: 16 }}>play_arrow</span>
          START INVEST.
        </button>
      </div>

      {/* Main nav */}
      <div style={{ flex: 1, padding: "6px 10px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px",
                background: isActive ? "#e53935" : "transparent",
                border: "none",
                color: isActive ? "#fff" : "#888",
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                fontWeight: isActive ? 700 : 500,
                fontSize: 11,
                letterSpacing: isActive ? "0.04em" : "0.02em",
                textTransform: isActive ? "uppercase" : "none",
                transition: "all 0.15s",
              }}
            >
              <span className={`material-symbols-outlined ${isActive ? "icon-fill" : ""}`} style={{ fontSize: 18 }}>
                {item.icon}
              </span>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 10px", borderTop: "1px solid #1f1f1f", display: "flex", flexDirection: "column", gap: 2 }}>
        <button
          onClick={() => onNavigate("admin")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 12px", background: activePage === "admin" ? "#1f1f1f" : "transparent", border: "none",
            color: activePage === "admin" ? "#fff" : "#666", cursor: "pointer", fontSize: 11, fontWeight: 500,
            transition: "color 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>settings</span>
          Settings
        </button>
        <button
          onClick={() => alert("Chronos Forensics Helpdesk\nContact: forensics-support@chronosforensics.internal\nDoc Version: v1.0.0 (Production PRD)")}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "7px 12px", background: "transparent", border: "none",
            color: "#666", cursor: "pointer", fontSize: 11, fontWeight: 500,
            transition: "color 0.15s",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 17 }}>help_outline</span>
          Support
        </button>
      </div>
    </nav>
  );
}

