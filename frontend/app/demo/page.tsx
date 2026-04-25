import Link from 'next/link';
import { DEPARTMENTS, DEMO_APP_ID, DEMO_DEPARTMENTS } from '@/lib/constants';

export default function DemoPage() {
  const deptLinks = DEMO_DEPARTMENTS.map(d => ({
    dept: d,
    label: `${DEPARTMENTS[d].shortName} Department Cockpit`,
    href: `/review/${d}/${DEMO_APP_ID}`,
    color: DEPARTMENTS[d].colorPrimary,
    light: DEPARTMENTS[d].colorLight,
    border: DEPARTMENTS[d].colorBorder,
  }));

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <header className="bg-[#0D2340] h-[60px] flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
        <span className="text-white/30 mx-3">|</span>
        <span className="text-white/80 text-[13px] uppercase tracking-widest">Hackathon Demo</span>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#0D2340] uppercase tracking-tight">PermitFlow — Demo Navigator</h1>
          <p className="text-[12px] text-[#6B7280] mt-1">AI for Government &middot; Washington, DC &middot; April 24, 2026</p>
          <div className="border-b border-[#E5E7EB] mt-3" />
        </div>

        <div className="bg-white border border-[#E5E7EB] p-4 mb-6">
          <div className="font-mono text-[11px] text-[#6B7280]">
            Demo Script: {DEMO_APP_ID} &middot; 2247 18th St NW &middot; Restaurant Change of Use
          </div>
        </div>

        <div className="space-y-3">
          {/* Applicant view */}
          <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-1 mt-4">Applicant View</div>
          <Link
            href={`/applicant/${DEMO_APP_ID}`}
            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors group"
            style={{ borderLeft: '4px solid #0D2340' }}
          >
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#0D2340]">
              Applicant Portal — Upload &amp; Track Status
            </span>
            <span className="font-mono text-[11px] text-[#9CA3AF] group-hover:text-[#374151]">
              /applicant/{DEMO_APP_ID}
            </span>
          </Link>

          {/* Department reviewer views */}
          <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-1 mt-4">Department Reviewer Views</div>
          {deptLinks.map(({ dept, label, href, color, light, border }) => (
            <Link
              key={dept}
              href={href}
              className="flex items-center justify-between w-full px-4 py-3 border hover:opacity-90 transition-opacity"
              style={{ backgroundColor: light, borderColor: border, borderLeft: `4px solid ${color}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[13px] font-bold uppercase tracking-wide" style={{ color }}>
                  {label}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#9CA3AF]">
                /review/{dept}/{DEMO_APP_ID}
              </span>
            </Link>
          ))}

          {/* Queue views */}
          <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-1 mt-4">Department Queue Dashboards</div>
          {DEMO_DEPARTMENTS.map(dept => {
            const d = DEPARTMENTS[dept];
            return (
              <Link
                key={dept}
                href={`/review/${dept}`}
                className="flex items-center justify-between w-full px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
                style={{ borderLeft: `4px solid ${d.colorPrimary}` }}
              >
                <span className="text-[12px] font-semibold text-[#374151]">{d.name} — Queue</span>
                <span className="font-mono text-[11px] text-[#9CA3AF]">/review/{dept}</span>
              </Link>
            );
          })}

          {/* Impact */}
          <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold mb-1 mt-4">Pitch Visuals</div>
          <Link
            href="/impact"
            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            style={{ borderLeft: '4px solid #059669' }}
          >
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#059669]">
              Today vs PermitFlow — Impact Timeline
            </span>
            <span className="font-mono text-[11px] text-[#9CA3AF]">/impact</span>
          </Link>

          {/* Upload form */}
          <Link
            href="/applicant"
            className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors"
            style={{ borderLeft: '4px solid #1D4ED8' }}
          >
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#1D4ED8]">
              New Application — Upload Form
            </span>
            <span className="font-mono text-[11px] text-[#9CA3AF]">/applicant</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
