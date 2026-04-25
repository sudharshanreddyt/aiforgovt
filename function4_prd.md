# PRD — Function 4: Applicant Portal

**Scope:** The applicant-facing side. Upload form, live AI review console, real-time department status dashboard, and consolidated findings view.

**Build time estimate:** 45–60 minutes  
**Dependencies:** Function 1 (types), Function 2 (AI engine API)

---

## 1. What to Build

Two main views:

1. **`/applicant`** — Landing + upload form (new submission)
2. **`/applicant/[appId]`** — Application status dashboard (track existing)

---

## 2. Applicant Landing Page (`/applicant`)

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ MASTHEAD — NAVY                                                              │
│ PermitFlow · District of Columbia — Department of Buildings                 │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PERMITFLOW — BUILDING PERMIT PRE-SCREENING SERVICE                         │
│  District of Columbia · Fiscal Year 2026                                    │
│  ─────────────────────────────────────────────────                          │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ NEW PERMIT APPLICATION                                               │   │
│  │                                                                      │   │
│  │ PROJECT ADDRESS                                                      │   │
│  │ [______________________________________________]                    │   │
│  │                                                                      │   │
│  │ PROJECT TYPE                                                         │   │
│  │ [Restaurant Change of Use                    ▼]                     │   │
│  │                                                                      │   │
│  │ PROJECT DESCRIPTION                                                  │   │
│  │ [______________________________________________]                    │   │
│  │ [______________________________________________]                    │   │
│  │                                                                      │   │
│  │ APPLICANT NAME                APPLICANT EMAIL                        │   │
│  │ [________________]            [________________________]            │   │
│  │                                                                      │   │
│  │ ─── UPLOAD DOCUMENTS ──────────────────────────────────────────── │   │
│  │                                                                      │   │
│  │ [+ ADD ARCHITECTURAL PLANS]  ← drag-and-drop zone                  │   │
│  │ [+ ADD MEP PLANS]                                                   │   │
│  │ [+ ADD NARRATIVE / OTHER]                                           │   │
│  │                                                                      │   │
│  │ Accepted formats: PDF only. Max 50MB per file.                      │   │
│  │                                                                      │   │
│  │ [        SUBMIT FOR AI PRE-SCREENING        ]  ← primary button    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Have an existing application?  [ENTER APPLICATION NUMBER →]                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Design Notes

- Background: `--color-surface` (#F2F4F6)
- Main form: white background, 1px border `--color-rule`
- "NEW PERMIT APPLICATION" header: navy background, white text, 14px uppercase
- Upload zones: dashed border 1px `--color-rule`, `--color-surface` background, hover state darkens border
- Submit button: full-width in the form, navy background, white uppercase text, 2px border-radius
- "Have an existing application?" — plain text + button link, right-aligned or below form

### File Upload Zones

Each upload zone:
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ARCHITECTURAL PLANS (REQUIRED)                         │
│  Drag PDF files here or click to browse                 │
│                                                         │
│  No file selected                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

When file is attached:
```
┌─────────────────────────────────────────────────────────┐
│ architectural_plans_v3.pdf          [REMOVE]            │
│ 4.2 MB · 24 pages                                       │
└─────────────────────────────────────────────────────────┘
```

### Demo Shortcut

Add a "LOAD DEMO APPLICATION" button below the form that:
1. Pre-fills all fields with Maria Chen's demo data
2. Marks the demo PDF as attached
3. Enables submit

This is for the hackathon demo so the judge can see the flow without manually typing.

```tsx
const loadDemoData = () => {
  setAddress('2247 18th St NW, Washington, DC 20009');
  setProjectType('restaurant_change_of_use');
  setDescription('Change of use from retail (Group M) to restaurant (Group A-2). Interior renovation of 2,800 sf.');
  setApplicantName('Maria L. Chen');
  setApplicantEmail('maria.chen@sunrisecafe.com');
  setDemoFileAttached(true);
};
```

### On Submit

1. `POST /api/applications/` to create application
2. `POST /api/applications/{appId}/upload` for each file
3. Redirect to `/applicant/{appId}`

---

## 3. Application Status Dashboard (`/applicant/[appId]`)

This is what the applicant sees while review is running and after it completes.

### Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ MASTHEAD — NAVY                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  APPLICATION APP-2026-4471                      [UNDER DEPARTMENTAL REVIEW] │
│  2247 18th St NW, Washington DC 20009                                       │
│  Restaurant Change of Use · Submitted Apr 24, 2026                          │
│  ──────────────────────────────────────────────────────────────────────────│
│                                                                              │
│  ┌─ AI REVIEW ENGINE ───────────────────────────────────────────────────┐   │
│  │ (shown when status is ai_reviewing — the "wow" console moment)       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─ DEPARTMENT REVIEW STATUS ───────────────────────────────────────────┐   │
│  │                                                                      │   │
│  │  ZONING          [▓▓▓▓▓▓▓▓▓▓▓▓] APPROVED     Apr 24 · 2:14 PM     │   │
│  │  BUILDING        [▓▓▓▓▓▓▓▓▓░░░] UNDER REVIEW  —                    │   │
│  │  FIRE            [▓▓▓▓▓▓░░░░░░] UNDER REVIEW  —                    │   │
│  │  ADA             [▓▓▓░░░░░░░░░] IN QUEUE       —                    │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─ FINDINGS OVERVIEW ──────────────────┐  ┌─ SUBMITTED DOCUMENTS ──────┐  │
│  │                                      │  │                            │  │
│  │  CRITICAL   WARNING   INFO   PASS    │  │  architectural_plans.pdf   │  │
│  │     3          3       1      8      │  │  24 pages · 4.2 MB         │  │
│  │                                      │  │                            │  │
│  │  [VIEW FULL FINDINGS REPORT]         │  │  [VIEW FILE]               │  │
│  └──────────────────────────────────────┘  └────────────────────────────┘  │
│                                                                              │
│  ┌─ ACTIVITY LOG ───────────────────────────────────────────────────────┐   │
│  │ APR 24, 2026 — 2:14 PM   Zoning Administration — APPROVED           │   │
│  │ APR 24, 2026 — 2:08 PM   AI Review Engine — All 4 agents complete   │   │
│  │ APR 24, 2026 — 1:31 PM   Application APP-2026-4471 submitted         │   │
│  │ APR 24, 2026 — 1:30 PM   Documents uploaded (1 file)                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. AI Review Console Component (`components/ui/AgentConsole.tsx`)

The most visually compelling part of the applicant view. Shows all 4 agents running in real time.

```
┌─ AI REVIEW ENGINE — RUNNING ────────────────────────────────────────────────┐
│                                                                              │
│  All four specialist agents are reviewing your application in parallel.     │
│                                                                              │
│  ZONING AGENT      [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 6/6   COMPLETE                  │
│  BUILDING AGENT    [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░] 4/6   Analyzing occupant load... │
│  FIRE AGENT        [▓▓▓▓▓▓▓▓░░░░░░░░░░░░] 3/6   Checking suppression sys...│
│  ADA AGENT         [▓▓▓▓░░░░░░░░░░░░░░░░] 2/6   Reading door schedule...   │
│                                                                              │
│  ELAPSED: 00:00:47                    ESTIMATED COMPLETION: 00:01:15        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Visual spec:
- Background: `#0D2340` (navy) — terminal/console aesthetic
- Text: white / light gray
- Progress bars: 8px height, no border-radius, colored per department
- Department name: uppercase, monospace, 13px
- Status message: 12px, white/70 opacity, truncated with ellipsis
- "COMPLETE" status: green text
- Elapsed / estimated: monospace, positioned at bottom
- Update via polling `GET /api/ai/review/{appId}/progress` every 2 seconds

```tsx
// Polling hook
useEffect(() => {
  if (appStatus !== 'ai_reviewing') return;
  
  const interval = setInterval(async () => {
    const res = await fetch(`/api/ai/review/${appId}/progress`);
    const progress = await res.json();
    setAgentProgress(progress);
    
    if (progress.overall_status === 'complete') {
      clearInterval(interval);
      setAppStatus('dept_review');
      refetchFindings();
    }
  }, 2000);
  
  return () => clearInterval(interval);
}, [appStatus, appId]);
```

When complete, console animates to:
```
┌─ AI REVIEW ENGINE — COMPLETE ────────────────────────────────────────────────┐
│                                                                              │
│  Review complete. 4 specialist agents reviewed 6 checks each.               │
│                                                                              │
│  ZONING AGENT      ████████████████████  COMPLETE — 6 checks               │
│  BUILDING AGENT    ████████████████████  COMPLETE — 6 checks               │
│  FIRE AGENT        ████████████████████  COMPLETE — 6 checks               │
│  ADA AGENT         ████████████████████  COMPLETE — 6 checks               │
│                                                                              │
│  Total time: 01:23   Your application has been forwarded to all departments.│
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Department Status Table Component

```tsx
interface DeptStatusRow {
  departmentId: DepartmentId;
  status: DepartmentReviewStatus;
  findingsCounts: { critical: number; warning: number; info: number; pass: number };
  completedAt: string | null;
  reviewerName: string | null;
}
```

Visual:
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DEPARTMENT           STATUS               FINDINGS        COMPLETED         │
├─────────────────────────────────────────────────────────────────────────────┤
│ ■ Zoning Admn.       [APPROVED]           0C / 0W / 6P   Apr 24 · 2:14 PM  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ■ Building Dept.     [UNDER REVIEW]       1C / 1W / 4P   —                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ ■ Fire Marshal       [UNDER REVIEW]       2C / 1W / 3P   —                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ ■ Accessibility      [IN QUEUE]           2C / 1W / 3P   —                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Left colored square: 12x12px dept primary color
- Status badge: from design system
- Findings: "1C / 1W / 4P" format (C=Critical, W=Warning, P=Pass), colored text
- Rows are not clickable for the applicant (reviewers have separate login)

---

## 6. Findings Overview Panel

```
┌─ FINDINGS OVERVIEW ──────────────────────────────────────────────────────────┐
│                                                                              │
│  CRITICAL     WARNING      INFO       PASS                                  │
│  ───────────  ──────────   ────────   ──────                                │
│     3            3           1          8                                   │
│                                                                              │
│  3 issues require your attention before the permit can be issued.           │
│                                                                              │
│  [VIEW FULL AI FINDINGS REPORT]                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

"VIEW FULL AI FINDINGS REPORT" → opens a modal with all findings grouped by department.

### Findings Modal

A full-page modal overlay with all findings, organized by department tabs.

Each department section:
```
─── FIRE MARSHAL — 2 CRITICAL, 1 WARNING ──────────────────────────────────────

[CRITICAL]  Fire Extinguisher Travel Distance Exceeds Maximum
            Extinguisher FE-1 is the only extinguisher shown. Travel distance...
            IFC 2021 § 906.1 | Sheet E1

[WARNING]   Kitchen Hood Suppression System Not Detailed
            Plans show Type I hood but no suppression system detail...
            NFPA 96 § 10.1 | Sheet M2
```

---

## 7. Activity Log Component

```tsx
interface ActivityEvent {
  timestamp: string;
  departmentId?: DepartmentId;
  eventType: 'submitted' | 'uploaded' | 'ai_complete' | 'dept_approved' | 'dept_conditional' | 'dept_rejected' | 'all_complete';
  message: string;
}
```

Hardcoded for demo. Newest first. Monospace timestamp.

```
APR 24, 2026 — 16:14   Zoning Administration — Application approved with no conditions.
APR 24, 2026 — 16:08   AI Review Engine — Pre-screening complete. 15 findings across 4 departments.
APR 24, 2026 — 15:31   Application APP-2026-4471 submitted for review.
APR 24, 2026 — 15:30   Documents uploaded: architectural_plans_v3.pdf (24 pages)
```

Left border: colored by department (navy for system events, dept color for dept events).

---

## 8. Application Cover Header

At the top of the status page, a formal application header strip (matches the government form aesthetic):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PERMITFLOW · DISTRICT OF COLUMBIA · DCRA                                   │
│  ─────────────────────────────────────────────────────────────────────────  │
│  APPLICATION    PROJECT TYPE          SUBMITTED         STATUS               │
│  APP-2026-4471  CHANGE OF USE         APR 24, 2026     [UNDER REVIEW]        │
│  ─────────────────────────────────────────────────────────────────────────  │
│  ADDRESS: 2247 18th St NW, Washington, DC 20009                             │
│  APPLICANT: Maria L. Chen · maria.chen@sunrisecafe.com                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Demo Flow

For the judge demo, the applicant page for `APP-2026-4471` should immediately show:
- The AI console in "complete" state (or replay the animation from the start)
- Zoning APPROVED, others UNDER REVIEW
- Correct finding counts

Add a "REPLAY AI REVIEW ANIMATION" button (small, text-only) that resets the console and re-runs the 30-second simulation. This is the "wow moment" opener of the demo.

---

## 10. Files to Create

```
frontend/app/applicant/page.tsx                    ← upload form
frontend/app/applicant/[appId]/page.tsx            ← status dashboard
frontend/components/ui/AgentConsole.tsx            ← the terminal console
frontend/components/ui/DeptStatusTable.tsx
frontend/components/ui/FindingsOverview.tsx
frontend/components/ui/FindingsModal.tsx
frontend/components/ui/ActivityLog.tsx
frontend/components/ui/FileUploadZone.tsx
```

---

## 11. Acceptance Criteria

- [ ] `/applicant` loads an upload form with government styling
- [ ] "LOAD DEMO APPLICATION" button pre-fills all form fields
- [ ] File upload zone accepts PDFs and shows filename on attach
- [ ] On submit, redirects to `/applicant/APP-2026-4471`
- [ ] `/applicant/APP-2026-4471` loads without error
- [ ] Application header shows correct ID, address, status badge
- [ ] AI console shows 4 department agents with animated progress bars
- [ ] Console turns navy (terminal aesthetic)
- [ ] Department status table shows 4 departments with correct colors
- [ ] Zoning row shows APPROVED status
- [ ] Findings overview shows correct counts (3 critical, 3 warning, 1 info, 8 pass)
- [ ] Activity log shows 4 events newest-first
- [ ] "VIEW FULL AI FINDINGS REPORT" opens modal with findings grouped by department
- [ ] "REPLAY AI REVIEW ANIMATION" resets and replays the console
- [ ] No emojis anywhere
- [ ] Mobile view shows simplified status list (at 375px)
