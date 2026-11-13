from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AgentExecutionLog
from app.schemas import (
    NaturalLanguageEventRequest, PlanGenerationResponse,
    PlanApprovalRequest, AgentLogResponse, VolunteerRecommendRequest
)
from app.agents.graph_orchestrator import run_agentic_workflow, commit_approved_plan
from app.agents.volunteer_agent import recommend_volunteers_for_event_tasks
from app.agents.progress_agent import audit_event_progress
from app.services.n8n_service import dispatch_n8n_webhook

router = APIRouter(prefix="/api/agents", tags=["Agentic AI"])

@router.post("/plan-event")
def plan_event(payload: NaturalLanguageEventRequest, db: Session = Depends(get_db)):
    """
    Executes the LangGraph multi-agent workflow:
    1. Event Planning Agent: extracts requirements & generates plan
    2. Volunteer Management Agent: scores & proposes volunteer allocations
    3. Documentation Agent: drafts initial proposal & permission letters
    4. LangGraph Orchestrator: stops at Human Approval Checkpoint
    """
    if not payload.prompt or len(payload.prompt.strip()) < 5:
        raise HTTPException(status_code=400, detail="Prompt must be at least 5 characters long.")
        
    try:
        state = run_agentic_workflow(prompt=payload.prompt, db=db, org_id=payload.org_id or 1)
        
        # If user specified auto_approve, commit immediately
        if payload.auto_approve:
            res = commit_approved_plan(
                db=db,
                event_data={**state["plan"], "raw_prompt": payload.prompt},
                tasks_data=state.get("tasks", []),
                volunteer_assignments=state.get("volunteer_recommendations", []),
                docs_data=state.get("documents", []),
                org_id=payload.org_id or 1
            )
            return {
                "success": True,
                "event_id": res["event_id"],
                "requires_approval": False,
                "plan": state["plan"],
                "tasks": state.get("tasks", []),
                "volunteer_recommendations": state.get("volunteer_recommendations", []),
                "documents": state.get("documents", []),
                "agent_traces": state.get("agent_traces", [])
            }
            
        return {
            "success": True,
            "requires_approval": True,
            "approval_token": state.get("approval_token"),
            "plan": state.get("plan", {}),
            "tasks": state.get("tasks", []),
            "volunteer_recommendations": state.get("volunteer_recommendations", []),
            "documents": state.get("documents", []),
            "agent_traces": state.get("agent_traces", [])
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Agent workflow error: {str(e)}")

@router.post("/approve-plan")
async def approve_plan(payload: PlanApprovalRequest, db: Session = Depends(get_db)):
    """
    Human-in-the-Loop Approval:
    Commits the organizer-approved event, tasks, and volunteer allocations to the database.
    """
    if not payload.approved:
        return {"success": False, "message": "Plan rejected by organizer."}
        
    result = commit_approved_plan(
        db=db,
        event_data=payload.event_data,
        tasks_data=payload.tasks_data,
        volunteer_assignments=payload.volunteer_assignments,
        docs_data=payload.event_data.get("documents", []),
        org_id=1
    )
    
    # Optional n8n webhook notification
    await dispatch_n8n_webhook("event.created_via_agent", {
        "event_id": result["event_id"],
        "title": payload.event_data.get("title"),
        "tasks_count": len(payload.tasks_data)
    })
    
    return result

@router.post("/recommend-volunteers")
def recommend_volunteers_endpoint(payload: VolunteerRecommendRequest, db: Session = Depends(get_db)):
    """
    Runs the Volunteer Management Agent to recommend assignments for unassigned tasks.
    """
    if not payload.event_id:
        raise HTTPException(status_code=400, detail="event_id is required")
        
    recs = recommend_volunteers_for_event_tasks(db=db, event_id=payload.event_id)
    return {"event_id": payload.event_id, "recommendations": recs}

@router.get("/progress-audit")
def progress_audit_endpoint(event_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Runs the AI Progress Monitoring Agent over real database task metrics.
    """
    return audit_event_progress(db=db, event_id=event_id)

@router.get("/logs", response_model=List[AgentLogResponse])
def get_agent_logs(limit: int = 20, event_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Fetches the audit trail of agent executions and tool calls.
    """
    query = db.query(AgentExecutionLog)
    if event_id:
        query = query.filter(AgentExecutionLog.event_id == event_id)
    return query.order_by(AgentExecutionLog.created_at.desc()).limit(limit).all()
