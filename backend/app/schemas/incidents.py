from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class IncidentCreate(BaseModel):
    title: str = Field(..., example="Database connection timeout on production API")
    description: str = Field(..., example="Production payment API returning 502 Bad Gateway error since 10:32 AM.")
    service: str = Field(..., example="Payment API")
    environment: str = Field(default="Production", example="Production")
    source: str = Field(default="Web Portal", example="Web Portal")
    reporter_email: Optional[str] = Field(default="user@company.com")

class IncidentEvidenceSchema(BaseModel):
    id: int
    source_type: str
    source_reference: str
    content: str
    relevance_score: float

    class Config:
        from_attributes = True

class AIAnalysisSchema(BaseModel):
    summary: Optional[str]
    classification: Optional[str]
    impact: Optional[str]
    urgency: Optional[str]
    root_cause: Optional[str]
    confidence: float
    recommendation: Optional[str]

    class Config:
        from_attributes = True

class RemediationActionSchema(BaseModel):
    id: int
    action_name: str
    action_description: Optional[str]
    risk_level: str
    approval_status: str
    execution_status: str
    execution_output: Optional[str]
    executed_at: Optional[datetime]

    class Config:
        from_attributes = True

class IncidentDetailResponse(BaseModel):
    id: str
    title: str
    description: str
    category: Optional[str]
    severity: Optional[str]
    priority: Optional[str]
    status: str
    source: str
    service: str
    environment: str
    assigned_team: Optional[str]
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    
    ai_analysis: Optional[AIAnalysisSchema] = None
    evidences: List[IncidentEvidenceSchema] = []
    remediations: List[RemediationActionSchema] = []

    class Config:
        from_attributes = True

class IncidentListResponse(BaseModel):
    incidents: List[IncidentDetailResponse]
    total: int
