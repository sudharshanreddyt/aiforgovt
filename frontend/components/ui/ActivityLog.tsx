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
    <div className="pf-card overflow-hidden">
      <div className="border-b border-[#D8E0EA] bg-white px-5 py-4">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Activity log</div>
      </div>
      <div className="divide-y divide-[#EDF1F5]">
        {events.map((ev, i) => {
          const dept = ev.departmentId ? DEPARTMENTS[ev.departmentId as keyof typeof DEPARTMENTS] : null;
          return (
            <div key={i} className="flex gap-3 px-5 py-3" style={{ borderLeft: `4px solid ${dept?.colorPrimary || '#102A43'}` }}>
              <span className="font-mono text-[10px] text-[#94A3B8] shrink-0 w-36">{ev.timestamp}</span>
              <span className="text-[12px] text-[#475569]">{ev.message}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
