import time
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Volunteer, Task, Event
from app.agents.tools import get_active_volunteers, recommend_volunteers_for_tasks

def analyze_volunteer_workload(db: Session, org_id: Optional[int] = 1) -> Dict[str, Any]:
    """
    Audits volunteer pool, checks capacity limits, and detects workload imbalance.
    """
    volunteers = db.query(Volunteer).filter(Volunteer.org_id == org_id).all()
    if not volunteers:
        return {
            "total_volunteers": 0,
            "available_volunteers": 0,
            "overloaded_count": 0,
            "workload_imbalance_detected": False,
            "volunteers": [],
            "insights": ["No volunteers registered yet. Add volunteers to start organizing."]
        }
        
    total = len(volunteers)
    overloaded = []
    underutilized = []
    available = []
    
    total_assigned_tasks = 0
    total_capacity = 0
    
    vol_stats = []
    for v in volunteers:
        # Count actual pending/in_progress tasks in DB
        active_tasks = db.query(Task).filter(
            Task.assigned_volunteer_id == v.id,
            Task.status.in_(["pending", "in_progress"])
        ).count()
        
        # Sync with model if changed
        if v.current_task_count != active_tasks:
            v.current_task_count = active_tasks
            db.commit()
            
        utilization_rate = round((active_tasks / max(1, v.max_tasks)) * 100, 1)
        total_assigned_tasks += active_tasks
        total_capacity += v.max_tasks
        
        is_overloaded = active_tasks >= v.max_tasks
        is_underutilized = active_tasks == 0 and v.availability_status == "available"
        
        if is_overloaded:
            overloaded.append(f"{v.name} ({active_tasks}/{v.max_tasks} tasks - {utilization_rate}%)")
        if is_underutilized:
            underutilized.append(v.name)
        if v.availability_status == "available" and not is_overloaded:
            available.append(v.name)
            
        vol_stats.append({
            "id": v.id,
            "name": v.name,
            "email": v.email,
            "department": v.department,
            "year": v.year,
            "skills": v.skills or [],
            "availability_status": v.availability_status,
            "current_tasks": active_tasks,
            "max_tasks": v.max_tasks,
            "utilization_rate": utilization_rate,
            "rating": v.rating,
            "is_overloaded": is_overloaded
        })
        
    overall_utilization = round((total_assigned_tasks / max(1, total_capacity)) * 100, 1)
    imbalance_detected = len(overloaded) > 0 and len(available) > 0
    
    insights = []
    if imbalance_detected:
        insights.append(
            f"Workload Imbalance Alert: {len(overloaded)} volunteer(s) are at or above maximum capacity, "
            f"while {len(underutilized)} volunteer(s) have 0 assigned tasks."
        )
    if overloaded:
        insights.append(f"Burnout risk flagged for: {', '.join(overloaded)}.")
    if underutilized:
        insights.append(f"Available capacity in: {', '.join(underutilized[:3])}.")
    if not insights:
        insights.append("Volunteer workload is evenly balanced across the branch.")

    return {
        "total_volunteers": total,
        "available_count": len(available),
        "overloaded_count": len(overloaded),
        "overall_utilization_percent": overall_utilization,
        "workload_imbalance_detected": imbalance_detected,
        "burnout_risk_volunteers": overloaded,
        "underutilized_volunteers": underutilized,
        "insights": insights,
        "volunteers": vol_stats
    }

def recommend_volunteers_for_event_tasks(db: Session, event_id: int) -> List[Dict[str, Any]]:
    """
    Analyzes unassigned tasks for an event and recommends optimal volunteers without auto-assigning.
    Organizers retain full human-in-the-loop control to approve or modify.
    """
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return []
        
    unassigned_tasks = db.query(Task).filter(
        Task.event_id == event_id,
        Task.assigned_volunteer_id == None
    ).all()
    
    if not unassigned_tasks:
        return []
        
    volunteers = get_active_volunteers(db, org_id=event.org_id)
    
    task_dicts = [
        {
            "id": t.id,
            "title": t.title,
            "category": t.category,
            "priority": t.priority,
            "estimated_hours": t.estimated_hours,
            "required_skills": [t.category]
        }
        for t in unassigned_tasks
    ]
    
    recommendations = recommend_volunteers_for_tasks(volunteers, task_dicts)
    
    # Attach task IDs
    for idx, rec in enumerate(recommendations):
        rec["task_id"] = task_dicts[idx]["id"]
        
    return recommendations

