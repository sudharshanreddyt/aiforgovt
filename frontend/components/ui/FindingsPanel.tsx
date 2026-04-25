'use client';
import { useState } from 'react';
import { Finding, DepartmentId, ReviewerAction, FindingSeverity } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';
import FindingCard from './FindingCard';

type Tab = 'all' | FindingSeverity;

interface Props {
  findings: Finding[];
  departmentId: DepartmentId;
  selectedFindingId: string | null;
  onFindingSelect: (id: string) => void;
  onActionUpdate: (findingId: string, action: ReviewerAction, note?: string) => void;
}

export default function FindingsPanel({ findings, departmentId, selectedFindingId, onFindingSelect, onActionUpdate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const dept = DEPARTMENTS[departmentId];

  const counts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    warning: findings.filter(f => f.severity === 'warning').length,
    info: findings.filter(f => f.severity === 'info').length,
    pass: findings.filter(f => f.severity === 'pass').length,
  };
  const pending = findings.filter(f => f.reviewerAction === 'pending').length;

  const filtered = activeTab === 'all' ? findings : findings.filter(f => f.severity === activeTab);

  const TABS: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: findings.length },
    { key: 'critical', label: 'Critical', count: counts.critical },
    { key: 'warning', label: 'Warning', count: counts.warning },
    { key: 'info', label: 'Info', count: counts.info },
    { key: 'pass', label: 'Pass', count: counts.pass },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Summary stats */}
      <div className="px-3 py-2 border-b border-[#E5E7EB] bg-[#F2F4F6] shrink-0">
        <div className="text-[10px] uppercase tracking-widest font-bold text-[#6B7280] mb-1">
          Findings Summary — {dept.shortName} Department
        </div>
        <div className="grid grid-cols-5 gap-1 text-center">
          {[
            { label: 'Critical', val: counts.critical, color: '#B91C1C' },
            { label: 'Warning', val: counts.warning, color: '#92400E' },
            { label: 'Info', val: counts.info, color: '#1E40AF' },
            { label: 'Pass', val: counts.pass, color: '#065F46' },
            { label: 'Pending', val: pending, color: '#6B7280' },
          ].map(({ label, val, color }) => (
            <div key={label}>
              <div className="text-[16px] font-bold" style={{ color }}>{val}</div>
              <div className="text-[9px] uppercase tracking-wide text-[#9CA3AF]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Severity tabs */}
      <div className="flex border-b border-[#E5E7EB] shrink-0">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors"
            style={{
              borderBottom: activeTab === key ? `2px solid ${dept.colorPrimary}` : '2px solid transparent',
              color: activeTab === key ? dept.colorPrimary : '#6B7280',
              background: 'white',
            }}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Findings list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <div className="text-[12px] text-[#9CA3AF] text-center py-8">No findings in this category.</div>
        ) : (
          filtered.map((finding, i) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              departmentId={departmentId}
              pinNumber={findings.indexOf(finding) + 1}
              isSelected={selectedFindingId === finding.id}
              onSelect={() => onFindingSelect(finding.id)}
              onActionUpdate={(action, note) => onActionUpdate(finding.id, action, note)}
            />
          ))
        )}
      </div>
    </div>
  );
}
