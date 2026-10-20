export interface ValidationResult {
  isValid: boolean;
  chain: string;
  formatName: string;
  error?: string;
}

const EVM_REGEX = /^0x[a-fA-F0-9]{40}$/;
const BTC_LEGACY_REGEX = /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
const BTC_P2SH_REGEX = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
const BTC_BECH32_REGEX = /^bc1[0-9a-hj-np-z]{8,87}$/i;
const SOL_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const TRON_REGEX = /^T[a-km-zA-HJ-NP-Z1-9]{33}$/;


const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const BECH32_ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

export function validateAddress(address: string): ValidationResult {
  if (!address || typeof address !== "string") {
    return {
      isValid: false,
      chain: "UNKNOWN",
      formatName: "Unknown",
      error: "Address is empty.",
    };
  }

  const addr = address.trim();

  if (EVM_REGEX.test(addr)) {
    return {
      isValid: true,
      chain: "ETH",
      formatName: "EVM (Ethereum / BNB / Polygon)",
    };
  }

  if (BTC_BECH32_REGEX.test(addr) || BTC_LEGACY_REGEX.test(addr) || BTC_P2SH_REGEX.test(addr)) {
    return {
      isValid: true,
      chain: "BTC",
      formatName: "Bitcoin On-Chain",
    };
  }

  if (TRON_REGEX.test(addr)) {
    return {
      isValid: true,
      chain: "TRON",
      formatName: "Tron TRC-20 Network",
    };
  }

  if (SOL_REGEX.test(addr) && addr.length >= 32 && !addr.startsWith("0x")) {
    return {
      isValid: true,
      chain: "SOL",
      formatName: "Solana Base58",
    };
  }

  return {
    isValid: false,
    chain: "UNKNOWN",
    formatName: "Invalid Format",
    error: `'${addr}' is not a valid EVM (0x...), Bitcoin, Solana, or Tron address.`,
  };
}

export function generateRandomValidAddress(chain: string = "eth"): string {
  const c = chain.toLowerCase();
  if (c === "btc" || c === "bitcoin") {
    let chars = "";
    for (let i = 0; i < 38; i++) {
      chars += BECH32_ALPHABET[Math.floor(Math.random() * BECH32_ALPHABET.length)];
    }
    return `bc1q${chars}`;
  } else if (c === "sol" || c === "solana") {
    let chars = "";
    for (let i = 0; i < 44; i++) {
      chars += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)];
    }
    return chars;
  } else if (c === "tron" || c === "trx") {
    let chars = "";
    for (let i = 0; i < 33; i++) {
      chars += BASE58_ALPHABET[Math.floor(Math.random() * BASE58_ALPHABET.length)];
    }
    return `T${chars}`;
  } else {
    // Default EVM 0x + 40 hex chars
    const hex = "0123456789abcdef";
    let chars = "";
    for (let i = 0; i < 40; i++) {
      chars += hex[Math.floor(Math.random() * hex.length)];
    }
    return `0x${chars}`;
  }
}
