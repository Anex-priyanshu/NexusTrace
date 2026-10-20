from fastapi import APIRouter, Query
from services.blockchain_fetcher import fetch_wallet_details

router = APIRouter(prefix="/api/wallet", tags=["wallet"])

@router.get("/{address}")
async def get_wallet_overview(address: str, chain: str = Query("eth")):
    return await fetch_wallet_details(address, chain=chain)
