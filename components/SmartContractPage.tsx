"use client";
import React, { useState } from "react";
import { getSmartContractAnalysis } from "../lib/api";
import { validateAddress, generateRandomValidAddress } from "../lib/addressValidator";

interface SmartContractPageProps {
  addressParam?: string;
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

export default function SmartContractPage({ addressParam = "0xE592427A0AEce92De3Edee1F18E0157C05861564", onNavigate, showToast }: SmartContractPageProps) {
  const [contractAddress, setContractAddress] = useState(addressParam);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [contractData, setContractData] = useState<any>({
    address: addressParam,
    contract_name: "Uniswap V3 SwapRouter",
    creator: "On-Chain Deployer Tx",
    verified: true,
    compiler: "EVM Compiler Bytecode Verified",
    proxy_pattern: "None",
    unlimited_approvals_found: 0,
    vulnerabilities: [],
    approvals: []
  });

  React.useEffect(() => {
    handleAnalyze(addressParam);
  }, [addressParam]);

  const handleAnalyze = async (targetAddr?: string) => {
    const addr = targetAddr || contractAddress;
    if (!addr.trim()) return;

    const val = validateAddress(addr);
    if (!val.isValid) {
      setValidationError(val.error || "Invalid Contract Address Format");
      if (showToast) showToast(`❌ ${val.error}`);
      return;
    }

    setValidationError(null);
    setLoading(true);
    const res = await getSmartContractAnalysis(addr);
    if (res) {
      setContractData(res);
      if (showToast) showToast(`Analyzed smart contract ${addr.slice(0, 10)}...`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 20, borderBottom: "1px solid #1f1f1f" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 6 }}>SMART CONTRACT LAB</h2>
          <p style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>Analyze smart contract bytecode, verified source code, proxy upgrades, and token approval risks.</p>
        </div>
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="Enter contract address (e.g. 0x71c7...)"
          style={{
            flex: 1, background: "#111", border: "1px solid #333", color: "#fff",
            padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: "none"
          }}
        />
        <button
          onClick={() => {
            const gen = generateRandomValidAddress("eth");
            setContractAddress(gen);
            handleAnalyze(gen);
          }}
          style={{
            padding: "0 14px", fontSize: 10, background: "#1a1a1a", border: "1px solid #333", color: "#aaa", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          🎲 GEN TEST CONTRACT
        </button>
        <button
          onClick={() => handleAnalyze()}
          className="btn-red"
          style={{ padding: "0 24px", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}
        >
          {loading ? "ANALYZING..." : "ANALYZE CONTRACT"}
        </button>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div style={{ background: "#2a0808", border: "1px solid #e53935", padding: "12px 16px", marginBottom: 20, color: "#ff8a80", fontSize: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
          <div>
            <strong>INVALID CONTRACT ADDRESS FORMAT:</strong> {validationError}
          </div>
        </div>
      )}


      {/* Contract Profile Bento */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>CONTRACT IDENTITY</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'JetBrains Mono', monospace", marginBottom: 4 }}>
            {contractData.contract_name}
          </div>
          <div style={{ fontSize: 11, color: "#e53935", fontFamily: "'JetBrains Mono', monospace", marginBottom: 16 }}>
            {contractData.address}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: "#4caf50", color: "#fff" }}>VERIFIED SOURCE</span>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: "#333", color: "#fff" }}>{contractData.proxy_pattern}</span>
          </div>
        </div>

        <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>CREATOR & COMPILER</div>
          <div style={{ fontSize: 12, color: "#ccc", fontFamily: "'JetBrains Mono', monospace", marginBottom: 8 }}>
            Creator: {contractData.creator}
          </div>
          <div style={{ fontSize: 11, color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>
            Compiler: {contractData.compiler}
          </div>
        </div>

        <div style={{ background: "#111", border: "1px solid #e53935", padding: 20 }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e53935", marginBottom: 12 }}>TOKEN APPROVAL SCANNER</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "#e53935", lineHeight: 1, marginBottom: 4 }}>
            {contractData.unlimited_approvals_found}
          </div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            UNLIMITED DANGEROUS APPROVALS DETECTED
          </div>
        </div>
      </div>

      {/* Vulnerabilities & Approvals Tables */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", marginBottom: 16 }}>FUNCTIONS & RISKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(contractData.vulnerabilities || []).map((v: any, i: number) => (
              <div key={i} style={{ background: "#1a1a1a", borderLeft: `3px solid ${v.severity === "HIGH" ? "#e53935" : "#ff9800"}`, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{v.type}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: v.severity === "HIGH" ? "#e53935" : "#ff9800" }}>{v.severity}</span>
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", marginBottom: 16 }}>ACTIVE TOKEN APPROVALS</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["TOKEN", "SPENDER", "AMOUNT", "RISK"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#555", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(contractData.approvals || []).map((a: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "10px", fontSize: 12, fontWeight: 700, color: "#fff" }}>{a.token}</td>
                  <td style={{ padding: "10px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#888" }}>{a.spender}</td>
                  <td style={{ padding: "10px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: a.amount === "Unlimited" ? "#e53935" : "#ccc" }}>{a.amount}</td>
                  <td style={{ padding: "10px" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", background: a.risk === "CRITICAL" ? "#e53935" : "#333", color: "#fff" }}>{a.risk}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
