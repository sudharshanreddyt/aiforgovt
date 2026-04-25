from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True)
    applicant_id = Column(String, nullable=False)
    applicant_name = Column(String, nullable=False)
    applicant_email = Column(String, nullable=False)
    jurisdiction = Column(String, default="dc")
    address = Column(String, nullable=False)
    project_type = Column(String, nullable=False)
    project_description = Column(Text)
    status = Column(String, default="submitted")
    submitted_at = Column(DateTime)
    parcel_data = Column(JSON)
    project_model = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True)
    application_id = Column(String, ForeignKey("applications.id"))
    filename = Column(String)
    document_type = Column(String)
    page_count = Column(Integer)
    storage_path = Column(String)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

class Finding(Base):
    __tablename__ = "findings"
    id = Column(String, primary_key=True)
    application_id = Column(String, ForeignKey("applications.id"))
    department_id = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    code_authority = Column(String)
    code_citation = Column(String)
    code_text = Column(Text)
    page_ref = Column(String)
    bounding_box = Column(JSON)
    suggested_fix = Column(Text)
    ai_confidence = Column(String)
    reviewer_action = Column(String, default="pending")
    reviewer_note = Column(Text)
    reviewer_id = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DepartmentReview(Base):
    __tablename__ = "department_reviews"
    id = Column(String, primary_key=True)
    application_id = Column(String, ForeignKey("applications.id"))
    department_id = Column(String, nullable=False)
    status = Column(String, default="not_started")
    reviewer_id = Column(String)
    reviewer_name = Column(String)
    decision = Column(String)
    decision_note = Column(Text)
    review_letter_draft = Column(Text)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
