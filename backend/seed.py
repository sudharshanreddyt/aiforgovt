"""Run: python seed.py"""
import json
from database import SessionLocal
from models import Application, Finding, DepartmentReview, Base
from database import engine
from datetime import datetime

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    with open("data/mock_application.json") as f:
        app_data = json.load(f)
    with open("data/mock_findings.json") as f:
        findings_data = json.load(f)

    submitted_at = datetime.fromisoformat(app_data.pop("submitted_at")) if app_data.get("submitted_at") else None
    app = Application(**app_data, submitted_at=submitted_at)
    db.merge(app)

    REVIEWER_NAMES = {
        "building": "James Okafor",
        "fire": "Maria Rodriguez",
        "ada": "David Kim",
        "zoning": "Sarah Thompson",
    }

    for dept_id in ["building", "fire", "ada", "zoning"]:
        is_zoning = dept_id == "zoning"
        review = DepartmentReview(
            id=f"REV-{dept_id.upper()}-2026-0001",
            application_id=app_data["id"],
            department_id=dept_id,
            status="approved" if is_zoning else "ai_complete",
            reviewer_name=REVIEWER_NAMES.get(dept_id),
            decision="approved" if is_zoning else None,
            decision_note="Application approved with no conditions. Use is matter-of-right in MU-4 zone." if is_zoning else None,
            completed_at=datetime(2026, 4, 24, 14, 14, 0) if is_zoning else None,
        )
        db.merge(review)

    for f_data in findings_data["findings"]:
        finding = Finding(
            **f_data,
            application_id=findings_data["application_id"],
            reviewer_action="pending",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.merge(finding)

    db.commit()
    db.close()
    print("Seeded successfully.")

if __name__ == "__main__":
    seed()
