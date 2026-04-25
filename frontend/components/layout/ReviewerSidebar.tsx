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
        className="block px-4 py-2 text-[13px] transition-colors"
        style={{
          borderLeft: isActive ? `3px solid ${dept.colorPrimary}` : '3px solid transparent',
          backgroundColor: isActive ? dept.colorLight : 'transparent',
          color: isActive ? dept.colorDark : '#374151',
          fontWeight: isActive ? 600 : 400,
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-[220px] shrink-0 bg-white border-r border-[#E5E7EB] flex flex-col overflow-y-auto">
      <div className="px-4 pt-4 pb-2">
        <div className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: dept.colorPrimary }}>
          {dept.shortName}
        </div>
        <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-1 mt-3">Review Queue</div>
        {navItem('Applications', 'applications', `/review/${departmentId}`)}
        {navItem('My Assignments', 'assignments', `/review/${departmentId}`)}
        {navItem('Completed', 'completed', `/review/${departmentId}`)}
      </div>
      <div className="px-4 py-2">
        <div className="text-[11px] uppercase tracking-wider text-[#6B7280] mb-1 mt-3">Reference</div>
        {navItem('Code Library', 'codes', `/review/${departmentId}`)}
        {navItem('Templates', 'templates', `/review/${departmentId}`)}
      </div>
      <div className="mt-auto px-4 py-3 text-[10px] text-[#9CA3AF] border-t border-[#E5E7EB]">
        PermitFlow v1.0 &middot; Apr 2026
      </div>
    </aside>
  );
}
