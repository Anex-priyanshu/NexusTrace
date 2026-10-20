const API_BASE = "http://127.0.0.1:8000/api";

export async function getWalletOverview(address: string, chain: string = "eth") {
  try {
    const res = await fetch(`${API_BASE}/wallet/${encodeURIComponent(address)}?chain=${chain}`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback wallet data:", err);
    return null;
  }
}

export async function getWalletTransactions(address: string, chain: string = "eth") {
  try {
    const res = await fetch(`${API_BASE}/transactions/${encodeURIComponent(address)}?chain=${chain}`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback transactions:", err);
    return null;
  }
}

export async function getGraphData(address: string, depth: number = 2) {
  try {
    const res = await fetch(`${API_BASE}/graph/${encodeURIComponent(address)}?depth=${depth}`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback graph:", err);
    return null;
  }
}

export async function runBatchRiskScreening(addresses: string[]) {
  try {
    const res = await fetch(`${API_BASE}/risk/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ addresses }),
    });
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    console.warn("Using fallback risk batch:", err);
    return null;
  }
}

export async function getSmartContractAnalysis(address: string) {
  try {
    const res = await fetch(`${API_BASE}/contracts/${encodeURIComponent(address)}`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function generateReport(caseId: string, address: string) {
  try {
    const res = await fetch(`${API_BASE}/reports/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_id: caseId, wallet_address: address }),
    });
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function getMarketPrices() {
  try {
    const res = await fetch(`${API_BASE}/market/prices`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function getLiveAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts/live`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function searchScamDb(query: string = "") {
  try {
    const res = await fetch(`${API_BASE}/scam-db/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function submitScamReport(address: string, entity: string, category: string, description: string) {
  try {
    const res = await fetch(`${API_BASE}/scam-db/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, entity, category, description }),
    });
    if (!res.ok) throw new Error("Backend error");
    return await res.json();
  } catch (err) {
    return null;
  }
}

