'use client';
import { useState } from 'react';
import { Finding, DepartmentId, ReviewerAction } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';
import Badge from './Badge';
import CodeCitation from './CodeCitation';

const SEVERITY_BORDER: Record<string, string> = {
  critical: '#B91C1C', warning: '#B45309', info: '#1E40AF', pass: '#065F46',
};

interface Props {
  finding: Finding;
  departmentId: DepartmentId;
  pinNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  onActionUpdate: (action: ReviewerAction, note?: string) => void;
}

export default function FindingCard({ finding, departmentId, pinNumber, isSelected, onSelect, onActionUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [inputText, setInputText] = useState('');
  const dept = DEPARTMENTS[departmentId];

  const handleSelect = () => {
    onSelect();
    setExpanded(true);
  };

  const actionColor = (action: ReviewerAction) =>
    finding.reviewerAction === action ? { background: dept.colorLight, color: dept.colorDark } : { background: 'white', color: '#374151' };

  return (
    <div
      className={`border border-[#E5E7EB] bg-white mb-2 transition-all cursor-pointer ${isSelected ? 'shadow-md' : ''}`}
      style={{
        borderLeft: `4px solid ${SEVERITY_BORDER[finding.severity] || '#6B7280'}`,
        outline: isSelected ? `1px solid ${dept.colorPrimary}` : undefined,
      }}
      onClick={handleSelect}
    >
      {/* Header (always visible) */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F2F4F6] border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Badge variant={finding.severity} small />
          <span className="font-mono text-[11px] text-[#6B7280]">{finding.id}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold"
            style={{ backgroundColor: dept.colorPrimary }}
          >
            {pinNumber}
          </span>
          <span className="font-mono">{finding.pageRef}</span>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#111827] leading-snug">{finding.title}</p>
          <button
            className="ml-2 text-[11px] text-[#6B7280] shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-[12px] text-[#374151] mb-3 leading-relaxed">{finding.description}</p>

          <CodeCitation
            authority={finding.codeAuthority}
            citation={finding.codeCitation}
            excerpt={finding.codeText}
            departmentId={departmentId}
          />

          {finding.suggestedFix && (
            <div className="mt-2">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">Suggested Correction</div>
              <p className="text-[12px] text-[#374151]">{finding.suggestedFix}</p>
            </div>
          )}

          <div className="mt-2 text-[10px] uppercase tracking-wider text-[#6B7280]">
            AI Confidence: <span className="font-bold text-[#374151]">{finding.aiConfidence?.toUpperCase()}</span>
          </div>

          {/* Action buttons */}
          <div className="flex border border-[#E5E7EB] mt-3">
            <button
              onClick={() => onActionUpdate('accepted')}
              className="flex-1 h-9 text-[11px] font-bold uppercase tracking-wide border-r border-[#E5E7EB] transition-colors"
              style={actionColor('accepted')}
            >
              Accept
            </button>
            <button
              onClick={() => setShowOverride(!showOverride)}
              className="flex-1 h-9 text-[11px] font-bold uppercase tracking-wide border-r border-[#E5E7EB] transition-colors"
              style={actionColor('overridden')}
            >
              Override
            </button>
            <button
              onClick={() => setShowNote(!showNote)}
              className="flex-1 h-9 text-[11px] font-bold uppercase tracking-wide transition-colors"
              style={actionColor('added')}
            >
              Add Note
            </button>
          </div>

          {showOverride && (
            <div className="mt-2 border border-[#E5E7EB] p-2">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">Reviewer Override Note</div>
              <textarea
                className="w-full text-[12px] border border-[#E5E7EB] p-2 resize-none h-20 outline-none focus:border-[#9CA3AF]"
                placeholder="AI finding is incorrect because..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { onActionUpdate('overridden', inputText); setShowOverride(false); }}
                  className="text-[11px] font-bold uppercase px-3 py-1"
                  style={{ backgroundColor: dept.colorPrimary, color: 'white' }}
                >
                  Submit Override
                </button>
                <button onClick={() => setShowOverride(false)} className="text-[11px] text-[#6B7280] uppercase px-2">Cancel</button>
              </div>
            </div>
          )}

          {showNote && (
            <div className="mt-2 border border-[#E5E7EB] p-2">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">Add Reviewer Note</div>
              <textarea
                className="w-full text-[12px] border border-[#E5E7EB] p-2 resize-none h-20 outline-none focus:border-[#9CA3AF]"
                placeholder="Additional observation..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { onActionUpdate('added', inputText); setShowNote(false); }}
                  className="text-[11px] font-bold uppercase px-3 py-1"
                  style={{ backgroundColor: dept.colorPrimary, color: 'white' }}
                >
                  Save Note
                </button>
                <button onClick={() => setShowNote(false)} className="text-[11px] text-[#6B7280] uppercase px-2">Cancel</button>
              </div>
            </div>
          )}

          <div className="mt-2 text-[10px] text-[#9CA3AF] uppercase">
            Status: {finding.reviewerAction === 'pending' ? 'Pending Review' : finding.reviewerAction.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
