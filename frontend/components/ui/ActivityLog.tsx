'use client';
import { DEPARTMENTS } from '@/lib/constants';

interface ActivityEvent {
  timestamp: string;
  departmentId?: string;
  message: string;
}

const DEMO_EVENTS: ActivityEvent[] = [
  { timestamp: 'APR 24, 2026 — 16:14', departmentId: 'zoning', message: 'Zoning Administration — Application approved with no conditions.' },
  { timestamp: 'APR 24, 2026 — 16:08', message: 'AI Review Engine — Pre-screening complete. 11 findings across 4 departments.' },
  { timestamp: 'APR 24, 2026 — 15:31', message: 'Application APP-2026-4471 submitted for review.' },
  { timestamp: 'APR 24, 2026 — 15:30', message: 'Documents uploaded: architectural_plans_v3.pdf (24 pages).' },
];

interface Props {
  events?: ActivityEvent[];
}

export default function ActivityLog({ events = DEMO_EVENTS }: Props) {
  return (
    <div className="border border-[#E5E7EB] bg-white">
      <div className="px-3 py-2 bg-[#0D2340] text-white text-[11px] font-bold uppercase tracking-widest">
        Activity Log
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {events.map((ev, i) => {
          const dept = ev.departmentId ? DEPARTMENTS[ev.departmentId as keyof typeof DEPARTMENTS] : null;
          return (
            <div key={i} className="flex gap-3 px-3 py-2" style={{ borderLeft: `3px solid ${dept?.colorPrimary || '#0D2340'}` }}>
              <span className="font-mono text-[10px] text-[#9CA3AF] shrink-0 w-36">{ev.timestamp}</span>
              <span className="text-[12px] text-[#374151]">{ev.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
