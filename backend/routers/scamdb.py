from fastapi import APIRouter, Query
from pydantic import BaseModel
from services.scam_db import lookup_wallet_entity, KNOWN_BAD_WALLETS
from services.address_validator import validate_address

router = APIRouter(prefix="/api/scam-db", tags=["scam-db"])

class ReportScamRequest(BaseModel):
    address: str
    entity: str
    category: str
    description: str

@router.get("/search")
async def search_scam_database(q: str = Query("")):
    query = q.strip().lower()
    results = []
    
    if not query:
        # Return summary list
        for addr, details in KNOWN_BAD_WALLETS.items():
            results.append({
                "address": addr,
                "entity": details["entity"],
                "category": details["category"],
                "tags": details["tags"],
                "risk_boost": details["risk_boost"],
                "severity": "CRITICAL" if details["risk_boost"] >= 40 else "HIGH"
            })
    else:
        # Search by address or tag or entity
        for addr, details in KNOWN_BAD_WALLETS.items():
            if query in addr.lower() or query in details["entity"].lower() or any(query in t.lower() for t in details["tags"]):
                results.append({
                    "address": addr,
                    "entity": details["entity"],
                    "category": details["category"],
                    "tags": details["tags"],
                    "risk_boost": details["risk_boost"],
                    "severity": "CRITICAL" if details["risk_boost"] >= 40 else "HIGH"
                })
        
        # If no exact match found, return heuristic lookup
        if not results:
            val_res = validate_address(query)
            if val_res["is_valid"]:
                entity_info = lookup_wallet_entity(query)
                results.append({
                    "address": query,
                    "entity": entity_info["entity"],
                    "category": entity_info["category"],
                    "tags": entity_info["tags"],
                    "risk_boost": entity_info["risk_boost"],
                    "severity": "HIGH" if entity_info["risk_boost"] > 0 else "LOW"
                })

    return {"query": q, "total_matches": len(results), "results": results}

@router.post("/submit")
async def submit_scam_report(payload: ReportScamRequest):
    addr_clean = payload.address.strip().lower()
    val_res = validate_address(addr_clean)
    if not val_res["is_valid"]:
        return {"success": False, "error": val_res["error"]}

    KNOWN_BAD_WALLETS[addr_clean] = {
        "entity": payload.entity or "User Flagged Suspicious Address",
        "category": payload.category or "Phishing/Scam",
        "risk_boost": 40,
        "tags": ["USER REPORTED", payload.category or "Phishing"]
    }
    return {
        "success": True,
        "message": f"Successfully registered report for {addr_clean}",
        "entry": KNOWN_BAD_WALLETS[addr_clean]
    }

