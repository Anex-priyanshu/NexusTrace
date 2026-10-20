import re

# Known Sanctioned & Threat Actor Wallets (OFAC, Lazarus Group, Scam DB)
KNOWN_BAD_WALLETS = {
    # Tornado Cash contracts & relayer addresses
    "0x71c7656ec7ab88b098defb751b7401b5f6d89b83": {
        "entity": "Tornado Cash Router",
        "category": "Mixer",
        "risk_boost": 35,
        "tags": ["Tornado Cash", "Privacy Mixer", "Sanctioned"]
    },
    "0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc": {
        "entity": "Tornado Cash 0.1 ETH",
        "category": "Mixer",
        "risk_boost": 35,
        "tags": ["Tornado Cash", "Mixer"]
    },
    "0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936": {
        "entity": "Tornado Cash 1 ETH",
        "category": "Mixer",
        "risk_boost": 35,
        "tags": ["Tornado Cash", "Mixer"]
    },
    "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf": {
        "entity": "Tornado Cash 10 ETH",
        "category": "Mixer",
        "risk_boost": 35,
        "tags": ["Tornado Cash", "Mixer"]
    },
    "0xa160cd373d0264d0ca14f117960bd9ed587c4f4b": {
        "entity": "Tornado Cash 100 ETH",
        "category": "Mixer",
        "risk_boost": 35,
        "tags": ["Tornado Cash", "Mixer"]
    },
    # Lazarus Group (Ronin Bridge Hack / Horizon Hack)
    "0x098b716b8aaf21512996dc57eb0615e2383e2f96": {
        "entity": "Lazarus Group (Ronin Exploit)",
        "category": "APT Group",
        "risk_boost": 50,
        "tags": ["Lazarus Group", "OFAC Sanctioned", "Ronin Exploit"]
    },
    "0xa0e8261556821540751263e792764830a666ce2b": {
        "entity": "Lazarus Group Wallet",
        "category": "APT Group",
        "risk_boost": 50,
        "tags": ["Lazarus Group", "OFAC Sanctioned"]
    },
    "0x3c554e94ea88a0400db4681604a11f26f2a36b95": {
        "entity": "Phishing Drainer Main",
        "category": "Scam/Drainer",
        "risk_boost": 40,
        "tags": ["Angel Drainer", "Phishing"]
    },
    "1a1zp1ep5qgefi2dmptftl5slmv7divfna": {
        "entity": "Genesis Wallet (Satoshi)",
        "category": "Historical",
        "risk_boost": 0,
        "tags": ["Satoshi Nakamoto", "Genesis"]
    },
    "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx89lq": {
        "entity": "Darknet Market Vendor",
        "category": "Darknet",
        "risk_boost": 30,
        "tags": ["Hydra Market", "Darknet"]
    }
}

KNOWN_EXCHANGES = {
    "binance": ["0x28c6c06298d514db089934071355e5743bf21d60", "0x21a31ee1afc51d94c2efccaa2092ad1028285549", "34xp4vro0lqzkzly59cbg87nupkwu54228"],
    "coinbase": ["0x71660c4005ba85c37ccec55d0c4493e66fe775d3", "0x503828976d22510aad0201ac7ec88293211d23da"],
    "kraken": ["0x2910543af39ab0d073142675d816722a572c88f2"],
    "kucoin": ["0xd6216fc66f0459791179a822709210214a1c5d94"]
}

def lookup_wallet_entity(address: str) -> dict:
    addr_clean = address.strip().lower()
    if addr_clean in KNOWN_BAD_WALLETS:
        return KNOWN_BAD_WALLETS[addr_clean]
    
    # Check exact exchange addresses
    for exch_name, addrs in KNOWN_EXCHANGES.items():
        if any(a.lower() == addr_clean for a in addrs):
            return {
                "entity": f"{exch_name.capitalize()} Exchange Hot Wallet",
                "category": "Exchange",
                "risk_boost": 0,
                "tags": ["Exchange", exch_name.capitalize()]
            }
    
    return {
        "entity": "Unlabeled Wallet",
        "category": "Individual",
        "risk_boost": 0,
        "tags": ["User Wallet"]
    }
