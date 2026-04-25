# PermitFlow — Project Context

> Multi-agent AI review platform that compresses 9-month permit approvals into weeks by giving every government department a specialist AI reviewer working in parallel.

**Hackathon:** AI for Government, Washington DC — April 24, 2026
**Problem statement:** AI for Government (Tom Blomfield, YC RFS)
**Build window:** 4:30 PM – 10:30 PM (4 hours of build, 1 hour polish, 1 hour buffer)

---

## 1. The Problem

Building permit approval in the US takes 6–18 months. The bottleneck is not application complexity — it's the sequential, manual, departmental review process.

A typical permit passes through 6–12 government departments (Zoning, Building, Fire, ADA, Plumbing, Mechanical, Electrical, Health, Environmental, Historic Preservation, Public Works). Today, each department reviews the same packet *in series*, manually, against thousands of pages of code. A single cafe permit can sit on 8 different desks for weeks each.

Most rejections are for objective code violations (door clearances, occupancy loads, fire egress capacity) that should have been caught upfront. Each rejection adds another 4–8 week round trip.

The result: $260B/year in delayed construction, businesses that fail before opening, and government employees drowning in tedious review work.

## 2. The Insight

Permit review has three jobs:

- **40% completeness checking** — "are all required documents and signatures present?"
- **30% mechanical code checks** — "does the door schedule show 32" minimum clearance?"
- **20% cross-referencing** — "the floor plan shows a door, but the schedule doesn't list it"
- **10% judgment calls** — "this technically complies but creates a hazardous condition"

The first 90% is mechanical, deterministic, and codified in publicly available standards. AI can do this work reliably *today*. The remaining 10% requires human judgment and stays with the reviewer.

Government already organizes itself into specialist departments — Fire Marshal, Building Official, Zoning Administrator. Each department maps perfectly to one AI agent that's an expert in that department's code. We're not inventing a new structure; we're mirroring the org chart in software.

## 3. The Solution

PermitFlow is a multi-tenant platform with three coordinated experiences:

**Applicant side** — one portal to upload plans, track status across all departments, receive consolidated feedback, and resubmit.

**AI Review Engine** — runs once on submission. Parses all documents into a structured project model, spawns one specialist agent per department in parallel, each producing findings tagged with severity, code citation, page reference, and bounding box on the plan.

**Department portals** — separate logins per department (Fire, Building, ADA, Zoning, Health, etc.), each with its own color theme. Reviewers see only their findings, in a split-screen cockpit: PDF on the left with AI annotations highlighted, findings list on the right with Accept/Override/Comment actions, auto-drafted review letter at the bottom.

**Coordination layer** — manages inter-departmental dependencies, sends real-time updates to the applicant after each department reviews, consolidates outcomes when all departments finish, and routes resubmissions back through only the departments that flagged issues.

## 4. Core Innovation

Three things together, none of which exist in current GovTech (Tyler, Accela, OpenGov):

1. **Parallel review architecture.** Today's systems digitize sequential workflows. We make departments work concurrently against the same source.
2. **Specialist agents grounded in real codes.** Each agent is an expert in one code domain (IBC, IFC, NFPA 101, ADA 2010, ANSI A117.1, local amendments).
3. **Visual citation graph.** Every finding is linked to (a) the exact page and bounding box on the applicant's plans and (b) the exact code section that justifies the finding. Reviewers verify in seconds instead of cross-referencing for hours.

## 5. Architecture

### High-level system

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│  Applicant      │  PDF    │  AI Review       │  JSON   │  Department         │
│  Portal         │ ──────► │  Engine          │ ──────► │  Portals            │
│                 │         │  (multi-agent)   │         │  (Fire/Bldg/ADA/    │
│  Upload + Track │ ◄────── │                  │ ◄────── │   Zoning/Health)    │
└─────────────────┘ Status  └──────────────────┘ Reviews └─────────────────────┘
        ▲                            │                              │
        │                            ▼                              │
        │                   ┌──────────────────┐                    │
        └───────────────────│  Coordination    │◄───────────────────┘
            Notifications   │  Layer           │   Approvals/
                            │  - Status        │   Rejections
                            │  - Dependencies  │
                            │  - Notifications │
                            └──────────────────┘
```

### AI Review Engine pipeline

1. **Document ingestion** — applicant uploads architectural plans, MEP plans, structural plans, narratives, city forms.
2. **PDF decomposition** — extract text, identify drawing types, parse schedules, OCR where needed.
3. **Structured project model construction** — Claude reads each page and builds a JSON representation: spaces, doors, fixtures, occupancy class, areas, egress paths, MEP systems.
4. **Parcel data lookup** — geocode address, hit city GIS API, retrieve zoning, height limits, historic status, flood zone.
5. **Parallel agent dispatch** — orchestrator spawns one agent per relevant department, each receiving:
   - The structured project model
   - Relevant code chunks (RAG over IBC/IFC/ADA + local amendments)
   - Parcel-specific constraints
   - Department's checklist configuration
6. **Findings aggregation** — each agent returns structured findings; orchestrator deduplicates cross-department and tags inter-dependencies.
7. **Storage** — findings stored, indexed by department for portal filtering.

### Data model

```
JURISDICTIONS
  - id, name, gis_endpoint, adopted_codes[], amendments_doc_url

DEPARTMENTS
  - id, jurisdiction_id, name, color_theme, reviews[],
    relevant_codes[], dependencies[]

APPLICATIONS
  - id, applicant_id, jurisdiction_id, address, project_type,
    status (submitted/reviewing/approved/rejected/conditional),
    documents[], parcel_data, project_model

FINDINGS
  - id, application_id, department_id, severity (critical/warning/info/pass),
    code_citation, code_text, page_ref, bounding_box,
    description, suggested_fix, ai_confidence,
    reviewer_action (pending/accepted/overridden/rejected),
    reviewer_note, reviewer_id

DEPARTMENT_REVIEWS
  - id, application_id, department_id, status, reviewer_id,
    started_at, completed_at, decision, decision_note

NOTIFICATIONS
  - id, applicant_id, application_id, department_id, type, message, sent_at
```

## 6. The Universal Codes (what each agent knows)

These are real, published, widely adopted codes. Pre-loaded into the platform.

| Code | Publisher | What it covers |
|------|-----------|----------------|
| IBC 2021 | ICC | Building structure, occupancy, egress, construction types |
| IFC 2021 | ICC | Fire prevention, suppression, alarm systems |
| IPC 2021 | ICC | Plumbing fixtures, water, drainage |
| IMC 2021 | ICC | Mechanical/HVAC, ventilation |
| IECC 2021 | ICC | Energy conservation |
| NFPA 101 | NFPA | Life safety code |
| NFPA 70 | NFPA | National Electrical Code |
| NFPA 96 | NFPA | Commercial cooking ventilation (restaurant hoods) |
| ADA 2010 Standards | DOJ | Accessibility (federal, identical everywhere) |
| ANSI A117.1 | ANSI | Accessibility technical standard |
| FDA Food Code 2022 | FDA | Restaurant food safety |

Local amendments layer on top via per-jurisdiction RAG indexes.

## 7. Departments and Color Scheme

Each department has a dedicated color used throughout: portal accent, finding pins on the PDF, status badges, notifications, and the department-specific section of the consolidated review letter.

| Department | Color | Hex | Code Domain | Typical Issues |
|-----------|-------|-----|-------------|----------------|
| Fire | Red | `#DC2626` | IFC, NFPA 101, NFPA 96 | Egress capacity, fire suppression, hood systems |
| Building | Blue | `#2563EB` | IBC | Structural, occupancy, construction type |
| ADA / Accessibility | Green | `#059669` | ADA 2010, ANSI A117.1 | Door clearances, ramps, bathrooms, parking |
| Zoning / Planning | Purple | `#7C3AED` | Local zoning code + GIS | Use, height, setbacks, density |
| Health | Orange | `#EA580C` | FDA Food Code, local | Food safety, handwashing, equipment |
| MEP | Amber | `#D97706` | IPC, IMC, NFPA 70 | Plumbing, HVAC, electrical |

## 8. User Flows

### Applicant flow

1. Sign up, enter project address and type.
2. Upload application package (plans, narratives, forms).
3. AI runs — sees a real-time view of agents reviewing in parallel.
4. Receives consolidated AI pre-review report. Optionally fixes issues before formal submission.
5. Submits. Each department's reviewer receives the application with AI findings pre-loaded.
6. Receives status updates as each department completes review ("✅ Fire Department approved", "⚠️ ADA Department conditional — see comments").
7. When all departments complete: receives consolidated final decision.
8. If rejected: views all flagged issues organized by department, color-coded. Fixes issues. Re-uploads. Only modified portions re-trigger affected departments.
9. If approved: downloads permit certificate package.

### Department reviewer flow

1. Login to department-specific portal (e.g., `fire.permitflow.gov` or single login with department selector).
2. Dashboard shows pending applications relevant to this department, sorted by submission date and severity.
3. Click application → enter the **Reviewer Cockpit**:
   - **Left panel:** PDF viewer with AI-generated annotations as colored pins (department's color). Click any pin to zoom and highlight.
   - **Right panel:** Findings list, sorted by severity:
     - 🔴 Critical (must fix)
     - 🟡 Warning (AI uncertain — please verify)
     - 🟢 Pass (AI confirmed compliant)
   - For each finding: code citation, AI's reasoning, suggested fix, action buttons (Accept / Override / Comment / Add note).
   - **Bottom panel:** Auto-drafted review letter (this department's section only).
4. Reviewer accepts AI findings (one click each), overrides where AI is wrong, adds anything AI missed.
5. Final decision: Approve / Conditional / Reject for this department.
6. System sends update to applicant: "Fire Department reviewed your application — approved with 1 condition."

### Coordination flow (the orchestrator)

- Tracks per-department review status.
- Enforces dependencies: Zoning must reach a decision before others can finalize (a zoning rejection halts other departments).
- Sends real-time notifications to applicant on every department status change.
- When all departments complete: computes overall outcome.
  - All approve → final approval certificate.
  - Any reject → consolidated rejection with department-by-department breakdown.
  - Mix of approve/conditional → conditional approval with required modifications.
- On resubmission: diffs the new submission against the prior; only re-routes to departments whose findings were addressed.

## 9. Department Dependencies

Most departments review in parallel. Only one true sequential dependency exists:

- **Zoning is foundational.** If a building can't legally exist on the lot (wrong use, exceeds height, violates setback), no other review matters. Zoning rejection short-circuits the rest.

All other departments review concurrently. Conditional cross-references (e.g., Fire's egress calculation depends on Building's occupancy load determination) are surfaced in the UI as "linked findings" but do not block parallel review.

## 10. Pricing Model

**Two-sided revenue.**

**Applicant side:**
- $199/month subscription during active permit project, OR
- $299 flat per permit (unlimited re-runs for 90 days).
- Re-runs after fixing issues are free — we want iteration.

**Government side:**
- $50K–$250K/year SaaS contract per municipality, scaled to permit volume.
- Per-permit transaction fee model for high-volume cities.
- Pilot: free for 90 days, paid after demonstrated time savings.

**Wedge strategy:** Sell to applicants first (no procurement cycle, instant revenue, fast feedback). Once volume is meaningful in a city, sell the department dashboard upward to that city's government.

## 11. TAM / Business Case

- ~2 million building permits issued annually in the US.
- Average $5K–$50K cost per permit (fees + delays + expediters + carrying cost).
- ~19,000 US municipalities issue permits.
- Federal permitting reform has bipartisan support; state-level reform happening in CA, TX, FL, NY.

**TAM math:**
- Applicant side: 2M permits × $300 avg = **$600M/year**
- Government SaaS: 19,000 municipalities × $100K avg = **$1.9B/year**
- **Combined: $2.5B+ TAM** for building permits alone.

Adjacent expansion: business licenses, food service permits, liquor licenses, environmental permits, construction inspections — each its own multi-billion dollar adjacency.

## 12. Tonight's Demo

### Scope cuts (be ruthless)

- **One city:** Washington, DC (judges are local, DC opendata is excellent).
- **One permit type:** restaurant change-of-use (relatable, code-rich, photogenic).
- **Four departments:** Building (blue), Fire (red), ADA (green), Zoning (purple).
- **One real address** with real GIS data.
- **One sample plan PDF** (find on DC opendata or use a sample architectural plan).
- **5–6 specific code checks per agent** that we can guarantee work on the demo permit.

### Demo script (90 seconds)

> "I'm Maria. I'm a plan reviewer at DC's Department of Buildings. Today I have 12 applications on my desk, each takes me 4–6 hours. I'll be here all week.
>
> Let me open application #4471 — a restaurant on Main Street.
>
> [opens reviewer cockpit, blue Building Department theme]
>
> Our system already reviewed this. On the left is the actual plan PDF. On the right are the AI's findings. 27 checks passed. 3 issues flagged.
>
> Click here — AI says the bathroom door clear width is 28 inches. ADA requires 32. It's pulled up the exact sheet, exact detail, exact code section. I verify in 5 seconds. Accept.
>
> Next — fire extinguisher spacing exceeds 75 feet. IFC 906.1. Verify, accept.
>
> Third — AI flagged the occupancy load as uncertain. AI calculated 142, plans state 120. The AI is right — they didn't count the patio. Override the plans, accept the AI.
>
> Click Generate review letter. Drafted. Edit two sentences, send.
>
> 4 hours of work, done in 6 minutes.
>
> Now watch — [switches to Fire Department portal, red theme] this is the same application from the Fire Marshal's view. Different login, different findings, different code domain. They're reviewing in parallel right now, not after me.
>
> [switches to applicant view] And here's what the cafe owner sees — real-time updates as each department completes.
>
> Multiply this across 19,000 municipalities, 2 million permits a year. That's the company we're building."

### What makes judges remember you

- **The visual moment:** four department portals, four colors, four AI agents reviewing the same plan simultaneously. That image *is* the company.
- **The honest framing:** "we make reviewers superhuman" beats "we replace reviewers" both ethically and politically.
- **The TAM math:** $2.5B+ TAM, bipartisan tailwind, no incumbent doing this.
- **The wedge:** applicant-side revenue starts day one, no government procurement cycle required.

## 13. Build Plan (Hour by Hour)

### Hour 1 (4:30 – 5:30): Setup and data
- Pick the demo address in DC (use DC opendata to find a real recent restaurant permit).
- Download a sample architectural plan PDF (DC opendata or a free sample).
- Pull the relevant code chapters: IBC Ch 3 + Ch 10, IFC Ch 9, ADA Ch 4 + Ch 6, DC Zoning Code restaurant section.
- Stand up Next.js + FastAPI skeletons.
- Define the TypeScript types and data model.

### Hour 2 (5:30 – 6:30): Core engine
- Build the structured project model extractor (Claude reads PDF pages, returns structured JSON).
- Hardcode 5–6 specific checks per agent that will demonstrably trigger on the demo plan.
- Build the orchestrator: parallel dispatch, findings aggregation.
- Output structured JSON: `{department, severity, code_citation, page_ref, bbox, description, suggested_fix}`.

### Hour 3 (6:30 – 8:00): Department portals (the hero)
- Build the Reviewer Cockpit component (reusable across departments, themed by props).
- Split-screen: react-pdf or PDF.js viewer with overlay pins on the left, findings list on the right.
- Department theming (color-coded headers, pins, badges).
- Accept/Override/Comment actions.
- Auto-drafted review letter at the bottom.
- Quick department switcher (so judges can see all four).

### Hour 4 (8:00 – 9:30): Applicant portal + polish
- Applicant upload form, real-time progress view of agents working.
- Status dashboard showing each department's status.
- Consolidated final review view.
- "Today vs PermitFlow" timeline graphic.
- TAM math slide.
- Practice the demo five times.

### 9:30 – 10:30: Buffer + present
- Fix what breaks in dress rehearsal (something will).
- Final pitch run-through.

## 14. Tech Stack

- **Frontend:** Next.js 14, Tailwind CSS, shadcn/ui, react-pdf for PDF rendering with annotation overlay.
- **Backend:** FastAPI (Python) for orchestration and agent dispatch.
- **LLM:** Anthropic Claude API — parallel `messages.create` calls for agent dispatch.
- **PDF processing:** PyMuPDF for text and structure extraction; Claude vision for drawing interpretation.
- **Vector store:** In-memory FAISS for code chunks (don't waste time on Pinecone tonight).
- **GIS:** DC opendata REST API (free, no auth required).
- **Database:** SQLite for tonight (one file, no setup); design data model so PostgreSQL migration is trivial.
- **Deployment:** Vercel (frontend) + Railway/Render (backend) if there's time; localhost is fine for the demo.

## 15. Pitch Deck Talking Points

- **Hook:** "Building a cafe in DC takes 9 months. Watch us do the entire compliance review in 90 seconds."
- **Problem:** $260B/year lost to permitting delays. Government employees buried in 4-hour-per-permit manual reviews. Most rejections are for objective code issues that should never have been submitted.
- **Insight:** Permit review is 90% mechanical, 10% judgment. AI does the 90%. Humans focus on the 10%.
- **Solution:** Multi-agent platform mirroring the org chart — one specialist agent per department, all reviewing in parallel, with citations to exact code sections and exact pages.
- **Demo:** Live walkthrough of the four department cockpits + applicant view.
- **Why now:** LLMs finally good enough at code reasoning. Bipartisan permitting reform pressure. Federal mandate to modernize.
- **Wedge:** Applicants pay $199/mo for pre-screening. Once we have volume in a city, sell the department dashboard to the government.
- **TAM:** $2.5B+ in US building permits alone. Adjacent in business licenses, food service, environmental, construction inspections.
- **Why us:** [Your story — engineering + government domain interest + ability to ship in 4 hours.]
- **Ask:** Day-1 customers in DC. Pilots with 3 municipalities by end of summer.

## 16. Anticipated Q&A

**Q: Won't this miss things and cause buildings to fail?**
A: Final approval is always human. We're a co-pilot, not a replacement. Same legal category as expediter firms — a $2B existing industry.

**Q: Won't departments resist?**
A: We sell to applicants first. When clean applications start arriving, departments adopt to keep up. Stripe's playbook — sold to developers, not banks.

**Q: How do you handle code variation across cities?**
A: 95% of jurisdictions adopt the same model codes (IBC, IFC, ADA, NFPA). Local amendments are one PDF per city — we RAG-index them. Per-parcel rules come live from city GIS APIs.

**Q: Government procurement is brutal. How do you sell?**
A: Bottoms-up. Applicants pay first. Government buys later when our findings are already in their workflow.

**Q: What about the hard 10% of edge cases?**
A: Stays with humans. We're not replacing judgment — we're freeing reviewers to focus on it. Same pattern that worked for radiology AI and contract review AI.

**Q: How do you handle liability?**
A: We're a screening tool, not a system of record. Final decision is the licensed government reviewer. Errors and omissions insurance covers our role. This is the same legal posture as plan-check expediters.

## 17. Future Roadmap (post-hackathon)

- **Phase 1 (months 1–3):** DC pilot, applicant-side launch, $199/mo. Restaurants, retail, change-of-use only.
- **Phase 2 (months 3–6):** First city contract (DC, NYC, Austin, or San Francisco). Department dashboard. Three more permit types.
- **Phase 3 (months 6–12):** Five city contracts. Multi-state expansion. BIM ingestion. Integration with existing GovTech (Accela, Tyler).
- **Phase 4 (year 2):** Adjacent permits — business licenses, food service, liquor, environmental. Federal NEPA/CEQA workflows.
- **Phase 5 (year 3+):** Become the default infrastructure layer for permitting in America.
