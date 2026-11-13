import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Event, Task, Volunteer

def audit_event_progress(db: Session, event_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Real-time database audit of tasks, milestones, overdue alerts, and bottlenecks.
    """
    query = db.query(Task)
    if event_id:
        query = query.filter(Task.event_id == event_id)
        
    tasks = query.all()
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    
    total_tasks = len(tasks)
    completed_tasks = 0
    pending_tasks = 0
    in_progress_tasks = 0
    overdue_tasks = []
    urgent_pending = []
    
    # Track task dates per volunteer to detect scheduling clashes
    volunteer_dates = {}
    schedule_conflicts = []
    
    for t in tasks:
        if t.status == "completed":
            completed_tasks += 1
        elif t.status == "in_progress":
            in_progress_tasks += 1
        else:
            pending_tasks += 1
            
        # Check overdue condition
        if t.status != "completed" and t.due_date and t.due_date < today_str:
            overdue_tasks.append({
                "id": t.id,
                "title": t.title,
                "due_date": t.due_date,
                "priority": t.priority,
                "category": t.category,
                "assigned_to": t.assigned_volunteer.name if t.assigned_volunteer else "Unassigned"
            })
            
        if t.status != "completed" and t.priority in ["Urgent", "High"]:
            urgent_pending.append({
                "id": t.id,
                "title": t.title,
                "priority": t.priority,
                "category": t.category
            })
            
        # Conflict detection
        if t.assigned_volunteer_id and t.due_date and t.status != "completed":
            v_key = (t.assigned_volunteer_id, t.due_date)
            if v_key in volunteer_dates:
                first_task = volunteer_dates[v_key]
                schedule_conflicts.append(
                    f"Conflict Alert: {t.assigned_volunteer.name if t.assigned_volunteer else 'Volunteer'} is assigned multiple simultaneous tasks due on {t.due_date} ('{first_task}' and '{t.title}')."
                )
            else:
                volunteer_dates[v_key] = t.title
                
    completion_rate = round((completed_tasks / max(1, total_tasks)) * 100, 1)
    
    # Audit volunteer burnout risk
    burnout_risks = []
    volunteers = db.query(Volunteer).all()
    for v in volunteers:
        active_count = db.query(Task).filter(
            Task.assigned_volunteer_id == v.id,
            Task.status.in_(["pending", "in_progress"])
        ).count()
        if active_count >= v.max_tasks:
            burnout_risks.append(f"{v.name} (At capacity: {active_count}/{v.max_tasks} active tasks)")
            
    insights = []
    recommended_actions = []
    
    if overdue_tasks:
        insights.append(f"⚠️ {len(overdue_tasks)} task(s) are overdue past their deadline.")
        recommended_actions.append(f"Prioritize resolution for overdue task: '{overdue_tasks[0]['title']}'. Reassign if volunteer is blocked.")
        
    if schedule_conflicts:
        insights.append(f"⚠️ {len(schedule_conflicts)} volunteer scheduling clash(es) detected.")
        recommended_actions.append("Adjust due dates or reassign conflicting task responsibilities.")
        
    if burnout_risks:
        insights.append(f"⚠️ Burnout risk: {len(burnout_risks)} volunteer(s) are carrying maximum task loads.")
        recommended_actions.append("Redistribute high-priority items to available 1st/2nd year volunteers.")
        
    if completion_rate >= 80.0:
        insights.append("🎉 Outstanding progress! Over 80% of organizing milestones are completed.")
        recommended_actions.append("Draft final post-event summary document and send speaker appreciation notes.")
    elif completion_rate < 40.0 and total_tasks > 3:
        insights.append("Notice: Event milestone velocity is below 40%. Requires organizer push.")
        recommended_actions.append("Host an all-hands 15-minute standup with team leads.")
        
    if not recommended_actions:
        recommended_actions.append("Continue tracking active milestones on the Kanban board.")
        recommended_actions.append("Publish next social media countdown announcement.")

    return {
        "event_id": event_id,
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "in_progress_tasks": in_progress_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks_count": len(overdue_tasks),
        "overdue_tasks": overdue_tasks,
        "completion_rate": completion_rate,
        "workload_imbalance_detected": len(burnout_risks) > 0,
        "burnout_risk_volunteers": burnout_risks,
        "conflicts_detected": schedule_conflicts,
        "insights": insights,
        "recommended_actions": recommended_actions
    }

