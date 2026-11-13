from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Event, Task, Volunteer, Document
from app.schemas import EventCreate, EventUpdate, EventResponse

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.get("", response_model=List[EventResponse])
def list_events(
    status: Optional[str] = None,
    org_id: int = 1,
    db: Session = Depends(get_db)
):
    query = db.query(Event).filter(Event.org_id == org_id)
    if status:
        query = query.filter(Event.status == status)
    events = query.order_by(Event.created_at.desc()).all()
    
    # Calculate tasks count & volunteer count
    res = []
    for e in events:
        resp = EventResponse.model_validate(e)
        resp.tasks_count = len(e.tasks)
        vol_ids = {t.assigned_volunteer_id for t in e.tasks if t.assigned_volunteer_id}
        resp.volunteers_count = len(vol_ids)
        res.append(resp)
    return res

@router.get("/{event_id}")
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    tasks = db.query(Task).filter(Task.event_id == event_id).all()
    tasks_data = []
    for t in tasks:
        tasks_data.append({
            "id": t.id,
            "title": t.title,
            "description": t.description,
            "category": t.category,
            "priority": t.priority,
            "status": t.status,
            "due_date": t.due_date,
            "estimated_hours": t.estimated_hours,
            "assigned_volunteer": {
                "id": t.assigned_volunteer.id,
                "name": t.assigned_volunteer.name,
                "email": t.assigned_volunteer.email,
                "department": t.assigned_volunteer.department
            } if t.assigned_volunteer else None
        })
        
    docs = db.query(Document).filter(Document.event_id == event_id).all()
    
    return {
        "event": EventResponse.model_validate(event),
        "tasks": tasks_data,
        "documents": [
            {
                "id": d.id,
                "title": d.title,
                "doc_type": d.doc_type,
                "status": d.status,
                "version": d.version,
                "created_at": d.created_at
            }
            for d in docs
        ],
        "teams": event.teams or [],
        "schedule": event.schedule or [],
        "checklist": event.checklist or []
    }

@router.post("", response_model=EventResponse)
def create_event(payload: EventCreate, db: Session = Depends(get_db)):
    event = Event(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: int, payload: EventUpdate, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
        
    db.commit()
    db.refresh(event)
    return event

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    db.delete(event)
    db.commit()
    return {"success": True, "message": "Event deleted successfully"}

