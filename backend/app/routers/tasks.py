from typing import List, Optional
import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Task, Volunteer, Event
from app.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("", response_model=List[TaskResponse])
def list_tasks(
    event_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Task)
    if event_id:
        query = query.filter(Task.event_id == event_id)
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
        
    return query.order_by(Task.created_at.desc()).all()

@router.post("", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    # Verify event exists
    event = db.query(Event).filter(Event.id == payload.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    task = Task(**payload.model_dump())
    db.add(task)
    
    if payload.assigned_volunteer_id:
        vol = db.query(Volunteer).filter(Volunteer.id == payload.assigned_volunteer_id).first()
        if vol:
            vol.current_task_count += 1
            
    db.commit()
    db.refresh(task)
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    old_vol_id = task.assigned_volunteer_id
    update_data = payload.model_dump(exclude_unset=True)
    
    for k, v in update_data.items():
        setattr(task, k, v)
        
    if "status" in update_data and update_data["status"] == "completed":
        task.completed_at = datetime.datetime.utcnow()
        
    # Rebalance volunteer counts if assignment changed
    if "assigned_volunteer_id" in update_data:
        new_vol_id = update_data["assigned_volunteer_id"]
        if old_vol_id != new_vol_id:
            if old_vol_id:
                old_v = db.query(Volunteer).filter(Volunteer.id == old_vol_id).first()
                if old_v and old_v.current_task_count > 0:
                    old_v.current_task_count -= 1
            if new_vol_id:
                new_v = db.query(Volunteer).filter(Volunteer.id == new_vol_id).first()
                if new_v:
                    new_v.current_task_count += 1
                    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task.assigned_volunteer_id:
        v = db.query(Volunteer).filter(Volunteer.id == task.assigned_volunteer_id).first()
        if v and v.current_task_count > 0:
            v.current_task_count -= 1
            
    db.delete(task)
    db.commit()
    return {"success": True, "message": "Task deleted"}

