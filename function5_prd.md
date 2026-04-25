# PRD — Function 5: Coordination Layer, Review Letter & Demo Polish

**Scope:** Department queue dashboard, overall coordination status logic, auto-drafted review letter generation, "Today vs PermitFlow" visual, and all final demo polish to make it judge-ready.

**Build time estimate:** 40–50 minutes  
**Dependencies:** Functions 1–4

---

## 1. What to Build

1. **Department Queue Dashboard** — The landing page when a reviewer logs in (`/review/[department]`)
2. **Coordination Logic** — Status transitions, Zoning dependency, consolidated outcome
3. **Review Letter Generation** — Full auto-draft with typewriter streaming
4. **"Today vs PermitFlow" Impact Graphic** — The pitch visual
5. **Demo Navigation Page** — Quick links to all views for the demo
6. **Final polish** — Loading states, error boundaries, 404 handling

---

## 2. Department Queue Dashboard (`/review/[department]`)

The landing page for a reviewer. Shows their application queue.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ MASTHEAD — Fire Marshal — Washington, DC                                    │
├──████████████████████ (red stripe) ████████████████████████████████████████┤
├──────────┬───────────────────────────────────────────────────────────────────┤
│ SIDEBAR  │                                                                  │
│          │  REVIEW QUEUE — FIRE MARSHAL                                     │
│          │  12 applications pending · 3 high priority                      │
│          │                                                                  │
│          │  ┌──────────────────────────────────────────────────────────┐   │
│          │  │ SORT BY: [Submission Date ▼]  FILTER: [All Status ▼]    │   │
│          │  └──────────────────────────────────────────────────────────┘   │
│          │                                                                  │
│          │  APPLICATION    ADDRESS                TYPE        STATUS        │
│          │  ─────────────────────────────────────────────────────────────  │
│          │  APP-2026-4471  2247 18th St NW        Ch. of Use  AI COMPLETE  │
│          │  APP-2026-4468  1420 K St NW           New Constr  AI COMPLETE  │
│          │  APP-2026-4460  815 Vermont Ave NW     Renovation  IN QUEUE     │
│          │  APP-2026-4455  3100 14th St NW        Ch. of Use  IN QUEUE     │
│          │  ...                                                             │
└──────────┴───────────────────────────────────────────────────────────────────┘
```

### Queue Table

Columns: Application No. | Address | Project Type | AI Findings (C/W/P) | Status | Submitted

```
APP-2026-4471  2247 18th St NW      Change of Use  2C / 1W / 3P  [AI COMPLETE]  Apr 24
APP-2026-4468  1420 K St NW         New Constr.    0C / 2W / 8P  [AI COMPLETE]  Apr 23
```

- "AI COMPLETE" badge → reviewer should open and action
- Clicking any row → goes to `/review/{department}/{appId}`
- "AI COMPLETE" rows should have a subtle dept color left border or highlight to draw attention

For the demo, only `APP-2026-4471` is real. The other rows are fake display-only data to show realism.

### Mock Queue Data (hardcoded for demo)

```tsx
const MOCK_QUEUE = [
  { id: 'APP-2026-4471', address: '2247 18th St NW', type: 'Change of Use', status: 'ai_complete', findings: '2C / 1W / 3P', submitted: 'Apr 24' },
  { id: 'APP-2026-4468', address: '1420 K St NW', type: 'New Construction', status: 'ai_complete', findings: '0C / 2W / 8P', submitted: 'Apr 23' },
  { id: 'APP-2026-4460', address: '815 Vermont Ave NW', type: 'Renovation', status: 'in_queue', findings: '—', submitted: 'Apr 22' },
  { id: 'APP-2026-4455', address: '3100 14th St NW', type: 'Change of Use', status: 'in_queue', findings: '—', submitted: 'Apr 21' },
  { id: 'APP-2026-4447', address: '1701 Penn Ave NW', type: 'Addition', status: 'in_queue', findings: '—', submitted: 'Apr 20' },
];
```

---

## 3. Coordination Status Logic (Frontend)

### Status Computation

The overall application status is derived from department statuses:

```typescript
function computeOverallStatus(reviews: DepartmentReview[]): ApplicationStatus {
  const statuses = reviews.map(r => r.status);
  
  // Zoning gate: if zoning rejected, whole application is rejected
  const zoningReview = reviews.find(r => r.departmentId === 'zoning');
  if (zoningReview?.decision === 'rejected') return 'rejected';
  
  // All approved → approved
  if (reviews.every(r => r.decision === 'approved')) return 'approved';
  
  // Any rejected → rejected
  if (reviews.some(r => r.decision === 'rejected')) return 'rejected';
  
  // Mix of approved/conditional → conditional
  if (reviews.every(r => r.decision !== null) && reviews.some(r => r.decision === 'conditional')) {
    return 'conditional';
  }
  
  // All AI complete, awaiting reviewer action
  if (reviews.every(r => ['ai_complete', 'under_review', 'approved', 'conditional', 'rejected'].includes(r.status))) {
    return 'dept_review';
  }
  
  return 'ai_reviewing';
}
```

### Department Progress Calculation

For the status table progress bar:

```typescript
function getDeptProgress(status: DepartmentReviewStatus): number {
  const map: Record<DepartmentReviewStatus, number> = {
    not_started: 0,
    in_queue: 10,
    ai_complete: 60,
    reviewer_assigned: 70,
    under_review: 80,
    approved: 100,
    conditional: 100,
    rejected: 100,
  };
  return map[status];
}
```

---

## 4. Review Letter Generation (Full Spec)

### Backend: `POST /api/reviews/{reviewId}/letter`

```python
LETTER_PROMPT = """
You are generating an official government plan review letter for the {dept_name}, 
District of Columbia.

Write a formal, authoritative letter with this exact structure:

1. LETTERHEAD (text-based):
   DISTRICT OF COLUMBIA
   {dept_jurisdiction}
   
2. CASE INFO TABLE:
   DATE:     {date}
   CASE NO.: {app_id}
   RE:       Plan Review — {project_type}
   ADDRESS:  {address}
   
3. SALUTATION: "Dear {applicant_name},"

4. OPENING: 1-2 sentences summarizing that this is the official review 
   and the decision.
   
5. FINDINGS: Numbered list of only critical/warning findings. Each item:
   a. Finding title
   b. Code citation
   c. What the plans show
   d. What is required
   e. Required corrective action

6. DECISION STATEMENT: Formal statement of department's decision 
   (Approved / Conditional Approval / Rejected).

7. NEXT STEPS: 2-3 sentences on what applicant must do.

8. SIGNATURE BLOCK:
   Sincerely,
   [Reviewer Name]
   [Title]
   {dept_name}
   {dept_jurisdiction}
   
Use formal government language. Be specific with code citations.
Do not use bullet points — use numbered lists or paragraphs.
"""
```

### Frontend Streaming

Use fetch with ReadableStream for the typewriter effect:

```tsx
const generateLetter = async () => {
  setIsGenerating(true);
  setLetterContent('');
  
  const response = await fetch(`/api/reviews/${reviewId}/letter`, {
    method: 'POST',
  });
  
  // For non-streaming (simpler for hackathon): just set all at once
  // but simulate typewriter:
  const data = await response.json();
  const fullText = data.letter;
  
  let i = 0;
  const interval = setInterval(() => {
    setLetterContent(fullText.slice(0, i));
    i += 8; // characters per tick
    if (i >= fullText.length) {
      setLetterContent(fullText);
      clearInterval(interval);
      setIsGenerating(false);
    }
  }, 16); // ~60fps
};
```

---

## 5. "Today vs PermitFlow" Impact Graphic

A visual comparison to use in the pitch and as a page at `/impact`.

### Component: `components/ui/ImpactTimeline.tsx`

```
TRADITIONAL PERMIT REVIEW                    WITH PERMITFLOW
────────────────────────────────────────     ────────────────────────────────────────

Submit Application                           Submit Application
    ↓                                            ↓
    │ 2-3 weeks (backlog)                   AI Pre-Screening
    ↓                                          (< 2 minutes)
Zoning Review (sequential)                       ↓
    │ 4-6 weeks                             All 4 Departments Review
    ↓                                          IN PARALLEL
Building Review (sequential)                   (< 1 week)
    │ 4-6 weeks                                   ↓
    ↓                                         Reviewer Actions
Fire Review (sequential)                       (1-2 days)
    │ 4-6 weeks                                   ↓
    ↓                                         PERMIT ISSUED
ADA Review (sequential)
    │ 4-6 weeks
    ↓
Revision requested
    │ 4-8 weeks
    ↓
PERMIT ISSUED

TOTAL: 6-18 MONTHS                           TOTAL: 1-3 WEEKS
```

Visual as an SVG/HTML component, not text. Use:
- Left column: gray, long vertical lines between steps, heavy weight
- Right column: dept colors, compressed timeline, parallel arrows
- Metrics at bottom: "9 months" in red → "3 weeks" in green

---

## 6. Demo Navigation Page (`/demo`)

A clean launch pad for the hackathon demo:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ PERMITFLOW — HACKATHON DEMO                                                 │
│ AI for Government · Washington, DC · April 24, 2026                        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DEMO SCRIPT: APP-2026-4471 · 2247 18th St NW · Restaurant Change of Use   │
│                                                                              │
│  ── APPLICANT VIEW ───────────────────────────────────────────────────────  │
│                                                                              │
│  [APPLICANT PORTAL — UPLOAD & TRACK STATUS]       /applicant/APP-2026-4471  │
│                                                                              │
│  ── DEPARTMENT REVIEWER VIEWS ─────────────────────────────────────────── │
│                                                                              │
│  [■ BUILDING DEPARTMENT COCKPIT]             /review/building/APP-2026-4471 │
│  [■ FIRE MARSHAL COCKPIT]                    /review/fire/APP-2026-4471     │
│  [■ ADA ACCESSIBILITY COCKPIT]               /review/ada/APP-2026-4471      │
│  [■ ZONING ADMINISTRATION COCKPIT]           /review/zoning/APP-2026-4471   │
│                                                                              │
│  ── PITCH VISUALS ─────────────────────────────────────────────────────── │
│                                                                              │
│  [TODAY vs PERMITFLOW — IMPACT TIMELINE]               /impact              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Each button is full-width, left-colored border in dept color (for dept views), uppercase label, right-side URL path shown in monospace.

This page loads at `/demo` and is the opening URL for the demo.

---

## 7. Loading States

Every async operation needs a loading state that looks government-appropriate (no spinners — use text):

```tsx
// Full page loading
<div className="flex items-center justify-center h-64">
  <div className="text-center">
    <div className="text-[11px] uppercase tracking-widest text-steel mb-2">Loading</div>
    <div className="text-[13px] text-slate">Retrieving application data...</div>
  </div>
</div>

// Inline loading (button state)
<button disabled className="...">LOADING...</button>

// Table row loading skeleton
<tr><td colSpan={6} className="h-10 bg-surface animate-pulse" /></tr>
```

---

## 8. Error States

```tsx
// API error
<div className="border border-rule bg-surface p-4">
  <div className="text-[11px] uppercase tracking-wide text-critical mb-1">Error</div>
  <div className="text-[13px] text-ink">Unable to load application data. Please try again.</div>
  <button className="mt-3 btn-secondary text-[11px]">RETRY</button>
</div>

// 404
<div className="text-center py-16">
  <div className="font-mono text-[48px] text-rule">404</div>
  <div className="text-[18px] font-semibold text-navy mt-2">Application Not Found</div>
  <div className="text-[13px] text-slate mt-1">
    Application {appId} could not be found in the system.
  </div>
  <a href="/demo" className="mt-4 btn-primary inline-block">RETURN TO DEMO</a>
</div>
```

---

## 9. Shared UI Components to Finalize

### Badge Component (`components/ui/Badge.tsx`)

```tsx
type BadgeVariant = FindingSeverity | ApplicationStatus | DepartmentReviewStatus;

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical:       { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', label: 'CRITICAL' },
  warning:        { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'WARNING' },
  info:           { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'INFO' },
  pass:           { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: 'PASS' },
  approved:       { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7', label: 'APPROVED' },
  conditional:    { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'CONDITIONAL' },
  rejected:       { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: 'REJECTED' },
  under_review:   { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'UNDER REVIEW' },
  ai_complete:    { bg: '#F5F3FF', text: '#4C1D95', border: '#DDD6FE', label: 'AI COMPLETE' },
  in_queue:       { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', label: 'IN QUEUE' },
  not_started:    { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: 'NOT STARTED' },
};
```

### Code Citation Component (`components/ui/CodeCitation.tsx`)

```tsx
interface Props {
  authority: string;     // "ADA 2010 Standards"
  citation: string;      // "§ 404.2.3"
  excerpt: string;       // The code text excerpt
  departmentId: DepartmentId;
}
```

Renders as:
```
┌─────────────────────────────────────────────────────────────┐  ← 4px dept color left border
│ ADA 2010 STANDARDS § 404.2.3                                │  ← label
│ ─────────────────────────────────────────────────────────── │
│ "Doorways shall provide a clear width of 32 inches          │  ← excerpt in quotes
│  (815 mm) minimum..."                                        │
└─────────────────────────────────────────────────────────────┘
```

Background: tinted dept light color at 40% opacity.

---

## 10. Performance Checklist

Before demo:
- [ ] All API calls are < 200ms (mock data returns instantly)
- [ ] No console errors in Chrome
- [ ] PDF loads correctly from `/public/sample-plan.pdf`
- [ ] Progress polling doesn't fire on pages where `appStatus !== 'ai_reviewing'`
- [ ] All 4 department cockpit routes load without white flash

---

## 11. Final Files to Create

```
frontend/app/demo/page.tsx                          ← demo launch pad
frontend/app/review/[department]/page.tsx           ← dept queue
frontend/app/impact/page.tsx                        ← impact graphic
frontend/components/ui/ImpactTimeline.tsx
frontend/components/ui/DemoNavPage.tsx
frontend/components/ui/Badge.tsx
frontend/components/ui/CodeCitation.tsx
frontend/components/ui/LoadingState.tsx
frontend/components/ui/ErrorState.tsx
```

---

## 12. Acceptance Criteria

- [ ] `/demo` page loads with all 6 navigation links
- [ ] `/review/fire` shows application queue with 5 rows
- [ ] Queue click on APP-2026-4471 navigates to cockpit
- [ ] `/impact` shows side-by-side timeline graphic
- [ ] All 4 dept cockpits navigate correctly from dept tab switcher
- [ ] Loading state shows on all async data fetches
- [ ] Error state shows on API failure
- [ ] Review letter generates with typewriter animation
- [ ] Letter content uses formal government language with correct code citations
- [ ] Badge component renders correctly for all badge variants
- [ ] CodeCitation component renders with dept color left border
- [ ] Demo navigation page has dept-colored left borders on dept view buttons
- [ ] No broken links / 404s on any demo path
- [ ] App looks professional enough to demo to government judges
