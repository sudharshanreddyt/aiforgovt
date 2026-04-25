# PRD — Function 1: Project Setup, Data Models & Mock Data

**Scope:** Scaffold the entire codebase, define all TypeScript types, SQLite schema, mock fixtures, and shared constants. Everything else builds on top of this.

**Build time estimate:** 30–40 minutes  
**Dependencies:** None (this is the foundation)

---

## 1. What to Build

### 1.1 Monorepo Structure

```
permitflow/
├── frontend/                    ← Next.js 14 app
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx             ← redirect to /applicant or /review
│   │   ├── applicant/
│   │   │   ├── page.tsx         ← applicant landing / upload
│   │   │   └── [appId]/
│   │   │       └── page.tsx     ← applicant status dashboard
│   │   └── review/
│   │       └── [department]/
│   │           ├── page.tsx     ← department dashboard (queue)
│   │           └── [appId]/
│   │               └── page.tsx ← reviewer cockpit
│   ├── components/
│   │   ├── ui/                  ← design system components
│   │   └── layout/
│   ├── lib/
│   │   ├── types.ts             ← ALL TypeScript types
│   │   ├── constants.ts         ← department configs, code refs
│   │   ├── api.ts               ← typed fetch wrappers
│   │   └── utils.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── typography.css
│   │   └── dept-themes.css
│   └── public/
│       └── sample-plan.pdf      ← demo architectural plan
│
├── backend/                     ← FastAPI Python app
│   ├── main.py
│   ├── models.py                ← SQLAlchemy models
│   ├── schemas.py               ← Pydantic schemas
│   ├── database.py              ← SQLite setup
│   ├── routers/
│   │   ├── applications.py
│   │   ├── findings.py
│   │   ├── reviews.py
│   │   └── ai_engine.py
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── building_agent.py
│   │   ├── fire_agent.py
│   │   ├── ada_agent.py
│   │   └── zoning_agent.py
│   ├── data/
│   │   └── mock_findings.json   ← hardcoded demo findings
│   └── requirements.txt
│
└── README.md
```

---

## 2. TypeScript Types (`frontend/lib/types.ts`)

Define every type used across the app:

```typescript
// ────────────────────────────────────────────────────────────────
// ENUMS
// ────────────────────────────────────────────────────────────────

export type DepartmentId = 'building' | 'fire' | 'ada' | 'zoning' | 'health' | 'mep';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'ai_reviewing'
  | 'dept_review'
  | 'approved'
  | 'conditional'
  | 'rejected'
  | 'resubmission_required';

export type DepartmentReviewStatus =
  | 'not_started'
  | 'in_queue'
  | 'ai_complete'
  | 'reviewer_assigned'
  | 'under_review'
  | 'approved'
  | 'conditional'
  | 'rejected';

export type FindingSeverity = 'critical' | 'warning' | 'info' | 'pass';

export type ReviewerAction = 'pending' | 'accepted' | 'overridden' | 'added' | 'dismissed';

// ────────────────────────────────────────────────────────────────
// DEPARTMENT CONFIG (static, loaded from constants.ts)
// ────────────────────────────────────────────────────────────────

export interface DepartmentConfig {
  id: DepartmentId;
  name: string;                    // "Building Department"
  shortName: string;               // "Building"
  colorPrimary: string;            // hex
  colorDark: string;
  colorLight: string;
  colorBorder: string;
  codeAuthorities: string[];       // ["IBC 2021", "IECC 2021"]
  jurisdiction: string;            // "DC DCRA"
}

// ────────────────────────────────────────────────────────────────
// PARCEL DATA (from DC GIS)
// ────────────────────────────────────────────────────────────────

export interface ParcelData {
  address: string;
  ssl: string;                     // DC Square-Suffix-Lot
  zoningDistrict: string;          // "MU-4"
  overlayDistricts: string[];
  heightLimitFt: number;
  floodZone: string | null;
  historicStatus: string | null;
  ward: number;
  latitude: number;
  longitude: number;
}

// ────────────────────────────────────────────────────────────────
// DOCUMENTS
// ────────────────────────────────────────────────────────────────

export interface SubmittedDocument {
  id: string;
  applicationId: string;
  filename: string;
  documentType: 'architectural_plans' | 'mep_plans' | 'structural' | 'narrative' | 'city_form' | 'other';
  pageCount: number;
  uploadedAt: string;              // ISO date
  storageUrl: string;
}

// ────────────────────────────────────────────────────────────────
// PROJECT MODEL (extracted by AI from documents)
// ────────────────────────────────────────────────────────────────

export interface ProjectModel {
  occupancyClass: string;          // "A-2" (restaurant)
  constructionType: string;        // "VB"
  totalAreaSqFt: number;
  floors: number;
  occupantLoad: number;
  spaces: ProjectSpace[];
  doors: DoorEntry[];
  egressPaths: EgressPath[];
  plumbingFixtures: PlumbingFixture[];
}

export interface ProjectSpace {
  id: string;
  name: string;
  areaSqFt: number;
  occupancyClass: string;
  occupantLoad: number;
  sheetRef: string;
}

export interface DoorEntry {
  id: string;                      // "D-07"
  location: string;
  clearWidthInches: number;
  swingDirection: string;
  isExitDoor: boolean;
  isAccessibleRoute: boolean;
  sheetRef: string;
  boundingBox: BoundingBox | null;
}

export interface EgressPath {
  id: string;
  from: string;
  to: string;
  widthInches: number;
  travelDistanceFt: number;
}

export interface PlumbingFixture {
  type: string;
  count: number;
  sheetRef: string;
}

export interface BoundingBox {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

// ────────────────────────────────────────────────────────────────
// APPLICATION
// ────────────────────────────────────────────────────────────────

export interface Application {
  id: string;                      // "APP-2026-4471"
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  jurisdiction: string;            // "dc"
  address: string;
  projectType: string;             // "restaurant_change_of_use"
  projectDescription: string;
  status: ApplicationStatus;
  submittedAt: string | null;
  parcelData: ParcelData | null;
  projectModel: ProjectModel | null;
  documents: SubmittedDocument[];
  departmentReviews: DepartmentReview[];
}

// ────────────────────────────────────────────────────────────────
// FINDING
// ────────────────────────────────────────────────────────────────

export interface Finding {
  id: string;                      // "FND-ADA-014"
  applicationId: string;
  departmentId: DepartmentId;
  severity: FindingSeverity;
  title: string;
  description: string;
  codeAuthority: string;           // "ADA 2010 Standards"
  codeCitation: string;            // "§ 404.2.3"
  codeText: string;                // excerpt from the code
  pageRef: string;                 // "Sheet A3"
  boundingBox: BoundingBox | null;
  suggestedFix: string;
  aiConfidence: 'high' | 'medium' | 'low';
  reviewerAction: ReviewerAction;
  reviewerNote: string | null;
  reviewerId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ────────────────────────────────────────────────────────────────
// DEPARTMENT REVIEW
// ────────────────────────────────────────────────────────────────

export interface DepartmentReview {
  id: string;                      // "REV-FIRE-2026-0892"
  applicationId: string;
  departmentId: DepartmentId;
  status: DepartmentReviewStatus;
  reviewerId: string | null;
  reviewerName: string | null;
  findings: Finding[];
  decision: 'approved' | 'conditional' | 'rejected' | null;
  decisionNote: string | null;
  reviewLetterDraft: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

// ────────────────────────────────────────────────────────────────
// AI ENGINE
// ────────────────────────────────────────────────────────────────

export interface AIReviewRequest {
  applicationId: string;
  documentUrls: string[];
  parcelData: ParcelData;
  departments: DepartmentId[];
}

export interface AIAgentStatus {
  departmentId: DepartmentId;
  status: 'queued' | 'running' | 'complete' | 'failed';
  checksComplete: number;
  checksTotal: number;
  currentAction: string;
  elapsedMs: number;
}

export interface AIReviewProgress {
  applicationId: string;
  overallStatus: 'running' | 'complete' | 'failed';
  agents: AIAgentStatus[];
  startedAt: string;
  estimatedCompletionMs: number;
}

// ────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  applicantId: string;
  applicationId: string;
  departmentId: DepartmentId | null;
  type: 'dept_approved' | 'dept_conditional' | 'dept_rejected' | 'all_complete' | 'resubmission_needed';
  message: string;
  sentAt: string;
  isRead: boolean;
}

// ────────────────────────────────────────────────────────────────
// API RESPONSE WRAPPERS
// ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

---

## 3. Constants (`frontend/lib/constants.ts`)

```typescript
import { DepartmentConfig, DepartmentId } from './types';

export const DEPARTMENTS: Record<DepartmentId, DepartmentConfig> = {
  building: {
    id: 'building',
    name: 'Building Department',
    shortName: 'Building',
    colorPrimary: '#1D4ED8',
    colorDark: '#1E3A8A',
    colorLight: '#EFF6FF',
    colorBorder: '#BFDBFE',
    codeAuthorities: ['IBC 2021', 'IECC 2021', 'DC Construction Codes 2020'],
    jurisdiction: 'DC DCRA',
  },
  fire: {
    id: 'fire',
    name: 'Fire Marshal',
    shortName: 'Fire',
    colorPrimary: '#DC2626',
    colorDark: '#991B1B',
    colorLight: '#FEF2F2',
    colorBorder: '#FECACA',
    codeAuthorities: ['IFC 2021', 'NFPA 101', 'NFPA 96', 'DC Fire Prevention Code'],
    jurisdiction: 'DC Fire and EMS',
  },
  ada: {
    id: 'ada',
    name: 'Accessibility Office',
    shortName: 'ADA',
    colorPrimary: '#059669',
    colorDark: '#065F46',
    colorLight: '#ECFDF5',
    colorBorder: '#A7F3D0',
    codeAuthorities: ['ADA 2010 Standards', 'ANSI A117.1', 'DC Accessibility Code'],
    jurisdiction: 'DC OHR / DCRA',
  },
  zoning: {
    id: 'zoning',
    name: 'Zoning Administration',
    shortName: 'Zoning',
    colorPrimary: '#7C3AED',
    colorDark: '#4C1D95',
    colorLight: '#F5F3FF',
    colorBorder: '#DDD6FE',
    codeAuthorities: ['DC Zoning Regulations 2016', 'DC Municipal Regulations Title 11'],
    jurisdiction: 'DC DCRA Zoning',
  },
  health: {
    id: 'health',
    name: 'Health Department',
    shortName: 'Health',
    colorPrimary: '#EA580C',
    colorDark: '#9A3412',
    colorLight: '#FFF7ED',
    colorBorder: '#FED7AA',
    codeAuthorities: ['FDA Food Code 2022', 'DC Health Code Title 25'],
    jurisdiction: 'DC DOH',
  },
  mep: {
    id: 'mep',
    name: 'MEP Review',
    shortName: 'MEP',
    colorPrimary: '#D97706',
    colorDark: '#92400E',
    colorLight: '#FFFBEB',
    colorBorder: '#FDE68A',
    codeAuthorities: ['IPC 2021', 'IMC 2021', 'NFPA 70', 'DC Mechanical Code'],
    jurisdiction: 'DC DCRA MEP',
  },
};

// Demo application ID
export const DEMO_APP_ID = 'APP-2026-4471';
export const DEMO_ADDRESS = '2247 18th St NW, Washington, DC 20009';

// Active departments for tonight's demo
export const DEMO_DEPARTMENTS: DepartmentId[] = ['building', 'fire', 'ada', 'zoning'];

// Application status display labels
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  ai_reviewing: 'AI Review Running',
  dept_review: 'Under Departmental Review',
  approved: 'Approved',
  conditional: 'Conditional Approval',
  rejected: 'Rejected',
  resubmission_required: 'Resubmission Required',
};
```

---

## 4. SQLite Schema (`backend/models.py`)

```python
from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()

class ApplicationStatusEnum(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    ai_reviewing = "ai_reviewing"
    dept_review = "dept_review"
    approved = "approved"
    conditional = "conditional"
    rejected = "rejected"
    resubmission_required = "resubmission_required"

class FindingSeverityEnum(str, enum.Enum):
    critical = "critical"
    warning = "warning"
    info = "info"
    pass_ = "pass"

class ReviewerActionEnum(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    overridden = "overridden"
    added = "added"
    dismissed = "dismissed"

class Application(Base):
    __tablename__ = "applications"
    id = Column(String, primary_key=True)          # "APP-2026-4471"
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
    id = Column(String, primary_key=True)          # "FND-ADA-014"
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
```

---

## 5. Mock Fixtures (`backend/data/mock_findings.json`)

Pre-load these exact findings so the demo reliably works. 5–6 per department.

```json
{
  "application_id": "APP-2026-4471",
  "findings": [
    {
      "id": "FND-ADA-001",
      "department_id": "ada",
      "severity": "critical",
      "title": "Bathroom Door Clear Width Below Minimum",
      "description": "Door D-07 (women's restroom) measures 28 inches clear width. ADA 2010 Standards require a minimum 32-inch clear width at doorways on an accessible route.",
      "code_authority": "ADA 2010 Standards",
      "code_citation": "§ 404.2.3",
      "code_text": "Doorways shall provide a clear width of 32 inches (815 mm) minimum. Clear widths shall be measured between the face of the door and the stop, at the leading edge of the door.",
      "page_ref": "Sheet A3",
      "bounding_box": {"page": 3, "x": 320, "y": 540, "width": 80, "height": 120},
      "suggested_fix": "Replace door D-07 with a 34-inch nominal door (provides 32-inch clear width). Update door schedule on Sheet A7.",
      "ai_confidence": "high"
    },
    {
      "id": "FND-ADA-002",
      "department_id": "ada",
      "severity": "critical",
      "title": "Accessible Parking Space Missing",
      "description": "Site plan shows 12 parking spaces with no designated accessible spaces. ADA requires a minimum of 1 accessible van-accessible space for lots of 1–25 spaces.",
      "code_authority": "ADA 2010 Standards",
      "code_citation": "§ 208.2",
      "code_text": "Where parking spaces are provided, parking spaces shall be provided in accordance with Table 208.2.",
      "page_ref": "Sheet C1",
      "bounding_box": {"page": 1, "x": 180, "y": 320, "width": 220, "height": 160},
      "suggested_fix": "Designate 1 van-accessible space (minimum 132 inches wide with 60-inch access aisle). Add International Symbol of Accessibility signage.",
      "ai_confidence": "high"
    },
    {
      "id": "FND-ADA-003",
      "department_id": "ada",
      "severity": "warning",
      "title": "Service Counter Height Not Specified",
      "description": "Plans show a service counter on Sheet A4 but do not specify height. ADA requires a portion of the counter to be a maximum of 36 inches above finish floor for accessible service.",
      "code_authority": "ADA 2010 Standards",
      "code_citation": "§ 904.4.1",
      "code_text": "A portion of the counter surface that is 36 inches (915 mm) long minimum shall be 36 inches (915 mm) high maximum above the finish floor.",
      "page_ref": "Sheet A4",
      "bounding_box": {"page": 4, "x": 260, "y": 410, "width": 150, "height": 90},
      "suggested_fix": "Add dimension note on Sheet A4 specifying that service counter includes a 36-inch minimum length section at 34–36 inches AFF.",
      "ai_confidence": "medium"
    },
    {
      "id": "FND-ADA-004",
      "department_id": "ada",
      "severity": "pass",
      "title": "Entry Door Hardware Compliant",
      "description": "Front entry hardware shown as lever-type handle on Sheet A2. Lever-type hardware does not require grasping or tight pinching. Compliant with ADA 2010 § 404.2.7.",
      "code_authority": "ADA 2010 Standards",
      "code_citation": "§ 404.2.7",
      "code_text": "Door and gate hardware shall be operable with one hand and shall not require tight grasping, pinching, or twisting of the wrist.",
      "page_ref": "Sheet A2",
      "bounding_box": null,
      "suggested_fix": null,
      "ai_confidence": "high"
    },
    {
      "id": "FND-FIRE-001",
      "department_id": "fire",
      "severity": "critical",
      "title": "Fire Extinguisher Travel Distance Exceeds Maximum",
      "description": "Extinguisher FE-1 is the only portable extinguisher shown on Sheet E1. Measured travel distance from far corner of dining room to FE-1 is 82 feet. IFC 906.1 requires travel distance not to exceed 75 feet for a Class A hazard.",
      "code_authority": "IFC 2021",
      "code_citation": "§ 906.1",
      "code_text": "Portable fire extinguishers shall be installed in all occupancies and locations as required by the fire code official. Travel distance to an extinguisher shall not exceed 75 feet for Class A hazards.",
      "page_ref": "Sheet E1",
      "bounding_box": {"page": 8, "x": 100, "y": 200, "width": 400, "height": 350},
      "suggested_fix": "Add a second portable fire extinguisher in the dining area such that no point exceeds 75-foot travel distance. Mount at 42 inches to top of handle.",
      "ai_confidence": "high"
    },
    {
      "id": "FND-FIRE-002",
      "department_id": "fire",
      "severity": "warning",
      "title": "Kitchen Hood Suppression System Not Detailed",
      "description": "Plans show a Type I commercial hood over cooking equipment (Sheet M2) but no suppression system detail is included. NFPA 96 requires a listed automatic fire-extinguishing system for Type I hoods over commercial cooking equipment.",
      "code_authority": "NFPA 96",
      "code_citation": "§ 10.1",
      "code_text": "Cooking equipment used in processes producing smoke or grease-laden vapors shall be equipped with an exhaust system that complies with all the equipment and performance requirements of this standard.",
      "page_ref": "Sheet M2",
      "bounding_box": {"page": 12, "x": 200, "y": 300, "width": 200, "height": 140},
      "suggested_fix": "Submit manufacturer's drawings for Ansul or equivalent listed suppression system. Include nozzle placement, agent quantity calculations, and fuel shutoff details.",
      "ai_confidence": "high"
    },
    {
      "id": "FND-FIRE-003",
      "department_id": "fire",
      "severity": "pass",
      "title": "Exit Signage Locations Compliant",
      "description": "Exit signs shown at all required egress doors and within 100 feet of travel to exit. Exit sign locations reviewed against IFC § 1013.1 and NFPA 101 § 7.10.1. All locations pass.",
      "code_authority": "IFC 2021",
      "code_citation": "§ 1013.1",
      "code_text": "Exits and exit access doorways from rooms or spaces that require two or more means of egress shall be marked by approved exit signs.",
      "page_ref": "Sheet E1",
      "bounding_box": null,
      "suggested_fix": null,
      "ai_confidence": "high"
    },
    {
      "id": "FND-BLDG-001",
      "department_id": "building",
      "severity": "warning",
      "title": "Occupant Load Discrepancy — Patio Not Counted",
      "description": "Applicant states occupant load of 120 persons on plans. AI calculation using IBC Table 1004.5 (restaurant: 15 sf/person net) with all occupied areas including exterior patio (Sheet A1) yields 142 persons. Patio area of 330 sf appears excluded from applicant's calculation.",
      "code_authority": "IBC 2021",
      "code_citation": "Table 1004.5",
      "code_text": "Dining rooms and banquet rooms: 15 net (gross for assembly areas without fixed seats).",
      "page_ref": "Sheet A1",
      "bounding_box": {"page": 1, "x": 480, "y": 300, "width": 180, "height": 120},
      "suggested_fix": "Revise occupant load calculation to include exterior patio (330 sf ÷ 15 = 22 persons additional). Update total occupant load placard requirement on Sheet A1 to 142 persons.",
      "ai_confidence": "medium"
    },
    {
      "id": "FND-BLDG-002",
      "department_id": "building",
      "severity": "pass",
      "title": "Construction Type Classification Verified",
      "description": "Project described as Type VB construction on Sheet G1. Reviewed against IBC Table 601 and Table 503. Three-story wood frame with sprinklers for A-2 occupancy at stated area is permitted. Classification confirmed.",
      "code_authority": "IBC 2021",
      "code_citation": "Table 503",
      "code_text": "Maximum allowable height and building areas by occupancy group and construction type.",
      "page_ref": "Sheet G1",
      "bounding_box": null,
      "suggested_fix": null,
      "ai_confidence": "high"
    },
    {
      "id": "FND-ZONE-001",
      "department_id": "zoning",
      "severity": "pass",
      "title": "Use Permitted — MU-4 Zone",
      "description": "Subject property at 2247 18th St NW is zoned MU-4 (Mixed-Use Moderate Density). Restaurant use (eating establishment) is a matter-of-right use in MU-4 zones per DCMR Title 11-C § 400.2. No special exception required.",
      "code_authority": "DC Zoning Regulations 2016",
      "code_citation": "§ 400.2 (MU-4)",
      "code_text": "Matter-of-right uses in the MU-4 zone include eating establishments, drinking establishments, and retail uses.",
      "page_ref": "Parcel Data",
      "bounding_box": null,
      "suggested_fix": null,
      "ai_confidence": "high"
    },
    {
      "id": "FND-ZONE-002",
      "department_id": "zoning",
      "severity": "info",
      "title": "Outdoor Seating Requires Public Space Permit",
      "description": "Site plan shows 6 outdoor tables on the public sidewalk (Sheet C1). Sidewalk cafe seating in DC requires a separate Public Space Permit from DDOT in addition to this building permit. This is an informational note only — not a code violation.",
      "code_authority": "DC Municipal Regulations Title 24",
      "code_citation": "§ 526",
      "code_text": "No person shall occupy public space for the purpose of operating an outdoor dining area without first obtaining a public space permit.",
      "page_ref": "Sheet C1",
      "bounding_box": {"page": 1, "x": 90, "y": 480, "width": 120, "height": 80},
      "suggested_fix": "File DDOT Public Space Permit application for sidewalk cafe. This building permit may be issued in parallel. DDOT permit must be in hand before outdoor seating opens.",
      "ai_confidence": "high"
    }
  ]
}
```

---

## 6. Mock Application Record (`backend/data/mock_application.json`)

```json
{
  "id": "APP-2026-4471",
  "applicant_id": "APPL-001",
  "applicant_name": "Maria L. Chen",
  "applicant_email": "maria.chen@sunrisecafe.com",
  "jurisdiction": "dc",
  "address": "2247 18th St NW, Washington, DC 20009",
  "project_type": "restaurant_change_of_use",
  "project_description": "Change of use from retail (Group M) to restaurant (Group A-2). Interior renovation of 2,800 sf on ground floor. Addition of full commercial kitchen, Type I hood, and 12-seat exterior patio.",
  "status": "dept_review",
  "submitted_at": "2026-04-24T14:30:00Z",
  "parcel_data": {
    "address": "2247 18th St NW, Washington, DC 20009",
    "ssl": "2563-0058",
    "zoningDistrict": "MU-4",
    "overlayDistricts": ["Arts Overlay"],
    "heightLimitFt": 50,
    "floodZone": null,
    "historicStatus": null,
    "ward": 1,
    "latitude": 38.9162,
    "longitude": -77.0377
  }
}
```

---

## 7. Backend Setup (`backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PermitFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers (built in later functions)
from routers import applications, findings, reviews, ai_engine
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(findings.router, prefix="/api/findings", tags=["findings"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(ai_engine.router, prefix="/api/ai", tags=["ai_engine"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "permitflow-api"}
```

---

## 8. Database Setup (`backend/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./permitflow.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

## 9. Seed Script (`backend/seed.py`)

Run once to load mock data into SQLite so the demo works immediately.

```python
"""Run: python seed.py"""
import json
from database import SessionLocal
from models import Application, Finding, DepartmentReview
from datetime import datetime

def seed():
    db = SessionLocal()
    
    # Load mock data
    with open("data/mock_application.json") as f:
        app_data = json.load(f)
    with open("data/mock_findings.json") as f:
        findings_data = json.load(f)
    
    # Create application
    app = Application(**app_data)
    db.merge(app)
    
    # Create department reviews
    for dept_id in ["building", "fire", "ada", "zoning"]:
        review = DepartmentReview(
            id=f"REV-{dept_id.upper()}-2026-0001",
            application_id=app_data["id"],
            department_id=dept_id,
            status="ai_complete",
        )
        db.merge(review)
    
    # Create findings
    for f_data in findings_data["findings"]:
        finding = Finding(
            **f_data,
            application_id=app_data["id"],
            reviewer_action="pending",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.merge(finding)
    
    db.commit()
    print("Seeded successfully.")

if __name__ == "__main__":
    seed()
```

---

## 10. Requirements (`backend/requirements.txt`)

```
fastapi==0.110.0
uvicorn==0.27.1
sqlalchemy==2.0.28
pydantic==2.6.3
anthropic==0.20.0
pymupdf==1.23.26
python-multipart==0.0.9
aiofiles==23.2.1
httpx==0.27.0
faiss-cpu==1.7.4
numpy==1.26.4
```

---

## 11. Next.js Base Config

`frontend/next.config.js`:
```js
/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};
```

`frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 12. Acceptance Criteria

- [ ] `npm run dev` starts frontend at localhost:3000 with no errors
- [ ] `uvicorn main:app --reload` starts API at localhost:8000 with no errors
- [ ] `GET /health` returns `{"status": "ok"}`
- [ ] `python seed.py` runs without error and creates `permitflow.db`
- [ ] All TypeScript types compile cleanly (`tsc --noEmit`)
- [ ] `DEPARTMENTS` constant has correct hex values for all 6 departments
- [ ] SQLite database has tables: `applications`, `findings`, `department_reviews`, `documents`
- [ ] Mock application `APP-2026-4471` is queryable from the database
- [ ] Mock findings JSON has at least 2 findings per department (building, fire, ada, zoning)
