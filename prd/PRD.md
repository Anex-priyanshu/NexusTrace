# ChainSentry — Product Requirements Document

**Unified Blockchain & Cyber Investigation Platform**
*Production-Grade Frontend & Full-Stack Delivery Specification*

| Field | Detail |
|---|---|
| Document Owner | Product Management |
| Version | 1.0 (Production Baseline) |
| Status | Approved for Engineering Handoff |
| Date | July 30, 2026 |
| Classification | Internal / Confidential |
| Target Release | MVP → v1 → v2 (phased, see Roadmap) |

---

## 1. Document Control

| Field | Detail |
|---|---|
| Product Name | ChainSentry — Blockchain Investigation Platform |
| Document Type | Product Requirements Document (Production) |
| Prepared For | Engineering, Design, QA, Security, DevOps, Compliance stakeholders |
| Source Input | Consolidated UI/UX & feature spec (15 core investigation features) |
| Review Cycle | Reviewed at each phase gate (MVP, v1, v2) and on major scope change |
| Approval Required From | Head of Product, Engineering Lead, Security Lead, Compliance Officer |

### 1.1 Revision History

| Version | Date | Author | Summary of Change |
|---|---|---|---|
| 0.1 | — | Product/UX | Initial UI/UX concept and feature inventory |
| 1.0 | Jul 30, 2026 | Product Management | Converted to production PRD: added tech stack, architecture, API contracts, NFRs, security, testing, rollout |

---

## 2. Purpose & Product Overview

ChainSentry is a unified, production-grade front-end platform for blockchain and cyber investigations. It consolidates wallet investigation, risk scoring, graph-based fund tracing, cross-chain analysis, smart contract inspection, token approval auditing, NFT/DeFi monitoring, scam intelligence lookup, OSINT correlation, and court-ready report generation into a single professional dashboard.

This PRD translates the approved UI/UX concept and feature inventory into a build-ready specification: it defines the technology stack, system architecture, API contracts, data model, non-functional requirements, security posture, and phased delivery plan required to ship a production website — not a prototype.

### 2.1 Problem Statement

Investigators across law enforcement, compliance, exchanges, and incident response currently rely on fragmented tooling (block explorers, spreadsheets, disparate intel feeds) to trace illicit crypto activity. This slows case resolution, introduces error, and produces evidence that is difficult to defend in court or audit. ChainSentry addresses this by unifying tracing, scoring, and reporting into one auditable workflow.

### 2.2 Product Vision

"Follow the money at every step" — a single pane of glass where an investigator can go from a raw wallet address to a court-ready, evidentiary report without leaving the platform, backed by real-time data, defensible risk scoring, and a full audit trail of every action taken.

---

## 3. Goals & Success Metrics

### 3.1 Business Goals

- **Reduce investigation time** — cut average time-to-report for a standard wallet investigation from hours to minutes via automated tracing and one-click reporting.
- **Increase evidentiary quality** — every exported report is reproducible, timestamped, and includes a full audit trail suitable for court or regulatory submission.
- **Expand addressable users** — serve four distinct user segments (law enforcement, compliance, exchanges, IR/security) from one configurable platform.
- **Enable defensible scale** — support multi-chain, high-volume graph exploration (10,000+ node graphs) without degrading UX.

### 3.2 Success Metrics (KPIs)

| Metric | Target (Post-Launch) | Measurement Method |
|---|---|---|
| Time to first insight (wallet lookup → risk score displayed) | ≤ 2 seconds (p95) | Frontend performance monitoring (Web Vitals + custom timing) |
| Graph render time (1,000-node subgraph) | ≤ 3 seconds (p95) | Client-side render timing instrumentation |
| Report generation time (standard case) | ≤ 15 seconds | Server-side job duration metrics |
| Platform uptime (production) | 99.9% monthly | Uptime monitoring (synthetic + real-user) |
| Weekly active investigators (WAI) | Growth quarter-over-quarter | Product analytics |
| Task success rate (usability testing) | ≥ 90% across core flows | Moderated usability sessions |
| Accessibility conformance | WCAG 2.1 AA, zero critical violations | Automated (axe-core) + manual audit |

---

## 4. Target Users & Personas

### 4.1 User Segments

| Segment | Primary Goals | Key Constraints |
|---|---|---|
| Law Enforcement & Intelligence | Track stolen/illicit funds, attribute criminal networks, assemble prosecutorial evidence | Chain-of-custody, court-admissibility, offline-capable exports |
| Regulators & Compliance Teams | Investigate fraud, enforce sanctions, screen VASPs, file SARs | Auditability, regulatory reporting formats, sanctions-list integration |
| Crypto Exchanges & Financial Firms | Enhanced due diligence, hack/breach investigation, asset freezing | Real-time alerting, integration with internal KYC/AML systems |
| Incident Response & Cybersecurity | Threat hunting, ransomware tracing, cross-chain incident resolution | Speed, integration with SOC/SIEM tooling, API access |

### 4.2 Representative Personas

**Persona A — "Dana," Financial Crimes Investigator (Law Enforcement)**
- Needs to move from a tip (a wallet address) to a defensible case file quickly.
- Requires exportable, timestamped evidence with an unbroken audit trail.
- Moderate technical skill; relies on visual graph exploration over raw data.

**Persona B — "Rahul," AML Compliance Analyst (Exchange)**
- Screens hundreds of wallets/day; needs fast batch risk scoring and clear thresholds.
- Must integrate findings into SAR filings and internal case management.
- High volume, low tolerance for false positives / UI friction.

**Persona C — "Mei," Incident Response Lead (Security Team)**
- Traces ransomware payment flows across chains under time pressure during active incidents.
- Needs API/automation hooks to plug into existing SOC tooling.
- High technical skill; comfortable with contract-level and raw transaction detail.

---

## 5. Scope

### 5.1 In Scope (Production Website — Frontend + Supporting Services)

- Responsive, desktop-first web application (React/Next.js) covering all 15 core investigation features.
- Backend-for-frontend (BFF) / GraphQL API layer to aggregate blockchain data, risk scoring, and intel sources.
- Authentication, authorization, and role-based access control (RBAC).
- Report generation pipeline (PDF/HTML export) with audit logging.
- Design system / component library, dark and light themes, WCAG 2.1 AA accessibility.
- Observability, CI/CD, and production infrastructure required to operate the site at scale.

### 5.2 Out of Scope (This PRD)

- Proprietary blockchain data indexing/ingestion pipelines (assumed to be provided via third-party or internal data-provider APIs).
- Native mobile applications (mobile is responsive-web only in this phase).
- Underlying risk-scoring model research/training (the frontend consumes a scoring API; model development is a separate data-science workstream).
- SSO/SAML identity-provider implementation details (integration point is specified; IdP configuration is an IT/security workstream).

---

## 6. Technology Stack

### 6.1 Frontend

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 14+ (React 18, App Router) | SSR/SSG for fast first paint on data-heavy dashboards; file-based routing matches the module-based sitemap |
| Language | TypeScript (strict mode) | Type safety across complex data models (wallets, graphs, risk factors) |
| Styling | Tailwind CSS + CSS variables (design tokens) | Matches spacing/typography token system specified; supports light/dark theming |
| Component Library | Custom design system (Storybook-documented) built on Radix UI primitives | Accessible-by-default primitives (ARIA, focus trapping) accelerate the specified component library |
| Data Fetching / State | Apollo Client (GraphQL) + TanStack Query for REST fallbacks | Matches GraphQL query pattern referenced in developer handoff tasks |
| Graph Visualization | D3.js (force-directed layout) rendered to Canvas/WebGL via PixiJS for large graphs; SVG fallback for small graphs | Canvas/WebGL required to meet 1,000+ node performance targets; SVG alone will not scale |
| Charts | Recharts / D3 for Sankey, time-series, pie, and bar charts | Covers all chart types specified (network, Sankey, time-series, pie, bar) |
| Forms & Validation | React Hook Form + Zod | Type-safe validation for wallet-address inputs, filters, and admin forms |
| Diagramming (docs/reports) | Mermaid.js (client-render) | For embedded flow diagrams in reports |
| Testing (unit/component) | Vitest + React Testing Library | — |
| Testing (E2E) | Playwright | — |
| Accessibility Testing | axe-core (automated) + manual screen-reader audits (NVDA/VoiceOver) | — |

### 6.2 Backend / API Layer

| Layer | Technology | Rationale |
|---|---|---|
| API Gateway | GraphQL (Apollo Server) as Backend-for-Frontend (BFF) | Aggregates blockchain data providers, risk engine, scam DB, and OSINT feeds behind one typed schema |
| Runtime | Node.js (TypeScript) microservices | Consistency with frontend language; strong ecosystem for blockchain SDKs |
| Report Generation Service | Headless Chromium (Puppeteer) for HTML→PDF, or a dedicated PDF templating service | Produces pixel-accurate, branded PDF/HTML exports with embedded chart snapshots |
| Real-Time Layer | WebSockets / Server-Sent Events for live alerts | Powers the Alerts/OSINT live-update requirement |
| Search | Elasticsearch / OpenSearch | Powers Scam Intelligence Database full-text and fuzzy search (wallet, domain, handle) |
| Caching | Redis | Caches expensive graph-traversal and risk-scoring results |
| Auth | OAuth2 / OIDC via SSO/SAML provider (Okta, Azure AD, or equivalent); JWT session tokens | — |

### 6.3 Data & Blockchain Integration

- Multi-chain data providers (e.g., node RPC endpoints + indexing services) for Bitcoin, Ethereum, and EVM-compatible chains (BNB Chain, Polygon) at minimum for MVP; additional chains added per roadmap.
- Bridge/DEX metadata provider integration for cross-chain trace reconstruction.
- Risk-scoring engine consumed as an internal API (0–100 score + factor breakdown); model itself is out of scope for this PRD.
- Scam Intelligence Database as an internally maintained, searchable data store, augmented by external threat-intel feed ingestion (OSINT).

### 6.4 Infrastructure & DevOps

| Concern | Approach |
|---|---|
| Hosting | Containerized services (Docker) orchestrated on Kubernetes; frontend deployed via a global CDN/edge network (e.g., Vercel/Cloudflare) for static/SSR assets |
| CI/CD | GitHub Actions (or equivalent): lint → type-check → unit tests → build → E2E → accessibility scan → staged deploy |
| Environments | Local → Dev → Staging → Production, with feature-flagged progressive rollout |
| Observability | Structured logging, distributed tracing (OpenTelemetry), error tracking (Sentry), Web Vitals + custom RUM dashboards |
| Infrastructure as Code | Terraform for cloud resources |
| Secrets Management | Vault or cloud-native secrets manager; no secrets/API keys in frontend bundle |

---

## 7. Information Architecture & Sitemap

| Route | Module | Core Features Covered |
|---|---|---|
| `/dashboard` | Dashboard (Home) | Alerts summary, recent cases, quick search |
| `/wallet/[address]` | Wallet Investigation | Wallet scan, risk score, balances/transactions, tags, counterparties, approvals, NFT/DeFi |
| `/risk-screening` | Risk Scoring | Batch address screening, watchlist monitoring |
| `/graph/[caseId]` | Graph Explorer | Interactive fund-flow graph, clustering, entity detection |
| `/tx/[hash]` | Transaction Analyzer | Decoded function calls, linked addresses |
| `/cross-chain` | Cross-Chain Tracer | Bridge/DEX flow reconstruction, Sankey visualization |
| `/contract/[address]` | Smart Contract Lab | Bytecode/ABI viewer, ownership, risk tags |
| `/wallet/[address]/approvals` | Token Approvals | Allowance listing, unsafe-approval flags, revoke action |
| `/nft/[collectionOrWallet]` | NFT Investigation | Holdings, sales history, wash-trade detection |
| `/scam-db` | Scam Intelligence | Search known scams by wallet/domain/handle |
| `/alerts` | OSINT & Alerts | Aggregated threat intel, alert subscriptions |
| `/reports` | Report Builder | Drag-and-drop report assembly, PDF/HTML export |
| `/admin` | Settings/Admin | User management, API keys, data sources, theme |

---

## 8. Functional Requirements by Module

### 8.1 Wallet Investigation
- **WI-1**: User can input a wallet address to retrieve balance, transaction history, and risk score.
- **WI-2**: Overview tab displays balance, asset breakdown, risk score widget, and tag badges.
- **WI-3**: Counterparties tab lists directly connected wallets/entities with labels and roles.
- **WI-4**: Transfers tab shows sortable, filterable transaction table with detail panel.
- **WI-5**: Approvals tab lists token allowances, flags unlimited approvals, exposes revoke action.
- **WI-6**: NFT/DeFi tab lists NFT holdings and DeFi positions, flagging wash trading.

### 8.2 Risk Scoring
- **RS-1**: Computes 0–100 wallet risk score from illicit tags, mixer exposure, and sanctions matches.
- **RS-2**: UI displays score with contributing factors breakdown.
- **RS-3**: Supports batch screening of multiple addresses returning sortable table.
- **RS-4**: Saved watchlists with configurable score-threshold alerts.

### 8.3 Graph Explorer
- **GE-1**: Interactive force-directed fund-flow graph with node/edge styling by entity type and risk.
- **GE-2**: Zoom, pan, node expansion (1-hop drill-down), and detail sidebar on selection.
- **GE-3**: Sidebar filters for amount threshold, date range, asset type, and hiding low-value nodes.
- **GE-4**: Pin notes to nodes/edges and save annotated graph views for reports.
- **GE-5**: High performance subgraphs (1,000+ nodes).

### 8.4 Cross-Chain Tracer
- **CC-1**: Trace fund movement across bridges and DEX swaps.
- **CC-2**: Render as Sankey / multi-chain timeline diagram.
- **CC-3**: Highlight hops through known mixers or exchanges.

### 8.5 Smart Contract Lab
- **SC-1**: View contract metadata: verified source link, creation date, proxy/upgradeability status.
- **SC-2**: Code viewer highlighting transfer/mint/admin function categories and risk patterns.
- **SC-3**: Aggregate usage stats and exploit/scam associations.

### 8.6 Token Approvals
- **TA-1**: List token/spender pairs with allowance amounts.
- **TA-2**: Flag unlimited approvals and malicious spenders.

### 8.7 NFT / DeFi Investigation
- **NF-1**: Grid view of NFT holdings with collection filtering.
- **NF-2**: Portfolio value tracking over time.
- **NF-3**: Wash trading detection.

### 8.8 Scam Intelligence Database
- **SD-1**: Full-text and fuzzy search by wallet address, domain, or social handle.
- **SD-2**: Detail view with severity, reported date, and evidence links.

### 8.9 OSINT & Alerts
- **OA-1**: Correlate external threat intelligence with on-chain entities.
- **OA-2**: Configurable alert subscriptions (email/push/webhook).
- **OA-3**: Alert status tracking and investigation drill-through.

### 8.10 Report Builder
- **RB-1**: Add snapshot to report from any graph, table, or chart.
- **RB-2**: Drag-and-drop section reordering.
- **RB-3**: One-click branded PDF/HTML export with auto alt-text.
- **RB-4**: Full audit logging with content hash for court chain-of-custody.

---

## 9. Non-Functional Requirements
- **Performance**: FCP ≤ 1.5s, TTI ≤ 2.5s, Graph render ≤ 3s (1k nodes), API lookup ≤ 800ms.
- **Reliability**: 99.9% uptime with graceful degradation.
- **Accessibility**: WCAG 2.1 AA compliant across all views.
- **Security**: HTTPS, OAuth2/OIDC SSO, strict RBAC, client-side derivation only for seed phrases, audited logging.

---

## 10. Delivery Roadmap
- **MVP**: Dashboard, Wallet Overview, Graph Explorer (core), Risk Score display, Transaction Table.
- **v1**: Live API integration via BFF/GraphQL, Counterparties, Cross-Chain Tracer, PDF exports, Audit logging.
- **v2**: Smart Contract Lab, Token Approvals, NFT/DeFi wash trade detection, OSINT/Alerts, Dark/Light modes.
