'use client';
import { FindingSeverity, ApplicationStatus, DepartmentReviewStatus } from '@/lib/types';

type BadgeVariant = FindingSeverity | ApplicationStatus | DepartmentReviewStatus | string;

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  critical:              { bg: '#FEF2F2', text: '#B91C1C', border: '#FCA5A5', label: 'CRITICAL' },
  warning:               { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'WARNING' },
  info:                  { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'INFO' },
  pass:                  { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: 'PASS' },
  approved:              { bg: '#ECFDF5', text: '#065F46', border: '#6EE7B7', label: 'APPROVED' },
  conditional:           { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'CONDITIONAL' },
  rejected:              { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: 'REJECTED' },
  under_review:          { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'UNDER REVIEW' },
  ai_complete:           { bg: '#F5F3FF', text: '#4C1D95', border: '#DDD6FE', label: 'AI COMPLETE' },
  in_queue:              { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', label: 'IN QUEUE' },
  not_started:           { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB', label: 'NOT STARTED' },
  submitted:             { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'SUBMITTED' },
  ai_reviewing:          { bg: '#F5F3FF', text: '#4C1D95', border: '#DDD6FE', label: 'AI REVIEWING' },
  dept_review:           { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'UNDER REVIEW' },
  resubmission_required: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', label: 'RESUBMISSION REQUIRED' },
  reviewer_assigned:     { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE', label: 'ASSIGNED' },
};

interface Props {
  variant: BadgeVariant;
  small?: boolean;
}

export default function Badge({ variant, small }: Props) {
  const style = BADGE_STYLES[variant] || { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB', label: variant.toUpperCase() };
  return (
    <span
      className={`inline-flex items-center font-bold uppercase tracking-wide border ${small ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'}`}
      style={{ backgroundColor: style.bg, color: style.text, borderColor: style.border }}
    >
      {style.label}
    </span>
  );
}
