export interface UserCase {
  id: string;
  wallet: string;
  fullAddress: string;
  chain?: string;
  assignee: string;
  name: string;
  activity: string;
  status: string;
  isRedStatus: boolean;
  timestamp: number;
}

const STORAGE_KEY = "nexustrace_recent_cases";

export function getRecentCases(): UserCase[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load recent cases:", err);
    return [];
  }
}

export function addRecentCase(address: string, chain: string = "eth"): UserCase {
  if (!address || !address.trim()) throw new Error("Invalid address");
  const cleanAddress = address.trim();
  const cases = getRecentCases();

  // Check if case already exists for this address
  const existingIdx = cases.findIndex(c => c.fullAddress.toLowerCase() === cleanAddress.toLowerCase());

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString() === new Date().toLocaleDateString() ? `Today, ${timeStr}` : now.toLocaleDateString();

  const formattedAddr = cleanAddress.length > 12 
    ? `${cleanAddress.slice(0, 6)}...${cleanAddress.slice(-4)}` 
    : cleanAddress;

  let updatedCase: UserCase;

  if (existingIdx >= 0) {
    // Update activity time and move to top
    updatedCase = {
      ...cases[existingIdx],
      activity: dateStr,
      timestamp: Date.now()
    };
    cases.splice(existingIdx, 1);
  } else {
    // Create new case with ID
    const nextIdNum = 2940 + cases.length + 1;
    updatedCase = {
      id: `CS-${nextIdNum}`,
      wallet: formattedAddr,
      fullAddress: cleanAddress,
      chain,
      assignee: "YOU",
      name: "Investigator",
      activity: dateStr,
      status: "IN-PROGRESS",
      isRedStatus: true,
      timestamp: Date.now()
    };
  }

  cases.unshift(updatedCase);
  // Keep last 15 cases
  const trimmed = cases.slice(0, 15);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save case:", err);
  }

  return updatedCase;
}

export function removeCase(id: string): UserCase[] {
  const cases = getRecentCases().filter(c => c.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (err) {
    console.error("Failed to remove case:", err);
  }
  return cases;
}

export function clearAllCases(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {}
}
