'use client';
import { useParams, useRouter } from 'next/navigation';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS, DEMO_APP_ID } from '@/lib/constants';
import DepartmentMasthead from '@/components/layout/DepartmentMasthead';
import ReviewerSidebar from '@/components/layout/ReviewerSidebar';
import Badge from '@/components/ui/Badge';

const MOCK_QUEUE = [
  { id: 'APP-2026-4471', address: '2247 18th St NW', type: 'Change of Use', status: 'ai_complete', findings: { building: '1C / 1W / 2P', fire: '1C / 1W / 1P', ada: '2C / 1W / 1P', zoning: '0C / 0W / 2P' }, submitted: 'Apr 24', real: true },
  { id: 'APP-2026-4468', address: '1420 K St NW', type: 'New Construction', status: 'ai_complete', findings: { building: '0C / 2W / 8P', fire: '0C / 1W / 5P', ada: '1C / 0W / 5P', zoning: '0C / 1W / 5P' }, submitted: 'Apr 23', real: false },
  { id: 'APP-2026-4460', address: '815 Vermont Ave NW', type: 'Renovation', status: 'in_queue', findings: { building: '—', fire: '—', ada: '—', zoning: '—' }, submitted: 'Apr 22', real: false },
  { id: 'APP-2026-4455', address: '3100 14th St NW', type: 'Change of Use', status: 'in_queue', findings: { building: '—', fire: '—', ada: '—', zoning: '—' }, submitted: 'Apr 21', real: false },
  { id: 'APP-2026-4447', address: '1701 Penn Ave NW', type: 'Addition', status: 'in_queue', findings: { building: '—', fire: '—', ada: '—', zoning: '—' }, submitted: 'Apr 20', real: false },
];

export default function DeptQueuePage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.department as DepartmentId;
  const dept = DEPARTMENTS[departmentId];

  if (!dept) return <div className="p-8 text-red-600">Invalid department: {departmentId}</div>;

  const aiCompleteCount = MOCK_QUEUE.filter(a => a.status === 'ai_complete').length;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DepartmentMasthead departmentId={departmentId} />
      <div className="flex flex-1 overflow-hidden">
        <ReviewerSidebar departmentId={departmentId} activeSection="applications" />
        <main className="flex-1 overflow-y-auto p-6 bg-[#F2F4F6]">
          <div className="mb-4">
            <h1 className="text-[18px] font-bold uppercase tracking-tight text-[#0D2340]">
              Review Queue — {dept.name}
            </h1>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              {MOCK_QUEUE.length} applications pending &middot; {aiCompleteCount} AI complete
            </p>
          </div>

          {/* Sort/filter bar */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-white border border-[#E5E7EB]">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#374151]">Sort By:</span>
            <select className="text-[12px] border border-[#E5E7EB] px-2 py-1 bg-white outline-none">
              <option>Submission Date</option>
              <option>Severity</option>
              <option>Status</option>
            </select>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#374151] ml-3">Filter:</span>
            <select className="text-[12px] border border-[#E5E7EB] px-2 py-1 bg-white outline-none">
              <option>All Status</option>
              <option>AI Complete</option>
              <option>In Queue</option>
            </select>
          </div>

          {/* Queue table */}
          <div className="border border-[#E5E7EB] bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F2F4F6]">
                  {['Application No.', 'Address', 'Project Type', 'AI Findings', 'Status', 'Submitted'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] uppercase tracking-widest text-[#6B7280] font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_QUEUE.map(app => (
                  <tr
                    key={app.id}
                    className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                    style={{
                      borderLeft: app.status === 'ai_complete' ? `3px solid ${dept.colorPrimary}` : '3px solid transparent',
                    }}
                    onClick={() => app.real ? router.push(`/review/${departmentId}/${app.id}`) : undefined}
                  >
                    <td className="px-3 py-2 font-mono text-[12px] text-[#374151]">{app.id}</td>
                    <td className="px-3 py-2 text-[13px] text-[#374151]">{app.address}</td>
                    <td className="px-3 py-2 text-[12px] text-[#374151]">{app.type}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-[#374151]">
                      {app.findings[departmentId as keyof typeof app.findings] || '—'}
                    </td>
                    <td className="px-3 py-2"><Badge variant={app.status} small /></td>
                    <td className="px-3 py-2 text-[11px] text-[#6B7280]">{app.submitted}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
