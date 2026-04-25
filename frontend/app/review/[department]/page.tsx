'use client';
import { useParams, useRouter } from 'next/navigation';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';
import DepartmentMasthead from '@/components/layout/DepartmentMasthead';
import ReviewerSidebar from '@/components/layout/ReviewerSidebar';
import Badge from '@/components/ui/Badge';

const MOCK_QUEUE = [
  { id: 'APP-2026-4471', address: '2247 18th St NW', type: 'Change of Use', status: 'ai_complete', findings: { building: '1C / 1W / 2P', fire: '1C / 1W / 1P', ada: '2C / 1W / 1P', zoning: '0C / 0W / 2P' }, submitted: 'Apr 24', age: '18 min', real: true },
  { id: 'APP-2026-4468', address: '1420 K St NW', type: 'New Construction', status: 'ai_complete', findings: { building: '0C / 2W / 8P', fire: '0C / 1W / 5P', ada: '1C / 0W / 5P', zoning: '0C / 1W / 5P' }, submitted: 'Apr 23', age: '1 day', real: false },
  { id: 'APP-2026-4460', address: '815 Vermont Ave NW', type: 'Renovation', status: 'in_queue', findings: { building: '-', fire: '-', ada: '-', zoning: '-' }, submitted: 'Apr 22', age: '2 days', real: false },
  { id: 'APP-2026-4455', address: '3100 14th St NW', type: 'Change of Use', status: 'in_queue', findings: { building: '-', fire: '-', ada: '-', zoning: '-' }, submitted: 'Apr 21', age: '3 days', real: false },
  { id: 'APP-2026-4447', address: '1701 Penn Ave NW', type: 'Addition', status: 'in_queue', findings: { building: '-', fire: '-', ada: '-', zoning: '-' }, submitted: 'Apr 20', age: '4 days', real: false },
];

export default function DeptQueuePage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.department as DepartmentId;
  const dept = DEPARTMENTS[departmentId];

  if (!dept) return <div className="p-8 text-red-600">Invalid department: {departmentId}</div>;

  const aiCompleteCount = MOCK_QUEUE.filter(a => a.status === 'ai_complete').length;
  const findingText = (app: typeof MOCK_QUEUE[number]) => app.findings[departmentId as keyof typeof app.findings] || '-';

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#EEF3F7]">
      <DepartmentMasthead departmentId={departmentId} />
      <div className="flex flex-1 overflow-hidden">
        <ReviewerSidebar departmentId={departmentId} activeSection="applications" />
        <main className="flex-1 overflow-y-auto p-6 pf-grid-bg">
          <section className="rounded-lg p-6 text-white shadow-[0_20px_55px_rgba(16,42,67,0.16)]" style={{ background: `linear-gradient(135deg, #102A43, ${dept.colorDark})` }}>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-white/65">Department queue</div>
                <h1 className="mt-2 text-[34px] font-black tracking-tight">{dept.name}</h1>
                <p className="mt-2 max-w-2xl text-[14px] leading-6 text-white/75">
                  Triage AI-screened permits by severity, verify plan citations, and issue a department decision without waiting for other desks.
                </p>
              </div>
              <div className="grid min-w-[360px] grid-cols-3 gap-2">
                {[
                  [MOCK_QUEUE.length, 'pending'],
                  [aiCompleteCount, 'AI ready'],
                  ['14 min', 'median triage'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md border border-white/14 bg-white/10 p-4 text-center">
                    <div className="text-[26px] font-black">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/60">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="pf-card mt-5 overflow-hidden">
            <div className="flex flex-col gap-3 border-b border-[#D8E0EA] bg-white px-5 py-4 lg:flex-row lg:items-center">
              <div className="mr-auto">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Applications</div>
                <p className="mt-1 text-[12px] text-[#64748B]">Sorted by AI severity and submission age.</p>
              </div>
              <select className="rounded-md border border-[#D8E0EA] bg-white px-3 py-2 text-[12px] font-semibold text-[#475569] outline-none">
                <option>Sort: AI severity</option>
                <option>Sort: Submission date</option>
                <option>Sort: Status</option>
              </select>
              <select className="rounded-md border border-[#D8E0EA] bg-white px-3 py-2 text-[12px] font-semibold text-[#475569] outline-none">
                <option>All statuses</option>
                <option>AI complete</option>
                <option>In queue</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px]">
                <thead>
                  <tr className="border-b border-[#D8E0EA] bg-[#F8FAFC]">
                    {['Application', 'Project', 'AI findings', 'Status', 'Submitted', 'Age', 'Next step'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[#64748B] font-black">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_QUEUE.map(app => (
                    <tr
                      key={app.id}
                      className="border-b border-[#EDF1F5] bg-white transition hover:bg-[#F8FAFC]"
                      style={{ borderLeft: app.status === 'ai_complete' ? `5px solid ${dept.colorPrimary}` : '5px solid transparent' }}
                      onClick={() => app.real ? router.push(`/review/${departmentId}/${app.id}`) : undefined}
                    >
                      <td className="px-4 py-4">
                        <div className="font-mono text-[12px] font-black text-[#172033]">{app.id}</div>
                        {app.real && <div className="mt-1 text-[10px] uppercase tracking-wide text-emerald-700">demo file</div>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-[13px] font-bold text-[#172033]">{app.address}</div>
                        <div className="mt-1 text-[11px] text-[#64748B]">{app.type}</div>
                      </td>
                      <td className="px-4 py-4 font-mono text-[12px] font-bold" style={{ color: dept.colorDark }}>{findingText(app)}</td>
                      <td className="px-4 py-4"><Badge variant={app.status} small /></td>
                      <td className="px-4 py-4 text-[12px] text-[#64748B]">{app.submitted}</td>
                      <td className="px-4 py-4 text-[12px] font-semibold text-[#475569]">{app.age}</td>
                      <td className="px-4 py-4">
                        <button
                          disabled={!app.real}
                          className="rounded-md px-3 py-2 text-[11px] font-black uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-35"
                          style={{ backgroundColor: app.real ? dept.colorPrimary : '#E2E8F0', color: app.real ? 'white' : '#64748B' }}
                        >
                          Open cockpit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
