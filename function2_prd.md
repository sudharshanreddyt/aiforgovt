# PRD — Function 2: AI Review Engine (Backend)

**Scope:** The FastAPI backend that ingests documents, builds the structured project model, and runs parallel specialist AI agents to produce findings. This is the core product intelligence.

**Build time estimate:** 60–75 minutes  
**Dependencies:** Function 1 (types, DB, mock data)

---

## 1. What to Build

Four FastAPI routers + the multi-agent orchestration engine:

1. `routers/applications.py` — CRUD for applications, file upload
2. `routers/ai_engine.py` — trigger review, stream progress
3. `routers/findings.py` — read findings, update reviewer actions
4. `routers/reviews.py` — read/update department reviews, submit decisions

And the agent system:
- `agents/orchestrator.py` — parallel dispatch
- `agents/building_agent.py`
- `agents/fire_agent.py`
- `agents/ada_agent.py`
- `agents/zoning_agent.py`

---

## 2. Applications Router (`routers/applications.py`)

### Endpoints

```
POST   /api/applications/                   Create new application
GET    /api/applications/{app_id}           Get application + all department reviews
GET    /api/applications/                   List applications (with optional dept filter)
POST   /api/applications/{app_id}/upload    Upload document file
GET    /api/applications/{app_id}/status    Get consolidated status summary
```

### POST /api/applications/

Request body:
```json
{
  "applicant_name": "Maria L. Chen",
  "applicant_email": "maria.chen@sunrisecafe.com",
  "address": "2247 18th St NW, Washington, DC 20009",
  "project_type": "restaurant_change_of_use",
  "project_description": "..."
}
```

Response: full Application object. Auto-generate ID in format `APP-{YEAR}-{4-digit-seq}`.

### POST /api/applications/{app_id}/upload

- Accept multipart/form-data with `file` and `document_type` fields
- Save file to `./uploads/{app_id}/{filename}`
- Create Document record in DB
- Return document object

### GET /api/applications/{app_id}/status

Returns:
```json
{
  "application_id": "APP-2026-4471",
  "overall_status": "dept_review",
  "department_statuses": [
    {
      "department_id": "building",
      "status": "under_review",
      "findings_count": { "critical": 1, "warning": 1, "info": 0, "pass": 2 },
      "reviewer_name": "James Okafor"
    },
    ...
  ],
  "submitted_at": "2026-04-24T14:30:00Z",
  "last_updated": "2026-04-24T16:05:00Z"
}
```

---

## 3. AI Engine Router (`routers/ai_engine.py`)

### Endpoints

```
POST   /api/ai/review/{app_id}             Trigger AI review (starts background task)
GET    /api/ai/review/{app_id}/progress    Get current agent progress (poll every 2s)
GET    /api/ai/review/{app_id}/results     Get completed findings (after complete)
```

### POST /api/ai/review/{app_id}

Triggers the orchestrator as a FastAPI background task. Returns immediately with:
```json
{
  "status": "started",
  "application_id": "APP-2026-4471",
  "departments": ["building", "fire", "ada", "zoning"],
  "estimated_duration_seconds": 90
}
```

**For the demo:** if the application is `APP-2026-4471`, skip the real AI call and immediately return the mock findings from the seed data. Add a 3-second artificial delay per agent to simulate running. This ensures the demo never fails.

```python
DEMO_MODE = True  # toggle in env

async def trigger_review(app_id: str, background_tasks: BackgroundTasks):
    if DEMO_MODE and app_id == "APP-2026-4471":
        background_tasks.add_task(simulate_demo_review, app_id)
    else:
        background_tasks.add_task(run_real_review, app_id)
```

### GET /api/ai/review/{app_id}/progress

Server-sent events (SSE) or polling endpoint. Returns:
```json
{
  "application_id": "APP-2026-4471",
  "overall_status": "running",
  "started_at": "2026-04-24T16:00:00Z",
  "elapsed_seconds": 47,
  "agents": [
    {
      "department_id": "zoning",
      "status": "complete",
      "checks_complete": 6,
      "checks_total": 6,
      "current_action": "Complete"
    },
    {
      "department_id": "building",
      "status": "running",
      "checks_complete": 4,
      "checks_total": 6,
      "current_action": "Analyzing occupant load calculations..."
    },
    {
      "department_id": "fire",
      "status": "running",
      "checks_complete": 3,
      "checks_total": 6,
      "current_action": "Checking fire suppression coverage..."
    },
    {
      "department_id": "ada",
      "status": "running",
      "checks_complete": 2,
      "checks_total": 6,
      "current_action": "Reading door schedule..."
    }
  ]
}
```

Store progress state in a simple in-memory dict keyed by app_id. Good enough for the demo.

---

## 4. Orchestrator (`agents/orchestrator.py`)

```python
import asyncio
import anthropic
from typing import List
from models import Finding, DepartmentReview
from database import SessionLocal

async def run_real_review(app_id: str):
    """
    1. Load application + documents from DB
    2. Build structured project model (Claude vision on PDF pages)
    3. Fetch parcel data from DC GIS
    4. Dispatch all agents in parallel via asyncio.gather
    5. Store findings
    6. Update application status
    """
    db = SessionLocal()
    
    # Step 1: Load application
    app = db.query(Application).filter(Application.id == app_id).first()
    
    # Step 2: Build project model
    project_model = await build_project_model(app, db)
    app.project_model = project_model
    
    # Step 3: Fetch parcel data (DC GIS)
    parcel = await fetch_dc_parcel_data(app.address)
    app.parcel_data = parcel
    
    app.status = "ai_reviewing"
    db.commit()
    
    # Step 4: Parallel agent dispatch
    update_progress(app_id, "running")
    
    results = await asyncio.gather(
        building_agent.run(app_id, project_model, parcel),
        fire_agent.run(app_id, project_model, parcel),
        ada_agent.run(app_id, project_model, parcel),
        zoning_agent.run(app_id, project_model, parcel),
    )
    
    # Step 5: Store all findings
    for dept_findings in results:
        for finding in dept_findings:
            db.add(Finding(**finding))
    
    app.status = "dept_review"
    db.commit()
    update_progress(app_id, "complete")
```

### `build_project_model` function

```python
async def build_project_model(app, db) -> dict:
    """
    Uses Claude to read the uploaded PDF pages and extract structured data.
    Returns a ProjectModel dict.
    """
    client = anthropic.Anthropic()
    
    # Load PDF bytes
    # For demo: load the sample plan PDF from disk
    
    prompt = """
    You are a plan review AI. Read these architectural plan pages and extract a structured JSON project model.
    
    Return ONLY valid JSON with this exact structure:
    {
      "occupancy_class": "A-2",
      "construction_type": "VB",
      "total_area_sq_ft": 2800,
      "floors": 1,
      "occupant_load": 120,
      "spaces": [
        {"id": "SP-01", "name": "Dining Room", "area_sq_ft": 1200, "occupancy_class": "A-2", "occupant_load": 80, "sheet_ref": "A1"}
      ],
      "doors": [
        {"id": "D-07", "location": "Women's Restroom", "clear_width_inches": 28, "swing_direction": "inswing", "is_exit_door": false, "is_accessible_route": true, "sheet_ref": "A3"}
      ],
      "egress_paths": [...],
      "plumbing_fixtures": [...]
    }
    """
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    import json
    return json.loads(response.content[0].text)
```

---

## 5. Agent Template (each agent follows this pattern)

All agents share the same interface. Example: `agents/ada_agent.py`

```python
import anthropic
import json
from typing import List, Dict

AGENT_SYSTEM_PROMPT = """
You are the ADA Accessibility Review Agent for PermitFlow.

Your job is to review architectural plans against:
- ADA 2010 Standards for Accessible Design (U.S. Department of Justice)
- ANSI A117.1-2017 Accessibility Standard
- DC Accessibility Code amendments

You are reviewing a restaurant change-of-use application in Washington, DC.

For EVERY check you perform, return a structured finding with:
- severity: "critical" | "warning" | "info" | "pass"
- title: Short descriptive title (max 60 chars)
- description: What you found and why it is/isn't compliant (2-3 sentences)
- code_authority: The code document (e.g., "ADA 2010 Standards")
- code_citation: The specific section (e.g., "§ 404.2.3")
- code_text: Verbatim quoted text from the code section (1-2 sentences)
- page_ref: Where in the plans you found this (e.g., "Sheet A3")
- suggested_fix: Specific corrective action (for critical/warning only)
- ai_confidence: "high" | "medium" | "low"

Return ONLY a JSON array of findings. No preamble. No markdown.
"""

ADA_CHECKS = [
    "Accessible route from parking to main entrance (§ 206.2.1)",
    "Entry door clear width minimum 32 inches (§ 404.2.3)",
    "Restroom door clear width (§ 404.2.3)",
    "Accessible parking space count and dimensions (§ 208.2)",
    "Service counter accessible portion height max 36 inches (§ 904.4.1)",
    "Restroom turning radius 60 inches minimum (§ 603.2.1)",
]

async def run(app_id: str, project_model: dict, parcel_data: dict) -> List[Dict]:
    client = anthropic.Anthropic()
    
    user_prompt = f"""
    PROJECT MODEL:
    {json.dumps(project_model, indent=2)}
    
    PARCEL DATA:
    {json.dumps(parcel_data, indent=2)}
    
    CHECKS TO PERFORM:
    {chr(10).join(f"- {c}" for c in ADA_CHECKS)}
    
    Review the project model against each check. For each check, produce one finding
    (pass if compliant, critical/warning/info if not).
    
    Return a JSON array of findings.
    """
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=3000,
        system=AGENT_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}]
    )
    
    findings = json.loads(response.content[0].text)
    
    # Add metadata
    for i, f in enumerate(findings):
        f["id"] = f"FND-ADA-{str(i+1).zfill(3)}"
        f["application_id"] = app_id
        f["department_id"] = "ada"
        f["reviewer_action"] = "pending"
    
    return findings
```

### Building Agent Checks
```python
BUILDING_CHECKS = [
    "Occupancy classification correct for restaurant use (IBC Ch 3)",
    "Occupant load calculation per IBC Table 1004.5",
    "Egress capacity: required exit width vs. provided (IBC § 1005.1)",
    "Travel distance to nearest exit max 250 ft for A-2 sprinklered (IBC § 1017.2)",
    "Construction type permitted for occupancy and area (IBC Table 503)",
    "Means of egress — minimum 2 exits for > 49 occupants (IBC § 1006.3)",
]
```

### Fire Agent Checks
```python
FIRE_CHECKS = [
    "Fire extinguisher coverage — travel distance max 75 ft Class A (IFC § 906.1)",
    "Type I hood fire suppression system required (NFPA 96 § 10.1)",
    "Exit signage at all exit doors and within 100 ft travel (IFC § 1013.1)",
    "Sprinkler system required for A-2 occupancy > 100 persons (IFC § 903.2.1.2)",
    "Egress lighting required at exits and exit access (IFC § 1008.1)",
    "Fire alarm system — occupant notification required (IFC § 907.2.1)",
]
```

### Zoning Agent Checks
```python
ZONING_CHECKS = [
    "Use permitted in zone district matter-of-right (DC DCMR Title 11)",
    "Gross floor area within zone allowance",
    "Height of proposed work within zone height limit",
    "Outdoor seating on public space — separate DDOT permit required",
    "Historic overlay review required if applicable",
    "Parking requirements — restaurant use minimum spaces (DC Zoning § 2001)",
]
```

---

## 6. DC GIS Parcel Lookup (`agents/gis.py`)

```python
import httpx

DC_GIS_BASE = "https://maps2.dcgis.dc.gov/dcgis/rest/services"

async def fetch_dc_parcel_data(address: str) -> dict:
    """
    1. Geocode address using DC's geocoder
    2. Pull zoning from DC GIS
    3. Pull parcel SSL from DC GIS
    Returns ParcelData dict.
    """
    
    # Step 1: Geocode
    geocode_url = "https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2"
    
    async with httpx.AsyncClient() as client:
        resp = await client.get(geocode_url, params={"str": address, "f": "json"})
        geo = resp.json()
    
    # For demo: return hardcoded parcel data if address matches demo address
    if "2247 18th" in address:
        return {
            "address": "2247 18th St NW, Washington, DC 20009",
            "ssl": "2563-0058",
            "zoning_district": "MU-4",
            "overlay_districts": ["Arts Overlay"],
            "height_limit_ft": 50,
            "flood_zone": None,
            "historic_status": None,
            "ward": 1,
            "latitude": 38.9162,
            "longitude": -77.0377,
        }
    
    # Real lookup logic here...
    return {}
```

---

## 7. Findings Router (`routers/findings.py`)

### Endpoints

```
GET    /api/findings/{app_id}                Get all findings for application
GET    /api/findings/{app_id}/{dept_id}      Get findings for one department
PATCH  /api/findings/{finding_id}/action     Update reviewer action on a finding
```

### PATCH /api/findings/{finding_id}/action

Request:
```json
{
  "reviewer_action": "accepted",
  "reviewer_note": "Verified on Sheet A3 — door D-07 is indeed 28\" clear.",
  "reviewer_id": "REV-BLDG-001"
}
```

Response: updated Finding object.

---

## 8. Reviews Router (`routers/reviews.py`)

### Endpoints

```
GET    /api/reviews/{app_id}                 Get all department reviews
GET    /api/reviews/{app_id}/{dept_id}       Get single department review
PATCH  /api/reviews/{review_id}/decision     Submit department decision
POST   /api/reviews/{review_id}/letter       Generate review letter draft
```

### PATCH /api/reviews/{review_id}/decision

Request:
```json
{
  "decision": "conditional",
  "decision_note": "Application approved with conditions. Applicant must resolve 2 critical findings before permit issuance.",
  "reviewer_id": "REV-BLDG-001"
}
```

### POST /api/reviews/{review_id}/letter

Calls Claude to generate a formal government review letter based on the findings:

```python
async def generate_review_letter(review_id: str) -> str:
    client = anthropic.Anthropic()
    
    # Load review + findings
    ...
    
    prompt = f"""
    Generate an official government plan review letter for the following review.
    
    Department: {dept_config['name']}
    Application: {app.id}
    Address: {app.address}
    Date: {datetime.now().strftime('%B %d, %Y')}
    Decision: {review.decision}
    
    Findings:
    {json.dumps(findings, indent=2)}
    
    Write a formal letter in the style of a DC government department.
    Include:
    1. Official letterhead section (text only)
    2. Greeting and reference line
    3. Summary of review
    4. For each critical/warning finding: numbered list with code citation and required correction
    5. Department's decision statement
    6. Next steps for applicant
    7. Reviewer signature block
    
    Use formal government language. Be specific about code citations.
    """
    
    response = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text
```

---

## 9. Demo Simulation (`agents/demo_simulator.py`)

This is critical for the hackathon demo. When `DEMO_MODE=True`, skip real AI and simulate agents running with realistic timing.

```python
import asyncio

AGENT_SCRIPTS = {
    "zoning": [
        (3, "Geocoding address against DC GIS..."),
        (5, "Checking use classification in MU-4 zone..."),
        (4, "Reviewing height and setback compliance..."),
        (3, "Checking outdoor seating public space requirements..."),
        (2, "Complete"),
    ],
    "building": [
        (4, "Parsing architectural plans..."),
        (5, "Calculating occupant load per IBC Table 1004.5..."),
        (6, "Checking egress capacity and travel distances..."),
        (4, "Verifying construction type classification..."),
        (3, "Complete"),
    ],
    "fire": [
        (4, "Reading fire protection plans..."),
        (5, "Checking fire extinguisher coverage areas..."),
        (5, "Reviewing kitchen hood suppression requirements..."),
        (4, "Verifying exit signage locations..."),
        (3, "Complete"),
    ],
    "ada": [
        (5, "Reading door schedule on Sheet A7..."),
        (6, "Measuring door clear widths against ADA § 404.2.3..."),
        (4, "Checking accessible parking count..."),
        (5, "Reviewing service counter heights..."),
        (3, "Complete"),
    ],
}

PROGRESS_STORE: dict = {}  # app_id -> progress dict

async def simulate_demo_review(app_id: str):
    """
    Simulate all 4 agents running in parallel with realistic status messages.
    Uses pre-seeded mock findings — no real AI calls.
    """
    PROGRESS_STORE[app_id] = {
        "status": "running",
        "agents": {
            dept: {"status": "running", "checks_complete": 0, 
                   "checks_total": len(steps), "current_action": steps[0][1]}
            for dept, steps in AGENT_SCRIPTS.items()
        }
    }
    
    async def run_agent(dept_id: str, steps: list):
        for i, (delay, message) in enumerate(steps):
            await asyncio.sleep(delay)
            is_last = (i == len(steps) - 1)
            PROGRESS_STORE[app_id]["agents"][dept_id] = {
                "status": "complete" if is_last else "running",
                "checks_complete": i + 1,
                "checks_total": len(steps),
                "current_action": message,
            }
    
    await asyncio.gather(
        *[run_agent(dept, steps) for dept, steps in AGENT_SCRIPTS.items()]
    )
    
    PROGRESS_STORE[app_id]["status"] = "complete"
```

---

## 10. Acceptance Criteria

- [ ] `POST /api/ai/review/APP-2026-4471` returns `{"status": "started"}` in < 100ms
- [ ] `GET /api/ai/review/APP-2026-4471/progress` returns all 4 agent statuses
- [ ] After ~30 seconds, all agents show `"status": "complete"` 
- [ ] `GET /api/findings/APP-2026-4471` returns all mock findings from seed data
- [ ] `GET /api/findings/APP-2026-4471/ada` returns only ADA findings
- [ ] `PATCH /api/findings/FND-ADA-001/action` with `{"reviewer_action": "accepted"}` updates the DB
- [ ] `POST /api/reviews/REV-ADA-2026-0001/letter` returns a formatted government letter string
- [ ] All endpoints return correct HTTP status codes (200, 201, 404, 422)
- [ ] CORS allows requests from localhost:3000
- [ ] Demo mode is on by default (`DEMO_MODE=True` in config)
