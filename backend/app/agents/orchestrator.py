from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.database import Incident, AIAnalysis, IncidentEvidence, RemediationAction, AuditLog
from app.agents.triage_agent import triage_agent
from app.agents.knowledge_agent import knowledge_agent
from app.agents.log_agent import log_agent
from app.agents.monitoring_agent import monitoring_agent
from app.agents.cmdb_agent import cmdb_agent
from app.agents.rca_agent import rca_agent
from app.agents.resolution_agent import resolution_agent

class AgentOrchestrator:
    """
    Main Orchestrator Agent (Incident Manager):
    Directs workflow execution across Triage, Knowledge, Logs, Metrics, CMDB, RCA, and Resolution sub-agents.
    """

    def analyze_and_triage_incident(self, db: Session, incident_id: str) -> Incident:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if not incident:
            raise ValueError(f"Incident {incident_id} not found")

        # 1. Triage Agent Phase
        triage_res = triage_agent.process(
            title=incident.title,
            description=incident.description,
            service=incident.service,
            environment=incident.environment
        )
        
        incident.category = triage_res["category"]
        incident.severity = triage_res["impact"]
        incident.priority = triage_res["priority"]
        incident.assigned_team = triage_res["assigned_team"]
        incident.status = "INVESTIGATING"

        # Clear any prior evidence to avoid duplicates
        db.query(IncidentEvidence).filter(IncidentEvidence.incident_id == incident_id).delete()

        # 2. Knowledge Retrieval Agent Phase (RAG SOPs + Historical Incidents)
        query = f"{incident.title} {incident.description} {incident.category}"
        rag_docs = knowledge_agent.search_knowledge_base(db, query, top_k=2)
        hist_incidents = knowledge_agent.search_historical_incidents(db, query, incident_id, top_k=2)

        for doc in rag_docs:
            evidence = IncidentEvidence(
                incident_id=incident_id,
                source_type="RAG_DOCUMENT",
                source_reference=f"KB-{doc['id']} ({doc['title']})",
                content=doc['content'][:300] + "...",
                relevance_score=doc['relevance_score']
            )
            db.add(evidence)

        for h in hist_incidents:
            evidence = IncidentEvidence(
                incident_id=incident_id,
                source_type="HISTORICAL_INCIDENT",
                source_reference=f"Incident #{h['incident_id']} ({h['title']})",
                content=h['content'][:300] + "...",
                relevance_score=h['relevance_score']
            )
            db.add(evidence)

        # 3. Log Agent Phase
        logs = log_agent.fetch_logs_for_incident(incident.service, incident.category, incident.title)
        log_content_summary = "\n".join([f"[{l['level']}] {l['message']}" for l in logs])
        db.add(IncidentEvidence(
            incident_id=incident_id,
            source_type="LOG",
            source_reference=f"Log Collector ({incident.service})",
            content=log_content_summary,
            relevance_score=0.92
        ))

        # 4. Monitoring Agent Phase
        metrics = monitoring_agent.fetch_metrics_for_service(incident.service, incident.category)
        metrics_summary = f"CPU: {metrics['cpu_utilization_pct']}% | Mem: {metrics['memory_utilization_pct']}% | Error Rate: {metrics['error_rate_pct']}% | Latency p99: {metrics['latency_p99_ms']}ms"
        db.add(IncidentEvidence(
            incident_id=incident_id,
            source_type="METRIC",
            source_reference="Prometheus Monitoring Agent",
            content=metrics_summary,
            relevance_score=0.88
        ))

        # 5. CMDB Topology Agent Phase
        topology = cmdb_agent.get_topology_for_service(incident.service)
        cmdb_summary = f"Topology: {topology['service']} (Tier: {topology['tier']}). Downstream Impact: {', '.join(topology['downstream_impact'])}"
        db.add(IncidentEvidence(
            incident_id=incident_id,
            source_type="CMDB",
            source_reference="CMDB Topology Engine",
            content=cmdb_summary,
            relevance_score=0.85
        ))

        # 6. RCA Agent Phase
        rca_res = rca_agent.analyze_root_cause(
            title=incident.title,
            description=incident.description,
            category=incident.category,
            rag_docs=rag_docs,
            historical_incidents=hist_incidents,
            logs=logs,
            metrics=metrics,
            topology=topology
        )

        # 7. Resolution Agent Phase
        res_plan = resolution_agent.generate_resolution(
            category=incident.category,
            root_cause=rca_res["root_cause"],
            confidence=rca_res["confidence"]
        )

        # Update or Create AI Analysis record
        ai_analysis = db.query(AIAnalysis).filter(AIAnalysis.incident_id == incident_id).first()
        if not ai_analysis:
            ai_analysis = AIAnalysis(incident_id=incident_id)
            db.add(ai_analysis)

        ai_analysis.summary = triage_res["summary"]
        ai_analysis.classification = incident.category
        ai_analysis.impact = triage_res["impact"]
        ai_analysis.urgency = triage_res["urgency"]
        ai_analysis.root_cause = rca_res["root_cause"]
        ai_analysis.confidence = rca_res["confidence"]
        ai_analysis.recommendation = res_plan["recommendation"]

        # Create Remediation Action Record
        db.query(RemediationAction).filter(RemediationAction.incident_id == incident_id).delete()
        remediation = RemediationAction(
            incident_id=incident_id,
            action_name=res_plan["action_name"],
            action_description=f"Tool: {res_plan['tool_name']} | Risk: {res_plan['risk_level']}",
            risk_level=res_plan["risk_level"],
            approval_status=res_plan["approval_status"],
            execution_status="NOT_STARTED"
        )
        db.add(remediation)

        incident.status = res_plan["workflow_state"]

        db.add(AuditLog(
            incident_id=incident_id,
            action="AI_AGENT_ANALYSIS_COMPLETED",
            details=f"Triage & RCA finished. Confidence: {rca_res['confidence']}%. State: {incident.status}."
        ))

        db.commit()
        db.refresh(incident)
        return incident

orchestrator = AgentOrchestrator()
