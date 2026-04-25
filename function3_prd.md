# PRD — Function 3: Department Reviewer Cockpit (The Hero UI)

**Scope:** The flagship department reviewer interface. Split-screen PDF viewer with AI annotation pins on the left, findings panel on the right, review letter at the bottom. Themed per department. This is the moment that wins the demo.

**Build time estimate:** 70–90 minutes  
**Dependencies:** Function 1 (types/constants), Function 2 (findings API)

---

## 1. What to Build

**Route:** `/review/[department]/[appId]`  
Example: `/review/fire/APP-2026-4471`

The page has 4 zones:
1. **Masthead** — department-colored header with application info
2. **Sidebar** — department navigation + application queue
3. **Cockpit** — split-screen: PDF viewer left + findings panel right
4. **Letter Panel** — collapsible bottom section with auto-drafted review letter

---

## 2. Page Layout

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ MASTHEAD (60px)                                                               │
│ PermitFlow · Fire Marshal — Washington, DC    Maria Rodriguez · Sign Out     │
├──████████████████████████████████████████████████████████████████████████████┤  ← 4px dept color stripe
├──────────┬────────────────────────────────────────────────────────────────────┤
│ SIDEBAR  │ BREADCRUMB: Queue / APP-2026-4471 / Fire Review                  │
│ 220px    ├────────────────────────────────────────────────────────────────────┤
│          │ APPLICATION HEADER STRIP (48px)                                   │
│          │ APP-2026-4471  2247 18th St NW  Change of Use  [UNDER REVIEW]    │
│ nav      ├──────────────────────────────┬─────────────────────────────────────┤
│ items    │ PDF VIEWER                   │ FINDINGS PANEL                     │
│          │ 55% width                    │ 45% width                          │
│          │                              │                                    │
│          │ [PDF pages with              │ [Severity tabs]                    │
│          │  annotation pins]            │ [Finding cards — scrollable]       │
│          │                              │                                    │
│          │                              │                                    │
│          │                              │                                    │
│          ├──────────────────────────────┴─────────────────────────────────────┤
│          │ REVIEW LETTER PANEL (collapsible, starts collapsed)               │
│          │ [▼ REVIEW LETTER DRAFT]  [GENERATE LETTER]  [COPY]  [SEND]       │
└──────────┴────────────────────────────────────────────────────────────────────┘
```

Total viewport height: 100vh, no page scroll. Internal panels scroll independently.

---

## 3. Masthead Component (`components/layout/DepartmentMasthead.tsx`)

```tsx
interface Props {
  departmentId: DepartmentId;
  reviewerName: string;
}
```

Visual spec:
- Background: `--color-navy` (#0D2340)
- Left: "PermitFlow" wordmark (Public Sans 700 18px, white) + separator + department full name (Public Sans 400 13px, uppercase, 0.1em tracking, white at 80% opacity)
- Right: logged-in user name + "Sign Out" link (small, white, underline)
- Below masthead: full-width 4px stripe in department primary color
- Height: 60px

```tsx
// Tailwind classes example
<header className="bg-navy h-[60px] flex items-center px-6 justify-between">
  <div className="flex items-center gap-4">
    <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
    <span className="text-white/30 text-lg">|</span>
    <span className="text-white/80 text-[13px] uppercase tracking-widest font-normal">
      {dept.name} — Washington, DC
    </span>
  </div>
  <div className="text-white/70 text-[12px]">
    {reviewerName} · <button className="underline">Sign Out</button>
  </div>
</header>
<div className="h-1 w-full" style={{ backgroundColor: dept.colorPrimary }} />
```

---

## 4. Sidebar Component (`components/layout/ReviewerSidebar.tsx`)

```tsx
interface Props {
  departmentId: DepartmentId;
  applicationId: string;
  queueCount: number;
}
```

Visual spec:
- Width: 220px, fixed
- Background: white
- Right border: 1px solid `--color-rule`
- Top: 12px padding, department short name in bold uppercase as section header
- Nav items: 14px, hover background `--color-surface`
- Active item: 3px left border in dept primary color, background dept light color

Nav sections:
```
REVIEW QUEUE
  ▶ Applications (active)
    My Assignments
    Completed

REFERENCE
    Code Library
    Templates

[version · date at bottom]
```

---

## 5. Application Header Strip

A horizontal strip above the cockpit showing key application metadata.

```
│ APP-2026-4471  ·  2247 18th St NW, Washington, DC  ·  Change of Use — Restaurant  │ [UNDER REVIEW ▼] │
```

- Background: `--color-surface`
- Border bottom: 1px `--color-rule`
- Height: 48px
- App ID: IBM Plex Mono, 13px, `--color-slate`
- Address + type: Public Sans 14px
- Status badge: right-aligned

---

## 6. Department Tab Switcher

Above the cockpit, a horizontal tab bar for switching between departments (for the demo):

```
[■ BUILDING]  [ FIRE ]  [ ADA ]  [ ZONING ]
```

- Active tab: dept color background, white text, no border-radius
- Inactive tab: white background, border 1px `--color-rule`, dept color text
- Height: 40px tabs
- Font: 11px, 700, uppercase, 0.08em tracking
- Left border on active: 3px dept color

On tab click: navigate to `/review/{dept}/APP-2026-4471`

```tsx
const DEMO_TABS: { dept: DepartmentId; label: string }[] = [
  { dept: 'building', label: 'Building' },
  { dept: 'fire', label: 'Fire' },
  { dept: 'ada', label: 'ADA' },
  { dept: 'zoning', label: 'Zoning' },
];
```

---

## 7. PDF Viewer Panel (Left, 55%)

### Library
Use `react-pdf` (`pdfjs-dist`). Install:
```
npm install react-pdf pdfjs-dist
```

Configure worker:
```tsx
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();
```

### Component: `components/ui/PDFViewer.tsx`

```tsx
interface Props {
  pdfUrl: string;
  findings: Finding[];
  departmentId: DepartmentId;
  selectedFindingId: string | null;
  onFindingClick: (findingId: string) => void;
}
```

Features:
1. Render PDF pages using `<Document>` and `<Page>` from react-pdf
2. Overlay annotation pins on top of pages using absolute positioning
3. Page navigation controls (Previous / Next / page X of Y)
4. Zoom in/out buttons
5. Clicking a pin selects the finding in the right panel
6. When a finding is selected in the right panel, PDF scrolls to that page and highlights the pin

### Annotation Pin rendering

```tsx
// For each finding that has a bounding_box on the current page:
<div
  style={{
    position: 'absolute',
    left: `${(bbox.x / pageWidth) * 100}%`,
    top: `${(bbox.y / pageHeight) * 100}%`,
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: isSelected ? dept.colorPrimary : getSeverityColor(finding.severity),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
    cursor: 'pointer',
    zIndex: 10,
    boxShadow: isSelected ? `0 0 0 3px white, 0 0 0 5px ${dept.colorPrimary}` : '0 2px 4px rgba(0,0,0,0.3)',
    transition: 'transform 0.1s',
    transform: isSelected ? 'scale(1.25)' : 'scale(1)',
  }}
  onClick={() => onFindingClick(finding.id)}
  title={finding.title}
>
  {pinNumber}
</div>
```

Pin numbers: sequential within the department (1, 2, 3...).  
PASS findings: hollow circle (border-only), no fill, smaller.

### PDF Controls Bar

```
[← Prev Page]  Page 3 of 14  [Next Page →]    [−] 100% [+]    [□ Fit Width]
```

Buttons: rectangular, 11px uppercase, bordered. No icons — text only.

---

## 8. Findings Panel (Right, 45%)

### Component: `components/ui/FindingsPanel.tsx`

```tsx
interface Props {
  findings: Finding[];
  departmentId: DepartmentId;
  selectedFindingId: string | null;
  onFindingSelect: (findingId: string) => void;
  onActionUpdate: (findingId: string, action: ReviewerAction, note?: string) => void;
}
```

### Severity Tab Bar

At top of findings panel:

```
[ALL (11)] [CRITICAL (2)] [WARNING (3)] [PASS (6)]
```

- Default: ALL tab selected
- Tab counts update as reviewer takes actions
- Active tab: dept color underline + bold

```tsx
const SEVERITY_TABS = ['all', 'critical', 'warning', 'info', 'pass'] as const;
```

### Finding Card Component (`components/ui/FindingCard.tsx`)

```tsx
interface Props {
  finding: Finding;
  departmentId: DepartmentId;
  pinNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  onActionUpdate: (action: ReviewerAction, note?: string) => void;
}
```

Visual structure:
```
┌─────────────────────────────────────────────────────────────┐  ← border-left: 4px severity color
│ [CRITICAL]  FND-ADA-001                    PIN ● 1  Sheet A3│
├─────────────────────────────────────────────────────────────┤
│ BATHROOM DOOR CLEAR WIDTH BELOW MINIMUM                     │
│ (click to expand ▼)                                         │
└─────────────────────────────────────────────────────────────┘

--- EXPANDED STATE: ---
┌─────────────────────────────────────────────────────────────┐
│ [CRITICAL]  FND-ADA-001                    PIN ● 1  Sheet A3│
├─────────────────────────────────────────────────────────────┤
│ BATHROOM DOOR CLEAR WIDTH BELOW MINIMUM                      │
│                                                              │
│ Door D-07 (women's restroom) measures 28 inches clear       │
│ width. ADA requires minimum 32 inches on accessible route.  │
│                                                              │
│ ─── CODE REFERENCE ─────────────────────────────────────── │
│ ADA 2010 STANDARDS § 404.2.3                                 │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ "Doorways shall provide a clear width of 32 inches..."  │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ─── SUGGESTED CORRECTION ───────────────────────────────── │
│ Replace door D-07 with 34" nominal door. Update Sheet A7.   │
│                                                              │
│ AI CONFIDENCE: HIGH                                          │
├─────────────────────────────────────────────────────────────┤
│ [ACCEPT AI FINDING]  [OVERRIDE]  [ADD NOTE]                  │
│                                                              │
│ Status: PENDING REVIEW                                       │
└─────────────────────────────────────────────────────────────┘
```

### CSS for Finding Card

```tsx
// Border color by severity
const severityBorderColor = {
  critical: '#B91C1C',
  warning: '#92400E',
  info: '#1E40AF',
  pass: '#065F46',
};

<div
  className={`border border-rule bg-white cursor-pointer transition-all ${
    isSelected ? 'ring-1 ring-offset-0' : ''
  }`}
  style={{
    borderLeft: `4px solid ${severityBorderColor[finding.severity]}`,
    ringColor: dept.colorPrimary,
  }}
  onClick={onSelect}
>
```

### Finding Card Header (always visible)

```tsx
<div className="flex items-center justify-between px-3 py-2 bg-surface border-b border-rule">
  <div className="flex items-center gap-2">
    <Badge severity={finding.severity} />
    <span className="font-mono text-[11px] text-steel">{finding.id}</span>
  </div>
  <div className="flex items-center gap-2 text-[11px] text-steel">
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
      style={{ backgroundColor: dept.colorPrimary }}
    >
      {pinNumber}
    </span>
    <span className="font-mono">{finding.page_ref}</span>
  </div>
</div>
<div className="px-3 py-2">
  <p className="text-[13px] font-semibold text-ink leading-snug">{finding.title}</p>
</div>
```

### Action Buttons

Three buttons in a horizontal group:

```tsx
<div className="flex border-t border-rule">
  <button
    onClick={() => onActionUpdate('accepted')}
    className="flex-1 h-9 text-[11px] font-bold uppercase tracking-wide border-r border-rule"
    style={{
      background: finding.reviewer_action === 'accepted' ? dept.colorLight : 'white',
      color: finding.reviewer_action === 'accepted' ? dept.colorDark : '#374151',
    }}
  >
    Accept AI Finding
  </button>
  <button
    onClick={() => setShowOverrideInput(true)}
    className="flex-1 h-9 text-[11px] font-bold uppercase tracking-wide border-r border-rule"
    style={{...}}
  >
    Override
  </button>
  <button
    onClick={() => setShowNoteInput(true)}
    className="flex-1 h-9 text-[11px] font-bold uppercase tracking-wide"
    style={{...}}
  >
    Add Note
  </button>
</div>
```

When Override is clicked, show an inline text area:
```
┌─────────────────────────────────────────────┐
│ REVIEWER OVERRIDE NOTE                      │
│ ┌───────────────────────────────────────┐   │
│ │ AI finding is incorrect because...    │   │
│ └───────────────────────────────────────┘   │
│ [SUBMIT OVERRIDE]  [Cancel]                 │
└─────────────────────────────────────────────┘
```

### Findings Panel Summary Stats

At the very top of the findings panel, above the severity tabs:

```
FINDINGS SUMMARY — FIRE DEPARTMENT
──────────────────────────────────────────────
CRITICAL  WARNING  INFO  PASS  PENDING
   2         2       0     2     4 of 6
```

Use a 5-column grid with borderless cells.

---

## 9. Review Letter Panel (Bottom, Collapsible)

### Component: `components/ui/ReviewLetterPanel.tsx`

Default state: collapsed (showing only the header bar).

Header bar (always visible, 44px):
```
[▶ REVIEW LETTER DRAFT — FIRE DEPARTMENT]          [GENERATE LETTER]  [COPY TEXT]  [SEND]
```

When expanded (300px height, split between two panels):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [▼ REVIEW LETTER DRAFT — FIRE DEPARTMENT]     [GENERATE LETTER] [COPY] [SEND]│
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  DISTRICT OF COLUMBIA                                                        │
│  FIRE AND EMERGENCY MEDICAL SERVICES DEPARTMENT                             │
│  FIRE PREVENTION DIVISION                                                   │
│                                                                              │
│  DATE:    April 24, 2026                                                     │
│  CASE:    APP-2026-4471                                                      │
│  RE:      Plan Review — Change of Use to Restaurant                          │
│  ADDRESS: 2247 18th St NW, Washington DC 20009                               │
│                                                                              │
│  Dear Applicant,                                                             │
│                                                                              │
│  This letter constitutes the Fire Prevention Division's review of your      │
│  submitted construction documents...                                        │
│                                                                              │
│  [editable textarea — full letter]                                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

The letter textarea should look like a document editor, not a form field:
- White background
- No border visible (or very subtle)
- Font: Public Sans 13px, generous line-height 1.8
- Monospace for headers (DISTRICT OF COLUMBIA etc.)

### Generate Letter Flow

1. User clicks "GENERATE LETTER" button
2. Button shows loading state: "GENERATING..."
3. Frontend calls `POST /api/reviews/{reviewId}/letter`
4. Response streams back letter text
5. Text appears in textarea character-by-character (typewriter effect — the one allowed animation)
6. Button resets to "REGENERATE"

---

## 10. Department Decision Bar

At the bottom of the findings panel (sticky, above the letter panel), a decision row:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DEPARTMENT DECISION          [APPROVE]  [CONDITIONAL APPROVAL]  [REJECT]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Only enabled when at least one finding has been actioned
- APPROVE: green outline button
- CONDITIONAL: amber outline button  
- REJECT: red outline button
- On click: show confirmation modal with decision note textarea

---

## 11. State Management

Use React `useState` + `useReducer` for cockpit state. No external state library needed for the demo.

```tsx
interface CockpitState {
  selectedFindingId: string | null;
  activeTab: 'all' | FindingSeverity;
  currentPage: number;
  zoom: number;
  isLetterExpanded: boolean;
  letterContent: string;
  findings: Finding[];
  isGeneratingLetter: boolean;
}
```

Key interactions:
- **Clicking a finding card** → sets `selectedFindingId`, PDF jumps to page via `scrollToPage(finding.page_ref)`
- **Clicking a PDF pin** → sets `selectedFindingId`, finding card scrolls into view, finding card expands
- **Accepting a finding** → optimistic UI update + `PATCH /api/findings/{id}/action`
- **Generate letter** → sets `isGeneratingLetter`, calls API, streams to `letterContent`

---

## 12. Data Fetching

```tsx
// On page load
useEffect(() => {
  const load = async () => {
    const [appRes, findingsRes, reviewRes] = await Promise.all([
      fetch(`/api/applications/${appId}`),
      fetch(`/api/findings/${appId}/${departmentId}`),
      fetch(`/api/reviews/${appId}/${departmentId}`),
    ]);
    // set state
  };
  load();
}, [appId, departmentId]);
```

---

## 13. Files to Create

```
frontend/app/review/[department]/[appId]/page.tsx    ← route page
frontend/components/layout/DepartmentMasthead.tsx
frontend/components/layout/ReviewerSidebar.tsx
frontend/components/ui/PDFViewer.tsx
frontend/components/ui/FindingsPanel.tsx
frontend/components/ui/FindingCard.tsx
frontend/components/ui/ReviewLetterPanel.tsx
frontend/components/ui/DepartmentTabSwitcher.tsx
frontend/components/ui/Badge.tsx
frontend/components/ui/CodeCitation.tsx
frontend/components/ui/DecisionBar.tsx
```

---

## 14. Acceptance Criteria

- [ ] `/review/fire/APP-2026-4471` loads without error
- [ ] Masthead shows "Fire Marshal — Washington, DC" with red dept color stripe
- [ ] PDF loads and renders (use public/sample-plan.pdf)
- [ ] At least 3 annotation pins appear on the PDF at correct positions
- [ ] Findings panel shows 6 findings (3 fire dept findings from mock data)
- [ ] Clicking a pin highlights the corresponding finding card
- [ ] Clicking a finding card scrolls PDF to correct page
- [ ] "Accept AI Finding" button updates the finding's visual state immediately
- [ ] Severity tabs filter correctly (CRITICAL shows 1, PASS shows 2, etc.)
- [ ] Department tab switcher navigates to `/review/building/APP-2026-4471` etc.
- [ ] Review Letter panel expands/collapses on click
- [ ] "Generate Letter" button triggers API call and populates letter with typewriter effect
- [ ] Decision bar buttons (Approve / Conditional / Reject) are visible and clickable
- [ ] Page looks like a government portal, not a SaaS startup
- [ ] No emojis anywhere in the UI
- [ ] Works at 1280px+ desktop viewport
