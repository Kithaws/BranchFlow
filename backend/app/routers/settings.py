import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, Base, engine
from app.config import settings
from app.schemas import SettingsUpdate
from app.agents.llm_factory import RUNTIME_CONFIG, is_gemini_active, get_active_gemini_key
from app.services.n8n_service import N8N_CONFIG, dispatch_n8n_webhook
from app.seed_data import seed_database
from app.models import (
    Organization, User, Event, Volunteer, Task, 
    Document, Communication, AgentExecutionLog
)

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
def get_system_settings():
    key = get_active_gemini_key()
    masked_key = ""
    if key:
        masked_key = key[:4] + "..." + key[-4:] if len(key) > 8 else "***"
        
    return {
        "gemini_active": is_gemini_active(),
        "masked_gemini_key": masked_key,
        "gemini_model": RUNTIME_CONFIG.get("gemini_model") or settings.GEMINI_MODEL,
        "n8n_enabled": N8N_CONFIG.get("enabled", settings.N8N_ENABLED),
        "n8n_webhook_url": N8N_CONFIG.get("webhook_url") or settings.N8N_WEBHOOK_URL,
        "database_type": "SQLite",
        "system_status": "Operational"
    }

@router.post("")
def update_system_settings(payload: SettingsUpdate):
    if payload.gemini_api_key is not None:
        RUNTIME_CONFIG["gemini_api_key"] = payload.gemini_api_key.strip()
    if payload.gemini_model is not None:
        RUNTIME_CONFIG["gemini_model"] = payload.gemini_model.strip()
    if payload.n8n_webhook_url is not None:
        N8N_CONFIG["webhook_url"] = payload.n8n_webhook_url.strip()
    if payload.n8n_enabled is not None:
        N8N_CONFIG["enabled"] = payload.n8n_enabled
        
    return {
        "success": True,
        "message": "Settings updated successfully",
        "gemini_active": is_gemini_active()
    }

@router.post("/test-n8n")
async def test_n8n():
    res = await dispatch_n8n_webhook("test.ping", {"test": "BranchFlow n8n connection test"})
    return res

@router.post("/reset-demo-data")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Clears all tables and re-seeds with rich realistic demo data.
    """
    # Delete in order of dependencies
    db.query(AgentExecutionLog).delete()
    db.query(Communication).delete()
    db.query(Document).delete()
    db.query(Task).delete()
    db.query(Volunteer).delete()
    db.query(Event).delete()
    db.query(User).delete()
    db.query(Organization).delete()
    db.commit()
    
    # Re-seed
    seed_database(db)
    
    return {"success": True, "message": "Demo database successfully reset and seeded!"}
