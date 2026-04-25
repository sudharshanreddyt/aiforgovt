import Link from 'next/link';
import { DEPARTMENTS, DEMO_APP_ID, DEMO_DEPARTMENTS } from '@/lib/constants';

export default function DemoPage() {
  const deptLinks = DEMO_DEPARTMENTS.map(d => ({
    dept: d,
    label: `${DEPARTMENTS[d].shortName} cockpit`,
    href: `/review/${d}/${DEMO_APP_ID}`,
    color: DEPARTMENTS[d].colorPrimary,
    light: DEPARTMENTS[d].colorLight,
    border: DEPARTMENTS[d].colorBorder,
  }));

  return (
    <div className="min-h-screen bg-[#EEF3F7] text-[#172033]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#102A43]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[14px] font-black text-[#102A43]">PF</div>
            <div>
              <div className="text-[18px] font-bold tracking-tight text-white">PermitFlow</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">AI for Government demo</div>
            </div>
          </div>
          <nav className="hidden items-center gap-2 text-[12px] font-semibold text-white/75 md:flex">
            <Link className="rounded-md px-3 py-2 hover:bg-white/10" href={`/applicant/${DEMO_APP_ID}`}>Applicant</Link>
            <Link className="rounded-md px-3 py-2 hover:bg-white/10" href={`/review/building/${DEMO_APP_ID}`}>Reviewer</Link>
            <Link className="rounded-md px-3 py-2 hover:bg-white/10" href="/impact">Impact</Link>
          </nav>
        </div>
      </header>

      <main className="pf-grid-bg">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-8 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="min-h-[460px] rounded-lg bg-[#102A43] p-7 text-white shadow-[0_24px_70px_rgba(16,42,67,0.22)]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-cyan-200/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-100">
              Washington, DC pilot
            </div>
            <h1 className="max-w-3xl text-[42px] font-black leading-[1.02] tracking-tight md:text-[58px]">
              Parallel permit review that feels like air traffic control.
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-7 text-slate-100/85">
              Every department gets a specialist AI reviewer, exact plan citations, and a cockpit for human approval. The demo follows one restaurant change-of-use packet across applicant status, departmental queues, and final decisions.
            </p>

            <div className="mt-8 grid max-w-3xl grid-cols-3 gap-3">
              {[
                ['9 months', 'status quo'],
                ['4 agents', 'parallel review'],
                ['11 findings', 'with citations'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-md border border-white/12 bg-white/9 p-4">
                  <div className="text-[26px] font-black">{value}</div>
                  <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100/70">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/review/building/${DEMO_APP_ID}`} className="pf-button rounded-md bg-[#22D3EE] px-5 py-3 text-[13px] font-black uppercase tracking-wide text-[#102A43] shadow-lg shadow-cyan-950/25">
                Open reviewer cockpit
              </Link>
              <Link href={`/applicant/${DEMO_APP_ID}`} className="pf-button rounded-md border border-white/25 px-5 py-3 text-[13px] font-bold uppercase tracking-wide text-white hover:bg-white/10">
                View applicant status
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <div className="pf-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Live demo packet</div>
                  <h2 className="mt-2 text-[24px] font-black tracking-tight text-[#102A43]">{DEMO_APP_ID}</h2>
                  <p className="mt-1 text-[13px] text-[#475569]">2247 18th St NW - restaurant change of use - 2,800 sf interior renovation.</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">AI complete</span>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {DEMO_DEPARTMENTS.map(dept => {
                  const d = DEPARTMENTS[dept];
                  return (
                    <div key={dept} className="rounded-md border p-3" style={{ borderColor: d.colorBorder, backgroundColor: d.colorLight }}>
                      <div className="h-2 w-10 rounded-full" style={{ backgroundColor: d.colorPrimary }} />
                      <div className="mt-3 text-[12px] font-black" style={{ color: d.colorDark }}>{d.shortName}</div>
                      <div className="mt-1 text-[10px] uppercase tracking-wide text-[#64748B]">ready</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pf-card overflow-hidden">
              <div className="border-b border-[#D8E0EA] px-5 py-4">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">90 second path</div>
              </div>
              {[
                ['1', 'Applicant uploads package', 'Portal shows document intake and parallel review progress.'],
                ['2', 'Agents annotate plan sheets', 'Findings include code section, page reference, and confidence.'],
                ['3', 'Reviewer verifies evidence', 'Split cockpit keeps PDF and decision actions in one flow.'],
                ['4', 'Applicant gets consolidated outcome', 'Only affected departments re-open on resubmission.'],
              ].map(([step, title, body]) => (
                <div key={step} className="grid grid-cols-[44px_1fr] gap-3 border-b border-[#EDF1F5] px-5 py-4 last:border-b-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#102A43] text-[12px] font-black text-white">{step}</div>
                  <div>
                    <div className="text-[14px] font-black text-[#172033]">{title}</div>
                    <div className="mt-1 text-[12px] leading-5 text-[#64748B]">{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-10">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="pf-card p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Applicant experience</div>
              <Link
                href={`/applicant/${DEMO_APP_ID}`}
                className="mt-4 flex items-center justify-between rounded-md border border-[#D8E0EA] bg-white px-4 py-4 transition hover:border-[#102A43]/30 hover:shadow-md"
                style={{ borderLeft: '5px solid #102A43' }}
              >
                <span>
                  <span className="block text-[15px] font-black text-[#102A43]">Track status and consolidated findings</span>
                  <span className="mt-1 block text-[12px] text-[#64748B]">Applicant portal - upload, agent progress, department outcomes.</span>
                </span>
                <span className="font-mono text-[11px] text-[#94A3B8]">open</span>
              </Link>
              <Link
                href="/applicant"
                className="mt-3 flex items-center justify-between rounded-md border border-[#D8E0EA] bg-white px-4 py-4 transition hover:border-[#155E75]/35 hover:shadow-md"
                style={{ borderLeft: '5px solid #155E75' }}
              >
                <span>
                  <span className="block text-[15px] font-black text-[#102A43]">Create a new application</span>
                  <span className="mt-1 block text-[12px] text-[#64748B]">Production-style intake for project data and PDFs.</span>
                </span>
                <span className="font-mono text-[11px] text-[#94A3B8]">open</span>
              </Link>
            </div>

            <div className="pf-card p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Department reviewer views</div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {deptLinks.map(({ dept, label, href, color, light, border }) => (
                  <Link
                    key={dept}
                    href={href}
                    className="rounded-md border p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ backgroundColor: light, borderColor: border }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-[13px] font-black" style={{ color }}>{label}</span>
                    </div>
                    <div className="mt-3 font-mono text-[10px] text-[#64748B]">/review/{dept}/{DEMO_APP_ID}</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-5">
            {DEMO_DEPARTMENTS.map(dept => {
              const d = DEPARTMENTS[dept];
              return (
                <Link
                  key={dept}
                  href={`/review/${dept}`}
                  className="rounded-md border border-[#D8E0EA] bg-white px-4 py-3 text-[12px] font-bold text-[#475569] transition hover:shadow-md"
                  style={{ borderTop: `4px solid ${d.colorPrimary}` }}
                >
                  {d.name} queue
                </Link>
              );
            })}
            <Link
              href="/impact"
              className="rounded-md border border-[#D8E0EA] bg-white px-4 py-3 text-[12px] font-bold text-[#475569] transition hover:shadow-md"
              style={{ borderTop: '4px solid #059669' }}
            >
              Impact timeline
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
