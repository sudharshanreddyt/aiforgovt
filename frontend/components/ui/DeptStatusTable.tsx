'use client';
import { DepartmentReview } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';
import Badge from './Badge';
import { getDeptProgress, countFindings, formatDateTime } from '@/lib/utils';

interface Props {
  reviews: DepartmentReview[];
}

export default function DeptStatusTable({ reviews }: Props) {
  return (
    <div className="pf-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#D8E0EA] bg-white px-5 py-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Department review status</div>
          <p className="mt-1 text-[12px] text-[#64748B]">Each department reviews the same packet concurrently.</p>
        </div>
        <span className="rounded-md bg-[#F8FAFC] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#64748B] ring-1 ring-[#D8E0EA]">Parallel routing</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#D8E0EA] bg-[#F8FAFC]">
            {['Department', 'Progress', 'Status', 'Findings', 'Completed'].map(h => (
              <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[#64748B] font-black">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reviews.map((rev) => {
            const dept = DEPARTMENTS[rev.departmentId];
            if (!dept) return null;
            const progress = getDeptProgress(rev.status);
            const counts = countFindings(rev.findings || []);
            return (
              <tr key={rev.departmentId} className="border-b border-[#EDF1F5] hover:bg-[#F8FAFC]">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-8 rounded-full shrink-0" style={{ backgroundColor: dept.colorPrimary }} />
                    <div>
                      <span className="block text-[13px] font-black text-[#172033]">{dept.name}</span>
                      <span className="text-[10px] uppercase tracking-wide text-[#94A3B8]">{dept.jurisdiction}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 w-40">
                  <div className="h-2.5 bg-[#E2E8F0] w-full rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: dept.colorPrimary }}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={rev.status} small />
                </td>
                <td className="px-4 py-4 font-mono text-[11px] font-bold">
                  {rev.findings?.length > 0 ? (
                    <span>
                      <span className="text-[#B91C1C]">{counts.critical}C</span>
                      {' / '}
                      <span className="text-[#92400E]">{counts.warning}W</span>
                      {' / '}
                      <span className="text-[#065F46]">{counts.pass}P</span>
                    </span>
                  ) : '—'}
                </td>
                <td className="px-4 py-4 text-[11px] text-[#64748B] font-mono">
                  {rev.completedAt ? formatDateTime(rev.completedAt) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
