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
    <div className="border border-[#E5E7EB] bg-white">
      <div className="px-3 py-2 bg-[#0D2340] text-white text-[11px] font-bold uppercase tracking-widest">
        Department Review Status
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E5E7EB] bg-[#F2F4F6]">
            {['Department', 'Progress', 'Status', 'Findings', 'Completed'].map(h => (
              <th key={h} className="text-left px-3 py-2 text-[10px] uppercase tracking-widest text-[#6B7280] font-bold">{h}</th>
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
              <tr key={rev.departmentId} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 shrink-0" style={{ backgroundColor: dept.colorPrimary }} />
                    <span className="text-[13px] text-[#374151]">{dept.name}</span>
                  </div>
                </td>
                <td className="px-3 py-2 w-32">
                  <div className="h-2 bg-[#E5E7EB] w-full">
                    <div
                      className="h-full transition-all"
                      style={{ width: `${progress}%`, backgroundColor: dept.colorPrimary }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant={rev.status} small />
                </td>
                <td className="px-3 py-2 font-mono text-[11px]">
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
                <td className="px-3 py-2 text-[11px] text-[#6B7280] font-mono">
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
