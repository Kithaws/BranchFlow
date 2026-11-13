import time
import uuid
import datetime
from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from sqlalchemy.orm import Session

from app.agents.state import EventPlanningState
from app.agents.event_planner import plan_event_from_prompt
from app.agents.documentation import generate_doc_heuristic
from app.agents.tools import get_active_volunteers, recommend_volunteers_for_tasks, record_agent_log
from app.models import Event, Task, Document, Volunteer

# In-memory store for pending human approval plans
PENDING_APPROVALS: Dict[str, Dict[str, Any]] = {}

# Node 1: Extract Requirements & Generate Event Structure
def extract_and_plan_node(state: EventPlanningState) -> EventPlanningState:
    start_time = time.time()
    prompt = state.get("prompt", "")
    
    plan_data = plan_event_from_prompt(prompt)
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    traces = state.get("agent_traces", [])
    traces.append({
        "step": 1,
        "agent": "Event Planning Agent",
        "action": "extract_requirements_and_plan",
        "status": "completed",
        "summary": f"Identified '{plan_data.get('title')}' ({plan_data.get('duration_days')} days, {plan_data.get('expected_participants')} participants, ₹{plan_data.get('budget', 0):,.0f} budget)",
        "duration_ms": elapsed_ms,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
    
    return {
        **state,
        "extracted_requirements": {
            "title": plan_data.get("title"),
            "event_type": plan_data.get("event_type"),
            "budget": plan_data.get("budget"),
            "expected_participants": plan_data.get("expected_participants"),
            "duration_days": plan_data.get("duration_days"),
            "venue": plan_data.get("venue")
        },
        "plan": plan_data,
        "tasks": plan_data.get("tasks", []),
        "agent_traces": traces,
        "current_step": "plan_generated"
    }

# Node 2: Volunteer Recommendation & Workload Guard
def recommend_volunteers_node(state: EventPlanningState, db: Session) -> EventPlanningState:
    start_time = time.time()
    tasks = state.get("tasks", [])
    org_id = state.get("org_id", 1)
    
    volunteers = get_active_volunteers(db, org_id=org_id)
    recommendations = recommend_volunteers_for_tasks(volunteers, tasks)
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    traces = state.get("agent_traces", [])
    matched_count = sum(1 for r in recommendations if r.get("recommended_volunteer_id"))
    
    traces.append({
        "step": 2,
        "agent": "Volunteer Management Agent",
        "action": "recommend_skill_allocation",
        "status": "completed",
        "summary": f"Analyzed {len(volunteers)} volunteer profiles; recommended allocations for {matched_count}/{len(tasks)} tasks without auto-committing.",
        "duration_ms": elapsed_ms,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
    
    return {
        **state,
        "volunteer_recommendations": recommendations,
        "agent_traces": traces,
        "current_step": "volunteers_recommended"
    }

# Node 3: Documentation Drafting
def draft_documents_node(state: EventPlanningState) -> EventPlanningState:
    start_time = time.time()
    plan = state.get("plan", {})
    
    # Generate draft Proposal and Permission Letter
    proposal_text = generate_doc_heuristic("Proposal", plan, "Initial auto-generated draft")
    permission_text = generate_doc_heuristic("Permission Letter", plan, "Initial institutional request")
    
    docs = [
        {
            "title": f"Official Proposal - {plan.get('title')}",
            "doc_type": "Proposal",
            "content": proposal_text
        },
        {
            "title": f"Principal Permission Letter - {plan.get('title')}",
            "doc_type": "Permission Letter",
            "content": permission_text
        }
    ]
    
    elapsed_ms = int((time.time() - start_time) * 1000)
    traces = state.get("agent_traces", [])
    traces.append({
        "step": 3,
        "agent": "Documentation Agent",
        "action": "draft_preliminary_documents",
        "status": "completed",
        "summary": f"Drafted 2 official documents (Executive Proposal & Institutional Permission Letter).",
        "duration_ms": elapsed_ms,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
    
    return {
        **state,
        "documents": docs,
        "agent_traces": traces,
        "current_step": "documents_drafted"
    }

# Node 4: Human-in-the-Loop Gate
def human_approval_gate_node(state: EventPlanningState) -> EventPlanningState:
    token = str(uuid.uuid4())
    traces = state.get("agent_traces", [])
    traces.append({
        "step": 4,
        "agent": "LangGraph Orchestrator",
        "action": "human_approval_pause",
        "status": "waiting_approval",
        "summary": "Agent workflow halted at Human Approval checkpoint. Organizer review required before committing to database.",
        "duration_ms": 10,
        "timestamp": datetime.datetime.utcnow().isoformat()
    })
    
    approval_payload = {
        "token": token,
        "state": state,
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    PENDING_APPROVALS[token] = approval_payload
    
    return {
        **state,
        "requires_approval": True,
        "approval_token": token,
        "agent_traces": traces,
        "current_step": "waiting_human_approval"
    }

def build_event_graph(db: Session):
    """
    Constructs and compiles the LangGraph StateGraph.
    """
    workflow = StateGraph(EventPlanningState)
    
    # Define nodes with closures
    workflow.add_node("intake_and_extract", extract_and_plan_node)
    workflow.add_node("recommend_volunteers", lambda state: recommend_volunteers_node(state, db))
    workflow.add_node("draft_documents", draft_documents_node)
    workflow.add_node("approval_gate", human_approval_gate_node)
    
    # Define linear execution flow
    workflow.set_entry_point("intake_and_extract")
    workflow.add_edge("intake_and_extract", "recommend_volunteers")
    workflow.add_edge("recommend_volunteers", "draft_documents")
    workflow.add_edge("draft_documents", "approval_gate")
    workflow.add_edge("approval_gate", END)
    
    return workflow.compile()

def run_agentic_workflow(prompt: str, db: Session, org_id: int = 1) -> Dict[str, Any]:
    """
    Executes the LangGraph pipeline from natural language prompt up to the Human Approval checkpoint.
    """
    initial_state: EventPlanningState = {
        "prompt": prompt,
        "org_id": org_id,
        "agent_traces": [],
        "requires_approval": True,
        "approved": False
    }
    
    graph = build_event_graph(db)
    final_state = graph.invoke(initial_state)
    
    return final_state

def commit_approved_plan(
    db: Session,
    event_data: Dict[str, Any],
    tasks_data: List[Dict[str, Any]],
    volunteer_assignments: List[Dict[str, Any]],
    docs_data: Optional[List[Dict[str, Any]]] = None,
    org_id: int = 1
) -> Dict[str, Any]:
    """
    Human Organizer Approval commit function:
    Atomically saves the Event, creates the Tasks, assigns volunteers, and stores the initial Documents.
    """
    # 1. Create Event
    now = datetime.datetime.utcnow()
    duration = event_data.get("duration_days", 1)
    
    event = Event(
        org_id=org_id,
        title=event_data.get("title", "New Event"),
        description=event_data.get("description", ""),
        event_type=event_data.get("event_type", "Workshop"),
        status="planning",
        start_date=event_data.get("start_date") or (now + datetime.timedelta(days=14)).strftime("%Y-%m-%d"),
        end_date=event_data.get("end_date") or (now + datetime.timedelta(days=14 + duration)).strftime("%Y-%m-%d"),
        duration_days=duration,
        budget=float(event_data.get("budget", 0)),
        expected_participants=int(event_data.get("expected_participants", 50)),
        venue=event_data.get("venue", "Campus Venue"),
        schedule=event_data.get("schedule", []),
        teams=event_data.get("teams", []),
        checklist=event_data.get("checklist", []),
        raw_prompt=event_data.get("raw_prompt")
    )
    db.add(event)
    db.flush()
    
    # 2. Map volunteer assignments by task title or index
    assignment_map = {}
    for a in volunteer_assignments:
        task_key = a.get("task_title") or a.get("title")
        if task_key and a.get("volunteer_id"):
            assignment_map[task_key] = a["volunteer_id"]
            
    # 3. Create Tasks
    created_tasks = []
    for t_data in tasks_data:
        assigned_id = assignment_map.get(t_data.get("title")) or t_data.get("assigned_volunteer_id")
        
        task = Task(
            event_id=event.id,
            assigned_volunteer_id=assigned_id,
            title=t_data.get("title", "Untitled Task"),
            description=t_data.get("description", f"Category: {t_data.get('category', 'Logistics')}"),
            category=t_data.get("category", "Logistics"),
            priority=t_data.get("priority", "Medium"),
            status="pending",
            due_date=(now + datetime.timedelta(days=5)).strftime("%Y-%m-%d"),
            estimated_hours=float(t_data.get("estimated_hours", 2.0))
        )
        db.add(task)
        created_tasks.append(task)
        
        # Increment volunteer task count if assigned
        if assigned_id:
            vol = db.query(Volunteer).filter(Volunteer.id == assigned_id).first()
            if vol:
                vol.current_task_count += 1
                
    # 4. Create Documents
    if docs_data:
        for d in docs_data:
            doc = Document(
                event_id=event.id,
                title=d.get("title", f"Document - {event.title}"),
                doc_type=d.get("doc_type", "Proposal"),
                content=d.get("content", ""),
                status="draft",
                version=1
            )
            db.add(doc)
            
    # 5. Record final approval log
    record_agent_log(
        db=db,
        event_id=event.id,
        agent_name="LangGraph Orchestrator",
        action_name="human_approved_and_persisted",
        input_data={"event_title": event.title, "task_count": len(tasks_data)},
        output_data={"event_id": event.id, "tasks_created": len(created_tasks), "status": "approved"},
        status="success",
        execution_time_ms=150
    )
    
    db.commit()
    db.refresh(event)
    
    return {
        "success": True,
        "event_id": event.id,
        "message": f"Event '{event.title}' and {len(created_tasks)} tasks successfully approved and persisted."
    }

