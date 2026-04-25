'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Application, Finding, DepartmentReview } from '@/lib/types';
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

  const replayConsole = () => {
    setConsoleKey(k => k + 1);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <header className="bg-[#0D2340] h-[60px] flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
      </header>
      <LoadingState message="Loading application data..." />
    </div>
  );

  if (!app) return (
    <div className="min-h-screen bg-[#F2F4F6] flex flex-col">
      <header className="bg-[#0D2340] h-[60px] flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
      </header>
      <div className="text-center py-16">
        <div className="font-mono text-[48px] text-[#E5E7EB]">404</div>
        <div className="text-[18px] font-semibold text-[#0D2340] mt-2">Application Not Found</div>
        <div className="text-[13px] text-[#6B7280] mt-1">Application {appId} could not be found in the system.</div>
        <Link href="/demo" className="mt-4 inline-block text-[11px] font-bold uppercase tracking-wide px-4 py-2 bg-[#0D2340] text-white">
          Return to Demo
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <header className="bg-[#0D2340] h-[60px] flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
        <span className="text-white/30 mx-3">|</span>
        <span className="text-white/80 text-[13px] uppercase tracking-widest">District of Columbia — DCRA</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Application header */}
        <div className="bg-white border border-[#E5E7EB]">
          <div className="px-4 py-2 bg-[#0D2340] text-white text-[10px] uppercase tracking-widest font-bold">
            PermitFlow &middot; District of Columbia &middot; DCRA
          </div>
          <div className="border-b border-[#E5E7EB]" />
          <div className="px-4 py-3 grid grid-cols-4 gap-4">
            {[
              { label: 'Application', val: app.id },
              { label: 'Project Type', val: (app.projectType || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
              { label: 'Submitted', val: app.submittedAt ? formatDate(app.submittedAt) : '—' },
              { label: 'Status', val: <Badge variant={app.status} /> },
            ].map(({ label, val }) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-widest text-[#9CA3AF]">{label}</div>
                <div className="text-[13px] font-semibold text-[#111827] mt-0.5">{val}</div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E5E7EB] px-4 py-2 text-[12px] text-[#374151]">
            <span className="font-semibold">Address:</span> {app.address} &nbsp;&nbsp;
            <span className="font-semibold">Applicant:</span> {app.applicantName} &middot; {app.applicantEmail}
          </div>
        </div>

        {/* AI Console */}
        {showConsole && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] uppercase tracking-widest text-[#6B7280]">AI Review Engine</span>
              <button onClick={replayConsole} className="text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#374151]">
                Replay Animation
              </button>
            </div>
            <AgentConsole key={consoleKey} appId={appId} autoStart />
          </div>
        )}

        {/* Department status + findings overview */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2">
            <DeptStatusTable reviews={app.departmentReviews || []} />
          </div>
          <div>
            <FindingsOverview findings={findings} />
          </div>
        </div>

        {/* Activity Log */}
        <ActivityLog />
      </div>
    </div>
  );
}
