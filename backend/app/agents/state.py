from typing import Dict, Any, List, Optional
from typing_extensions import TypedDict

class EventPlanningState(TypedDict, total=False):
    """
    LangGraph State Schema representing the full event lifecycle in BranchFlow.
    """
    # Input
    prompt: str
    org_id: int
    user_id: Optional[int]
    
    # Node outputs
    extracted_requirements: Dict[str, Any]
    plan: Dict[str, Any]
    tasks: List[Dict[str, Any]]
    volunteer_recommendations: List[Dict[str, Any]]
    documents: List[Dict[str, Any]]
    
    # Execution & Human-in-the-Loop approval
    approved: bool
    requires_approval: bool
    approval_token: Optional[str]
    current_step: str
    agent_traces: List[Dict[str, Any]]
    
    # Event ID if persisted
    event_id: Optional[int]
    error: Optional[str]
