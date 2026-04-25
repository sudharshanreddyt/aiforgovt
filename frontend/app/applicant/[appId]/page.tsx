'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Application, Finding } from '@/lib/types';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import AgentConsole from '@/components/ui/AgentConsole';
import DeptStatusTable from '@/components/ui/DeptStatusTable';
import FindingsOverview from '@/components/ui/FindingsOverview';
import ActivityLog from '@/components/ui/ActivityLog';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/ui/LoadingState';

export default function ApplicantDashboard() {
  const params = useParams();
  const appId = params.appId as string;

  const [app, setApp] = useState<Application | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleKey, setConsoleKey] = useState(0);

  useEffect(() => {
    if (!appId) return;
    const load = async () => {
      try {
        const appData = await api.getApplication(appId);
        setApp(appData);
        const f = await api.getFindings(appId);
        setFindings(f);
        setShowConsole(true);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appId]);

  const replayConsole = () => setConsoleKey(k => k + 1);

  if (loading) return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <header className="bg-[#102A43] h-16 flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
      </header>
      <LoadingState message="Loading application data..." />
    </div>
  );

  if (!app) return (
    <div className="min-h-screen bg-[#EEF3F7] flex flex-col">
      <header className="bg-[#102A43] h-16 flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
      </header>
      <div className="text-center py-16">
        <div className="font-mono text-[48px] text-[#CBD5E1]">404</div>
        <div className="text-[18px] font-semibold text-[#102A43] mt-2">Application Not Found</div>
        <div className="text-[13px] text-[#64748B] mt-1">Application {appId} could not be found in the system.</div>
        <Link href="/demo" className="mt-4 inline-block rounded-md px-4 py-2 text-[11px] font-bold uppercase tracking-wide bg-[#102A43] text-white">
          Return to Demo
        </Link>
      </div>
    </div>
  );

  const completed = (app.departmentReviews || []).filter(r => r.completedAt || ['approved', 'conditional', 'rejected'].includes(r.status)).length;
  const total = (app.departmentReviews || []).length || 4;
  const progressPct = Math.round((completed / total) * 100);
  const critical = findings.filter(f => f.severity === 'critical').length;
  const warning = findings.filter(f => f.severity === 'warning').length;

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#102A43]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[14px] font-black text-[#102A43]">PF</div>
            <div>
              <div className="text-[18px] font-bold text-white">PermitFlow</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Applicant status center</div>
            </div>
          </div>
          <Link href="/demo" className="rounded-md border border-white/20 px-4 py-2 text-[12px] font-bold text-white hover:bg-white/10">
            Demo navigator
          </Link>
        </div>
      </header>

      <main className="pf-grid-bg">
        <div className="mx-auto max-w-7xl px-5 py-7">
          <section className="rounded-lg bg-[#102A43] p-6 text-white shadow-[0_22px_62px_rgba(16,42,67,0.18)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">District of Columbia</span>
                  <Badge variant={app.status} />
                </div>
                <h1 className="text-[34px] font-black leading-tight tracking-tight md:text-[44px]">{app.address}</h1>
                <p className="mt-2 text-[14px] text-slate-100/80">
                  {app.id} - {(app.projectType || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - Submitted {app.submittedAt ? formatDate(app.submittedAt) : 'today'}
                </p>
              </div>
              <div className="grid min-w-[320px] grid-cols-3 gap-2">
                {[
                  [`${progressPct}%`, 'review progress'],
                  [`${critical}`, 'critical'],
                  [`${warning}`, 'warnings'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-md border border-white/12 bg-white/9 p-4 text-center">
                    <div className="text-[28px] font-black">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-cyan-100/65">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1.18fr_0.82fr]">
            <div className="space-y-5">
              {showConsole && (
                <div className="pf-card overflow-hidden">
                  <div className="flex items-center justify-between border-b border-[#D8E0EA] bg-white px-5 py-4">
                    <div>
                      <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">AI review engine</div>
                      <p className="mt-1 text-[12px] text-[#64748B]">Specialist departments run in parallel, then route findings to reviewers.</p>
                    </div>
                    <button onClick={replayConsole} className="pf-button rounded-md border border-[#D8E0EA] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-[#475569] hover:bg-[#F8FAFC]">
                      Replay
                    </button>
                  </div>
                  <AgentConsole key={consoleKey} appId={appId} autoStart />
                </div>
              )}

              <DeptStatusTable reviews={app.departmentReviews || []} />
              <ActivityLog />
            </div>

            <aside className="space-y-5">
              <div className="pf-card p-5">
                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Project record</div>
                <dl className="mt-4 space-y-3">
                  {[
                    ['Applicant', `${app.applicantName} - ${app.applicantEmail}`],
                    ['Application', app.id],
                    ['Project type', (app.projectType || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
                    ['Address', app.address],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">{label}</dt>
                      <dd className="mt-0.5 text-[13px] font-semibold text-[#172033]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <FindingsOverview findings={findings} />
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
