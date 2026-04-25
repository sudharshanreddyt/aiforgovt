import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import DepartmentReview, Finding, Application
from schemas import DecisionUpdate

router = APIRouter()

DEPT_NAMES = {
    "building": ("Building Department", "DC DCRA"),
    "fire": ("Fire Marshal", "DC Fire and Emergency Medical Services Department"),
    "ada": ("Accessibility Office", "DC OHR / DCRA"),
    "zoning": ("Zoning Administration", "DC DCRA Zoning"),
}

def _rev_to_dict(rev, findings):
    return {
        "id": rev.id, "applicationId": rev.application_id, "departmentId": rev.department_id,
        "status": rev.status, "reviewerId": rev.reviewer_id, "reviewerName": rev.reviewer_name,
        "decision": rev.decision, "decisionNote": rev.decision_note,
        "reviewLetterDraft": rev.review_letter_draft,
        "startedAt": rev.started_at.isoformat() if rev.started_at else None,
        "completedAt": rev.completed_at.isoformat() if rev.completed_at else None,
        "findings": [_f_dict(f) for f in findings],
    }

def _f_dict(f):
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
def get_all_reviews(app_id: str, db: Session = Depends(get_db)):
    reviews = db.query(DepartmentReview).filter(DepartmentReview.application_id == app_id).all()
    result = []
    for rev in reviews:
        findings = db.query(Finding).filter(
            Finding.application_id == app_id, Finding.department_id == rev.department_id
        ).all()
        result.append(_rev_to_dict(rev, findings))
    return result

@router.get("/{app_id}/{dept_id}")
def get_dept_review(app_id: str, dept_id: str, db: Session = Depends(get_db)):
    rev = db.query(DepartmentReview).filter(
        DepartmentReview.application_id == app_id,
        DepartmentReview.department_id == dept_id
    ).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    findings = db.query(Finding).filter(
        Finding.application_id == app_id, Finding.department_id == dept_id
    ).all()
    return _rev_to_dict(rev, findings)

@router.patch("/{review_id}/decision")
def submit_decision(review_id: str, update: DecisionUpdate, db: Session = Depends(get_db)):
    rev = db.query(DepartmentReview).filter(DepartmentReview.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")
    rev.decision = update.decision
    rev.decision_note = update.decision_note
    rev.reviewer_id = update.reviewer_id
    rev.status = update.decision
    rev.completed_at = datetime.utcnow()
    db.commit()
    findings = db.query(Finding).filter(
        Finding.application_id == rev.application_id, Finding.department_id == rev.department_id
    ).all()
    return _rev_to_dict(rev, findings)

@router.post("/{review_id}/letter")
def generate_letter(review_id: str, db: Session = Depends(get_db)):
    rev = db.query(DepartmentReview).filter(DepartmentReview.id == review_id).first()
    if not rev:
        raise HTTPException(status_code=404, detail="Review not found")

    app = db.query(Application).filter(Application.id == rev.application_id).first()
    findings = db.query(Finding).filter(
        Finding.application_id == rev.application_id, Finding.department_id == rev.department_id
    ).all()

    dept_name, jurisdiction = DEPT_NAMES.get(rev.department_id, ("Department", "DC Government"))
    date_str = datetime.utcnow().strftime("%B %d, %Y")

    issues = [f for f in findings if f.severity in ("critical", "warning")]
    issue_lines = ""
    for i, f in enumerate(issues, 1):
        issue_lines += f"\n{i}. {f.title}\n   Code: {f.code_authority} {f.code_citation}\n   Finding: {f.description}\n   Required correction: {f.suggested_fix or 'See plans examiner.'}\n"

    decision_stmt = "APPROVED" if rev.decision == "approved" else ("CONDITIONAL APPROVAL" if rev.decision == "conditional" else "REJECTED")
    reviewer = rev.reviewer_name or "Plan Examiner"
    project_type_str = (app.project_type or 'Change of Use').replace('_', ' ').title()
    applicant_addr = app.address if app else 'N/A'
    applicant_name = app.applicant_name if app else 'Applicant'

    if issues:
        findings_section = f"\nThe following items require correction before a permit can be issued:\n{issue_lines}"
        next_steps = "Please address the items listed above and resubmit corrected documents for review. Only the pages requiring revision need to be resubmitted. Allow 10 business days for re-review."
    else:
        findings_section = "\nOur review found no code deficiencies. The submitted documents comply with applicable requirements.\n"
        next_steps = "This department's approval has been recorded. No further action is required from you with respect to this department."

    letter = f"""DISTRICT OF COLUMBIA
{jurisdiction.upper()}
PLAN REVIEW DIVISION

DATE:     {date_str}
CASE NO.: {rev.application_id}
RE:       Plan Review — {project_type_str}
ADDRESS:  {applicant_addr}

Dear {applicant_name},

This letter constitutes the {dept_name}'s official review of the construction documents submitted in connection with the above-referenced application. Our review has been conducted in accordance with applicable codes and standards within our jurisdiction.

DECISION: {decision_stmt}
{findings_section}
NEXT STEPS:
{next_steps}

This review is based on the documents submitted and does not relieve the owner or designer of responsibility for compliance with all applicable codes and regulations. Questions regarding this review may be directed to this office.

Sincerely,

{reviewer}
Plan Examiner
{dept_name}
{jurisdiction}
District of Columbia"""

    rev.review_letter_draft = letter
    db.commit()
    return {"letter": letter}
