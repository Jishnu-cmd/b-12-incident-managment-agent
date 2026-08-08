# AI-Powered Incident Management Agent

> **Institution:** Vasireddy Venkatadri Institute of Technology (VVIT)  
> **Department:** Computer Science & Engineering (Artificial Intelligence & Machine Learning)  
> **Batch ID:** CSM-C12  
> **Project Guide:** Mrs. V. Asha Jyothi  
> **Repository:** [b-12-incident-managment-agent](https://github.com/Jishnu-cmd/b-12-incident-managment-agent)

---

## 📌 Executive Summary

The **AI-Powered Incident Management Agent** is an autonomous IT incident response and auto-healing platform. Conventional incident management relies on manual triage, fragmented log analysis, and slow human escalation. This platform automates the complete lifecycle:

1. **Ingestion & AI Triage**: Automatically parses incoming incidents, predicts category, assesses impact, and calculates priority (`P1`–`P4`).
2. **Multi-Evidence Diagnosis**: Integrates log patterns, Prometheus metrics, and CMDB dependency graphs.
3. **RAG SOP Retrieval**: Dense 128-dimensional vector similarity engine over Standard Operating Procedures and historical cases.
4. **Root Cause Analysis (RCA)**: Correlates evidence and assigns an explicit confidence percentage (*e.g., 92%*).
5. **Model Context Protocol (MCP) Sandbox**: Executes safe remediation scripts (*restart service, clear cache, scale container, verify health*) with role-based safety checks.
6. **Continuous Learning Loop**: Automatically promotes verified incident resolutions into the vector store as new knowledge documents.

---

## 📐 System Architecture

```text
                    AI INCIDENT MANAGEMENT SYSTEM
                              │
                              ▼
                    ┌──────────────────┐
                    │ Incident Portal  │
                    └────────┬─────────┘
                             │ "API returning 500 error"
                             ▼
                    ┌──────────────────┐
                    │ Multi-Agent AI   │
                    └────────┬─────────┘
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Log Agent    │    │ Monitor Agent │    │  CMDB Agent   │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   RCA Engine     │ (92% Confidence)
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ MCP Sandbox Fix  │ (Auto-Heal Execution)
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Knowledge Feedback│ (RAG Vector Store Update)
                    └──────────────────┘
```

---

## 📁 Repository Structure

```text
major/
├── backend/                  # FastAPI Python 3.11 Backend
│   ├── app/
│   │   ├── agents/           # Multi-Agent Engine (Triage, RCA, Log, Monitoring, CMDB, Learning)
│   │   ├── api/              # REST Endpoints (Incidents, Knowledge, Copilot, Evaluation, Tools)
│   │   ├── core/             # Configuration & Database Connection
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── rag/              # Local 128-dim Vector Store Engine
│   │   └── schemas/          # Pydantic Schemas
│   ├── seed_data.py          # Database Populator Script
│   └── requirements.txt      # Python Dependencies
├── frontend/                 # Vite + React + TypeScript + Tailwind CSS UI
│   ├── src/
│   │   ├── components/       # Header, Sidebar, RightSidebar, GlobeGraphic, Heatmap, Modals
│   │   ├── pages/            # Dashboard, IncidentDetail, ToolSandbox, CopilotChat, KnowledgeBase, Evaluation
│   │   ├── services/         # Axios API Client
│   │   └── types/            # TypeScript Interfaces
│   ├── package.json
│   └── vite.config.ts
├── mcp-server/               # Model Context Protocol Tool Server
│   ├── server.py
│   └── tools.py
├── remediation/              # Execution Sandbox & Policy Matrix
│   ├── policies/             # Safety Matrix Rules
│   └── scripts/              # Sandbox Executor Script
└── README.md
```

---

## ⚡ Quick Start & Execution

### 1. Backend Setup (FastAPI & SQLite)

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python seed_data.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8008
```

### 2. Frontend Setup (Vite + React)

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open your browser at [http://127.0.0.1:5174](http://127.0.0.1:5174) to access the Command Center UI.

---

## 📊 Key Features

- **Command Center Dashboard**: Real-time MTTR graphs, Priority Snapshot cards (`P1`–`P4`), Category & Outcome charts, Heatmap.
- **Interactive Tool Sandbox**: Live execution of MCP tools (`restart_service`, `clear_cache`, `scale_container`, `verify_health`).
- **AI Copilot**: Context-aware chat assistant for incident resolution.
- **RAG Knowledge Base**: Vector search over SOPs and past incidents.
- **Academic Evaluation Suite**: Performance benchmarks (*MTTR, Precision, Recall, Auto-Heal Rate*).
