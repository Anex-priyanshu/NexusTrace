from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from services.blockchain_fetcher import fetch_wallet_details

router = APIRouter(prefix="/api/reports", tags=["reports"])

class GenerateReportRequest(BaseModel):
    case_id: str
    wallet_address: str

@router.post("/generate")
async def generate_forensic_report(payload: GenerateReportRequest):
    details = await fetch_wallet_details(payload.wallet_address)
    risk_score = details.get("risk_score", 10)
    risk_level = details.get("risk_level", "Low Risk")
    balance_usd = details.get("metrics", {}).get("balance_usd", 0.0)
    tx_count = details.get("metrics", {}).get("tx_count", 0)

    now_iso = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    return {
        "report_id": f"REP-{payload.case_id}-2026",
        "case_id": payload.case_id,
        "subject_wallet": payload.wallet_address,
        "executive_summary": f"Live forensic analysis of wallet {payload.wallet_address} ({details.get('chain', 'ETH').upper()}) concluded a risk rating of {risk_score}/100 ({risk_level}). Total on-chain balance verified at ${balance_usd:,.2f} USD across {tx_count} recorded transactions.",
        "risk_score": risk_score,
        "total_traced_volume_usd": f"${balance_usd:,.2f}",
        "generated_at": now_iso,
        "download_urls": {
            "json": f"/api/reports/download/{payload.case_id}.json",
            "csv": f"/api/reports/download/{payload.case_id}.csv"
        }
    }
