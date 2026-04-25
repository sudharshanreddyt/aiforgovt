'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { DepartmentId, Finding, DepartmentReview, ReviewerAction } from '@/lib/types';
import { DEPARTMENTS, DEMO_APP_ID } from '@/lib/constants';
import { api } from '@/lib/api';
import DepartmentMasthead from '@/components/layout/DepartmentMasthead';
import ReviewerSidebar from '@/components/layout/ReviewerSidebar';
import DepartmentTabSwitcher from '@/components/ui/DepartmentTabSwitcher';
import FindingsPanel from '@/components/ui/FindingsPanel';
import ReviewLetterPanel from '@/components/ui/ReviewLetterPanel';
import DecisionBar from '@/components/ui/DecisionBar';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/ui/LoadingState';

const PDFViewer = dynamic(() => import('@/components/ui/PDFViewer'), { ssr: false });

export default function ReviewerCockpit() {
  const params = useParams();
  const departmentId = params.department as DepartmentId;
  const appId = params.appId as string;

  const dept = DEPARTMENTS[departmentId];

  const [findings, setFindings] = useState<Finding[]>([]);
  const [review, setReview] = useState<DepartmentReview | null>(null);
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [appStatus, setAppStatus] = useState('');

  useEffect(() => {
    if (!departmentId || !appId) return;
    const load = async () => {
      try {
        const [app, deptFindings, deptReview] = await Promise.all([
          api.getApplication(appId),
          api.getDeptFindings(appId, departmentId),
          api.getDeptReview(appId, departmentId),
        ]);
        setFindings(deptFindings);
        setReview(deptReview);
        setAddress(app.address);
        setProjectType(app.projectType);
        setAppStatus(app.status);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [departmentId, appId]);

  const handleActionUpdate = useCallback(async (findingId: string, action: ReviewerAction, note?: string) => {
    try {
      const updated = await api.updateFindingAction(findingId, action, note, `REV-${departmentId.toUpperCase()}-001`);
      setFindings(prev => prev.map(f => f.id === findingId ? { ...f, reviewerAction: action, reviewerNote: note || f.reviewerNote } : f));
    } catch (e) {
      console.error(e);
    }
  }, [departmentId]);

  const hasActioned = findings.some(f => f.reviewerAction !== 'pending');

  if (!dept) return <div className="p-8 text-red-600">Invalid department: {departmentId}</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DepartmentMasthead departmentId={departmentId} reviewerName={review?.reviewerName || 'Plan Examiner'} />

      <div className="flex flex-1 overflow-hidden">
        <ReviewerSidebar departmentId={departmentId} applicationId={appId} activeSection="applications" />

        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Breadcrumb */}
          <div className="px-4 py-2 text-[11px] text-[#6B7280] bg-white border-b border-[#E5E7EB] shrink-0">
            Queue / <span className="font-mono">{appId}</span> / {dept.shortName} Review
          </div>

          {/* Application header strip */}
          <div className="flex items-center px-4 h-12 bg-[#F2F4F6] border-b border-[#E5E7EB] shrink-0">
            <span className="font-mono text-[12px] text-[#6B7280] mr-3">{appId}</span>
            <span className="text-[13px] text-[#374151] mr-3">{address || '2247 18th St NW, Washington, DC'}</span>
            <span className="text-[13px] text-[#374151] mr-auto">
              {projectType ? projectType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Change of Use'}
            </span>
            <Badge variant={appStatus || 'dept_review'} />
          </div>

          {/* Department tab switcher */}
          <DepartmentTabSwitcher activeDept={departmentId} appId={appId} />

          {/* Main cockpit: PDF left, findings right */}
          {loading ? (
            <LoadingState message="Loading findings and plans..." />
          ) : (
            <div className="flex flex-1 overflow-hidden">
              {/* PDF Viewer — 55% */}
              <div className="flex-[55] overflow-hidden border-r border-[#E5E7EB]">
                <PDFViewer
                  pdfUrl="/sample-plan.pdf"
                  findings={findings}
                  departmentId={departmentId}
                  selectedFindingId={selectedFindingId}
                  onFindingClick={(id) => setSelectedFindingId(id)}
                />
              </div>

              {/* Findings panel — 45% */}
              <div className="flex-[45] flex flex-col overflow-hidden">
                <FindingsPanel
                  findings={findings}
                  departmentId={departmentId}
                  selectedFindingId={selectedFindingId}
                  onFindingSelect={setSelectedFindingId}
                  onActionUpdate={handleActionUpdate}
                />
                <DecisionBar
                  reviewId={review?.id || `REV-${departmentId.toUpperCase()}-2026-0001`}
                  departmentId={departmentId}
                  hasActioned={hasActioned}
                />
                <ReviewLetterPanel
                  reviewId={review?.id || `REV-${departmentId.toUpperCase()}-2026-0001`}
                  departmentId={departmentId}
                  initialLetter={review?.reviewLetterDraft || undefined}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
