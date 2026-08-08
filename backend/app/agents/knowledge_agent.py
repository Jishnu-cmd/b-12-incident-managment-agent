from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.database import KnowledgeDocument, Incident
from app.rag.vector_store import vector_store

class KnowledgeAgent:
    """
    Knowledge Agent:
    Retrieves relevant SOPs, troubleshooting guides, and similar past resolved incidents using RAG vector similarity.
    """
    
    def search_knowledge_base(self, db: Session, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        docs = db.query(KnowledgeDocument).all()
        doc_dicts = [
            {
                "id": d.id,
                "title": d.title,
                "content": d.content,
                "document_type": d.document_type,
                "source": d.source,
                "embedding_json": d.embedding_json
            } for d in docs
        ]
        
        matches = vector_store.search_similar_documents(query, doc_dicts, top_k=top_k)
        
        results = []
        for doc, score in matches:
            results.append({
                "id": doc["id"],
                "title": doc["title"],
                "content": doc["content"],
                "document_type": doc["document_type"],
                "source": doc["source"],
                "relevance_score": score
            })
        return results

    def search_historical_incidents(self, db: Session, query: str, current_incident_id: str, top_k: int = 2) -> List[Dict[str, Any]]:
        incidents = db.query(Incident).filter(Incident.status == "RESOLVED", Incident.id != current_incident_id).all()
        inc_dicts = []
        for inc in incidents:
            rca_text = inc.ai_analysis.root_cause if inc.ai_analysis else ""
            rec_text = inc.ai_analysis.recommendation if inc.ai_analysis else ""
            content = f"Title: {inc.title}\nDescription: {inc.description}\nCategory: {inc.category}\nRoot Cause: {rca_text}\nResolution: {rec_text}"
            inc_dicts.append({
                "id": inc.id,
                "title": inc.title,
                "content": content,
                "service": inc.service,
                "status": inc.status
            })
        
        matches = vector_store.search_similar_documents(query, inc_dicts, top_k=top_k)
        results = []
        for inc, score in matches:
            results.append({
                "incident_id": inc["id"],
                "title": inc["title"],
                "content": inc["content"],
                "relevance_score": score
            })
        return results

knowledge_agent = KnowledgeAgent()
