from services.scam_db import lookup_wallet_entity

def calculate_wallet_risk(address: str, chain: str = "eth", tx_count: int = 0, first_seen: str = "", balance_usd: float = 0.0) -> dict:
    addr_lower = address.lower().strip()
    entity_info = lookup_wallet_entity(addr_lower)
    
    score = 10 # Base clean score
    risk_factors = []
    reasons = []

    # 1. Known Scam / Sanction DB Match
    if entity_info["risk_boost"] > 0:
        score += entity_info["risk_boost"]
        risk_factors.append(f"{entity_info['category'].upper()} DETECTED")
        reasons.append(f"Linked to {entity_info['entity']} ({', '.join(entity_info['tags'])})")
    
    # 2. Transaction velocity & volume rules
    if tx_count > 10000:
        score += 15
        risk_factors.append("HIGH VELOCITY")
        reasons.append("High frequency automated transaction pattern (>10,000 txs)")
    elif tx_count > 1000:
        score += 10
        risk_factors.append("ACTIVE TRADER")

    # 3. Large Balance / Whale check
    if balance_usd > 1000000:
        risk_factors.append("WHALE")
        reasons.append("High capital wallet holding >$1M USD equivalent")

    # Final score cap 0-100
    final_score = min(max(score, 5), 98)
    
    # Determine Risk Level
    if final_score >= 80:
        risk_level = "Critical"
        level_color = "red"
    elif final_score >= 50:
        risk_level = "High"
        level_color = "orange"
    elif final_score >= 25:
        risk_level = "Medium"
        level_color = "yellow"
    else:
        risk_level = "Low"
        level_color = "green"

    if not risk_factors:
        risk_factors = ["NO SIGNIFICANT FLAGS"]
        reasons = ["Clean wallet history with no direct malicious entity connections"]

    return {
        "address": address,
        "chain": chain.upper(),
        "risk_score": final_score,
        "risk_level": risk_level,
        "level_color": level_color,
        "entity_name": entity_info["entity"],
        "category": entity_info["category"],
        "tags": entity_info["tags"],
        "risk_factors": risk_factors,
        "reasons": reasons,
        "metrics": {
            "tx_count": tx_count,
            "balance_usd": balance_usd,
            "first_seen": first_seen or ("Never" if tx_count == 0 else "2023-01-01")
        }
    }
