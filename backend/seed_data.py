import os
import sys
import json

# Ensure backend root is in sys.path
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

root_dir = os.path.abspath(os.path.join(backend_dir, ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.core.database import SessionLocal, engine, Base
from app.models.database import User, Incident, AIAnalysis, IncidentEvidence, RemediationAction, KnowledgeDocument
from app.rag.vector_store import vector_store

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Fake Company Users: AetherPay Global Inc.
        u_admin = db.query(User).filter(User.email == "admin@aetherpay.com").first()
        if not u_admin:
            u_admin = User(name="Alex Mercer", email="admin@aetherpay.com", role="Incident Manager", department="Platform Ops")
            db.add(u_admin)

        u_engineer = db.query(User).filter(User.email == "sre@aetherpay.com").first()
        if not u_engineer:
            u_engineer = User(name="Elena Rostova", email="sre@aetherpay.com", role="Lead SRE", department="Site Reliability")
            db.add(u_engineer)

        db.commit()

        # 2. Knowledge Documents & SOPs for AetherPay Global Inc.
        sop_docs = [
            {
                "title": "AetherPay SOP: Payment Gateway HTTP 500 Connection Exhaustion",
                "content": "SOP-PAY-500: High connection pool utilization on payment-api postgresql cluster causes HTTP 500 internal server errors. Symptom: HTTP 500 spikes, DB connections > 90%, latency > 1500ms. Action: Execute clear_cache to flush idle connection handles and scale container pool. Verification: Check /healthz ping returns 200 OK.",
                "type": "SOP",
                "source": "AetherPay Confluence"
            },
            {
                "title": "AetherPay SOP: User Auth Service Memory Leak & OOM Killer Spike",
                "content": "SOP-AUTH-401: Memory leakage in JWT token verification threadpool causes container OOM kills and auth latency spikes. Action: Execute scale_container to expand replica count to 5 pods and restart service daemon. Verification: Verify SLA latency < 45ms.",
                "type": "SOP",
                "source": "AetherPay Confluence"
            },
            {
                "title": "AetherPay SOP: Redis Cache Cluster Hit-Ratio Degradation",
                "content": "SOP-CACHE-301: Redis cluster cache evictions lead to database read overload on user profile service. Action: Execute clear_cache tool to purge stale memory keys and scale Redis replica memory.",
                "type": "SOP",
                "source": "AetherPay Runbook"
            }
        ]

        for s in sop_docs:
            existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == s["title"]).first()
            if not existing:
                emb = vector_store.generate_embedding(s["content"])
                doc = KnowledgeDocument(
                    title=s["title"], 
                    content=s["content"], 
                    document_type=s["type"], 
                    source=s["source"],
                    embedding_json=json.dumps(emb)
                )
                db.add(doc)
                db.commit()

        # 3. Seed AetherPay Production Incidents
        inc_data = [
            {
                "id": "INC-1024",
                "title": "AetherPay Production API Failure — HTTP 500 Spikes",
                "description": "Payment Gateway API is failing for checkout transactions in production. Error log: 'sqlalchemy.exc.TimeoutError: QueuePool limit of size 20 overflow 10 reached'. Latency spiked to 2.4s, 500 error rate at 28%.",
                "service": "Payment Gateway API",
                "environment": "Production (US-East-1)",
                "source": "Datadog Alert",
                "priority": "P1",
                "severity": "CRITICAL",
                "category": "Database",
                "status": "REMEDIATION_RECOMMENDED",
                "assigned_team": "Payments Platform Team",
                "rca": "Database connection pool exhaustion on PostgreSQL primary node (db-payment-prod-01) due to unclosed transaction handles during peak checkout burst.",
                "confidence": 92.0,
                "action_name": "Clear Idle DB Connections & Expand Pool",
                "tool_name": "clear_cache"
            },
            {
                "id": "INC-1023",
                "title": "User Database Cluster High Memory Contention",
                "description": "PostgreSQL User Cluster buffer pool memory usage hit 94%. Slow query logs show long-running SELECT queries on user_accounts table.",
                "service": "User DB Cluster",
                "environment": "Production",
                "source": "Prometheus Alertmanager",
                "priority": "P2",
                "severity": "HIGH",
                "category": "Database",
                "status": "INVESTIGATING",
                "assigned_team": "Data Infrastructure",
                "rca": "Buffer pool cache churn caused by unindexed batch query executed by reporting worker.",
                "confidence": 87.0,
                "action_name": "Flush Buffer Cache & Scale Replicas",
                "tool_name": "clear_cache"
            },
            {
                "id": "INC-1022",
                "title": "AetherPay Auth Service Latency Degraded",
                "description": "OAuth token verification endpoint /v1/auth/verify taking > 850ms per request. Customer login failure rate at 4.2%.",
                "service": "Auth Token Authority",
                "environment": "Production",
                "source": "NewRelic Monitor",
                "priority": "P3",
                "severity": "MEDIUM",
                "category": "Application",
                "status": "NEW",
                "assigned_team": "Identity & Security",
                "rca": "Cryptographic token verification thread pool saturation under high concurrent login traffic.",
                "confidence": 78.0,
                "action_name": "Scale Container Replicas",
                "tool_name": "scale_container"
            },
            {
                "id": "INC-1021",
                "title": "Redis Session Cache Hit Ratio Dropped below 65%",
                "description": "Session lookup cache misses causing fallback reads to primary user database.",
                "service": "Redis Cluster",
                "environment": "Production",
                "source": "Grafana Sentinel",
                "priority": "P4",
                "severity": "LOW",
                "category": "Infrastructure",
                "status": "NEW",
                "assigned_team": "Platform SRE",
                "rca": "Memory key eviction triggered by unexpired transient session objects.",
                "confidence": 64.0,
                "action_name": "Flush Stale Session Keys",
                "tool_name": "clear_cache"
            },
            {
                "id": "INC-1020",
                "title": "Notification Worker Queue Backup",
                "description": "SMS and Email notification dispatch latency increased to 12 minutes.",
                "service": "Notification Worker",
                "environment": "Production",
                "source": "AWS CloudWatch",
                "priority": "P2",
                "severity": "HIGH",
                "category": "Application",
                "status": "RESOLVED",
                "assigned_team": "Messaging Services",
                "rca": "Third-party SMS gateway throttling rate limit exceeded.",
                "confidence": 93.0,
                "action_name": "Restart Worker Service Daemon",
                "tool_name": "restart_service"
            }
        ]

        for item in inc_data:
            existing = db.query(Incident).filter(Incident.id == item["id"]).first()
            if not existing:
                inc = Incident(
                    id=item["id"],
                    title=item["title"],
                    description=item["description"],
                    service=item["service"],
                    environment=item["environment"],
                    source=item["source"],
                    priority=item["priority"],
                    severity=item["severity"],
                    category=item["category"],
                    status=item["status"],
                    assigned_team=item["assigned_team"],
                    reporter_id=u_engineer.id
                )
                db.add(inc)
                db.commit()
                db.refresh(inc)

                # AI Analysis
                ana = AIAnalysis(
                    incident_id=inc.id,
                    summary=f"AI Agent triage analysis for {inc.title}",
                    classification=item["category"],
                    impact=item["severity"],
                    urgency=item["severity"],
                    root_cause=item["rca"],
                    confidence=item["confidence"],
                    recommendation=item["action_name"]
                )
                db.add(ana)

                # Evidence
                ev1 = IncidentEvidence(
                    incident_id=inc.id, 
                    source_type="LOG", 
                    source_reference="payment-api-app.log",
                    content=f"ERROR 2026-08-14 11:45:00 [{item['service']}] PoolTimeout: Connection pool exhausted (size=20, overflow=10)"
                )
                ev2 = IncidentEvidence(
                    incident_id=inc.id, 
                    source_type="METRIC", 
                    source_reference="prometheus_query_db_pool",
                    content="Prometheus Sample: CPU=88%, Memory=92%, DB_Connections=98/100, Latency=2450ms, HTTP_500_Rate=28.4%"
                )
                ev3 = IncidentEvidence(
                    incident_id=inc.id, 
                    source_type="CMDB", 
                    source_reference="cmdb_topology_graph",
                    content=f"Topology Graph: {item['service']} -> db-payment-prod-01 -> Redis Cluster -> AWS Ingress Gateway"
                )
                db.add_all([ev1, ev2, ev3])

                # Remediation Action
                rem = RemediationAction(
                    incident_id=inc.id,
                    action_name=item["action_name"],
                    action_description=f"Automated execution script for {item['tool_name']} on {item['service']}",
                    risk_level="Low" if item["confidence"] >= 90 else "Medium",
                    approval_status="APPROVED" if item["status"] in ["REMEDIATION_RECOMMENDED", "RESOLVED"] else "PENDING",
                    execution_status="SUCCESS" if item["status"] == "RESOLVED" else "NOT_STARTED"
                )
                db.add(rem)
                db.commit()

        print("[AetherPay Seed] Database populated with AetherPay Global Inc. microservices, SOPs, and incidents!")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
