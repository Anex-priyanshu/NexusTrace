"use client";
import React, { useState, useEffect } from "react";
import { getGraphData } from "../lib/api";
import { validateAddress, generateRandomValidAddress } from "../lib/addressValidator";
import { addRecentCase } from "../lib/casesStore";

interface GraphPageProps {
  addressParam?: string;
  onNavigate?: (page: string, address?: string) => void;
  showToast?: (msg: string) => void;
}

export default function GraphPage({ addressParam = "0x28c6c06298d514db089934071355e5743bf21d60", onNavigate, showToast }: GraphPageProps) {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [targetAddress, setTargetAddress] = useState(addressParam);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [layoutMode, setLayoutMode] = useState<"FORCE" | "HIERARCHICAL" | "CIRCULAR">("FORCE");
  const [customNotes, setCustomNotes] = useState("On-chain funds cycle trace. High velocity indicates automated clearing pattern.");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [canvasDim, setCanvasDim] = useState({ w: 900, h: 550 });

  // Interactive Filter States
  const [hideLowValue, setHideLowValue] = useState(false);
  const [hideBenign, setHideBenign] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("ALL");
  const [timeframeDays, setTimeframeDays] = useState(30);

  // Live Transmission Animation State
  const [isLiveFlow, setIsLiveFlow] = useState(true);
  const [flowSpeed, setFlowSpeed] = useState(1);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasDim({
          w: canvasRef.current.clientWidth || 900,
          h: canvasRef.current.clientHeight || 550
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (addressParam) {
      setTargetAddress(addressParam);
      fetchGraph(addressParam);
    }
  }, [addressParam]);

  const fetchGraph = async (addr?: string) => {
    const query = (addr || targetAddress).trim();
    if (!query) return;

    addRecentCase(query);

    const val = validateAddress(query);
    if (!val.isValid) {
      setValidationError(val.error || "Invalid Cryptocurrency Address");
      if (showToast) showToast(`❌ ${val.error}`);
      setGraphData(null);
      setSelectedNode(null);
      return;
    }

    setValidationError(null);
    const data = await getGraphData(query, 2);
    if (data && data.nodes) {
      setGraphData(data);
      if (data.nodes.length > 0) {
        setSelectedNode(data.nodes[0]);
      }
      if (showToast) showToast(`Generated transaction graph with ${data.nodes.length} nodes`);
    }
  };

  const handleResetFilters = () => {
    setHideLowValue(false);
    setHideBenign(false);
    setSelectedAsset("ALL");
    setTimeframeDays(30);
    setZoomLevel(100);
    setIsLiveFlow(true);
    setFlowSpeed(1);
    if (showToast) showToast("Graph filters reset to default");
  };

  const handleGenerateTestNode = () => {
    const gen = generateRandomValidAddress("eth");
    setTargetAddress(gen);
    fetchGraph(gen);
  };

  const handleExportGraph = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(graphData || {}))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `graph_trace_${targetAddress.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (showToast) showToast("Graph topology exported as JSON evidence file");
  };

  const toggleLayout = () => {
    const nextLayout = layoutMode === "FORCE" ? "HIERARCHICAL" : layoutMode === "HIERARCHICAL" ? "CIRCULAR" : "FORCE";
    setLayoutMode(nextLayout);
    if (showToast) showToast(`Graph layout set to ${nextLayout}`);
  };

  // Compute node positions dynamically from canvas dimensions & backend graphData.nodes
  const computeNodePositions = () => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return {};
    const nodeMap: any = {};
    const nodes = graphData.nodes;
    const otherNodes = nodes.filter((n: any) => n.id !== "center");
    const totalOthers = otherNodes.length;

    const cxCenter = Math.max(canvasDim.w / 2, 350);
    const cyCenter = Math.max(canvasDim.h / 2, 250);

    // Center Node Position
    nodeMap["center"] = {
      top: cyCenter - 28,
      left: cxCenter - 28,
      cx: cxCenter,
      cy: cyCenter
    };

    const radius = Math.min(cxCenter, cyCenter) * 0.52;

    otherNodes.forEach((node: any, i: number) => {
      let angle = -Math.PI / 2 + (2 * Math.PI * i) / (totalOthers || 1);
      if (layoutMode === "HIERARCHICAL") {
        angle = (i - (totalOthers - 1) / 2) * 0.6;
      }
      const cx = cxCenter + radius * Math.cos(angle);
      const cy = cyCenter + radius * Math.sin(angle);
      nodeMap[node.id] = {
        top: cy - 30,
        left: cx - 60,
        cx: cx,
        cy: cy
      };
    });

    return nodeMap;
  };

  const positions = computeNodePositions();
  const nodesList = graphData?.nodes || [];
  const edgesList = graphData?.edges || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)", background: "#0a0a0a", overflow: "hidden" }}>
      {/* Top Toolbar */}
      <div style={{ height: 52, flexShrink: 0, background: "#0d0d0d", borderBottom: "1px solid #1f1f1f", display: "flex", alignItems: "center", padding: "0 16px", justifyContent: "space-between", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingRight: 16, borderRight: "1px solid #1f1f1f", marginRight: 12 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#e53935" }}>hub</span>
            <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>Graph Explorer</span>
          </div>

          <button
            onClick={() => {
              setIsLiveFlow(!isLiveFlow);
              if (showToast) showToast(isLiveFlow ? "Live data transmission paused" : "Live data transmission resumed");
            }}
            className="btn-red"
            style={{
              padding: "6px 12px", fontSize: 10, marginRight: 6, display: "flex", alignItems: "center", gap: 5,
              background: isLiveFlow ? "#e53935" : "#333",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {isLiveFlow ? "pause_circle" : "play_circle"}
            </span>
            {isLiveFlow ? "LIVE FLOW: ON" : "PAUSED"}
          </button>

          <button onClick={handleGenerateTestNode} className="btn-outline" style={{ padding: "6px 12px", fontSize: 10, marginRight: 6 }}>
            🎲 GEN TEST ADDRESS
          </button>
          <button onClick={toggleLayout} className="btn-outline" style={{ padding: "6px 12px", fontSize: 10, marginRight: 6 }}>
            ⊞ LAYOUT: {layoutMode}
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExportGraph} className="btn-red" style={{ padding: "7px 16px", fontSize: 10, display: "flex", alignItems: "center", gap: 5 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>download</span>EXPORT TOPOLOGY
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Left Filter Panel */}
        <div style={{ width: 280, background: "#0d0d0d", borderRight: "1px solid #1f1f1f", padding: 20, flexShrink: 0, overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e53935" }}>GRAPH FILTERS</span>
            <button onClick={handleResetFilters} title="Reset all filters" style={{ background: "none", border: "none", color: "#888", cursor: "pointer" }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>filter_list_off</span>
            </button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 9, fontWeight: 800, color: "#555", display: "block", marginBottom: 6 }}>ROOT WALLET</label>
            <div style={{ display: "flex" }}>
              <input
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                style={{ flex: 1, background: "#111", border: "1px solid #333", color: "#fff", padding: "6px 8px", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", outline: "none" }}
              />
              <button onClick={() => fetchGraph(targetAddress)} className="btn-red" style={{ padding: "6px 10px", fontSize: 9 }}>
                TRACE
              </button>
            </div>
          </div>

          {validationError && (
            <div style={{ background: "#2a0808", border: "1px solid #e53935", padding: 10, color: "#ff8a80", fontSize: 10, marginBottom: 16 }}>
              {validationError}
            </div>
          )}

          {/* Interactive Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: hideLowValue ? "#fff" : "#888" }}>
                HIDE LOW VALUE (&lt;$100)
              </span>
              <button
                type="button"
                onClick={() => setHideLowValue(!hideLowValue)}
                style={{ width: 38, height: 20, background: hideLowValue ? "#e53935" : "#333", border: "none", cursor: "pointer", position: "relative", padding: 0 }}
              >
                <div style={{ position: "absolute", top: 3, left: hideLowValue ? 21 : 3, width: 14, height: 14, background: "#fff", transition: "left 0.2s" }} />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: hideBenign ? "#fff" : "#888" }}>
                HIDE BENIGN ENTITIES
              </span>
              <button
                type="button"
                onClick={() => setHideBenign(!hideBenign)}
                style={{ width: 38, height: 20, background: hideBenign ? "#e53935" : "#333", border: "none", cursor: "pointer", position: "relative", padding: 0 }}
              >
                <div style={{ position: "absolute", top: 3, left: hideBenign ? 21 : 3, width: 14, height: 14, background: "#fff", transition: "left 0.2s" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Graph Canvas */}
        <div ref={canvasRef} className="graph-bg" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Banner */}
          <div style={{ position: "absolute", top: 14, left: 20, right: 20, zIndex: 20, background: "#111", border: "1px solid #e53935", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, background: "#e53935", borderRadius: "50%" }} />
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase" }}>
                DYNAMIC TRANSACTION TOPOLOGY TRACE
              </span>
              <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: "#e53935" }}>
                Target: {targetAddress.slice(0, 12)}...
              </span>
            </div>
            <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#aaa" }}>
              Total Nodes: {nodesList.length} | Edges: {edgesList.length}
            </div>
          </div>

          <div
            style={{
              width: "100%", height: "100%", position: "relative",
              transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center", transition: "transform 0.2s ease-out"
            }}
          >
            {/* SVG Connecting Edges */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              <defs>
                <marker id="arrow-red" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#e53935" />
                </marker>
                <marker id="arrow-gray" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>

              {edgesList.map((edge: any, i: number) => {
                const sPos = positions[edge.source];
                const tPos = positions[edge.target];
                if (!sPos || !tPos) return null;

                const pathD = `M ${sPos.cx} ${sPos.cy} L ${tPos.cx} ${tPos.cy}`;
                const strokeColor = edge.risk === "CRITICAL" || edge.risk === "HIGH" ? "#e53935" : "#666";

                return (
                  <g key={i}>
                    <path d={pathD} stroke={strokeColor} strokeWidth="1.8" fill="none" markerEnd={strokeColor === "#e53935" ? "url(#arrow-red)" : "url(#arrow-gray)"} />
                    {isLiveFlow && (
                      <circle r="4" fill={strokeColor}>
                        <animateMotion path={pathD} dur={`${2 / flowSpeed}s`} repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Edge Floating Midpoint Badges */}
            {edgesList.map((edge: any, i: number) => {
              const sPos = positions[edge.source];
              const tPos = positions[edge.target];
              if (!sPos || !tPos) return null;

              const midX = (sPos.cx + tPos.cx) / 2;
              const midY = (sPos.cy + tPos.cy) / 2;
              const isHigh = edge.risk === "CRITICAL" || edge.risk === "HIGH";

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute", top: midY - 12, left: midX - 45, background: "#111",
                    border: `1px solid ${isHigh ? "#e53935" : "#444"}`, padding: "2px 8px", fontSize: 9,
                    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: isHigh ? "#e53935" : "#ccc",
                    pointerEvents: "none", zIndex: 12
                  }}
                >
                  {edge.value} ➔
                </div>
              );
            })}

            {/* Render Nodes Dynamically */}
            {nodesList.map((node: any) => {
              const pos = positions[node.id];
              if (!pos) return null;

              const isCenter = node.id === "center";
              const isHighRisk = node.risk > 70;

              if (isCenter) {
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ position: "absolute", top: pos.top, left: pos.left, cursor: "pointer", zIndex: 15 }}
                  >
                    <div style={{ position: "absolute", inset: -8, background: "rgba(229,57,53,0.15)", borderRadius: "50%", animation: "pulse-red 2s infinite" }} />
                    <div className="pulse-red" style={{ width: 56, height: 56, background: "#111", border: "2px solid #e53935", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span className="material-symbols-outlined icon-fill" style={{ fontSize: 22, color: "#e53935" }}>warning</span>
                    </div>
                    <div style={{ position: "absolute", top: 62, left: "50%", transform: "translateX(-50%)", background: "#111", border: "1px solid #333", padding: "3px 8px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: "#fff", fontWeight: 700 }}>
                        {node.label}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: "absolute", top: pos.top, left: pos.left, background: "#111",
                    border: `1px solid ${isHighRisk ? "#e53935" : "#333"}`, width: 120, padding: 10,
                    cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, zIndex: 14
                  }}
                >
                  <div style={{ width: 36, height: 36, background: "#1a1a1a", border: "1px solid #333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: isHighRisk ? "#e53935" : "#ccc" }}>
                      {node.type === "mixer" ? "blur_on" : node.type === "exchange" ? "account_balance" : "hub"}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#ccc", textAlign: "center", wordBreak: "break-word" }}>{node.label}</span>
                  <span style={{ fontSize: 9, color: isHighRisk ? "#e53935" : "#555", letterSpacing: "0.08em", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800 }}>
                    {node.entity.toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Canvas Zoom Controls */}
          <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", background: "#111", border: "1px solid #222", zIndex: 10 }}>
            <button onClick={() => setZoomLevel(Math.min(zoomLevel + 25, 200))} style={{ width: 36, height: 36, background: "none", border: "none", borderRight: "1px solid #222", color: "#888", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>+</button>
            <button onClick={() => setZoomLevel(100)} style={{ width: 48, height: 36, background: "none", border: "none", borderRight: "1px solid #222", color: "#fff", cursor: "pointer", fontSize: 10, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{zoomLevel}%</button>
            <button onClick={() => setZoomLevel(Math.max(zoomLevel - 25, 50))} style={{ width: 36, height: 36, background: "none", border: "none", borderRight: "1px solid #222", color: "#888", cursor: "pointer", fontSize: 16, fontWeight: 700 }}>−</button>
          </div>
        </div>

        {/* Right Inspector Panel */}
        {selectedNode && (
          <div style={{ width: 320, background: "#0d0d0d", borderLeft: "1px solid #1f1f1f", display: "flex", flexDirection: "column", overflowY: "auto", flexShrink: 0 }}>
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #e53935", background: "#111", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span className="material-symbols-outlined icon-fill" style={{ fontSize: 16, color: "#e53935" }}>warning</span>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#e53935" }}>SELECTED NODE</span>
                </div>
                <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: "#fff", wordBreak: "break-all", lineHeight: 1.5 }}>
                  {selectedNode.full_address}
                </div>
              </div>
              <button onClick={() => setSelectedNode(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              </button>
            </div>

            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Risk Score */}
              <div style={{ background: "#111", border: "1px solid #222", padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 6 }}>RISK SCORE</div>
                  <span style={{ fontSize: 28, fontWeight: 900, color: selectedNode.risk > 70 ? "#e53935" : "#4caf50", fontFamily: "'Inter', sans-serif" }}>{selectedNode.risk}</span>
                  <span style={{ fontSize: 13, color: "#555" }}>/100</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>ATTRIBUTED ENTITY</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", background: selectedNode.risk > 70 ? "#e53935" : "#1a1a1a", color: "#fff", fontSize: 10, fontWeight: 700 }}>
                    {selectedNode.entity || "Unlabeled Wallet"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate("wallet", selectedNode.full_address);
                  }}
                  className="btn-red"
                  style={{ width: "100%", padding: "11px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>travel_explore</span>TRACE THIS WALLET
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
