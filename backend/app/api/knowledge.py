import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.database import KnowledgeDocument
from app.rag.vector_store import vector_store

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])

class KnowledgeCreate(BaseModel):
    title: str
    content: str
    document_type: str = "SOP" # SOP, Troubleshooting Guide, Architecture, Resolution Record
    source: Optional[str] = "Manual Upload"

class KnowledgeSearchRequest(BaseModel):
    query: str
    top_k: int = 3

@router.get("")
def list_knowledge_documents(db: Session = Depends(get_db)):
    docs = db.query(KnowledgeDocument).order_by(KnowledgeDocument.created_at.desc()).all()
    return [{
        "id": d.id,
        "title": d.title,
        "content": d.content,
        "document_type": d.document_type,
        "source": d.source,
        "version": d.version,
        "created_at": d.created_at
    } for d in docs]

@router.post("")
def add_knowledge_document(payload: KnowledgeCreate, db: Session = Depends(get_db)):
    embedding = vector_store.generate_embedding(payload.content)
    doc = KnowledgeDocument(
        title=payload.title,
        content=payload.content,
        document_type=payload.document_type,
        source=payload.source,
        embedding_json=json.dumps(embedding),
        version="1.0"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {"status": "success", "id": doc.id, "title": doc.title}

@router.post("/search")
def search_knowledge(payload: KnowledgeSearchRequest, db: Session = Depends(get_db)):
    docs = db.query(KnowledgeDocument).all()
    doc_dicts = [{
        "id": d.id,
        "title": d.title,
        "content": d.content,
        "document_type": d.document_type,
        "source": d.source,
        "embedding_json": d.embedding_json
    } for d in docs]

    matches = vector_store.search_similar_documents(payload.query, doc_dicts, top_k=payload.top_k)
    return [{
        "id": doc["id"],
        "title": doc["title"],
        "content": doc["content"],
        "document_type": doc["document_type"],
        "source": doc["source"],
        "relevance_score": score
    } for doc, score in matches]
