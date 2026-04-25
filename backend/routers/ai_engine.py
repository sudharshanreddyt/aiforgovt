import asyncio
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Application, DepartmentReview
from agents.demo_simulator import simulate_demo_review, PROGRESS_STORE, AGENT_SCRIPTS

router = APIRouter()

DEMO_MODE = True
DEMO_APP_ID = "APP-2026-4471"


@router.post("/review/{app_id}")
async def trigger_review(app_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if DEMO_MODE and app_id == DEMO_APP_ID:
        background_tasks.add_task(simulate_demo_review, app_id)
    else:
        background_tasks.add_task(simulate_demo_review, app_id)

    app.status = "ai_reviewing"
    db.commit()

    return {
        "status": "started",
        "application_id": app_id,
        "departments": ["building", "fire", "ada", "zoning"],
        "estimated_duration_seconds": 30,
    }


@router.get("/review/{app_id}/progress")
def get_progress(app_id: str):
    if app_id not in PROGRESS_STORE:
        agents = []
        for dept, steps in AGENT_SCRIPTS.items():
            agents.append({
                "department_id": dept,
                "status": "queued",
                "checks_complete": 0,
                "checks_total": len(steps),
                "current_action": "Waiting...",
            })
        return {
            "application_id": app_id,
            "overall_status": "running",
            "started_at": datetime.utcnow().isoformat(),
            "elapsed_seconds": 0,
            "agents": agents,
        }

    store = PROGRESS_STORE[app_id]
    agents = []
    for dept, data in store["agents"].items():
        agents.append({
            "department_id": dept,
            "status": data["status"],
            "checks_complete": data["checks_complete"],
            "checks_total": data["checks_total"],
            "current_action": data["current_action"],
        })

    started = datetime.fromisoformat(store["started_at"]) if "started_at" in store else datetime.utcnow()
    elapsed = (datetime.utcnow() - started).total_seconds()

    return {
        "application_id": app_id,
        "overall_status": store["status"],
        "started_at": store.get("started_at"),
        "elapsed_seconds": int(elapsed),
        "agents": agents,
    }


@router.get("/review/{app_id}/results")
def get_results(app_id: str, db: Session = Depends(get_db)):
    from models import Finding
    findings = db.query(Finding).filter(Finding.application_id == app_id).all()
    return [
        {
            "id": f.id, "department_id": f.department_id, "severity": f.severity,
            "title": f.title, "code_citation": f.code_citation, "page_ref": f.page_ref,
        }
        for f in findings
    ]
