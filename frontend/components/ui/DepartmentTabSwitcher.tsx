'use client';
import { useRouter } from 'next/navigation';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS, DEMO_APP_ID } from '@/lib/constants';

const DEMO_TABS: { dept: DepartmentId; label: string }[] = [
  { dept: 'building', label: 'Building' },
  { dept: 'fire', label: 'Fire' },
  { dept: 'ada', label: 'ADA' },
  { dept: 'zoning', label: 'Zoning' },
];

interface Props {
  activeDept: DepartmentId;
  appId?: string;
}

export default function DepartmentTabSwitcher({ activeDept, appId = DEMO_APP_ID }: Props) {
  const router = useRouter();
  return (
    <div className="flex border-b border-[#E5E7EB] shrink-0">
      {DEMO_TABS.map(({ dept, label }) => {
        const d = DEPARTMENTS[dept];
        const isActive = dept === activeDept;
        return (
          <button
            key={dept}
            onClick={() => router.push(`/review/${dept}/${appId}`)}
            className="h-10 px-4 text-[11px] font-bold uppercase tracking-wide transition-colors border-r border-[#E5E7EB] last:border-r-0"
            style={{
              backgroundColor: isActive ? d.colorPrimary : 'white',
              color: isActive ? 'white' : d.colorPrimary,
              borderLeft: isActive ? `3px solid ${d.colorDark}` : undefined,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
