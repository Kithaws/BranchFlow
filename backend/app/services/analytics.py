import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models import Event, Volunteer, Task, Document, AgentExecutionLog

def get_dashboard_summary(db: Session, org_id: int = 1) -> Dict[str, Any]:
    """
    Computes real-time statistics, metrics, and chart series for the Executive Dashboard.
    """
    # 1. Events metrics
    events = db.query(Event).filter(Event.org_id == org_id).all()
    total_events = len(events)
    active_events = sum(1 for e in events if e.status == "active")
    planning_events = sum(1 for e in events if e.status == "planning")
    completed_events = sum(1 for e in events if e.status == "completed")
    
    # 2. Volunteers metrics
    volunteers = db.query(Volunteer).filter(Volunteer.org_id == org_id).all()
    total_volunteers = len(volunteers)
    available_volunteers = sum(1 for v in volunteers if v.availability_status == "available")
    
    # Department breakdown
    dept_counts = {}
    for v in volunteers:
        dept = v.department or "Other"
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
    volunteer_dept_chart = [{"department": k, "count": v} for k, v in dept_counts.items()]

    # 3. Tasks metrics
    tasks = db.query(Task).all()
    total_tasks = len(tasks)
    completed_tasks = sum(1 for t in tasks if t.status == "completed")
    in_progress_tasks = sum(1 for t in tasks if t.status == "in_progress")
    pending_tasks = sum(1 for t in tasks if t.status == "pending")
    
    today_str = datetime.date.today().strftime("%Y-%m-%d")
    overdue_tasks = sum(1 for t in tasks if t.status != "completed" and t.due_date and t.due_date < today_str)
    
    task_completion_pct = round((completed_tasks / max(1, total_tasks)) * 100, 1)

    # Priority distribution chart
    priority_counts = {"Urgent": 0, "High": 0, "Medium": 0, "Low": 0}
    category_counts = {}
    for t in tasks:
        p = t.priority or "Medium"
        priority_counts[p] = priority_counts.get(p, 0) + 1
        cat = t.category or "General"
        category_counts[cat] = category_counts.get(cat, 0) + 1
        
    tasks_by_priority_chart = [{"priority": k, "count": v} for k, v in priority_counts.items()]
    tasks_by_category_chart = [{"category": k, "count": v} for k, v in category_counts.items()]

    # 4. Upcoming events (ordered by start_date)
    upcoming = (
        db.query(Event)
        .filter(Event.org_id == org_id, Event.status.in_(["planning", "active"]))
        .order_by(Event.start_date.asc())
        .limit(5)
        .all()
    )
    upcoming_events_data = [
        {
            "id": e.id,
            "title": e.title,
            "event_type": e.event_type,
            "status": e.status,
            "start_date": e.start_date,
            "expected_participants": e.expected_participants,
            "venue": e.venue,
            "tasks_count": len(e.tasks)
        }
        for e in upcoming
    ]

    # 5. Recent activities / agent audit logs
    recent_logs = (
        db.query(AgentExecutionLog)
        .order_by(AgentExecutionLog.created_at.desc())
        .limit(6)
        .all()
    )
    recent_activities = [
        {
            "id": l.id,
            "agent_name": l.agent_name,
            "action_name": l.action_name,
            "status": l.status,
            "execution_time_ms": l.execution_time_ms,
            "timestamp": l.created_at.strftime("%b %d, %H:%M")
        }
        for l in recent_logs
    ]

    return {
        "metrics": {
            "total_events": total_events,
            "active_events": active_events,
            "planning_events": planning_events,
            "completed_events": completed_events,
            "total_volunteers": total_volunteers,
            "available_volunteers": available_volunteers,
            "total_tasks": total_tasks,
            "pending_tasks": pending_tasks,
            "in_progress_tasks": in_progress_tasks,
            "completed_tasks": completed_tasks,
            "overdue_tasks": overdue_tasks,
            "task_completion_percentage": task_completion_pct
        },
        "charts": {
            "events_status": [
                {"name": "Active", "value": active_events, "color": "#10b981"},
                {"name": "Planning", "value": planning_events, "color": "#8b5cf6"},
                {"name": "Completed", "value": completed_events, "color": "#64748b"}
            ],
            "task_progress": [
                {"name": "Completed", "value": completed_tasks, "color": "#10b981"},
                {"name": "In Progress", "value": in_progress_tasks, "color": "#3b82f6"},
                {"name": "Pending", "value": pending_tasks, "color": "#f59e0b"}
            ],
            "tasks_by_priority": tasks_by_priority_chart,
            "tasks_by_category": tasks_by_category_chart,
            "volunteers_by_department": volunteer_dept_chart
        },
        "upcoming_events": upcoming_events_data,
        "recent_activities": recent_activities
    }

