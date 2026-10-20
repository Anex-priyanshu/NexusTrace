# 🛡️ NexusTrace (Chronos Forensics)
### Unified Blockchain Cybercrime Investigation & Multi-Chain Cryptofinancial Intelligence Platform

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/UI-React%2019-blue?logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary

**NexusTrace** (developed under the *Chronos Forensics* cyber intelligence framework) is a production-grade cryptocurrency forensics and on-chain intelligence platform designed for **law enforcement agencies, financial intelligence units (FIUs), AML/KYC compliance officers, and cyber incident responders**.

Modern cryptocurrency laundering techniques (such as peel chains, mixers, cross-chain swaps, and privacy contracts) evade conventional surveillance. NexusTrace solves this by unifying raw on-chain data ingestion, heuristic behavioral analytics, graph-based fund flow reconstruction, and court-ready evidentiary reporting into a centralized operational dashboard.

---

## 🚀 Key Modules & Capabilities

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NexusTrace Cyber Engine                         │
├─────────────────┬───────────────────┬───────────────────┬──────────────┤
│ 🔍 Wallet Trace │ 🕸️ Graph Explorer │ ⚠️ Risk Scoring   │ 📜 Contracts │
│ • Multi-chain   │ • Hop tracking    │ • OFAC Sanctions  │ • Honeypots  │
│ • Balance logs  │ • Peel chains     │ • Mixer detection │ • Approvals  │
│ • Counterparties│ • Cluster maps    │ • AML Confidence  │ • Bytecode   │
├─────────────────┼───────────────────┼───────────────────┼──────────────┤
│ 🌉 Cross-Chain  │ 🚨 Threat Alerts  │ 🗄️ ScamDB Intel   │ 📑 Reports   │
│ • Bridge hops   │ • Live Webhooks   │ • Rug-pull radar  │ • Court-ready│
│ • Asset tracing │ • Whale alerts    │ • Phishing feeds  │ • Audit logs │
└─────────────────┴───────────────────┴───────────────────┴──────────────┘
```

### 1. 🔍 Deep Wallet Profiler & Counterparty Analysis
- Ingests address metadata, real-time balances, transaction velocities, and gas expenditure patterns across **Ethereum, Binance Smart Chain, Polygon, and Bitcoin**.
- Identifies primary counterparties, recurring exchange touchpoints, and unhosted wallet clusters.

### 2. 🕸️ Interactive Visual Graph Tracing
- Dynamic node-link graph mapping money movements from origin to destination across multiple hops.
- Automated detection of **peel chains, smurfing patterns, and tumbler/mixer hops** (e.g., Tornado Cash).
- Interactive controls for time-slicing, transaction thresholding, and cluster grouping.

### 3. ⚠️ Contextual Risk & AML Compliance Engine
- Algorithmic risk rating (0–100) factoring in **OFAC SDN list checks, mixer proximity, darknet market interactions, and velocity anomalies**.
- Explains the exact evidence rationale for every risk score to meet regulatory defensibility standards.

### 4. 📜 Smart Contract & Honeypot Inspector
- Decompilation and static heuristic analysis of target smart contract bytecode.
- Detects malicious token tax functions, hidden owner mint privileges, blacklist traps, and unverified proxies.

### 5. 🌉 Cross-Chain Bridge Monitor
- Traces illicit funds jumping across heterogeneous chains via decentralized bridges (Across, Stargate, Hop Protocol, etc.).

### 6. 🗄️ ScamDB & OSINT Threat Feeds
- Continuous feed integration of verified phishing campaigns, fake investment portals, ransomware payment addresses, and crowdsourced scam databases.

### 7. 📑 Evidentiary Court-Ready Reports
- One-click export of structured investigative dossiers including timestamped transaction ledgers, network graph snapshots, and chain-of-custody verification.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic, NetworkX.
- **Data Integration**: Multi-chain RPC nodes, Etherscan API, BscScan API, Polygonscan API, Moralis API.

---

## ⚡ Quick Start

### 1. One-Click Launcher (Windows)
Double-click `start.bat` in the root folder, or run in PowerShell:
```powershell
.\start.bat
```
This automatically boots both the FastAPI backend (`:8000`) and Next.js frontend (`:3005`), then opens the investigation portal in your default browser.

### 2. Manual Startup

#### Backend (FastAPI):
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

#### Frontend (Next.js):
```bash
npm install
npm run dev -- -p 3005
```
Access the web portal at: `http://localhost:3005`

---

## 📂 Project Structure

```
NexusTrace/
├── app/                  # Next.js 16 App Router (Core layout, globals)
├── components/           # Investigation UI modules (Graph, Wallet, Risk, ScamDB)
├── backend/              # FastAPI Python backend engine
│   ├── routers/          # Modular API endpoints (wallet, graph, risk, etc.)
│   ├── services/         # On-chain queries, graph builders, risk calculators
│   └── main.py           # Application entrypoint & CORS middleware
├── prd/                  # Full Product Requirements & Architecture Specifications
├── public/               # Static assets & brand vectors
├── start.bat             # Production dual-server orchestrator
└── README.md             # Platform documentation
```

---

## ⚖️ Legal & Compliance Notice

This software is developed strictly for authorized law enforcement, compliance verification, forensic auditing, and cybersecurity research purposes. Users are responsible for complying with applicable local and international financial privacy regulations.

---

**Author**: Priyanshu Patel  
**Organization**: Chronos Forensics / NexusTrace Intelligence
