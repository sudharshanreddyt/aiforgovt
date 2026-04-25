import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from database import get_db
from models import Application, Document, Finding, DepartmentReview
from schemas import ApplicationCreate, ApplicationOut

router = APIRouter()

UPLOAD_DIR = "./uploads"

@router.post("/", response_model=ApplicationOut)
def create_application(data: ApplicationCreate, db: Session = Depends(get_db)):
    year = datetime.utcnow().year
    seq = db.query(Application).count() + 1
    app_id = f"APP-{year}-{str(seq).zfill(4)}"
    app = Application(
        id=app_id,
        applicant_id=f"APPL-{str(seq).zfill(3)}",
        applicant_name=data.applicant_name,
        applicant_email=data.applicant_email,
        address=data.address,
        project_type=data.project_type,
        project_description=data.project_description,
        status="submitted",
        submitted_at=datetime.utcnow(),
        jurisdiction="dc",
    )
    db.add(app)

    for dept_id in ["building", "fire", "ada", "zoning"]:
        review = DepartmentReview(
            id=f"REV-{dept_id.upper()}-{year}-{str(seq).zfill(4)}",
            application_id=app_id,
            department_id=dept_id,
            status="in_queue",
        )
        db.add(review)

    db.commit()
    db.refresh(app)
    return app

@router.get("/{app_id}")
def get_application(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    reviews = db.query(DepartmentReview).filter(DepartmentReview.application_id == app_id).all()
    docs = db.query(Document).filter(Document.application_id == app_id).all()

    review_list = []
    for rev in reviews:
        findings = db.query(Finding).filter(
            Finding.application_id == app_id,
            Finding.department_id == rev.department_id
        ).all()
        review_list.append({
            "id": rev.id,
            "applicationId": app_id,
            "departmentId": rev.department_id,
            "status": rev.status,
            "reviewerId": rev.reviewer_id,
            "reviewerName": rev.reviewer_name,
            "decision": rev.decision,
            "decisionNote": rev.decision_note,
            "reviewLetterDraft": rev.review_letter_draft,
            "startedAt": rev.started_at.isoformat() if rev.started_at else None,
            "completedAt": rev.completed_at.isoformat() if rev.completed_at else None,
            "findings": [_finding_to_dict(f) for f in findings],
        })

    return {
        "id": app.id,
        "applicantId": app.applicant_id,
        "applicantName": app.applicant_name,
        "applicantEmail": app.applicant_email,
        "jurisdiction": app.jurisdiction,
        "address": app.address,
        "projectType": app.project_type,
        "projectDescription": app.project_description,
        "status": app.status,
        "submittedAt": app.submitted_at.isoformat() if app.submitted_at else None,
        "parcelData": app.parcel_data,
        "projectModel": app.project_model,
        "documents": [_doc_to_dict(d) for d in docs],
        "departmentReviews": review_list,
    }

@router.get("/{app_id}/status")
def get_status(app_id: str, db: Session = Depends(get_db)):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")

    reviews = db.query(DepartmentReview).filter(DepartmentReview.application_id == app_id).all()
    dept_statuses = []
    for rev in reviews:
        findings = db.query(Finding).filter(
            Finding.application_id == app_id,
            Finding.department_id == rev.department_id
        ).all()
        counts = {"critical": 0, "warning": 0, "info": 0, "pass": 0}
        for f in findings:
            if f.severity in counts:
                counts[f.severity] += 1
        dept_statuses.append({
            "department_id": rev.department_id,
            "status": rev.status,
            "findings_count": counts,
            "reviewer_name": rev.reviewer_name,
            "completed_at": rev.completed_at.isoformat() if rev.completed_at else None,
        })

    return {
        "application_id": app_id,
        "overall_status": app.status,
        "department_statuses": dept_statuses,
        "submitted_at": app.submitted_at.isoformat() if app.submitted_at else None,
        "last_updated": app.updated_at.isoformat() if app.updated_at else None,
    }

@router.post("/{app_id}/upload")
async def upload_document(
    app_id: str,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    db: Session = Depends(get_db),
):
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    upload_path = os.path.join(UPLOAD_DIR, app_id)
    os.makedirs(upload_path, exist_ok=True)
    file_path = os.path.join(upload_path, file.filename or "upload.pdf")

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        id=str(uuid.uuid4()),
        application_id=app_id,
        filename=file.filename,
        document_type=document_type,
        page_count=0,
        storage_path=file_path,
    )
    db.add(doc)
    db.commit()

    return {"id": doc.id, "filename": doc.filename, "document_type": doc.document_type}

def _finding_to_dict(f):
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

def _doc_to_dict(d):
    return {
        "id": d.id, "applicationId": d.application_id, "filename": d.filename,
        "documentType": d.document_type, "pageCount": d.page_count,
        "uploadedAt": d.uploaded_at.isoformat() if d.uploaded_at else None,
        "storageUrl": f"/uploads/{d.application_id}/{d.filename}",
    }
