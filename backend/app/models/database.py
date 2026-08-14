import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, nullable=False, index=True)
    hashed_password = Column(String(200), nullable=True)
    role = Column(String(50), nullable=False, default="Engineer") # Admin, Incident Manager, Engineer, Lead SRE, Service Desk, Viewer
    department = Column(String(100), nullable=True, default="IT Operations")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(30), primary_key=True, index=True) # e.g. INC-1001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=True) # Application, Network, Database, Cloud, Security, Storage, Authentication, API, Infrastructure
    severity = Column(String(20), nullable=True) # Low, Medium, High, Critical
    priority = Column(String(10), nullable=True) # P1, P2, P3, P4
    status = Column(String(30), nullable=False, default="NEW") # NEW, TRIAGED, INVESTIGATING, DIAGNOSED, REMEDIATION_RECOMMENDED, AUTO_HEALING, ASSIGNED, VERIFYING, RESOLVED, CLOSED
    source = Column(String(50), nullable=False, default="Web Portal") # Web Portal, Email, API, Chat, Monitoring, Alert System
    service = Column(String(100), nullable=False)
    environment = Column(String(50), nullable=False, default="Production") # Production, Staging, Development
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_team = Column(String(100), nullable=True, default="Triage Queue")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    # Relationships
    ai_analysis = relationship("AIAnalysis", back_populates="incident", uselist=False, cascade="all, delete-orphan")
    evidences = relationship("IncidentEvidence", back_populates="incident", cascade="all, delete-orphan")
    remediations = relationship("RemediationAction", back_populates="incident", cascade="all, delete-orphan")

class AIAnalysis(Base):
    __tablename__ = "ai_analysis"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(30), ForeignKey("incidents.id"), nullable=False, unique=True)
    summary = Column(Text, nullable=True)
    classification = Column(String(50), nullable=True)
    impact = Column(String(20), nullable=True) # Low, Medium, High, Critical
    urgency = Column(String(20), nullable=True) # Low, Medium, High, Critical
    root_cause = Column(Text, nullable=True)
    confidence = Column(Float, nullable=False, default=0.0) # 0.0 to 100.0
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="ai_analysis")

class IncidentEvidence(Base):
    __tablename__ = "incident_evidence"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(30), ForeignKey("incidents.id"), nullable=False)
    source_type = Column(String(50), nullable=False) # LOG, METRIC, CMDB, RAG_DOCUMENT, HISTORICAL_INCIDENT
    source_reference = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    relevance_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    incident = relationship("Incident", back_populates="evidences")

class RemediationAction(Base):
    __tablename__ = "remediation_actions"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(30), ForeignKey("incidents.id"), nullable=False)
    action_name = Column(String(100), nullable=False)
    action_description = Column(Text, nullable=True)
    risk_level = Column(String(20), nullable=False, default="Low") # Low, Medium, High, Critical
    approval_status = Column(String(30), nullable=False, default="PENDING") # PENDING, AUTO_APPROVED, APPROVED, REJECTED, EXECUTED, VERIFIED
    execution_status = Column(String(30), nullable=False, default="NOT_STARTED") # NOT_STARTED, IN_PROGRESS, SUCCESS, FAILED
    execution_output = Column(Text, nullable=True)
    executed_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="remediations")

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    document_type = Column(String(50), nullable=False, default="SOP") # SOP, Troubleshooting Guide, Resolution Record, FAQ, Architecture
    source = Column(String(100), nullable=True)
    embedding_json = Column(Text, nullable=True) # Vector stored as JSON array string
    version = Column(String(20), default="1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    incident_id = Column(String(30), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
