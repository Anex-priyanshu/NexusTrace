import re
import secrets
import random

EVM_REGEX = re.compile(r"^0x[a-fA-F0-9]{40}$")
BTC_LEGACY_REGEX = re.compile(r"^1[a-km-zA-HJ-NP-Z1-9]{25,34}$")
BTC_P2SH_REGEX = re.compile(r"^3[a-km-zA-HJ-NP-Z1-9]{25,34}$")
BTC_BECH32_REGEX = re.compile(r"^bc1[0-9a-hj-np-z]{8,87}$", re.IGNORECASE)
SOL_REGEX = re.compile(r"^[1-9A-HJ-NP-Za-km-z]{32,44}$")
TRON_REGEX = re.compile(r"^T[a-km-zA-HJ-NP-Z1-9]{33}$")


BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
BECH32_ALPHABET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

def validate_address(address: str) -> dict:
    if not address or not isinstance(address, str):
        return {
            "is_valid": False,
            "chain": "UNKNOWN",
            "format_name": "Unknown",
            "error": "Address is empty or invalid type."
        }

    addr = address.strip()
    
    if EVM_REGEX.match(addr):
        return {
            "is_valid": True,
            "chain": "ETH",
            "format_name": "EVM (Ethereum/BNB/Polygon)",
            "error": None
        }

    if BTC_BECH32_REGEX.match(addr) or BTC_LEGACY_REGEX.match(addr) or BTC_P2SH_REGEX.match(addr):
        return {
            "is_valid": True,
            "chain": "BTC",
            "format_name": "Bitcoin On-Chain",
            "error": None
        }

    if TRON_REGEX.match(addr):
        return {
            "is_valid": True,
            "chain": "TRON",
            "format_name": "Tron TRC-20 Network",
            "error": None
        }

    # Solana addresses are Base58 strings 32-44 characters long
    # Make sure it doesn't collide with non-Solana strings like pure hex or simple words
    if SOL_REGEX.match(addr) and len(addr) >= 32 and not addr.startswith("0x"):
        return {
            "is_valid": True,
            "chain": "SOL",
            "format_name": "Solana Base58",
            "error": None
        }

    return {
        "is_valid": False,
        "chain": "UNKNOWN",
        "format_name": "Invalid",
        "error": f"'{addr}' is not a recognized EVM (0x...), Bitcoin, Solana, or Tron address format."
    }

def generate_valid_random_address(chain: str = "eth") -> str:
    chain = chain.lower()
    if chain in ["btc", "bitcoin"]:
        prefix = "bc1q"
        chars = "".join(random.choices(BECH32_ALPHABET, k=38))
        return prefix + chars
    elif chain in ["sol", "solana"]:
        return "".join(random.choices(BASE58_ALPHABET, k=44))
    elif chain in ["tron", "trx"]:
        return "T" + "".join(random.choices(BASE58_ALPHABET, k=33))
    else:
        # Default EVM 0x + 40 hex chars
        hex_chars = secrets.token_hex(20)
        return f"0x{hex_chars}"
