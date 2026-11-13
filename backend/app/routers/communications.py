from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Communication, Event
from app.schemas import CommunicationCreate, CommunicationResponse, CommGenRequest
from app.agents.communication import generate_communication_copy
from app.agents.tools import record_agent_log

router = APIRouter(prefix="/api/communications", tags=["Communications"])

@router.get("", response_model=List[CommunicationResponse])
def list_communications(event_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Communication)
    if event_id:
        query = query.filter(Communication.event_id == event_id)
    return query.order_by(Communication.created_at.desc()).all()

@router.post("", response_model=CommunicationResponse)
def create_communication(payload: CommunicationCreate, db: Session = Depends(get_db)):
    comm = Communication(**payload.model_dump())
    db.add(comm)
    db.commit()
    db.refresh(comm)
    return comm

@router.delete("/{comm_id}")
def delete_communication(comm_id: int, db: Session = Depends(get_db)):
    comm = db.query(Communication).filter(Communication.id == comm_id).first()
    if not comm:
        raise HTTPException(status_code=404, detail="Communication not found")
    db.delete(comm)
    db.commit()
    return {"success": True, "message": "Communication deleted"}

@router.post("/generate", response_model=CommunicationResponse)
def generate_communication_ai(payload: CommGenRequest, db: Session = Depends(get_db)):
    event_details = {}
    event_title = "College Event"
    
    if payload.event_id:
        event = db.query(Event).filter(Event.id == payload.event_id).first()
        if event:
            event_title = event.title
            event_details = {
                "title": event.title,
                "start_date": event.start_date,
                "venue": event.venue
            }
            
    content = generate_communication_copy(
        topic=payload.topic or "Event Announcement",
        channel=payload.channel,
        tone=payload.tone,
        recipient_group=payload.recipient_group,
        event_details=event_details,
        additional_notes=payload.additional_notes
    )
    
    comm = Communication(
        event_id=payload.event_id,
        title=f"[{payload.channel}] {payload.topic or 'Announcement'} - {event_title}",
        channel=payload.channel,
        tone=payload.tone,
        recipient_group=payload.recipient_group,
        content=content,
        status="ready"
    )
    db.add(comm)
    db.commit()
    db.refresh(comm)
    
    # Audit log
    record_agent_log(
        db=db,
        event_id=payload.event_id,
        agent_name="Communication Agent",
        action_name=f"generate_{payload.channel.lower()}_copy",
        input_data=payload.model_dump(),
        output_data={"communication_id": comm.id, "char_count": len(content)},
        status="success"
    )
    
    return comm

