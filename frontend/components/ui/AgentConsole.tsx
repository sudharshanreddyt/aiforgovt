'use client';
import { useEffect, useState, useRef } from 'react';
import { DEPARTMENTS, DEMO_APP_ID } from '@/lib/constants';
import { api } from '@/lib/api';
import { formatElapsed } from '@/lib/utils';

interface AgentStatus {
  department_id: string;
  status: string;
  checks_complete: number;
  checks_total: number;
  current_action: string;
}

interface ProgressResponse {
  overall_status: string;
  agents: AgentStatus[];
}

interface Props {
  appId: string;
  autoStart?: boolean;
  onComplete?: () => void;
}

export default function AgentConsole({ appId, autoStart = false, onComplete }: Props) {
  const [status, setStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef<number>(0);

  const DEPT_ORDER = ['zoning', 'building', 'fire', 'ada'];

  const startReview = async () => {
    setStatus('running');
    setElapsed(0);
    startedRef.current = Date.now();
    try {
      await api.triggerReview(appId);
    } catch (e) {
      console.error(e);
    }

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedRef.current) / 1000));
    }, 1000);

    intervalRef.current = setInterval(async () => {
      try {
        const progress = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/ai/review/${appId}/progress`).then(r => r.json()) as ProgressResponse;
        const ordered = DEPT_ORDER.map(d => progress.agents.find(a => a.department_id === d)).filter((x): x is AgentStatus => !!x);
        setAgents(ordered);
        if ((progress as ProgressResponse).overall_status === 'complete') {
          setStatus('complete');
          clearInterval(intervalRef.current!);
          clearInterval(timerRef.current!);
          onComplete?.();
        }
      } catch {}
    }, 2000);
  };

  useEffect(() => {
    if (autoStart) startReview();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetAndReplay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setAgents([]);
    setStatus('idle');
    setTimeout(() => startReview(), 100);
  };

  return (
    <div className="bg-[#102A43] text-white p-5 font-mono">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[11px] uppercase tracking-[0.2em] font-black text-white/80">
          AI Review Engine - {status === 'complete' ? 'COMPLETE' : status === 'running' ? 'RUNNING' : 'READY'}
        </div>
        <div className="flex gap-2">
          {status === 'idle' && (
            <button
              onClick={startReview}
              className="rounded-md text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 border border-white/30 hover:bg-white/10"
            >
              RUN AI REVIEW
            </button>
          )}
          {(status === 'running' || status === 'complete') && (
            <button
              onClick={resetAndReplay}
              className="rounded-md text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 border border-white/30 hover:bg-white/10"
            >
              REPLAY
            </button>
          )}
        </div>
      </div>

      {status === 'idle' && (
        <div className="text-[12px] text-white/40 text-center py-4">
          Click RUN AI REVIEW to start parallel agent analysis.
        </div>
      )}

      {(status === 'running' || status === 'complete') && (
        <>
          {status === 'running' && (
            <div className="text-[11px] text-white/60 mb-3">
              All four specialist agents are reviewing your application in parallel.
            </div>
          )}
          {status === 'complete' && (
            <div className="text-[11px] text-white/60 mb-3">
              Review complete. 4 specialist agents reviewed 6 checks each. Your application has been forwarded to all departments.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {(agents.length > 0 ? agents : DEPT_ORDER.map(d => ({ department_id: d, status: 'queued', checks_complete: 0, checks_total: 6, current_action: 'Waiting...' }))).map((agent) => {
              const dept = DEPARTMENTS[agent.department_id as keyof typeof DEPARTMENTS];
              if (!dept) return null;
              const pct = agent.checks_total > 0 ? (agent.checks_complete / agent.checks_total) * 100 : 0;
              const isComplete = agent.status === 'complete';

              return (
                <div key={agent.department_id} className="rounded-md border border-white/10 bg-white/8 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider w-32 font-black" style={{ color: dept.colorPrimary }}>
                      {dept.shortName} Agent
                    </span>
                    <span className="text-[10px] text-white/50 flex-1 mx-3 truncate">{agent.current_action}</span>
                    <span className="text-[10px] font-bold" style={{ color: isComplete ? '#34D399' : 'white' }}>
                      {isComplete ? 'COMPLETE' : `${agent.checks_complete}/${agent.checks_total}`}
                    </span>
                  </div>
                  <div className="h-2.5 bg-white/10 w-full rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: isComplete ? '#34D399' : dept.colorPrimary }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-4 text-[10px] text-white/40 font-mono">
            <span>ELAPSED: {formatElapsed(elapsed * 1000)}</span>
            {status === 'running' && <span>EST. COMPLETION: ~00:30</span>}
          </div>
        </>
      )}
    </div>
  );
}
