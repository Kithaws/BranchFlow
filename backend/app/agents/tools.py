import time
import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import Volunteer, Event, Task, Document, AgentExecutionLog

def get_active_volunteers(db: Session, org_id: Optional[int] = 1) -> List[Dict[str, Any]]:
    """
    Retrieves all volunteers with their current workload, rating, and skills.
    """
    query = db.query(Volunteer)
    if org_id:
        query = query.filter(Volunteer.org_id == org_id)
    volunteers = query.all()
    
    return [
        {
            "id": v.id,
            "name": v.name,
            "email": v.email,
            "department": v.department,
            "year": v.year,
            "skills": v.skills or [],
            "availability_status": v.availability_status,
            "max_tasks": v.max_tasks,
            "current_task_count": v.current_task_count,
            "rating": v.rating,
            "is_overloaded": v.current_task_count >= v.max_tasks,
            "capacity_remaining": max(0, v.max_tasks - v.current_task_count)
        }
        for v in volunteers
    ]

def score_volunteer_for_task(volunteer: Dict[str, Any], required_skills: List[str], priority: str) -> float:
    """
    Calculates fitness score between volunteer profile and task requirements.
    Considers skill intersection, workload penalty, and volunteer rating.
    """
    if volunteer["availability_status"] != "available":
        return 0.0
    if volunteer["is_overloaded"]:
        return 0.1 # Heavily penalized if at capacity
    
    vol_skills_lower = [s.lower() for s in volunteer["skills"]]
    req_skills_lower = [s.lower() for s in required_skills]
    
    # Calculate skill match ratio
    matches = sum(1 for req in req_skills_lower if any(req in v or v in req for v in vol_skills_lower))
    skill_score = (matches / max(1, len(req_skills_lower))) * 60.0
    
    # Workload score (higher remaining capacity = higher score)
    capacity_ratio = volunteer["capacity_remaining"] / max(1, volunteer["max_tasks"])
    workload_score = capacity_ratio * 25.0
    
    # Rating score (4.0 to 5.0 scaled to 15 points)
    rating_score = (volunteer["rating"] / 5.0) * 15.0
    
    total = round(skill_score + workload_score + rating_score, 1)
    return min(100.0, total)

def recommend_volunteers_for_tasks(volunteers: List[Dict[str, Any]], tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Heuristically matches best-fit volunteers to a batch of tasks while guarding against overload.
    """
    # Track simulated capacity during recommendation
    temp_capacities = {v["id"]: v["capacity_remaining"] for v in volunteers}
    recommendations = []
    
    for task in tasks:
        req_skills = task.get("required_skills", [])
        category = task.get("category", "")
        if not req_skills:
            req_skills = [category]
            
        ranked = []
        for v in volunteers:
            # Score
            score = score_volunteer_for_task(v, req_skills, task.get("priority", "Medium"))
            # Apply temporary allocation penalty
            if temp_capacities.get(v["id"], 0) <= 0:
                score *= 0.2
            ranked.append((score, v))
            
        ranked.sort(key=lambda x: x[0], reverse=True)
        
        best_candidate = ranked[0][1] if ranked else None
        best_score = ranked[0][0] if ranked else 0.0
        
        # If best candidate has remaining capacity, allocate virtually
        if best_candidate and temp_capacities.get(best_candidate["id"], 0) > 0:
            temp_capacities[best_candidate["id"]] -= 1
            allocated_id = best_candidate["id"]
            allocated_name = best_candidate["name"]
            status_note = f"Recommended (Score: {best_score}%) based on skills {req_skills}"
        else:
            allocated_id = best_candidate["id"] if best_candidate else None
            allocated_name = best_candidate["name"] if best_candidate else "Unassigned"
            status_note = "High capacity load warning: consider recruiting additional volunteer."

        recommendations.append({
            "task_title": task.get("title", ""),
            "category": category,
            "priority": task.get("priority", "Medium"),
            "estimated_hours": task.get("estimated_hours", 2.0),
            "required_skills": req_skills,
            "recommended_volunteer_id": allocated_id,
            "recommended_volunteer_name": allocated_name,
            "match_score": best_score,
            "notes": status_note
        })
        
    return recommendations

def record_agent_log(
    db: Session,
    event_id: Optional[int],
    agent_name: str,
    action_name: str,
    input_data: Dict[str, Any],
    output_data: Dict[str, Any],
    status: str = "success",
    execution_time_ms: int = 0
) -> AgentExecutionLog:
    """
    Persists an execution audit log for an agent step into SQLite.
    """
    log = AgentExecutionLog(
        event_id=event_id,
        agent_name=agent_name,
        action_name=action_name,
        input_data=input_data,
        output_data=output_data,
        status=status,
        execution_time_ms=execution_time_ms,
        created_at=datetime.datetime.utcnow()
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

