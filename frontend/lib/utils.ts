import { DepartmentReview, DepartmentReviewStatus, ApplicationStatus, FindingSeverity } from './types';

export function computeOverallStatus(reviews: DepartmentReview[]): ApplicationStatus {
  const zoningReview = reviews.find(r => r.departmentId === 'zoning');
  if (zoningReview?.decision === 'rejected') return 'rejected';
  if (reviews.every(r => r.decision === 'approved')) return 'approved';
  if (reviews.some(r => r.decision === 'rejected')) return 'rejected';
  if (reviews.every(r => r.decision !== null) && reviews.some(r => r.decision === 'conditional')) {
    return 'conditional';
  }
  if (reviews.every(r => ['ai_complete', 'under_review', 'approved', 'conditional', 'rejected'].includes(r.status))) {
    return 'dept_review';
  }
  return 'ai_reviewing';
}

export function getDeptProgress(status: DepartmentReviewStatus): number {
  const map: Record<DepartmentReviewStatus, number> = {
    not_started: 0, in_queue: 10, ai_complete: 60, reviewer_assigned: 70,
    under_review: 80, approved: 100, conditional: 100, rejected: 100,
  };
  return map[status] ?? 0;
}

export function countFindings(findings: { severity: FindingSeverity }[]) {
  return {
    critical: findings.filter(f => f.severity === 'critical').length,
    warning: findings.filter(f => f.severity === 'warning').length,
    info: findings.filter(f => f.severity === 'info').length,
    pass: findings.filter(f => f.severity === 'pass').length,
  };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function pad2(n: number) { return String(n).padStart(2, '0'); }

export function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
}
