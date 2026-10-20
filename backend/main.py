from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import wallet, transactions, graph, risk, contracts, reports, market, alerts, scamdb

app = FastAPI(
    title="Chronos Forensics — API",
    description="Cybercrime investigation & multi-chain cryptocurrency tracing API",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(wallet.router)
app.include_router(transactions.router)
app.include_router(graph.router)
app.include_router(risk.router)
app.include_router(contracts.router)
app.include_router(reports.router)
app.include_router(market.router)
app.include_router(alerts.router)
app.include_router(scamdb.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Chronos Forensics Cyber Intelligence Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
