import httpx
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("branchflow.n8n")

# Global runtime override for n8n settings
N8N_CONFIG = {
    "webhook_url": settings.N8N_WEBHOOK_URL,
    "enabled": settings.N8N_ENABLED
}

async def dispatch_n8n_webhook(event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Dispatches a webhook payload to n8n workflow engine if configured.
    """
    webhook_url = N8N_CONFIG.get("webhook_url") or settings.N8N_WEBHOOK_URL
    is_enabled = N8N_CONFIG.get("enabled", settings.N8N_ENABLED)
    
    if not is_enabled or not webhook_url:
        logger.info(f"[n8n Automation] Webhook '{event_type}' simulated (n8n integration is disabled or URL not set).")
        return {"status": "skipped", "message": "n8n webhook disabled or URL empty"}
        
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post(
                webhook_url,
                json={
                    "source": "BranchFlow Agentic System",
                    "event_type": event_type,
                    "payload": payload
                }
            )
            return {
                "status": "success" if resp.status_code in [200, 201, 202] else "error",
                "http_status": resp.status_code,
                "response": resp.text[:200]
            }
    except Exception as e:
        logger.warning(f"[n8n Automation Error]: {e}")
        return {"status": "error", "message": str(e)}
