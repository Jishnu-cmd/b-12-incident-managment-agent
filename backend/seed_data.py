import json
import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.database import User, Incident, AIAnalysis, IncidentEvidence, RemediationAction, KnowledgeDocument, AuditLog
from app.rag.vector_store import vector_store

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Re-seed if requested or ensure INC-1024 exists
    inc_1024 = db.query(Incident).filter(Incident.id == "INC-1024").first()
    if inc_1024:
        print("[Seed] INC-1024 already present.")
        db.close()
        return

    print("[Seed] Seeding database with PRD demonstration dataset including INC-1024...")

    # Find or create default users
    u1 = db.query(User).filter(User.email == "admin@vvit.ac.in").first()
    if not u1:
        u1 = User(name="Admin User", email="admin@vvit.ac.in", role="Admin", department="DevOps")
        u2 = User(name="Asha Jyothi (Guide)", email="ashajyothi@vvit.ac.in", role="Incident Manager", department="CSE - AIML")
        u3 = User(name="CSM-C12 Student", email="csmc12@vvit.ac.in", role="Engineer", department="IT Operations")
        db.add_all([u1, u2, u3])
        db.commit()

    # Seed SOP Documents
    sops = [
        {
            "title": "SOP-API-001: Troubleshooting Nginx 502 Bad Gateway and Gunicorn Worker Segfaults",
            "content": "Symptoms: Nginx reverse proxy returns 502 Bad Gateway while upstream Gunicorn process logs worker exit code 139 (SIGSEGV).\nResolution Steps:\n1. Check Gunicorn process status: systemctl status gunicorn.\n2. Flush transient memory allocation buffer.\n3. Execute graceful worker restart: systemctl reload gunicorn.\n4. Verify /healthz endpoint status code equals 200.",
            "document_type": "SOP",
            "source": "Infrastructure SOP Repository"
        },
        {
            "title": "SOP-DB-002: Resolving PostgreSQL Connection Pool Exhaustion",
            "content": "Symptoms: OperationalError FATAL: remaining connection slots reserved. QueuePool limit reached.\nResolution Steps:\n1. Flush unclosed idle client connections.\n2. Increase max_connections and max pool overflow limit in pool manager.\n3. Restart background worker application pods.\n4. Verify active connection count is below 80% threshold.",
            "document_type": "SOP",
            "source": "Database Operations Manual"
        }
    ]

    for sop in sops:
        existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == sop["title"]).first()
        if not existing:
            emb = vector_store.generate_embedding(sop["content"])
            doc = KnowledgeDocument(
                title=sop["title"],
                content=sop["content"],
                document_type=sop["document_type"],
                source=sop["source"],
                embedding_json=json.dumps(emb),
                version="1.0"
            )
            db.add(doc)

    db.commit()

    now = datetime.datetime.utcnow()

    # Create INC-1024 — Production API Failure
    inc_1024 = Incident(
        id="INC-1024",
        title="Production API Failure (HTTP 500 & Connection Timeouts)",
        description="Production API is returning HTTP 500 errors affecting ~60% of incoming checkout API requests starting at 10:42 AM. Database connections appear saturated.",
        category="Application",
        severity="High",
        priority="P1",
        status="REMEDIATION_RECOMMENDED",
        source="Alert System",
        service="Production API",
        environment="Production",
        assigned_team="Application Development Team",
        created_at=now - datetime.timedelta(minutes=10)
    )

    ai_1024 = AIAnalysis(
        incident_id="INC-1024",
        summary="Production API is experiencing HTTP 500 errors due to backend database pool exhaustion.",
        classification="Application",
        impact="High",
        urgency="High",
        root_cause="Database connection pool exhaustion due to unclosed application pool connections under high checkout traffic.",
        confidence=92.0,
        recommendation="Restart API service workers and refresh connection pool limits."
    )

    rem_1024 = RemediationAction(
        incident_id="INC-1024",
        action_name="Restart API Service & Refresh Connection Pool",
        action_description="Tool: restart_service | Risk: Medium | Confidence: 92%",
        risk_level="Medium",
        approval_status="AUTO_APPROVED",
        execution_status="NOT_STARTED"
    )

    db.add(inc_1024)
    db.add(ai_1024)
    db.add(rem_1024)

    # Evidences for INC-1024
    db.add_all([
        IncidentEvidence(
            incident_id="INC-1024",
            source_type="LOG",
            source_reference="Application Daemon Log (/var/log/api.log)",
            content="[ERROR] psycopg2.OperationalError: FATAL: remaining connection slots are reserved\n[ERROR] QueuePool limit of size 20 overflow 10 reached, connection timed out after 30.00s.",
            relevance_score=0.95
        ),
        IncidentEvidence(
            incident_id="INC-1024",
            source_type="METRIC",
            source_reference="Prometheus Monitoring Agent",
            content="DB Connections: 99/100 (99% capacity) | CPU: 91.5% | Memory: 89.0% | HTTP 5xx Rate: 35.0% | Latency p99: 4200ms",
            relevance_score=0.92
        ),
        IncidentEvidence(
            incident_id="INC-1024",
            source_type="CMDB",
            source_reference="CMDB Topology Engine",
            content="Dependency Path: Production API → App Server (Gunicorn) → PostgreSQL Primary DB Node (pg-db-01) → Redis Cache",
            relevance_score=0.88
        ),
        IncidentEvidence(
            incident_id="INC-1024",
            source_type="RAG_DOCUMENT",
            source_reference="SOP-DB-002 (Database Troubleshooting Guide)",
            content="Symptoms: QueuePool limit reached. Resolution: Flush unclosed idle client connections & restart application pods.",
            relevance_score=0.90
        ),
        IncidentEvidence(
            incident_id="INC-1024",
            source_type="HISTORICAL_INCIDENT",
            source_reference="Similar Incident #INC-982 (Resolved Past Case)",
            content="Previous Cause: DB pool saturation under checkout burst.\nResolution: Reset connection pool handlers & restarted Gunicorn service.",
            relevance_score=0.89
        )
    ])

    db.commit()
    print("[Seed] INC-1024 successfully seeded!")
    db.close()

if __name__ == "__main__":
    seed_database()
