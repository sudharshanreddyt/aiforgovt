# PermitFlow — Design System

> Government-grade aesthetic. Authoritative, dense, utilitarian. Inspired by USA.gov, DC.gov, and the US Web Design System (USWDS). No rounded cards. No gradients. No emojis.

---

## 1. Design Philosophy

PermitFlow is infrastructure for government. It should look like it belongs there.

**Reference sites to study:**
- usa.gov — clean federal header, tabular data, serif wordmarks
- DC.gov — banner-style nav, blue/white/gray palette
- gsa.gov — dense, document-like layout
- hud.gov — left-border accent patterns
- 18f.gsa.gov — modern government: clean but institutional

**What this means in practice:**
- Every screen should look like a government portal, not a SaaS startup
- Information density over whitespace
- Tables and lists over cards and tiles
- Rectangular buttons with visible borders, never pill-shaped
- Status is communicated with text labels and colored bars, not icons or emojis
- Application numbers, case IDs, and date formatting must look official
- Approval states use stamp-style visual language
- Department color is applied as an accent stripe, not a full background

---

## 2. Color Palette

### System Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-navy` | `#0D2340` | Primary nav, page headers, heavy text |
| `--color-navy-mid` | `#163A5F` | Secondary nav, table headers |
| `--color-slate` | `#3D5166` | Body text, secondary labels |
| `--color-steel` | `#687E94` | Placeholder text, tertiary labels |
| `--color-rule` | `#C5D2DC` | Borders, table rules, dividers |
| `--color-surface` | `#F2F4F6` | Page background |
| `--color-white` | `#FFFFFF` | Panel backgrounds, form surfaces |
| `--color-offwhite` | `#F8F9FA` | Alternate row backgrounds |
| `--color-ink` | `#1A2733` | Primary body text |

### Status Colors

| Token | Hex | State |
|-------|-----|-------|
| `--color-critical` | `#B91C1C` | Critical finding, rejection |
| `--color-warning` | `#92400E` | Warning finding, conditional |
| `--color-pass` | `#065F46` | Pass, approved |
| `--color-info` | `#1E40AF` | Informational, in-review |
| `--color-pending` | `#4B5563` | Pending, not started |

### Department Colors

| Department | Primary | Dark | Light (bg) | Border |
|-----------|---------|------|-----------|--------|
| Building | `#1D4ED8` | `#1E3A8A` | `#EFF6FF` | `#BFDBFE` |
| Fire | `#DC2626` | `#991B1B` | `#FEF2F2` | `#FECACA` |
| ADA / Accessibility | `#059669` | `#065F46` | `#ECFDF5` | `#A7F3D0` |
| Zoning / Planning | `#7C3AED` | `#4C1D95` | `#F5F3FF` | `#DDD6FE` |
| Health | `#EA580C` | `#9A3412` | `#FFF7ED` | `#FED7AA` |
| MEP | `#D97706` | `#92400E` | `#FFFBEB` | `#FDE68A` |

---

## 3. Typography

**Primary Font:** `Public Sans` (USWDS standard — load from Google Fonts or npm)  
**Monospace:** `IBM Plex Mono` (for case IDs, code citations, application numbers)  
**Fallback:** `system-ui, -apple-system, sans-serif`

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
```

### Type Scale

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.t-page-title` | 22px / 1.75rem | 700 | Page H1 |
| `.t-section-title` | 16px / 1.25rem | 600 | Section headers |
| `.t-label` | 11px / 0.688rem | 700 | Field labels (ALL CAPS, tracked 0.08em) |
| `.t-body` | 14px / 0.875rem | 400 | Body, table cells |
| `.t-body-sm` | 12px / 0.75rem | 400 | Secondary text, footnotes |
| `.t-mono` | 12px / 0.75rem | 400 | Case IDs, code refs, timestamps |
| `.t-badge` | 10px / 0.625rem | 700 | Status badges (ALL CAPS) |

### Label convention
All field labels: UPPERCASE, tracked, 11px, color `--color-steel`
```
APPLICANT NAME
PROJECT ADDRESS
SUBMISSION DATE
```

---

## 4. Spacing System

Base unit: `4px`

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Inline gaps |
| `--space-2` | 8px | Tight padding |
| `--space-3` | 12px | Default element padding |
| `--space-4` | 16px | Panel padding, section gaps |
| `--space-6` | 24px | Large section spacing |
| `--space-8` | 32px | Page section dividers |

---

## 5. Component Specifications

### 5.1 Page Header / Masthead

```
┌──────────────────────────────────────────────────────────────────────┐
│  [PermitFlow wordmark]          DEPARTMENT OF BUILDINGS — WASHINGTON DC │
│  gov.permitflow.dc                     Logged in: M. Rodriguez · Sign Out│
├──────────────────────────────────────────────────────────────────────┤
│  [DEPT COLOR BAR — 4px full width stripe]                            │
└──────────────────────────────────────────────────────────────────────┘
```

- Background: `--color-navy`
- Text: `#FFFFFF`
- Wordmark: Public Sans 700, 18px
- Department name: Public Sans 400, 13px, ALL CAPS, letter-spacing 0.1em
- Below header: 4px solid department color stripe (full width)

### 5.2 Left Navigation Sidebar

```
┌─────────────────────┐
│  [4px dept color]   │
│                     │
│  REVIEW QUEUE       │
│  ──────────────     │
│  ▶ Applications     │  ← active: dept color left border 3px, bg tinted
│    Dashboard        │
│    My Assignments   │
│                     │
│  TOOLS              │
│  ──────────────     │
│    Code Reference   │
│    Templates        │
│                     │
│  v2.1 · 2026-04-24  │
└─────────────────────┘
```

- Width: 220px fixed
- Background: `--color-white`
- Right border: 1px solid `--color-rule`
- Section labels: 10px, 700, ALL CAPS, `--color-steel`
- Active item: 3px left border in dept color, background tinted dept color at 8% opacity
- Hover: background `--color-surface`

### 5.3 Buttons

**No pill shapes. No border-radius > 3px.**

```css
/* Primary button */
.btn-primary {
  height: 36px;
  padding: 0 16px;
  background: var(--dept-color);
  color: white;
  font: 600 13px/1 'Public Sans';
  letter-spacing: 0.03em;
  border: 1px solid var(--dept-color-dark);
  border-radius: 2px;
  text-transform: uppercase;
}

/* Secondary button */
.btn-secondary {
  height: 36px;
  padding: 0 16px;
  background: white;
  color: var(--color-navy);
  font: 600 13px/1 'Public Sans';
  border: 1.5px solid var(--color-rule);
  border-radius: 2px;
  text-transform: uppercase;
}

/* Destructive / reject */
.btn-danger {
  background: white;
  color: var(--color-critical);
  border-color: var(--color-critical);
}

/* Ghost / text */
.btn-ghost {
  background: transparent;
  border: none;
  color: var(--color-slate);
  font-size: 13px;
  text-decoration: underline;
}
```

Button groups should use a border-grouped pattern (government form style):
```
[  ACCEPT  ] [  OVERRIDE  ] [  FLAG FOR REVIEW  ]
   ↑ joined borders, look like a segmented control
```

### 5.4 Status Badges

```css
.badge {
  display: inline-block;
  padding: 2px 8px;
  font: 700 10px/1.4 'Public Sans';
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-radius: 2px;
}
```

| Badge | Background | Text | Border |
|-------|-----------|------|--------|
| APPROVED | `#ECFDF5` | `#065F46` | `#6EE7B7` |
| UNDER REVIEW | `#EFF6FF` | `#1E40AF` | `#BFDBFE` |
| CONDITIONAL | `#FFFBEB` | `#92400E` | `#FDE68A` |
| REJECTED | `#FEF2F2` | `#991B1B` | `#FECACA` |
| PENDING | `#F3F4F6` | `#374151` | `#D1D5DB` |
| CRITICAL | `#FEF2F2` | `#B91C1C` | `#FCA5A5` |
| WARNING | `#FFFBEB` | `#92400E` | `#FDE68A` |
| PASS | `#ECFDF5` | `#065F46` | `#A7F3D0` |

### 5.5 Data Tables

Government-style dense tables. No card wrapping — tables ARE the layout.

```css
table.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: var(--color-navy-mid);
  color: white;
  font: 600 11px/1 'Public Sans';
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 10px 12px;
  text-align: left;
  border-right: 1px solid rgba(255,255,255,0.12);
}

.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-rule);
  color: var(--color-ink);
  vertical-align: top;
}

.data-table tr:nth-child(even) td {
  background: var(--color-offwhite);
}

.data-table tr:hover td {
  background: #EFF6FF;
  cursor: pointer;
}
```

### 5.6 Finding Cards (Reviewer Cockpit)

Each finding in the right panel of the Reviewer Cockpit:

```
┌─────────────────────────────────────────────────────────────┐
│ [CRITICAL]  FINDING NO. F-014             [pin: ●] Sheet A3 │
├─────────────────────────────────────────────────────────────┤
│ BATHROOM DOOR CLEAR WIDTH BELOW MINIMUM                      │
│                                                             │
│ AI Analysis: Door D-07 measures 28" clear width. ADA 2010   │
│ §404.2.3 requires minimum 32" clear width at accessible     │
│ route restroom doors. Confidence: HIGH                      │
│                                                             │
│ CODE REFERENCE                                              │
│ ADA 2010 Standards §404.2.3                                 │
│ "Doorways shall provide a clear width of 32 inches..."      │
│                                                             │
│ SUGGESTED CORRECTION                                        │
│ Replace door D-07 with 34" nominal door (32" clear width).  │
├─────────────────────────────────────────────────────────────┤
│ [ACCEPT AI FINDING]  [OVERRIDE]  [ADD NOTE]                 │
└─────────────────────────────────────────────────────────────┘
```

- Left border: 4px solid, severity color
- Header background: `--color-surface`
- Separator: 1px `--color-rule`
- Finding number: `.t-mono` style
- Code reference section: slightly indented, monospace font, light background

### 5.7 Application Number / Case ID formatting

```
APP-2026-4471          ← Application ID
FND-ADA-014           ← Finding ID (department prefix)
REV-FIRE-2026-0892    ← Review ID
```

Always in IBM Plex Mono, `--color-slate`, uppercase.

### 5.8 PDF Annotation Pins

On the PDF viewer, AI annotation pins are numbered circles:

```
●  14     ← filled circle, department color, white number
○  pass   ← outline circle, pass color
```

- Size: 24px circle
- Font: 700, 10px, white
- Hover: expand to show finding title tooltip
- Active/selected: ring outline 2px white + 2px dept color

### 5.9 Section Dividers

Use a horizontal rule with a label (government-report style):

```
── SECTION 3: EGRESS REQUIREMENTS ───────────────────────────
```

```css
.section-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  font: 700 10px/1 'Public Sans';
  letter-spacing: 0.1em;
  color: var(--color-steel);
  text-transform: uppercase;
  margin: 24px 0 16px;
}

.section-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-rule);
}
```

### 5.10 Form Fields

```css
.form-field label {
  display: block;
  font: 700 11px/1 'Public Sans';
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-steel);
  margin-bottom: 6px;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  height: 38px;
  padding: 0 10px;
  border: 1.5px solid var(--color-rule);
  border-radius: 2px;
  font: 400 14px 'Public Sans';
  color: var(--color-ink);
  background: white;
}

.form-field input:focus {
  border-color: var(--dept-color);
  outline: 2px solid var(--dept-color-light);
  outline-offset: 1px;
}
```

### 5.11 Progress / Status Timeline

For the applicant's view of department review progress:

```
ZONING        [▓▓▓▓▓▓▓▓▓▓] APPROVED     APR 24 · 2:14 PM
BUILDING      [▓▓▓▓▓▓▓▓──] UNDER REVIEW  —
FIRE          [▓▓▓▓▓▓▓▓──] UNDER REVIEW  —
ADA           [▓▓────────] IN QUEUE      —
```

- Progress bar: 6px tall, rectangular, no border-radius
- Department label: 110px fixed width column
- Bar: dept color when active, `--color-rule` for unfilled
- Status: badge component
- Date: monospace small

### 5.12 Approval Stamp Visual

When a department approves or the overall permit is approved, display a rotated stamp:

```
     ┌──────────────────┐
    /  APPROVED          \
    |  DEPT. OF BUILDINGS |   ← rotated ~-8deg, color border double-rule
    |  APR 24, 2026       |
    \  REF: APP-2026-4471/
     └──────────────────┘
```

CSS: `transform: rotate(-6deg)`, double border, department color, uppercase

---

## 6. Layout Grids

### Reviewer Cockpit (the hero view)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [MASTHEAD — DEPT COLOR STRIPE]                                      │
├──────────┬──────────────────────────────────────────────────────────┤
│ SIDEBAR  │ BREADCRUMB: Applications / APP-2026-4471 / Fire Review  │
│ 220px    ├─────────────────────────────┬───────────────────────────┤
│          │ PDF VIEWER (annotated)      │ FINDINGS PANEL            │
│          │                             │ [severity tabs]           │
│          │ [react-pdf + overlay pins]  │ ────────────────          │
│          │                             │ [finding card 1]          │
│          │                             │ [finding card 2]          │
│          │ 55% width                   │ 45% width (scrollable)    │
│          ├─────────────────────────────┴───────────────────────────┤
│          │ REVIEW LETTER PANEL (collapsible, bottom 30%)           │
│          │ Auto-drafted · [EDIT]  [GENERATE PDF]  [SEND]          │
└──────────┴──────────────────────────────────────────────────────────┘
```

### Applicant Portal

```
┌─────────────────────────────────────────────────────────────────────┐
│ [MASTHEAD — NAVY]                                                   │
├──────────┬──────────────────────────────────────────────────────────┤
│ SIDEBAR  │ APPLICATION APP-2026-4471                                │
│          │ 2247 18th St NW · Washington, DC                         │
│          ├──────────────────────────────────────────────────────────┤
│          │ DEPARTMENT REVIEW STATUS                                 │
│          │ [4-row status table with progress bars]                  │
│          ├──────────────────────────────────────────────────────────┤
│          │ FINDINGS SUMMARY     │  DOCUMENTS SUBMITTED             │
│          │ [counts by severity] │  [file list]                     │
│          ├──────────────────────────────────────────────────────────┤
│          │ ACTIVITY LOG (timeline, newest first)                    │
└──────────┴──────────────────────────────────────────────────────────┘
```

---

## 7. Unique Design Elements (Not on Any AI Startup)

### 7.1 Department Portal Switcher

At the top of the reviewer cockpit, a horizontal tab row showing all 4 departments. The active one is highlighted in its department color. Looks like a government form's tabbed sections.

```
[■ BUILDING DEPT]  [ FIRE DEPT ]  [ ADA/ACCESS. ]  [ ZONING ]
    blue accent      gray              gray             gray
```

### 7.2 Code Citation Pull Quote

When showing a code reference, display it like a government document pull quote:

```
┌─ ADA 2010 STANDARDS § 404.2.3 ─────────────────────────────┐
│                                                              │
│  "...doorways shall provide a clear width of 32 inches      │
│   (815 mm) minimum..."                                       │
│                                                              │
│  Source: U.S. Access Board — effective Jan 26, 2012          │
└──────────────────────────────────────────────────────────────┘
```

Left border: 4px dept color. Background: tinted dept color at 5%.

### 7.3 AI Analysis Running State

When agents are reviewing in parallel, show a real-time status console:

```
┌─ AI REVIEW ENGINE — RUNNING ───────────────────────────────────────┐
│                                                                     │
│  [▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░]  BUILDING AGENT    12 checks complete...  │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░]  FIRE AGENT        Analyzing egress...    │
│  [▓▓▓▓░░░░░░░░░░░░░░░░░]  ADA AGENT         Reading door schedule  │
│  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░]  ZONING AGENT      Almost done...         │
│                                                                     │
│  ELAPSED: 00:00:47   ESTIMATED: 00:01:15                           │
└─────────────────────────────────────────────────────────────────────┘
```

Terminal/console aesthetic. Monospace font. This is the "wow" moment — all four agents running simultaneously.

### 7.4 Application Cover Sheet

At the top of any application view, a formal cover section mimicking a government form header:

```
┌──────────────────────────────────────────────────────────────────────┐
│  PERMITFLOW · DISTRICT OF COLUMBIA                                   │
│  DEPARTMENT OF CONSUMER AND REGULATORY AFFAIRS                       │
├──────────────────────────────────────────────────────────────────────┤
│  APPLICATION NO.  │  PROJECT TYPE    │  SUBMITTED       │  STATUS    │
│  APP-2026-4471    │  CHANGE OF USE   │  APR 24, 2026    │ [BADGE]    │
├──────────────────────────────────────────────────────────────────────┤
│  PROPERTY ADDRESS                    │  APPLICANT                   │
│  2247 18th St NW, Washington DC      │  Maria L. Chen               │
│  20009                               │  License #DC-2024-8891       │
└──────────────────────────────────────────────────────────────────────┘
```

### 7.5 Review Letter Template

Auto-drafted letter looks like a real government letter:

```
                     DISTRICT OF COLUMBIA
              DEPARTMENT OF CONSUMER AND REGULATORY AFFAIRS
                  BUILDING DEPARTMENT — PLAN REVIEW

                              OFFICIAL NOTICE

DATE:      April 24, 2026
CASE NO.:  APP-2026-4471
RE:        Plan Review — Change of Use Application
ADDRESS:   2247 18th St NW, Washington DC 20009

Dear Applicant:

This letter constitutes the official plan review findings of the Building
Department...
```

---

## 8. Responsive Behavior

**Desktop-first.** This is a government reviewer tool, not a consumer app.

- Min-width: 1280px for Reviewer Cockpit
- Mobile: Applicant tracking view only (simplified status list)
- PDF viewer requires desktop

Breakpoints:
- `xl`: 1280px+ — full reviewer cockpit
- `lg`: 1024px — collapsed sidebar
- `md`: 768px — applicant portal tablet view
- `sm`: 375px — applicant status-only mobile

---

## 9. Animation & Motion

Minimal. Government software does not pulse, bounce, or glow.

- Page transitions: none (instant)
- AI analysis progress bars: smooth `width` transition, 1s ease-out
- Finding cards expanding: 150ms ease-out height animation
- Badge changes: 200ms background-color transition
- PDF pin hover: 100ms scale(1.2)
- Review letter generation: typewriter-style text stream (this is the one "wow" animation)

---

## 10. Tailwind Configuration Additions

Add to `tailwind.config.js`:

```js
theme: {
  extend: {
    fontFamily: {
      sans: ['Public Sans', 'system-ui', 'sans-serif'],
      mono: ['IBM Plex Mono', 'monospace'],
    },
    colors: {
      navy: { DEFAULT: '#0D2340', mid: '#163A5F' },
      slate: '#3D5166',
      steel: '#687E94',
      rule: '#C5D2DC',
      surface: '#F2F4F6',
      dept: {
        building: { DEFAULT: '#1D4ED8', dark: '#1E3A8A', light: '#EFF6FF', border: '#BFDBFE' },
        fire:     { DEFAULT: '#DC2626', dark: '#991B1B', light: '#FEF2F2', border: '#FECACA' },
        ada:      { DEFAULT: '#059669', dark: '#065F46', light: '#ECFDF5', border: '#A7F3D0' },
        zoning:   { DEFAULT: '#7C3AED', dark: '#4C1D95', light: '#F5F3FF', border: '#DDD6FE' },
        health:   { DEFAULT: '#EA580C', dark: '#9A3412', light: '#FFF7ED', border: '#FED7AA' },
        mep:      { DEFAULT: '#D97706', dark: '#92400E', light: '#FFFBEB', border: '#FDE68A' },
      },
    },
    borderRadius: {
      DEFAULT: '2px',
      sm: '2px',
      md: '3px',
      lg: '4px',
      full: '9999px', // only for PDF pins/circles
    },
  }
}
```

---

## 11. File / Folder Structure for Styles

```
/styles
  globals.css         ← CSS variables, base resets
  typography.css      ← Type scale classes
  components.css      ← Button, badge, table base styles
  dept-themes.css     ← Per-department CSS variable overrides

/components/ui
  Badge.tsx
  Button.tsx
  DataTable.tsx
  FindingCard.tsx
  StatusTimeline.tsx
  DepartmentHeader.tsx
  CodeCitation.tsx
  ApprovalStamp.tsx
  ReviewerCockpit.tsx   ← main layout
  AgentConsole.tsx      ← the running AI visualization
```

---

## 12. Do's and Don'ts

### DO
- Use rectangular buttons with uppercase text
- Use a left-border accent on active states
- Use UPPERCASE for all labels and section headers  
- Use monospace for all IDs, case numbers, dates, code citations
- Use dense tables over cards
- Reference specific code sections (§ 404.2.3 not just "ADA")
- Use a top or left colored stripe for department identity
- Show application numbers in every header

### DO NOT
- Use pill-shaped buttons or rounded cards (border-radius > 4px)
- Use gradient backgrounds
- Use emojis anywhere in the UI
- Use drop shadows (box-shadow allowed only for modal overlays)
- Use animations that take >300ms
- Use abstract icons without text labels
- Use light gray text on white backgrounds
- Center-align body text
