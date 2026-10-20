"use client";
import React, { useState } from "react";

interface AdminPageProps {
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

export default function AdminPage({ showToast }: AdminPageProps) {
  const [apiKey, setApiKey] = useState("cs_live_99f012a84b1239c81726a4891");
  const [nodeRpc, setNodeRpc] = useState("https://mainnet.infura.io/v3/official-key-nexus");
  const [autoExport, setAutoExport] = useState(true);

  const handleSave = () => {
    if (showToast) showToast("System settings and API keys updated successfully!");
  };

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1f1f1f" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>SETTINGS & SYSTEM ADMIN</h2>
          <p style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Configure multi-chain RPC providers, risk engine APIs, team RBAC, and forensic audit log preferences.</p>
        </div>
        <button onClick={handleSave} className="btn-red" style={{ padding: "9px 18px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>save</span>SAVE CHANGES
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* API Credentials */}
        <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e53935", marginBottom: 16 }}>API & DATA PROVIDER KEYS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 9, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>GRAPHQL BFF API TOKEN</label>
              <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
            </div>
            <div>
              <label style={{ fontSize: 9, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>ETHEREUM RPC NODE ENDPOINT</label>
              <input type="text" value={nodeRpc} onChange={(e) => setNodeRpc(e.target.value)} style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: "10px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }} />
            </div>
          </div>
        </div>

        {/* Audit & Compliance */}
        <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#e53935", marginBottom: 16 }}>AUDIT & COURT REPRODUCIBILITY</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", display: "block" }}>Cryptographic Hash Logging</span>
                <span style={{ fontSize: 10, color: "#666" }}>Automatically compute SHA-256 evidence hashes for PDF report exports</span>
              </div>
              <input type="checkbox" checked={autoExport} onChange={(e) => setAutoExport(e.target.checked)} style={{ accentColor: "#e53935", width: 18, height: 18, cursor: "pointer" }} />
            </div>

            <div style={{ borderTop: "1px solid #222", paddingTop: 14 }}>
              <span style={{ fontSize: 10, color: "#555", display: "block", marginBottom: 4 }}>ORGANIZATION ID</span>
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>ORG-CYBER-FORENSICS-US-940</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
