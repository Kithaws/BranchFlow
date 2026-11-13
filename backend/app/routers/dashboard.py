from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.analytics import get_dashboard_summary

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_summary(org_id: int = 1, db: Session = Depends(get_db)):
    """
    Returns high-level KPI metrics, chart datasets, upcoming events, and recent activities.
    """
    return get_dashboard_summary(db=db, org_id=org_id)

