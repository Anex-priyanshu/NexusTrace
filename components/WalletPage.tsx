"use client";
import React, { useState, useEffect } from "react";
import { getWalletOverview, getWalletTransactions } from "../lib/api";
import { validateAddress, generateRandomValidAddress } from "../lib/addressValidator";
import { addRecentCase } from "../lib/casesStore";

interface WalletPageProps {
  addressParam?: string;
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

const chains = [
  { id: "eth", name: "ETH Mainnet" },
  { id: "btc", name: "Bitcoin" },
  { id: "bnb", name: "BNB Chain" },
  { id: "tron", name: "Tron Network" },
  { id: "sol", name: "Solana" },
  { id: "polygon", name: "Polygon" }
];

const formatAddr = (addr?: string) => {
  if (!addr) return "—";
  if (addr.length <= 14) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

const defaultTx = [
  {
    dir: "in",
    hash: "6263-7aee",
    full_hash: "62637aee14ahqvMqirpjb1qnvwA7RvQVvr6iDqZtJ4",
    timestamp: "7/31/2026, 00:36:25",
    time: "7/31/2026, 00:36:25",
    from: "14ah-ZtJ4",
    to: "2 Outputs",
    amount: "0.00041786",
    amount_usd: 27.07,
    asset: "BTC",
    fee_sats: 865,
    fee_usd: 0.56,
    entity: "Bitcoin Transaction",
    risk: "CLEAN",
    inputs: [
      { address: "14ahqvMqirpjb1qnvwA7RvQVvr6iDqZtJ4", amount: "0.00216691", amount_usd: 140.40 }
    ],
    outputs: [
      { address: "bc1qkhntcxx85sqmm4vwndyuhfjf65rqe56prqt98t", amount: "0.00174040", amount_usd: 112.76 },
      { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", amount: "0.00041786", amount_usd: 27.07 }
    ]
  },
  {
    dir: "in",
    hash: "12c7-2c5a",
    full_hash: "12c72c5a1Cs17UkQ98df23094821049281a9c",
    timestamp: "7/30/2026, 18:57:36",
    time: "7/30/2026, 18:57:36",
    from: "1Cs1-7UkQ",
    to: "2 Outputs",
    amount: "0.00016153",
    amount_usd: 10.47,
    asset: "BTC",
    fee_sats: 896,
    fee_usd: 0.58,
    entity: "Bitcoin Transaction",
    risk: "CLEAN",
    inputs: [
      { address: "1Cs17UkQ98df23094821049281a9c", amount: "0.00105800", amount_usd: 68.24 }
    ],
    outputs: [
      { address: "198b716b8aaf2151121049281a9c", amount: "0.00089647", amount_usd: 57.77 },
      { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", amount: "0.00016153", amount_usd: 10.47 }
    ]
  },
  {
    dir: "in",
    hash: "5edf-51f9",
    full_hash: "5edf51f90x89D2c4F192837192837192837192837192",
    timestamp: "7/30/2026, 14:31:15",
    time: "7/30/2026, 14:31:15",
    from: "4 Inputs",
    to: "5 Outputs",
    amount: "0.00037992",
    amount_usd: 24.62,
    asset: "BTC",
    fee_sats: 1800,
    fee_usd: 1.17,
    entity: "Bitcoin Transaction",
    risk: "HIGH",
    inputs: [
      { address: "0x89D2c4F192837192837192837192837192837192", amount: "0.00250000", amount_usd: 161.25 },
      { address: "13a89df23094821049281a9c", amount: "0.00120000", amount_usd: 77.40 }
    ],
    outputs: [
      { address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", amount: "0.00037992", amount_usd: 24.62 },
      { address: "14e90298d514db089934071355e5743bf21d60", amount: "0.00332008", amount_usd: 214.03 }
    ]
  }
];

const initialApprovals = [
  { token: "USDT", spender: "0x71c7656ec7ab88b098defb751b7401b5f6d89b83", spenderName: "Tornado Cash Router", allowance: "Unlimited", risk: "CRITICAL" },
  { token: "USDC", spender: "0x1111111254fb6c44bac0bed2854e76f90643097d", spenderName: "1inch V5 Router", allowance: "100,000 USDC", risk: "LOW" },
  { token: "DAI", spender: "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936", spenderName: "Untrusted Spender", allowance: "Unlimited", risk: "HIGH" },
];

const counterparties = [
  { name: "Tornado Cash Router", category: "Mixer", totalVolume: "$1,450,000", txCount: 14, risk: "CRITICAL", address: "0x71c7656ec7ab88b098defb751b7401b5f6d89b83" },
  { name: "Binance Hot Wallet #4", category: "Exchange", totalVolume: "$850,000", txCount: 42, risk: "LOW", address: "0x28c6c06298d514db089934071355e5743bf21d60" },
  { name: "Lazarus Cluster Sub-node", category: "APT Group", totalVolume: "$620,000", txCount: 3, risk: "CRITICAL", address: "0x89D2c4F192837192837192837192837192837192" },
];

const nfts = [
  { name: "Bored Ape #8812", collection: "BCC", value: "48.5 ETH", washFlag: true, image: "🦍" },
  { name: "Pudgy Penguin #1024", collection: "Pudgy", value: "12.2 ETH", washFlag: false, image: "🐧" },
  { name: "Azuki #4902", collection: "Azuki", value: "8.0 ETH", washFlag: true, image: "🥷" },
];

export default function WalletPage({ addressParam = "0x28c6c06298d514db089934071355e5743bf21d60", onNavigate, showToast }: WalletPageProps) {
  const [address, setAddress] = useState(addressParam);
  const [selectedChain, setSelectedChain] = useState("eth");
  const [activeTab, setActiveTab] = useState(0);
  const [chartTimeframe, setChartTimeframe] = useState("1M");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [txs, setTxs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState(initialApprovals);
  const [txFilter, setTxFilter] = useState("ALL");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(true);
  const [latestTxHash, setLatestTxHash] = useState<string | null>(null);
  const [scannedBlocks, setScannedBlocks] = useState(20148912);
  const [liveTxCount, setLiveTxCount] = useState(0);
  const [txViewMode, setTxViewMode] = useState<"CARD" | "TABLE">("CARD");
  const [expandedTxs, setExpandedTxs] = useState<Record<string, boolean>>({});

  const toggleExpandTx = (hash: string) => {
    setExpandedTxs(prev => ({ ...prev, [hash]: !prev[hash] }));
  };

  // Pure Real On-Chain Live Polling Effect (Polling Blockstream & Ethereum RPCs)
  useEffect(() => {
    if (!isLiveMonitoring || loading || validationError) return;

    let isMounted = true;

    const pollOnChainData = async () => {
      try {
        const queryAddr = address.trim();
        if (!queryAddr) return;

        const [latestOverview, latestTxs] = await Promise.all([
          getWalletOverview(queryAddr, selectedChain),
          getWalletTransactions(queryAddr, selectedChain)
        ]);

        if (!isMounted) return;

        setScannedBlocks(prev => prev + 1);

        if (latestOverview && latestOverview.metrics) {
          setData((prevData: any) => ({
            ...prevData,
            ...latestOverview,
            metrics: {
              ...prevData?.metrics,
              ...latestOverview.metrics
            }
          }));
        }

        if (latestTxs && Array.isArray(latestTxs) && latestTxs.length > 0) {
          setTxs(prevTxs => {
            const existingHashes = new Set(prevTxs.map(t => t.hash || t.full_hash));
            const newOnChainTxs = latestTxs.filter(t => !existingHashes.has(t.hash || t.full_hash));

            if (newOnChainTxs.length > 0) {
              setLatestTxHash(newOnChainTxs[0].hash || newOnChainTxs[0].full_hash);
              setLiveTxCount(c => c + newOnChainTxs.length);
              if (showToast) showToast(`⚡ REAL ON-CHAIN TX DETECTED: ${newOnChainTxs[0].amount} ${newOnChainTxs[0].asset}`);
              return [...newOnChainTxs, ...prevTxs];
            }
            return prevTxs;
          });
        }
      } catch (err) {
        console.warn("Real on-chain polling error:", err);
      }
    };

    const interval = setInterval(pollOnChainData, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isLiveMonitoring, loading, validationError, address, selectedChain]);

  useEffect(() => {
    if (addressParam) {
      setAddress(addressParam);
      handleSearch(addressParam);
    }
  }, [addressParam, selectedChain]);

  const handleSearch = async (targetAddr?: string) => {
    const queryAddr = targetAddr || address;
    if (!queryAddr.trim()) return;

    const val = validateAddress(queryAddr);
    if (!val.isValid) {
      setValidationError(val.error || "Invalid Cryptocurrency Address Format");
      setData({
        is_valid: false,
        risk_score: 0,
        risk_level: "Invalid Format",
        entity_name: "Invalid Address Format",
        tags: ["INVALID FORMAT"],
        reasons: [val.error],
        metrics: { balance_usd: 0, tx_count: 0, first_seen: "N/A" }
      });
      setTxs([]);
      if (showToast) showToast(`❌ ${val.error}`);
      return;
    }

    setValidationError(null);
    setLoading(true);

    addRecentCase(queryAddr, selectedChain);

    const overviewData = await getWalletOverview(queryAddr, selectedChain);
    const txData = await getWalletTransactions(queryAddr, selectedChain);

    if (overviewData) {
      if (overviewData.is_valid === false) {
        setValidationError(overviewData.error || "Invalid cryptocurrency address format.");
      }
      setData(overviewData);
    }

    if (txData !== null && txData !== undefined) {
      setTxs(txData);
    } else {
      setTxs(defaultTx);
    }
    setLoading(false);
    setIsLiveMonitoring(true);
    setLiveTxCount(0);
    if (showToast) showToast(`⚡ Real-time investigation started! Streaming live block updates...`);
  };

  const handleGenerateTestAddr = () => {
    const generated = generateRandomValidAddress(selectedChain);
    setAddress(generated);
    handleSearch(generated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
    if (showToast) showToast("Address copied to clipboard!");
  };

  const handleRevoke = (token: string, spenderName: string) => {
    setApprovals(prev => prev.filter(a => !(a.token === token && a.spenderName === spenderName)));
    if (showToast) showToast(`Revoked ${token} approval for ${spenderName}!`);
  };

  const riskScore = data?.risk_score ?? 10;
  const riskLevel = data?.risk_level ?? (validationError ? "Invalid Format" : "Low Risk");
  const entityName = data?.entity_name ?? (validationError ? "Invalid Address" : "Unlabeled Wallet");
  const tags = data?.tags ?? (validationError ? ["INVALID FORMAT"] : ["CLEAN WALLET"]);
  const reasons = data?.reasons ?? (validationError ? [validationError] : ["Clean wallet history with no malicious flags"]);

  const filteredTxs = txs.filter(t => {
    if (txFilter === "INBOUND") return t.dir === "in";
    if (txFilter === "OUTBOUND") return t.dir === "out";
    if (txFilter === "SWAP") return t.dir === "swap";
    return true;
  });

  const chartData = React.useMemo(() => {
    if (!txs || txs.length === 0) {
      return {
        pathD: "M0,85 L100,85",
        fillD: "M0,85 L100,85 L100,100 L0,100 Z",
        labels: ["7 Days Ago", "3 Days Ago", "Today"]
      };
    }

    const amounts = txs.map(t => parseFloat(t.amount || "0")).filter(a => !isNaN(a) && a > 0);
    const baseVal = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 1.0;
    const maxTxVal = amounts.length > 0 ? Math.max(...amounts) : 5.0;

    let numPoints = 8;
    let timeMultiplier = 1.0;
    let seedShift = 0;

    if (chartTimeframe === "1W") {
      numPoints = 7;
      timeMultiplier = 0.5;
      seedShift = 2;
    } else if (chartTimeframe === "1M") {
      numPoints = 10;
      timeMultiplier = 1.2;
      seedShift = 7;
    } else if (chartTimeframe === "3M") {
      numPoints = 12;
      timeMultiplier = 3.0;
      seedShift = 14;
    }

    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * 100;
      
      const txIndex = (i + seedShift) % txs.length;
      const tx = txs[txIndex];
      const rawVal = tx ? parseFloat(tx.amount || "0") : baseVal;
      
      const waveMod = Math.sin((i + seedShift) * 0.9) * 0.4 + 1.0;
      const calcVal = Math.max(0.001, rawVal * waveMod * (0.5 + ((i * 3 + seedShift) % 5) * 0.25));
      
      const maxRange = Math.max(maxTxVal * timeMultiplier, 0.01);
      const norm = Math.min(calcVal / maxRange, 1.0);
      const y = Math.round(85 - (norm * 65));
      
      points.push({ x: Math.round(x), y });
    }

    const lineD = points.map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
    const fillD = `${lineD} L100,100 L0,100 Z`;

    const now = new Date();
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });

    let labels: string[] = [];

    if (chartTimeframe === "1W") {
      labels = [
        formatDate(new Date(now.getTime() - 7 * 24 * 3600 * 1000)),
        formatDate(new Date(now.getTime() - 3 * 24 * 3600 * 1000)),
        "Today"
      ];
    } else if (chartTimeframe === "1M") {
      labels = [
        formatDate(new Date(now.getTime() - 30 * 24 * 3600 * 1000)),
        formatDate(new Date(now.getTime() - 15 * 24 * 3600 * 1000)),
        "Today"
      ];
    } else if (chartTimeframe === "3M") {
      labels = [
        formatDate(new Date(now.getTime() - 90 * 24 * 3600 * 1000)),
        formatDate(new Date(now.getTime() - 45 * 24 * 3600 * 1000)),
        "Today"
      ];
    }

    return {
      pathD: lineD,
      fillD: fillD,
      labels: labels
    };
  }, [txs, chartTimeframe]);

  return (
    <div style={{ padding: "28px", background: "#0a0a0a", minHeight: "100vh" }}>
      {/* Live Search Bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <select
          value={selectedChain}
          onChange={(e) => setSelectedChain(e.target.value)}
          style={{
            background: "#111", border: "1px solid #333", color: "#e53935",
            padding: "10px 14px", fontWeight: 700, fontSize: 12, outline: "none", cursor: "pointer"
          }}
        >
          {chains.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div style={{ flex: 1, display: "flex", background: "#111", border: "1px solid #333" }}>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter any ETH, BTC, TRON or SOL wallet address..."
            style={{
              flex: 1, background: "transparent", border: "none", color: "#fff",
              padding: "10px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: "none"
            }}
          />
          <button
            onClick={handleGenerateTestAddr}
            title="Generate a cryptographically valid test address"
            style={{
              padding: "0 14px", fontSize: 10, background: "#1a1a1a", borderLeft: "1px solid #333", borderRight: "1px solid #333", borderTop: "none", borderBottom: "none", color: "#aaa", cursor: "pointer", fontFamily: "'JetBrains Mono', monospace"
            }}
          >
            🎲 GEN VALID TEST ADDR
          </button>
          <button
            onClick={() => handleSearch()}
            className="btn-red"
            style={{ padding: "0 24px", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}
          >
            {loading ? "SEARCHING..." : "INVESTIGATE"}
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div style={{ background: "#2a0808", border: "1px solid #e53935", padding: "14px 18px", marginBottom: 20, color: "#ff8a80", fontSize: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#e53935" }}>warning</span>
          <div>
            <strong style={{ color: "#fff", display: "block", marginBottom: 2 }}>INVALID ADDRESS FORMAT DETECTED</strong>
            <span>{validationError} — Please enter a valid EVM (0x...), Bitcoin, Solana, or Tron address, or click <strong>🎲 GEN VALID TEST ADDR</strong> above.</span>
          </div>
        </div>
      )}


      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 11, color: "#555" }}>
        <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>Wallet Investigation</span>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
        <span style={{ color: "#e53935", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{address}</span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, background: "#111", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: "#888" }}>account_balance_wallet</span>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>
                {address}
              </span>
              <button onClick={copyToClipboard} style={{ background: "none", border: "none", cursor: "pointer", color: "#555" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>content_copy</span>
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {selectedChain.toUpperCase()} Network • Entity: {entityName}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => onNavigate && onNavigate("graph", address)}
            className="btn-outline"
            style={{ padding: "8px 16px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>monitoring</span>VIEW GRAPH
          </button>
          <button
            onClick={() => {
              const c = addRecentCase(address, selectedChain);
              if (showToast) showToast(`Wallet ${address.slice(0, 8)}... added to Case ${c.id}`);
            }}
            className="btn-red"
            style={{ padding: "8px 16px", fontSize: 10, display: "flex", alignItems: "center", gap: 6 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>folder_open</span>ADD TO CASE
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #222", marginBottom: 24 }}>
        {["Overview", "Transactions", "Counterparties", `Approvals (${approvals.length})`, "NFT/DeFi"].map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              padding: "10px 18px",
              background: activeTab === i ? "#e53935" : "transparent",
              borderStyle: "solid",
              borderWidth: "1px 1px 0 1px",
              borderColor: activeTab === i ? "#e53935" : "transparent",
              color: activeTab === i ? "#fff" : "#555",
              fontSize: 11, fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase",
              cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB 0: OVERVIEW */}
      {activeTab === 0 && (
        <>
          {/* Bento Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Balance */}
            <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 16 }}>Total Balance (USD)</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", fontFamily: "'Inter', sans-serif", marginBottom: 20 }}>
                ${data?.metrics?.balance_usd !== undefined ? data.metrics.balance_usd.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div className="donut" style={{ width: 64, height: 64, flexShrink: 0, position: "relative" }}>
                  <div style={{ position: "absolute", inset: 8, background: "#111", borderRadius: "50%" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[["BTC", "70%", "#e53935"], ["ETH", "25%", "#888"], ["USDT", "5%", "#444"]].map(([asset, pct, color]) => (
                    <div key={asset} style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 8, height: 8, background: color }} />
                        <span style={{ fontSize: 11, color: "#ccc" }}>{asset}</span>
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#666" }}>{pct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Risk Score */}
            <div style={{ background: "#111", border: "1px solid #222", padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 16, width: "100%" }}>Risk Assessment</div>
              <div style={{ position: "relative", width: 160, height: 80, marginBottom: 12 }}>
                <div className="gauge-track">
                  <div className="gauge-fill" style={{ transform: `rotate(${Math.min(riskScore * 1.8, 180)}deg)` }} />
                </div>
                <div style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center" }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: riskScore > 70 ? "#e53935" : "#4caf50", fontFamily: "'Inter', sans-serif", lineHeight: 1 }}>
                    {riskScore}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", background: riskScore > 70 ? "#e53935" : "#4caf50", color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                {riskLevel}
              </span>
              <div style={{ fontSize: 11, color: "#666", textAlign: "center" }}>
                {reasons.slice(0, 2).join(" • ")}
              </div>
            </div>

            {/* Entity Tags */}
            <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 16 }}>Entity Profile & Tags</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {tags.map((tag: string) => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", border: "1px solid #e53935", color: "#e53935", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>warning</span>
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #222", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["First Seen", data?.metrics?.first_seen || "2018-04-12"],
                  ["Total Tx Count", data?.metrics?.tx_count?.toLocaleString() || "14,289"]
                ].map(([label, val]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#555" }}>{label}</span>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart + Recent TX */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            {/* Chart */}
            <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555" }}>Transaction Volume ({chartTimeframe})</span>
                <div style={{ display: "flex", gap: 6 }}>
                  {["1W", "1M", "3M"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setChartTimeframe(t)}
                      style={{
                        padding: "3px 10px", fontSize: 10, fontWeight: 700,
                        background: chartTimeframe === t ? "#e53935" : "transparent",
                        border: "1px solid #333",
                        color: chartTimeframe === t ? "#fff" : "#555",
                        cursor: "pointer", letterSpacing: "0.06em"
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 200, position: "relative", borderLeft: "1px solid #222", borderBottom: "1px solid #222" }}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e53935" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#e53935" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>
                  <path d={chartData.fillD} fill="url(#lineGrad)" style={{ transition: "d 0.4s ease-in-out, fill 0.4s ease-in-out" }} />
                  <path d={chartData.pathD} fill="none" stroke="#e53935" strokeWidth="2" vectorEffect="non-scaling-stroke" style={{ transition: "d 0.4s ease-in-out, stroke 0.4s ease-in-out" }} />
                </svg>
                <div style={{ position: "absolute", bottom: 6, left: 0, right: 0, display: "flex", justifyContent: "space-between", padding: "0 12px" }}>
                  {chartData.labels.map(l => (
                    <span key={l} style={{ fontSize: 9, color: "#888", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em", fontWeight: 700 }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent TX */}
            <div style={{ background: "#111", border: "1px solid #222" }}>
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#e53935" }}>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Recent Transactions</span>
                <button
                  onClick={() => setActiveTab(1)}
                  style={{ fontSize: 10, fontWeight: 700, background: "none", border: "none", cursor: "pointer", color: "#fff", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 4 }}
                >
                  VIEW ALL <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                </button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1f1f1f" }}>
                    {["DIR", "AMOUNT", "ASSET"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#444", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txs.slice(0, 5).map((tx, i) => {
                    const isNew = tx.hash === latestTxHash;
                    return (
                      <tr key={i} className={isNew ? "new-tx-row" : ""} style={{ borderBottom: "1px solid #1a1a1a", transition: "background 0.3s" }}>
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{
                            width: 26, height: 26,
                            background: tx.dir === "out" ? "rgba(229,57,53,0.15)" : tx.dir === "in" ? "rgba(76,175,80,0.15)" : "#1a1a1a",
                            border: `1px solid ${tx.dir === "out" ? "#e53935" : tx.dir === "in" ? "#4caf50" : "#333"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 14, color: tx.dir === "out" ? "#e53935" : tx.dir === "in" ? "#4caf50" : "#555" }}>
                              {tx.dir === "out" ? "arrow_upward" : tx.dir === "in" ? "arrow_downward" : "swap_horiz"}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#ccc" }}>
                          {tx.amount}
                          {isNew && <span style={{ fontSize: 8, background: "#4caf50", color: "#fff", padding: "1px 4px", marginLeft: 6, fontWeight: 800 }}>LIVE</span>}
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#555" }}>{tx.asset}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 1: TRANSACTIONS */}
      {activeTab === 1 && (
        <div style={{ background: "#111", border: "1px solid #222", padding: 18 }}>
          <div style={{ paddingBottom: 14, borderBottom: "1px solid #222", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#e53935" }}>receipt_long</span>
                ON-CHAIN TRANSACTION HISTORY
              </span>
              <div style={{ display: "flex", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: 2 }}>
                <button
                  onClick={() => setTxViewMode("CARD")}
                  style={{
                    padding: "4px 10px", fontSize: 10, fontWeight: 700, borderRadius: 3,
                    background: txViewMode === "CARD" ? "#e53935" : "transparent",
                    border: "none", color: "#fff", cursor: "pointer", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>view_agenda</span>
                  CARD VIEW
                </button>
                <button
                  onClick={() => setTxViewMode("TABLE")}
                  style={{
                    padding: "4px 10px", fontSize: 10, fontWeight: 700, borderRadius: 3,
                    background: txViewMode === "TABLE" ? "#e53935" : "transparent",
                    border: "none", color: "#fff", cursor: "pointer", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", gap: 4
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>table_chart</span>
                  TABLE VIEW
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {["ALL", "INBOUND", "OUTBOUND", "SWAP"].map(f => (
                <button
                  key={f}
                  onClick={() => setTxFilter(f)}
                  style={{
                    padding: "5px 12px", fontSize: 10, fontWeight: 700, borderRadius: 4,
                    background: txFilter === f ? "#e53935" : "rgba(255,255,255,0.05)",
                    boxShadow: txFilter === f ? "0 0 10px rgba(229,57,53,0.4)" : "none",
                    border: `1px solid ${txFilter === f ? "#e53935" : "rgba(255,255,255,0.1)"}`,
                    color: "#fff", cursor: "pointer", transition: "all 0.2s ease"
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* CARD VIEW (High-Tech Block Explorer Redesign) */}
          {txViewMode === "CARD" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredTxs.map((t, i) => {
                const isExpanded = expandedTxs[t.hash] !== undefined ? expandedTxs[t.hash] : (i === 0);
                const isNew = t.hash === latestTxHash;
                const senderAddr = t.from || (t.dir === "out" ? address : t.entity || "Sender Wallet");
                const receiverAddr = t.to || (t.dir === "in" ? address : t.entity || "Receiver Wallet");

                return (
                  <div key={i} className={`tx-card ${isExpanded ? "tx-card-expanded" : ""} ${isNew ? "new-tx-row" : ""}`}>
                    {/* Top Bar / Header */}
                    <div
                      onClick={() => toggleExpandTx(t.hash)}
                      style={{
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        cursor: "pointer",
                        borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.08)" : "none",
                        background: isExpanded ? "rgba(255,255,255,0.02)" : "transparent"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {/* Direction Icon Badge */}
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: t.dir === "in" ? "rgba(16,185,129,0.15)" : t.dir === "out" ? "rgba(244,63,94,0.15)" : "rgba(59,130,246,0.15)",
                          border: `1px solid ${t.dir === "in" ? "#10b981" : t.dir === "out" ? "#f43f5e" : "#3b82f6"}`,
                          boxShadow: `0 0 10px ${t.dir === "in" ? "rgba(16,185,129,0.25)" : t.dir === "out" ? "rgba(244,63,94,0.25)" : "rgba(59,130,246,0.25)"}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: t.dir === "in" ? "#10b981" : t.dir === "out" ? "#f43f5e" : "#3b82f6" }}>
                            {t.dir === "in" ? "south_west" : t.dir === "out" ? "north_east" : "swap_horiz"}
                          </span>
                        </div>

                        {/* ID, Status Badge & Timestamp */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#e53935", letterSpacing: "0.02em" }}>
                              ID: {t.hash}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(t.full_hash || t.hash); if (showToast) showToast(`TX ID copied: ${t.hash}`); }}
                              title="Copy TX Hash"
                              className="copy-btn"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
                            </button>
                            <span style={{
                              fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em",
                              background: t.dir === "in" ? "rgba(16,185,129,0.2)" : t.dir === "out" ? "rgba(244,63,94,0.2)" : "rgba(59,130,246,0.2)",
                              color: t.dir === "in" ? "#10b981" : t.dir === "out" ? "#f43f5e" : "#3b82f6",
                              border: `1px solid ${t.dir === "in" ? "#10b981" : t.dir === "out" ? "#f43f5e" : "#3b82f6"}`
                            }}>
                              {t.dir === "in" ? "📥 RECEIVED (AAYA PAISA)" : t.dir === "out" ? "📤 SENT (BHEJA PAISA)" : "🔄 SWAP"}
                            </span>
                            {isNew && (
                              <span style={{ fontSize: 9, background: "#10b981", color: "#000", padding: "2px 6px", borderRadius: 3, fontWeight: 900, letterSpacing: "0.05em" }}>
                                LIVE
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "#777", marginTop: 3, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12, color: "#555" }}>schedule</span>
                            {t.timestamp || t.time || "On-Chain"}
                          </div>
                        </div>
                      </div>

                      {/* From & To Route Summary */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                        <div style={{ background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ color: "#f43f5e", fontSize: 9, display: "block", fontWeight: 800, textTransform: "uppercase" }}>SENDER (From)</span>
                          <span style={{ color: "#ccc", fontWeight: 600 }}>{formatAddr(senderAddr)}</span>
                        </div>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: "#555" }}>arrow_forward</span>
                        <div style={{ background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }}>
                          <span style={{ color: "#10b981", fontSize: 9, display: "block", fontWeight: 800, textTransform: "uppercase" }}>RECEIVER (To)</span>
                          <span style={{ color: "#ccc", fontWeight: 600 }}>{t.to || formatAddr(receiverAddr)}</span>
                        </div>
                      </div>

                      {/* Amount, Value & Fee */}
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>
                          {t.amount} {t.asset}
                          <span style={{ fontSize: 11, color: "#999", fontWeight: 500, marginLeft: 6 }}>
                            • ${t.amount_usd !== undefined ? t.amount_usd.toLocaleString() : (parseFloat(t.amount || 0)*3120).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: "#666", marginTop: 3, fontFamily: "'JetBrains Mono', monospace" }}>
                          Fee {t.fee_sats ? `${t.fee_sats} Sats` : `${t.fee_eth || '0.0004'} ETH`} • ${t.fee_usd || '0.44'}
                        </div>
                      </div>

                      {/* Expand Chevron Icon */}
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 12
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#aaa" }}>
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details (Inputs & Outputs Columns) */}
                    {isExpanded && (
                      <div style={{ padding: "18px 22px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "rgba(10,10,14,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {/* FROM (Inputs) Column */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#f43f5e", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#f43f5e" }}>output</span>
                              FROM: SENDER WALLETS ({t.inputs ? t.inputs.length : 1})
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {(t.inputs && t.inputs.length > 0 ? t.inputs : [{ address: senderAddr, amount: t.amount, amount_usd: t.amount_usd }]).map((inp: any, idx: number) => {
                              const isTarget = inp.address?.toLowerCase() === address.toLowerCase();
                              return (
                                <div
                                  key={idx}
                                  className={`address-box ${isTarget ? "address-highlight-sender" : ""}`}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", color: "#aaa", padding: "1px 5px", borderRadius: 3, fontWeight: 800 }}>
                                        {idx + 1}
                                      </span>
                                      {isTarget && (
                                        <span style={{ fontSize: 9, background: "#f43f5e", color: "#fff", padding: "1px 6px", borderRadius: 3, fontWeight: 900 }}>
                                          ME (MY WALLET - SENDER)
                                        </span>
                                      )}
                                      <span style={{
                                        fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                                        color: isTarget ? "#f43f5e" : "#ddd", fontWeight: isTarget ? 700 : 400,
                                        wordBreak: "break-all"
                                      }}>
                                        {inp.address}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(inp.address); if (showToast) showToast(`Copied: ${inp.address.slice(0, 10)}...`); }}
                                      className="copy-btn"
                                      title="Copy Address"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
                                    </button>
                                  </div>

                                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>{inp.amount} {t.asset}</span>
                                    <span style={{ fontSize: 10, color: "#777", fontWeight: 400 }}>
                                      • ${inp.amount_usd !== undefined ? inp.amount_usd.toLocaleString() : (parseFloat(inp.amount || 0)*3120).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* TO (Outputs) Column */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: "#10b981", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 15, color: "#10b981" }}>input</span>
                              TO: RECEIVER WALLETS ({t.outputs ? t.outputs.length : 1})
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {(t.outputs && t.outputs.length > 0 ? t.outputs : [{ address: receiverAddr, amount: t.amount, amount_usd: t.amount_usd }]).map((out: any, idx: number) => {
                              const isTarget = out.address?.toLowerCase() === address.toLowerCase();
                              const isChangeReturn = out.address?.toLowerCase() === senderAddr?.toLowerCase();
                              return (
                                <div
                                  key={idx}
                                  className={`address-box ${isTarget ? "address-highlight-target" : ""}`}
                                >
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
                                      <span style={{ fontSize: 10, background: "rgba(255,255,255,0.1)", color: "#aaa", padding: "1px 5px", borderRadius: 3, fontWeight: 800 }}>
                                        {idx + 1}
                                      </span>
                                      {isTarget ? (
                                        <span style={{ fontSize: 9, background: "#10b981", color: "#000", padding: "2px 7px", borderRadius: 3, fontWeight: 900 }}>
                                          ME (MY WALLET - RECEIVER)
                                        </span>
                                      ) : isChangeReturn ? (
                                        <span style={{ fontSize: 9, background: "rgba(255,255,255,0.15)", color: "#aaa", padding: "1px 6px", borderRadius: 3, fontWeight: 700 }}>
                                          CHANGE RETURN TO SENDER
                                        </span>
                                      ) : null}
                                      <span style={{
                                        fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                                        color: isTarget ? "#10b981" : "#ddd", fontWeight: isTarget ? 700 : 400,
                                        wordBreak: "break-all"
                                      }}>
                                        {out.address}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(out.address); if (showToast) showToast(`Copied: ${out.address.slice(0, 10)}...`); }}
                                      className="copy-btn"
                                      title="Copy Address"
                                    >
                                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>content_copy</span>
                                    </button>
                                  </div>

                                  <div style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                                    <span>{out.amount} {t.asset}</span>
                                    <span style={{ fontSize: 10, color: "#777", fontWeight: 400 }}>
                                      • ${out.amount_usd !== undefined ? out.amount_usd.toLocaleString() : (parseFloat(out.amount || 0)*3120).toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW (Sleek Modern Matrix) */
            <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", background: "rgba(18,18,24,0.6)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}>
                    {["TX HASH", "DIR", "SENDER (FROM)", "RECEIVER (TO)", "AMOUNT & ASSET", "COUNTERENTITY", "TIMESTAMP", "RISK"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#888", textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxs.map((t, i) => {
                    const isNew = t.hash === latestTxHash;
                    const senderAddr = t.from || (t.dir === "out" ? address : t.entity || "Unknown Sender");
                    const receiverAddr = t.to || (t.dir === "in" ? address : t.entity || "Unknown Receiver");

                    return (
                      <tr key={i} className={isNew ? "new-tx-row" : ""} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}>
                        <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#e53935", fontWeight: 700 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{t.hash}</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(t.full_hash || t.hash); if (showToast) showToast(`TX copied: ${t.hash}`); }}
                              className="copy-btn"
                              title="Copy TX Hash"
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>content_copy</span>
                            </button>
                            {isNew && <span style={{ fontSize: 9, background: "#10b981", color: "#000", padding: "1px 5px", borderRadius: 3, fontWeight: 900 }}>LIVE</span>}
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span className={t.dir === "in" ? "badge-inbound" : t.dir === "out" ? "badge-outbound" : "badge-swap"} style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.05em" }}>
                            {t.dir.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                          <span
                            onClick={() => {
                              navigator.clipboard.writeText(senderAddr);
                              if (showToast) showToast(`Copied Sender: ${senderAddr.slice(0, 10)}...`);
                            }}
                            title={`Sender Address: ${senderAddr}\nClick to copy`}
                            style={{
                              cursor: "pointer",
                              color: senderAddr.toLowerCase() === address.toLowerCase() ? "#f43f5e" : "#ccc",
                              fontWeight: senderAddr.toLowerCase() === address.toLowerCase() ? 700 : 400,
                              borderBottom: "1px dotted rgba(255,255,255,0.2)"
                            }}
                          >
                            {formatAddr(senderAddr)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                          <span
                            onClick={() => {
                              navigator.clipboard.writeText(receiverAddr);
                              if (showToast) showToast(`Copied Receiver: ${receiverAddr.slice(0, 10)}...`);
                            }}
                            title={`Receiver Address: ${receiverAddr}\nClick to copy`}
                            style={{
                              cursor: "pointer",
                              color: receiverAddr.toLowerCase() === address.toLowerCase() ? "#10b981" : "#ccc",
                              fontWeight: receiverAddr.toLowerCase() === address.toLowerCase() ? 700 : 400,
                              borderBottom: "1px dotted rgba(255,255,255,0.2)"
                            }}
                          >
                            {formatAddr(receiverAddr)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 700 }}>
                          {t.amount} {t.asset}
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#aaa" }}>{t.entity}</td>
                        <td style={{ padding: "14px 16px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#777" }}>{t.timestamp}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{
                            fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.05em",
                            background: t.risk === "CRITICAL" ? "rgba(229,57,53,0.2)" : t.risk === "HIGH" ? "rgba(255,152,0,0.2)" : "rgba(255,255,255,0.06)",
                            color: t.risk === "CRITICAL" ? "#e53935" : t.risk === "HIGH" ? "#ff9800" : "#10b981",
                            border: `1px solid ${t.risk === "CRITICAL" ? "rgba(229,57,53,0.4)" : t.risk === "HIGH" ? "rgba(255,152,0,0.4)" : "rgba(16,185,129,0.3)"}`
                          }}>
                            {t.risk}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COUNTERPARTIES */}
      {activeTab === 2 && (
        <div style={{ background: "#111", border: "1px solid #222" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #222", fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>
            DIRECTLY CONNECTED COUNTERPARTIES
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["ENTITY NAME", "CATEGORY", "ADDRESS", "VOLUME TRACED", "TX COUNT", "ACTION"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#555", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {counterparties.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "14px", fontSize: 12, fontWeight: 700, color: "#fff" }}>{c.name}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", background: c.risk === "CRITICAL" ? "#e53935" : "#333", color: "#fff" }}>{c.category}</span>
                  </td>
                  <td style={{ padding: "14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#888" }}>{c.address}</td>
                  <td style={{ padding: "14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#fff" }}>{c.totalVolume}</td>
                  <td style={{ padding: "14px", fontSize: 11, color: "#aaa" }}>{c.txCount} txs</td>
                  <td style={{ padding: "14px" }}>
                    <button onClick={() => onNavigate && onNavigate("graph", c.address)} className="btn-red" style={{ padding: "5px 12px", fontSize: 9 }}>
                      TRACE COUNTERPARTY
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: APPROVALS */}
      {activeTab === 3 && (
        <div style={{ background: "#111", border: "1px solid #222" }}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid #222", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff" }}>ACTIVE TOKEN ALLOWANCES</span>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", background: "#e53935", color: "#fff" }}>2 UNLIMITED HIGH RISK APPROVALS</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #222" }}>
                {["TOKEN", "SPENDER NAME", "SPENDER ADDRESS", "ALLOWANCE", "RISK", "ACTION"].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "#555", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {approvals.map((a, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "14px", fontSize: 12, fontWeight: 800, color: "#fff" }}>{a.token}</td>
                  <td style={{ padding: "14px", fontSize: 11, color: "#ccc" }}>{a.spenderName}</td>
                  <td style={{ padding: "14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#888" }}>{a.spender}</td>
                  <td style={{ padding: "14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: a.allowance === "Unlimited" ? "#e53935" : "#ccc", fontWeight: 700 }}>{a.allowance}</td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", background: a.risk === "CRITICAL" ? "#e53935" : "#333", color: "#fff" }}>{a.risk}</span>
                  </td>
                  <td style={{ padding: "14px" }}>
                    <button onClick={() => handleRevoke(a.token, a.spenderName)} className="btn-red" style={{ padding: "5px 12px", fontSize: 9 }}>
                      REVOKE ALLOWANCE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: NFT/DEFI */}
      {activeTab === 4 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#111", border: "1px solid #222", padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff", marginBottom: 16 }}>
              NFT HOLDINGS & WASH TRADE DETECTION
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {nfts.map((nft, i) => (
                <div key={i} style={{ background: "#1a1a1a", border: `1px solid ${nft.washFlag ? "#e53935" : "#333"}`, padding: 16 }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{nft.image}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>{nft.name}</div>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 10 }}>Collection: {nft.collection}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 700 }}>{nft.value}</span>
                    {nft.washFlag && (
                      <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", background: "#e53935", color: "#fff" }}>
                        WASH TRADE SUSPECT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
