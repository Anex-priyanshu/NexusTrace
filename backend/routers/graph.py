from fastapi import APIRouter, Query
from services.blockchain_fetcher import build_graph_data

router = APIRouter(prefix="/api/graph", tags=["graph"])

@router.get("/{address}")
async def get_graph_data(address: str, depth: int = Query(2)):
    return await build_graph_data(address, depth=depth)
