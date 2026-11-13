from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Volunteer, Task
from app.schemas import VolunteerCreate, VolunteerUpdate, VolunteerResponse
from app.agents.volunteer_agent import analyze_volunteer_workload

router = APIRouter(prefix="/api/volunteers", tags=["Volunteers"])

@router.get("", response_model=List[VolunteerResponse])
def list_volunteers(org_id: int = 1, db: Session = Depends(get_db)):
    volunteers = db.query(Volunteer).filter(Volunteer.org_id == org_id).all()
    # Ensure current_task_count is accurate
    for v in volunteers:
        count = db.query(Task).filter(
            Task.assigned_volunteer_id == v.id,
            Task.status.in_(["pending", "in_progress"])
        ).count()
        v.current_task_count = count
    return volunteers

@router.get("/workload-analysis")
def get_workload_analysis(org_id: int = 1, db: Session = Depends(get_db)):
    return analyze_volunteer_workload(db=db, org_id=org_id)

@router.post("", response_model=VolunteerResponse)
def create_volunteer(payload: VolunteerCreate, db: Session = Depends(get_db)):
    vol = Volunteer(**payload.model_dump())
    db.add(vol)
    db.commit()
    db.refresh(vol)
    return vol

@router.put("/{volunteer_id}", response_model=VolunteerResponse)
def update_volunteer(volunteer_id: int, payload: VolunteerUpdate, db: Session = Depends(get_db)):
    vol = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
        
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(vol, k, v)
        
    db.commit()
    db.refresh(vol)
    return vol

@router.delete("/{volunteer_id}")
def delete_volunteer(volunteer_id: int, db: Session = Depends(get_db)):
    vol = db.query(Volunteer).filter(Volunteer.id == volunteer_id).first()
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found")
        
    # Unassign volunteer tasks
    db.query(Task).filter(Task.assigned_volunteer_id == volunteer_id).update({"assigned_volunteer_id": None})
    db.delete(vol)
    db.commit()
    return {"success": True, "message": "Volunteer deleted successfully"}

