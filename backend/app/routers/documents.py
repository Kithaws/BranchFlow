from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, Event
from app.schemas import DocumentCreate, DocumentUpdate, DocumentResponse, DocGenRequest
from app.agents.documentation import generate_document_content, generate_doc_heuristic
from app.agents.tools import record_agent_log

router = APIRouter(prefix="/api/documents", tags=["Documents"])

@router.get("", response_model=List[DocumentResponse])
def list_documents(event_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if event_id:
        query = query.filter(Document.event_id == event_id)
    return query.order_by(Document.created_at.desc()).all()

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.post("", response_model=DocumentResponse)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    doc = Document(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.put("/{doc_id}", response_model=DocumentResponse)
def update_document(doc_id: int, payload: DocumentUpdate, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(doc, k, v)
        
    doc.version += 1
    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    db.delete(doc)
    db.commit()
    return {"success": True, "message": "Document deleted"}

@router.post("/generate", response_model=DocumentResponse)
def generate_document_ai(payload: DocGenRequest, db: Session = Depends(get_db)):
    event_details = {}
    event_title = "College Student Event"
    
    if payload.event_id:
        event = db.query(Event).filter(Event.id == payload.event_id).first()
        if event:
            event_title = event.title
            event_details = {
                "title": event.title,
                "event_type": event.event_type,
                "budget": event.budget,
                "expected_participants": event.expected_participants,
                "venue": event.venue,
                "duration_days": event.duration_days
            }
            
    content = generate_document_content(
        doc_type=payload.doc_type,
        event_details=event_details,
        additional_notes=payload.additional_notes,
        target_audience=payload.target_audience
    )
    
    # Save to database
    doc = Document(
        event_id=payload.event_id,
        title=f"{payload.doc_type} - {event_title}",
        doc_type=payload.doc_type,
        content=content,
        status="draft",
        version=1,
        metadata_info={"generated_by_agent": True, "target_audience": payload.target_audience}
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Audit log
    record_agent_log(
        db=db,
        event_id=payload.event_id,
        agent_name="Documentation Agent",
        action_name=f"generate_{payload.doc_type.lower().replace(' ', '_')}",
        input_data=payload.model_dump(),
        output_data={"document_id": doc.id, "char_count": len(content)},
        status="success"
    )
    
    return doc

