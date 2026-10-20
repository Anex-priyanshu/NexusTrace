"use client";
import React, { useState, useEffect } from "react";
import { searchScamDb, submitScamReport } from "../lib/api";

interface ScamDbPageProps {
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

const mockScams = [
  { id: "SCAM-9081", title: "Lazarus Group Ransomware Pool", category: "Ransomware / APT", wallet: "0x71C7656EC7ab88b098defB751B7401B5f6d89B83", domain: "lazarus-decrypt.onion", severity: "CRITICAL", reportedAt: "2026-07-28", desc: "Attributed to North Korean APT 38 cyber criminal syndicate targeting DeFi protocol liquidity pools." },
  { id: "SCAM-8912", title: "Fake Uniswap v4 Phishing Campaign", category: "Phishing / Drainer", wallet: "0x3c554e94ea88a0400db4681604a11f26f2a36b95", domain: "app-uniswap-v4-claim.io", severity: "HIGH", reportedAt: "2026-07-25", desc: "Malicious permit2 approval drainer targeting high-value Ethereum liquidity provider tokens." },
  { id: "SCAM-8401", title: "Tornado Cash Darknet Clearinghouse", category: "Mixer / Money Laundering", wallet: "0x89D2c4F192837192837192837192837192837192", domain: "mixer-clearing.onion", severity: "CRITICAL", reportedAt: "2026-07-20", desc: "High-volume laundering address receiving proceeds from major crypto exchange exploits." },
  { id: "SCAM-7920", title: "Telegram Pig Butchering Fraud Ring", category: "Investment Scam", wallet: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx89lq", domain: "crypto-yield-ai-trader.com", severity: "HIGH", reportedAt: "2026-07-15", desc: "Social engineering scam impersonating regulatory officers to request secondary security deposits." },
];

export default function ScamDbPage({ onNavigate, showToast }: ScamDbPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [scamList, setScamList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newAddr, setNewAddr] = useState("");
  const [newEntity, setNewEntity] = useState("");
  const [newCategory, setNewCategory] = useState("Phishing");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    handleSearch("");
  }, []);

  const handleSearch = async (query?: string) => {
    const term = query !== undefined ? query : searchTerm;
    const res = await searchScamDb(term);
    if (res && res.results && res.results.length > 0) {
      const mapped = res.results.map((item: any, index: number) => ({
        id: `SCAM-${9000 - index}`,
        title: item.entity,
        category: item.category,
        wallet: item.address,
        domain: `${item.entity.toLowerCase().replace(/[^a-z0-9]/g, '')}-threat.onion`,
        severity: item.severity,
        reportedAt: "2026-07-30",
        desc: `High-risk entity entry matching tags: ${(item.tags || []).join(', ')}.`
      }));
      setScamList(mapped);
    }
  };

  const handleCreateReport = async () => {
    if (!newAddr.trim() || !newEntity.trim()) {
      if (showToast) showToast("Please enter wallet address and entity name!");
      return;
    }

    const res = await submitScamReport(newAddr, newEntity, newCategory, newDesc);
    if (res && res.success) {
      if (showToast) showToast(`Successfully added ${newAddr.slice(0, 10)}... to Scam DB!`);
      setShowModal(false);
      setNewAddr("");
      setNewEntity("");
      setNewDesc("");
      handleSearch(searchTerm);
    } else {
      if (showToast) showToast(`Error: ${res?.error || 'Failed to submit report'}`);
    }
  };

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1f1f1f" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>SCAM INTELLIGENCE DATABASE</h2>
          <p style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Search global threat intelligence, illicit address blacklists, phishing domains, and darknet handles.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-red" style={{ padding: "9px 18px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add</span>SUBMIT INTEL ENTRY
        </button>
      </div>

      {/* Submit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111", border: "1px solid #e53935", width: 440, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.9)" }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", textTransform: "uppercase", marginBottom: 16 }}>SUBMIT NEW THREAT INTEL</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, fontWeight: 800, color: "#666", display: "block", marginBottom: 4 }}>WALLET ADDRESS</label>
              <input
                type="text"
                value={newAddr}
                onChange={(e) => setNewAddr(e.target.value)}
                placeholder="e.g. 0x71C7656EC7ab..."
                style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, fontWeight: 800, color: "#666", display: "block", marginBottom: 4 }}>ENTITY NAME</label>
              <input
                type="text"
                value={newEntity}
                onChange={(e) => setNewEntity(e.target.value)}
                placeholder="e.g. Angel Drainer Fraud Cluster"
                style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: 10, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 9, fontWeight: 800, color: "#666", display: "block", marginBottom: 4 }}>THREAT CATEGORY</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: 10, fontSize: 11 }}
              >
                <option value="Phishing">Phishing / Drainer</option>
                <option value="Mixer">Mixer / Laundering</option>
                <option value="APT">APT / State Hacking</option>
                <option value="Ransomware">Ransomware</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 9, fontWeight: 800, color: "#666", display: "block", marginBottom: 4 }}>EVIDENCE DESCRIPTION</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe linked txs or phishing domain..."
                style={{ width: "100%", background: "#0d0d0d", border: "1px solid #333", color: "#fff", padding: 10, fontSize: 11, height: 60 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} className="btn-outline" style={{ padding: "8px 16px", fontSize: 10 }}>CANCEL</button>
              <button onClick={handleCreateReport} className="btn-red" style={{ padding: "8px 16px", fontSize: 10 }}>SUBMIT TO DB</button>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="SEARCH BY WALLET ADDRESS, PHISHING DOMAIN, OR THREAT ENTITY..."
          style={{
            flex: 1, background: "#111", border: "1px solid #333", color: "#fff",
            padding: "12px 18px", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, outline: "none"
          }}
        />
        <button onClick={() => handleSearch()} className="btn-red" style={{ padding: "0 24px", fontSize: 11 }}>
          SEARCH DB
        </button>
      </div>

      {/* Results List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {scamList.map((scam) => (
          <div key={scam.id} style={{ background: "#111", border: "1px solid #222", padding: 20, borderLeft: `4px solid ${scam.severity === "CRITICAL" ? "#e53935" : "#ff9800"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: scam.severity === "CRITICAL" ? "#e53935" : "#ff9800", color: "#fff" }}>{scam.severity}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#888", textTransform: "uppercase" }}>{scam.category}</span>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>• ID: {scam.id}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{scam.title}</h3>
              </div>
              <span style={{ fontSize: 10, color: "#555", fontFamily: "'JetBrains Mono', monospace" }}>Reported: {scam.reportedAt}</span>
            </div>

            <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, lineHeight: 1.5 }}>{scam.desc}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, background: "#1a1a1a", padding: 12, border: "1px solid #222", marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 9, color: "#555", display: "block" }}>FLAGGED WALLET ADDRESS</span>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#e53935", fontWeight: 700 }}>{scam.wallet}</span>
              </div>
              <div>
                <span style={{ fontSize: 9, color: "#555", display: "block" }}>ASSOCIATED PHISHING DOMAIN</span>
                <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>{scam.domain}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onNavigate && onNavigate("wallet", scam.wallet)} className="btn-red" style={{ padding: "6px 14px", fontSize: 10 }}>
                INVESTIGATE WALLET
              </button>
              <button onClick={() => onNavigate && onNavigate("graph", scam.wallet)} className="btn-outline" style={{ padding: "6px 14px", fontSize: 10 }}>
                OPEN IN GRAPH
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

