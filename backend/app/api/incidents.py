import sys
import os
import datetime

# Ensure project root is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from app.core.database import get_db
from app.models.database import Incident, User, RemediationAction, AuditLog
from app.schemas.incidents import IncidentCreate, IncidentDetailResponse, IncidentListResponse
from app.agents.orchestrator import orchestrator
from app.agents.learning_agent import learning_agent
from remediation.scripts.executor import remediation_executor

router = APIRouter(prefix="/incidents", tags=["Incidents"])

class IncidentUpdatePayload(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    severity: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    assigned_team: Optional[str] = None

@router.post("", response_model=IncidentDetailResponse)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    """CREATE: Ingest new incident and trigger AI Agent identification & triage pipeline."""
    reporter = db.query(User).filter(User.email == payload.reporter_email).first()
    if not reporter:
        reporter = User(name="Operations Engineer", email=payload.reporter_email, role="Engineer")
        db.add(reporter)
        db.commit()
        db.refresh(reporter)

    count = db.query(Incident).count()
    inc_id = f"INC-{1001 + count}"

    incident = Incident(
        id=inc_id,
        title=payload.title,
        description=payload.description,
        service=payload.service,
        environment=payload.environment,
        source=payload.source,
        reporter_id=reporter.id,
        status="NEW"
    )
    db.add(incident)
    db.commit()

    # Automatically identify symptoms & perform AI triage
    updated_incident = orchestrator.analyze_and_triage_incident(db, inc_id)
    return updated_incident

@router.get("", response_model=IncidentListResponse)
def list_incidents(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """READ: Retrieve and filter incidents queue."""
    query = db.query(Incident)
    if status:
        query = query.filter(Incident.status == status)
    if priority:
        query = query.filter(Incident.priority == priority)
    if category:
        query = query.filter(Incident.category == category)
    if search:
        query = query.filter(
            (Incident.title.contains(search)) |
            (Incident.description.contains(search)) |
            (Incident.id.contains(search))
        )
    
    incidents = query.order_by(Incident.created_at.desc()).all()
    return {"incidents": incidents, "total": len(incidents)}

@router.get("/{id}", response_model=IncidentDetailResponse)
def get_incident(id: str, db: Session = Depends(get_db)):
    """READ: Fetch complete incident detail including AI Analysis, Evidence, and Remediation."""
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.put("/{id}", response_model=IncidentDetailResponse)
def update_incident(id: str, payload: IncidentUpdatePayload, db: Session = Depends(get_db)):
    """UPDATE: Update incident properties (title, priority, status, assigned team)."""
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if payload.title is not None:
        incident.title = payload.title
    if payload.description is not None:
        incident.description = payload.description
    if payload.priority is not None:
        incident.priority = payload.priority
    if payload.severity is not None:
        incident.severity = payload.severity
    if payload.category is not None:
        incident.category = payload.category
    if payload.status is not None:
        incident.status = payload.status
        if payload.status == "RESOLVED" and not incident.resolved_at:
            incident.resolved_at = datetime.datetime.utcnow()
            learning_agent.promote_incident_to_knowledge(db, incident)
    if payload.assigned_team is not None:
        incident.assigned_team = payload.assigned_team

    incident.updated_at = datetime.datetime.utcnow()

    db.add(AuditLog(
        incident_id=id,
        action="INCIDENT_UPDATED",
        details=f"Incident {id} fields updated manually."
    ))
    db.commit()
    db.refresh(incident)
    return incident

@router.delete("/{id}")
def delete_incident(id: str, db: Session = Depends(get_db)):
    """DELETE: Remove incident from system."""
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    db.delete(incident)
    db.add(AuditLog(
        incident_id=id,
        action="INCIDENT_DELETED",
        details=f"Incident {id} deleted from queue."
    ))
    db.commit()
    return {"status": "success", "message": f"Incident {id} deleted successfully", "deleted_id": id}

@router.post("/{id}/analyze", response_model=IncidentDetailResponse)
def reanalyze_incident(id: str, db: Session = Depends(get_db)):
    """SOLVE / IDENTIFY: Re-trigger AI Multi-Agent analysis pipeline."""
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return orchestrator.analyze_and_triage_incident(db, id)

@router.post("/{id}/remediation/approve")
def approve_remediation(id: str, db: Session = Depends(get_db)):
    """SOLVE: Human-in-the-Loop approval for pending remediation action."""
    remediation = db.query(RemediationAction).filter(RemediationAction.incident_id == id).first()
    if not remediation:
        raise HTTPException(status_code=404, detail="No remediation action found for this incident")

    remediation.approval_status = "APPROVED"
    db.add(AuditLog(
        incident_id=id,
        action="HUMAN_APPROVAL_GRANTED",
        details=f"Remediation '{remediation.action_name}' approved by engineer."
    ))
    db.commit()
    return {"status": "success", "message": "Remediation approved successfully", "approval_status": "APPROVED"}

@router.post("/{id}/remediation/execute")
def execute_remediation(id: str, db: Session = Depends(get_db)):
    """SOLVE: Execute remediation action via Safety Execution Sandbox & mark resolved."""
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    remediation = db.query(RemediationAction).filter(RemediationAction.incident_id == id).first()
    if not remediation:
        raise HTTPException(status_code=404, detail="Remediation record not found")

    tool_name = "restart_service"
    if "Cache" in remediation.action_name or "Connection" in remediation.action_name:
        tool_name = "clear_cache"
    elif "Scale" in remediation.action_name or "Memory" in remediation.action_name:
        tool_name = "scale_container"

    exec_res = remediation_executor.execute_remediation(
        tool_name=tool_name,
        target_service=incident.service,
        user_role="Engineer",
        confidence=incident.ai_analysis.confidence if incident.ai_analysis else 85.0
    )

    remediation.execution_status = exec_res["execution_status"]
    remediation.execution_output = exec_res["output"]
    remediation.executed_at = datetime.datetime.utcnow()

    if exec_res["verified"]:
        incident.status = "RESOLVED"
        incident.resolved_at = datetime.datetime.utcnow()
        # Learning feedback loop
        learning_agent.promote_incident_to_knowledge(db, incident)

    db.add(AuditLog(
        incident_id=id,
        action="REMEDIATION_EXECUTED",
        details=f"Executed tool '{tool_name}'. Outcome: {exec_res['status']}."
    ))
    db.commit()
    db.refresh(incident)

    return {
        "status": exec_res["status"],
        "incident_status": incident.status,
        "output": exec_res["output"]
    }

@router.post("/{id}/resolve")
def resolve_incident(id: str, db: Session = Depends(get_db)):
    """SOLVE: Manually mark incident as resolved and update RAG feedback loop."""
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "RESOLVED"
    incident.resolved_at = datetime.datetime.utcnow()
    
    learning_agent.promote_incident_to_knowledge(db, incident)
    
    db.commit()
    return {"status": "success", "incident_id": id, "new_status": "RESOLVED"}
