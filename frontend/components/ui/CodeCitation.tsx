'use client';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';

interface Props {
  authority: string;
  citation: string;
  excerpt: string;
  departmentId: DepartmentId;
}

export default function CodeCitation({ authority, citation, excerpt, departmentId }: Props) {
  const dept = DEPARTMENTS[departmentId];
  return (
    <div
      className="text-[12px] p-3 my-2"
      style={{
        borderLeft: `4px solid ${dept.colorPrimary}`,
        backgroundColor: dept.colorLight + 'aa',
      }}
    >
      <div className="font-mono font-bold uppercase tracking-wide mb-1" style={{ color: dept.colorDark }}>
        {authority} {citation}
      </div>
      <div className="border-t pt-1 text-slate-600 italic" style={{ borderColor: dept.colorBorder }}>
        &ldquo;{excerpt}&rdquo;
      </div>
    </div>
  );
}
