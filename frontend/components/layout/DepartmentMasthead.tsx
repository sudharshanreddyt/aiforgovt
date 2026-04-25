'use client';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';

interface Props {
  departmentId: DepartmentId;
  reviewerName?: string;
}

export default function DepartmentMasthead({ departmentId, reviewerName = 'Plan Examiner' }: Props) {
  const dept = DEPARTMENTS[departmentId];
  return (
    <>
      <header
        className="h-[60px] flex items-center px-6 justify-between shrink-0"
        style={{ backgroundColor: '#0D2340' }}
      >
        <div className="flex items-center gap-4">
          <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
          <span className="text-white/30 text-lg">|</span>
          <span className="text-white/80 text-[13px] uppercase tracking-widest font-normal">
            {dept.name} — Washington, DC
          </span>
        </div>
        <div className="text-white/70 text-[12px]">
          {reviewerName} &middot; <button className="underline hover:text-white">Sign Out</button>
        </div>
      </header>
      <div className="h-1 w-full shrink-0" style={{ backgroundColor: dept.colorPrimary }} />
    </>
  );
}
