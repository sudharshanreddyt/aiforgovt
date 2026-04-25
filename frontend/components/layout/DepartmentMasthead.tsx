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
        className="h-16 flex items-center px-5 justify-between shrink-0"
        style={{ backgroundColor: '#102A43' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[14px] font-black text-[#102A43]">PF</div>
          <div>
            <div className="font-bold text-[18px] text-white tracking-tight">PermitFlow</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">
              {dept.name} - Washington, DC
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-[12px] font-semibold text-white">{reviewerName}</div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-white/45">Plan review session</div>
          </div>
          <button className="rounded-md border border-white/20 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white/80 hover:bg-white/10 hover:text-white">Sign out</button>
        </div>
      </header>
      <div className="h-1.5 w-full shrink-0" style={{ backgroundColor: dept.colorPrimary }} />
    </>
  );
}
