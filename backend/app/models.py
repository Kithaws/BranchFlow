import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, 
    Float, Boolean, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    type = Column(String(100), default="College Club") # e.g., IEEE Student Branch, ACM Chapter, Cultural Club
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="organization", cascade="all, delete-orphan")
    volunteers = relationship("Volunteer", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    role = Column(String(50), default="Organizer") # Lead Organizer, Faculty Advisor, Member
    avatar = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="users")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    event_type = Column(String(100), default="Workshop") # Workshop, Hackathon, Conference, Seminar, Cultural Fest
    status = Column(String(50), default="planning") # planning, approved, active, completed, cancelled
    start_date = Column(String(100), nullable=True)
    end_date = Column(String(100), nullable=True)
    duration_days = Column(Integer, default=1)
    budget = Column(Float, default=0.0)
    expected_participants = Column(Integer, default=50)
    venue = Column(String(200), nullable=True)
    
    # AI generated structured metadata
    schedule = Column(JSON, default=list) # List of schedule day/time blocks
    teams = Column(JSON, default=list) # Required organizing teams (Logistics, Tech, Sponsorship, etc.)
    checklist = Column(JSON, default=list) # Checklists with milestones
    raw_prompt = Column(Text, nullable=True) # The prompt used to generate this event
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="events")
    tasks = relationship("Task", back_populates="event", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="event", cascade="all, delete-orphan")
    communications = relationship("Communication", back_populates="event", cascade="all, delete-orphan")
    agent_logs = relationship("AgentExecutionLog", back_populates="event", cascade="all, delete-orphan")

class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), default="Computer Science")
    year = Column(String(50), default="3rd Year")
    
    # Skills stored as list of strings, e.g. ["Python", "Graphic Design", "Logistics", "Sponsorship"]
    skills = Column(JSON, default=list)
    availability_status = Column(String(50), default="available") # available, busy, unavailable
    max_tasks = Column(Integer, default=4)
    current_task_count = Column(Integer, default=0)
    rating = Column(Float, default=4.5)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    organization = relationship("Organization", back_populates="volunteers")
    tasks = relationship("Task", back_populates="assigned_volunteer")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    assigned_volunteer_id = Column(Integer, ForeignKey("volunteers.id"), nullable=True)
    
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Logistics") # Logistics, Technical, Sponsorship, PR & Media, Hospitality
    priority = Column(String(50), default="Medium") # Low, Medium, High, Urgent
    status = Column(String(50), default="pending") # pending, in_progress, completed, blocked
    
    due_date = Column(String(100), nullable=True)
    estimated_hours = Column(Float, default=2.0)
    completed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="tasks")
    assigned_volunteer = relationship("Volunteer", back_populates="tasks")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    
    title = Column(String(250), nullable=False)
    doc_type = Column(String(100), default="Proposal") 
    # Proposal, Permission Letter, Sponsorship Proposal, Budget Draft, Meeting Agenda, Event Report, Post-event Summary
    content = Column(Text, nullable=False) # Rich Markdown content
    status = Column(String(50), default="draft") # draft, reviewed, approved, exported
    version = Column(Integer, default=1)
    metadata_info = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="documents")

class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    
    title = Column(String(250), nullable=False)
    channel = Column(String(100), default="WhatsApp") # WhatsApp, Email, Instagram, Discord, LinkedIn, SMS
    tone = Column(String(50), default="professional") # professional, friendly, casual
    recipient_group = Column(String(100), default="Attendees") # Attendees, Volunteers, Faculty, Sponsors, All
    content = Column(Text, nullable=False)
    status = Column(String(50), default="draft") # draft, ready, sent
    sent_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="communications")

class AgentExecutionLog(Base):
    __tablename__ = "agent_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    
    agent_name = Column(String(100), nullable=False) # Event Planner, Documentation, Volunteer, Communication, Progress Monitoring
    action_name = Column(String(150), nullable=False)
    input_data = Column(JSON, default=dict)
    output_data = Column(JSON, default=dict)
    status = Column(String(50), default="success") # running, success, warning, failed
    execution_time_ms = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    event = relationship("Event", back_populates="agent_logs")
