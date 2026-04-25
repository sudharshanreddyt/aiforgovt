from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Finding
from schemas import FindingActionUpdate

router = APIRouter()

def _to_dict(f):
    return {
        "id": f.id, "applicationId": f.application_id, "departmentId": f.department_id,
        "severity": f.severity, "title": f.title, "description": f.description,
        "codeAuthority": f.code_authority, "codeCitation": f.code_citation,
        "codeText": f.code_text, "pageRef": f.page_ref, "boundingBox": f.bounding_box,
        "suggestedFix": f.suggested_fix, "aiConfidence": f.ai_confidence,
        "reviewerAction": f.reviewer_action, "reviewerNote": f.reviewer_note,
        "reviewerId": f.reviewer_id,
        "createdAt": f.created_at.isoformat() if f.created_at else None,
        "updatedAt": f.updated_at.isoformat() if f.updated_at else None,
    }

@router.get("/{app_id}")
def get_findings(app_id: str, db: Session = Depends(get_db)):
    findings = db.query(Finding).filter(Finding.application_id == app_id).all()
    return [_to_dict(f) for f in findings]

@router.get("/{app_id}/{dept_id}")
def get_dept_findings(app_id: str, dept_id: str, db: Session = Depends(get_db)):
    findings = db.query(Finding).filter(
        Finding.application_id == app_id,
        Finding.department_id == dept_id
    ).all()
    return [_to_dict(f) for f in findings]

@router.patch("/{finding_id}/action")
def update_finding_action(finding_id: str, update: FindingActionUpdate, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    finding.reviewer_action = update.reviewer_action
    if update.reviewer_note:
        finding.reviewer_note = update.reviewer_note
    if update.reviewer_id:
        finding.reviewer_id = update.reviewer_id
    finding.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(finding)
    return _to_dict(finding)
