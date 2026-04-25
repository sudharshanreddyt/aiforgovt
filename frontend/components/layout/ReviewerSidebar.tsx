'use client';
import Link from 'next/link';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';

interface Props {
  departmentId: DepartmentId;
  applicationId?: string;
  activeSection?: string;
}

export default function ReviewerSidebar({ departmentId, applicationId, activeSection = 'applications' }: Props) {
  const dept = DEPARTMENTS[departmentId];

  const navItem = (label: string, section: string, href: string) => {
    const isActive = activeSection === section;
    return (
      <Link
        href={href}
        className="mb-1 block rounded-md px-3 py-2 text-[13px] transition-colors"
        style={{
          borderLeft: isActive ? `4px solid ${dept.colorPrimary}` : '4px solid transparent',
          backgroundColor: isActive ? dept.colorLight : 'transparent',
          color: isActive ? dept.colorDark : '#374151',
          fontWeight: isActive ? 800 : 500,
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-[240px] shrink-0 bg-white border-r border-[#D8E0EA] flex flex-col overflow-y-auto">
      <div className="px-4 pt-5 pb-2">
        <div className="rounded-lg border p-4" style={{ borderColor: dept.colorBorder, backgroundColor: dept.colorLight }}>
          <div className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: dept.colorPrimary }}>
            {dept.shortName}
          </div>
          <div className="mt-2 text-[13px] font-black text-[#172033]">Reviewer workspace</div>
          <div className="mt-1 text-[11px] leading-4 text-[#64748B]">{dept.codeAuthorities.slice(0, 2).join(' + ')}</div>
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-2 mt-5 font-black">Review Queue</div>
        {navItem('Applications', 'applications', `/review/${departmentId}`)}
        {navItem('My Assignments', 'assignments', `/review/${departmentId}`)}
        {navItem('Completed', 'completed', `/review/${departmentId}`)}
      </div>
      <div className="px-4 py-2">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[#94A3B8] mb-2 mt-3 font-black">Reference</div>
        {navItem('Code Library', 'codes', `/review/${departmentId}`)}
        {navItem('Templates', 'templates', `/review/${departmentId}`)}
      </div>
      {applicationId && (
        <div className="mx-4 mt-3 rounded-md border border-[#D8E0EA] bg-[#F8FAFC] p-3">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">Active file</div>
          <div className="mt-1 font-mono text-[11px] font-bold text-[#172033]">{applicationId}</div>
        </div>
      )}
      <div className="mt-auto px-4 py-3 text-[10px] text-[#94A3B8] border-t border-[#D8E0EA]">
        PermitFlow reviewer console - Apr 2026
      </div>
    </aside>
  );
}
