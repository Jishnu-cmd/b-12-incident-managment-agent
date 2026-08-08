import json
from sqlalchemy.orm import Session
from app.models.database import Incident, KnowledgeDocument, AuditLog
from app.rag.vector_store import vector_store

class LearningAgent:
    """
    Learning Agent (Knowledge Feedback Loop):
    Promotes verified resolved incidents into new trusted Knowledge Base documents with pre-computed embeddings.
    """

    def promote_incident_to_knowledge(self, db: Session, incident: Incident, user_id: int = None) -> KnowledgeDocument:
        rca_text = incident.ai_analysis.root_cause if incident.ai_analysis else "N/A"
        recommendation_text = incident.ai_analysis.recommendation if incident.ai_analysis else "N/A"

        doc_title = f"Resolved Incident Case Study: {incident.title} [{incident.id}]"
        doc_content = (
            f"Incident ID: {incident.id}\n"
            f"Title: {incident.title}\n"
            f"Category: {incident.category}\n"
            f"Service: {incident.service}\n"
            f"Symptoms: {incident.description}\n"
            f"Root Cause: {rca_text}\n"
            f"Verified Resolution: {recommendation_text}\n"
            f"Severity: {incident.severity} | Priority: {incident.priority}\n"
        )

        embedding = vector_store.generate_embedding(doc_content)

        kb_doc = KnowledgeDocument(
            title=doc_title,
            content=doc_content,
            document_type="Resolution Record",
            source=f"Historical Incident Feedback ({incident.id})",
            embedding_json=json.dumps(embedding),
            version="1.0"
        )
        db.add(kb_doc)

        audit = AuditLog(
            user_id=user_id,
            incident_id=incident.id,
            action="KNOWLEDGE_BASE_LEARNING_UPDATE",
            details=f"Incident {incident.id} resolution promoted to RAG Knowledge Base."
        )
        db.add(audit)
        db.commit()
        db.refresh(kb_doc)

        return kb_doc

learning_agent = LearningAgent()
