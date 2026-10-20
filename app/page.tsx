"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import DashboardPage from "../components/DashboardPage";
import WalletPage from "../components/WalletPage";
import GraphPage from "../components/GraphPage";
import RiskPage from "../components/RiskPage";
import SmartContractPage from "../components/SmartContractPage";
import CrossChainPage from "../components/CrossChainPage";
import ScamDbPage from "../components/ScamDbPage";
import AlertsPage from "../components/AlertsPage";
import ReportsPage from "../components/ReportsPage";
import AdminPage from "../components/AdminPage";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [activeAddress, setActiveAddress] = useState("0x71C7656EC7ab88b098defB751B7401B5f6d89B83");
  const [activeCaseId, setActiveCaseId] = useState("CS-2941");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigateWithAddress = (targetPage: string, addr?: string) => {
    if (addr) setActiveAddress(addr);
    setPage(targetPage);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "wallet":
        return <WalletPage addressParam={activeAddress} onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "graph":
        return <GraphPage addressParam={activeAddress} onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "risk":
        return <RiskPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "contracts":
        return <SmartContractPage addressParam={activeAddress} onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "crosschain":
        return <CrossChainPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "scamdb":
        return <ScamDbPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "alerts":
        return <AlertsPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "reports":
        return <ReportsPage caseIdParam={activeCaseId} addressParam={activeAddress} onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      case "admin":
        return <AdminPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
      default:
        return <DashboardPage onNavigate={handleNavigateWithAddress} showToast={showToast} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0a0a0a", overflow: "hidden", position: "relative" }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            background: "#e53935",
            color: "#fff",
            padding: "12px 20px",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.06em",
            boxShadow: "0 4px 16px rgba(229,57,53,0.4)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            textTransform: "uppercase"
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
          {toastMessage}
        </div>
      )}

      <Sidebar activePage={page} onNavigate={(p) => setPage(p)} />
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {page !== "graph" && <Topbar onSearch={(q) => handleNavigateWithAddress("wallet", q)} showToast={showToast} />}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

