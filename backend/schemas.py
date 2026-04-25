from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime

class ApplicationCreate(BaseModel):
    applicant_name: str
    applicant_email: str
    address: str
    project_type: str
    project_description: Optional[str] = None

class ApplicationOut(BaseModel):
    id: str
    applicant_id: str
    applicant_name: str
    applicant_email: str
    jurisdiction: str
    address: str
    project_type: str
    project_description: Optional[str]
    status: str
    submitted_at: Optional[datetime]
    parcel_data: Optional[Any]
    project_model: Optional[Any]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}

class FindingOut(BaseModel):
    id: str
    application_id: str
    department_id: str
    severity: str
    title: str
    description: Optional[str]
    code_authority: Optional[str]
    code_citation: Optional[str]
    code_text: Optional[str]
    page_ref: Optional[str]
    bounding_box: Optional[Any]
    suggested_fix: Optional[str]
    ai_confidence: Optional[str]
    reviewer_action: str
    reviewer_note: Optional[str]
    reviewer_id: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}

class DepartmentReviewOut(BaseModel):
    id: str
    application_id: str
    department_id: str
    status: str
    reviewer_id: Optional[str]
    reviewer_name: Optional[str]
    decision: Optional[str]
    decision_note: Optional[str]
    review_letter_draft: Optional[str]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    findings: List[FindingOut] = []

    model_config = {"from_attributes": True}

class FindingActionUpdate(BaseModel):
    reviewer_action: str
    reviewer_note: Optional[str] = None
    reviewer_id: Optional[str] = None

class DecisionUpdate(BaseModel):
    decision: str
    decision_note: Optional[str] = None
    reviewer_id: Optional[str] = None
