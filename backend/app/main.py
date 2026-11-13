import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.seed_data import seed_database
from app.routers import (
    dashboard, events, volunteers, tasks, 
    documents, communications, agents, settings as settings_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("branchflow")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed initial data
    logger.info("Initializing BranchFlow database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()
        
    logger.info(f"BranchFlow API started in {settings.ENVIRONMENT} mode.")
    yield
    # Shutdown
    logger.info("BranchFlow API shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(dashboard.router)
app.include_router(events.router)
app.include_router(volunteers.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(communications.router)
app.include_router(agents.router)
app.include_router(settings_router.router)

@app.get("/")
def root():
    return {
        "name": "BranchFlow API",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "healthy"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "gemini_active": settings_router.is_gemini_active(),
        "database": "SQLite connected"
    }
