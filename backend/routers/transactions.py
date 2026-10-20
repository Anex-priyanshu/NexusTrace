from fastapi import APIRouter, Query
from services.blockchain_fetcher import fetch_transactions

router = APIRouter(prefix="/api/transactions", tags=["transactions"])

@router.get("/{address}")
async def get_wallet_transactions(address: str, chain: str = Query("eth"), limit: int = Query(10)):
    return await fetch_transactions(address, chain=chain, limit=limit)
