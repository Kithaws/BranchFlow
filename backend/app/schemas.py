import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

# ----------------- Base Schemas -----------------
class OrganizationBase(BaseModel):
    name: str
    type: str = "College Club"
    description: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# ----------------- Volunteer Schemas -----------------
class VolunteerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    department: str = "Computer Science"
    year: str = "3rd Year"
    skills: List[str] = Field(default_factory=list)
    availability_status: str = "available"
    max_tasks: int = 4
    rating: float = 4.5
    notes: Optional[str] = None

class VolunteerCreate(VolunteerBase):
    org_id: Optional[int] = 1

class VolunteerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None
    skills: Optional[List[str]] = None
    availability_status: Optional[str] = None
    max_tasks: Optional[int] = None
    notes: Optional[str] = None

class VolunteerResponse(VolunteerBase):
    id: int
    org_id: Optional[int] = None
    current_task_count: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# ----------------- Task Schemas -----------------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "Logistics"
    priority: str = "Medium"
    status: str = "pending"
    due_date: Optional[str] = None
    estimated_hours: float = 2.0
    assigned_volunteer_id: Optional[int] = None

class TaskCreate(TaskBase):
    event_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[str] = None
    estimated_hours: Optional[float] = None
    assigned_volunteer_id: Optional[int] = None

class TaskResponse(TaskBase):
    id: int
    event_id: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    assigned_volunteer: Optional[VolunteerResponse] = None
    class Config:
        from_attributes = True

# ----------------- Event Schemas -----------------
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "Workshop"
    status: str = "planning"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: int = 1
    budget: float = 0.0
    expected_participants: int = 50
    venue: Optional[str] = None
    schedule: List[Dict[str, Any]] = Field(default_factory=list)
    teams: List[Dict[str, Any]] = Field(default_factory=list)
    checklist: List[Dict[str, Any]] = Field(default_factory=list)
    raw_prompt: Optional[str] = None

class EventCreate(EventBase):
    org_id: Optional[int] = 1

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration_days: Optional[int] = None
    budget: Optional[float] = None
    expected_participants: Optional[int] = None
    venue: Optional[str] = None
    schedule: Optional[List[Dict[str, Any]]] = None
    teams: Optional[List[Dict[str, Any]]] = None
    checklist: Optional[List[Dict[str, Any]]] = None

class EventResponse(EventBase):
    id: int
    org_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    tasks_count: Optional[int] = 0
    volunteers_count: Optional[int] = 0
    class Config:
        from_attributes = True

# ----------------- Document Schemas -----------------
class DocumentBase(BaseModel):
    title: str
    doc_type: str = "Proposal"
    content: str
    status: str = "draft"
    metadata_info: Dict[str, Any] = Field(default_factory=dict)

class DocumentCreate(DocumentBase):
    event_id: Optional[int] = None

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    doc_type: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    event_id: Optional[int] = None
    version: int
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

# ----------------- Communication Schemas -----------------
class CommunicationBase(BaseModel):
    title: str
    channel: str = "WhatsApp"
    tone: str = "professional"
    recipient_group: str = "Attendees"
    content: str
    status: str = "draft"

class CommunicationCreate(CommunicationBase):
    event_id: Optional[int] = None

class CommunicationResponse(CommunicationBase):
    id: int
    event_id: Optional[int] = None
    created_at: datetime.datetime
    sent_at: Optional[datetime.datetime] = None
    class Config:
        from_attributes = True

# ----------------- Agent Execution Schemas -----------------
class AgentLogResponse(BaseModel):
    id: int
    event_id: Optional[int] = None
    agent_name: str
    action_name: str
    input_data: Dict[str, Any] = Field(default_factory=dict)
    output_data: Dict[str, Any] = Field(default_factory=dict)
    status: str
    execution_time_ms: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

# ----------------- AI Agent Requests & Responses -----------------
class NaturalLanguageEventRequest(BaseModel):
    prompt: str = Field(..., description="Natural language prompt describing the event")
    org_id: Optional[int] = 1
    auto_approve: bool = False

class PlanGenerationResponse(BaseModel):
    success: bool
    event_id: Optional[int] = None
    plan: Dict[str, Any]
    agent_traces: List[Dict[str, Any]] = Field(default_factory=list)
    requires_approval: bool = True
    approval_token: Optional[str] = None

class PlanApprovalRequest(BaseModel):
    approved: bool = True
    event_data: Dict[str, Any]
    tasks_data: List[Dict[str, Any]] = Field(default_factory=list)
    volunteer_assignments: List[Dict[str, Any]] = Field(default_factory=list)

class DocGenRequest(BaseModel):
    event_id: Optional[int] = None
    doc_type: str = "Proposal" # Proposal, Permission Letter, Sponsorship Proposal, Budget Draft, Meeting Agenda, Event Report, Post-event Summary
    additional_notes: Optional[str] = ""
    target_audience: Optional[str] = "College Principal / Dean"

class CommGenRequest(BaseModel):
    event_id: Optional[int] = None
    channel: str = "WhatsApp" # WhatsApp, Email, Instagram, Discord, LinkedIn, SMS
    tone: str = "professional" # professional, friendly, casual
    recipient_group: str = "Attendees"
    topic: Optional[str] = "Registration Open"
    additional_notes: Optional[str] = ""

class VolunteerRecommendRequest(BaseModel):
    event_id: Optional[int] = None
    task_id: Optional[int] = None
    required_skills: List[str] = Field(default_factory=list)
    category: Optional[str] = "General"

class ProgressAuditResponse(BaseModel):
    event_id: Optional[int] = None
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_rate: float
    workload_imbalance_detected: bool
    burnout_risk_volunteers: List[str]
    conflicts_detected: List[str]
    insights: List[str]
    recommended_actions: List[str]

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None
    n8n_webhook_url: Optional[str] = None
    n8n_enabled: Optional[bool] = None
