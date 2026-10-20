from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.risk_engine import calculate_wallet_risk
from services.address_validator import validate_address

router = APIRouter(prefix="/api/risk", tags=["risk"])

class BatchRiskRequest(BaseModel):
    addresses: List[str]

@router.post("/batch")
async def batch_risk_screening(payload: BatchRiskRequest):
    results = []
    for addr in payload.addresses:
        clean_addr = addr.strip()
        if clean_addr:
            val_res = validate_address(clean_addr)
            if not val_res["is_valid"]:
                results.append({
                    "address": clean_addr,
                    "chain": "UNKNOWN",
                    "is_valid": False,
                    "risk_score": 0,
                    "risk_level": "Invalid Format",
                    "level_color": "gray",
                    "entity_name": "Invalid Address Format",
                    "category": "Error",
                    "tags": ["INVALID FORMAT"],
                    "risk_factors": ["INVALID FORMAT"],
                    "reasons": [val_res["error"]],
                    "metrics": {"tx_count": 0, "balance_usd": 0.0, "first_seen": "N/A"}
                })
            else:
                risk_info = calculate_wallet_risk(clean_addr, chain=val_res["chain"])
                risk_info["is_valid"] = True
                results.append(risk_info)
    return {"screened_count": len(results), "results": results}

