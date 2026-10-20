from fastapi import APIRouter
from services.blockchain_fetcher import fetch_crypto_prices

router = APIRouter(prefix="/api/market", tags=["market"])

@router.get("/prices")
async def get_market_prices():
    prices = await fetch_crypto_prices()
    return {
        "status": "success",
        "prices": prices,
        "timestamp": "2026-07-30T21:58:00Z"
    }
