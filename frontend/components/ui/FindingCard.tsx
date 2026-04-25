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
      className={`mb-3 cursor-pointer rounded-lg border border-[#D8E0EA] bg-white transition-all ${isSelected ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}
      style={{
        borderLeft: `5px solid ${SEVERITY_BORDER[finding.severity] || '#6B7280'}`,
        outline: isSelected ? `2px solid ${dept.colorPrimary}` : undefined,
      }}
      onClick={handleSelect}
    >
      {/* Header (always visible) */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#F8FAFC] border-b border-[#EDF1F5] rounded-tr-lg">
        <div className="flex items-center gap-2">
          <Badge variant={finding.severity} small />
          <span className="font-mono text-[11px] font-bold text-[#64748B]">{finding.id}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
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
          <p className="text-[14px] font-black text-[#172033] leading-snug">{finding.title}</p>
          <button
            className="ml-2 rounded-md px-2 py-1 text-[11px] text-[#64748B] hover:bg-[#F1F5F9] shrink-0"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="px-3 pb-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-[12px] text-[#475569] mb-3 leading-relaxed">{finding.description}</p>

          <CodeCitation
            authority={finding.codeAuthority}
            citation={finding.codeCitation}
            excerpt={finding.codeText}
            departmentId={departmentId}
          />

          {finding.suggestedFix && (
            <div className="mt-2">
              <div className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1 font-black">Suggested Correction</div>
              <p className="rounded-md bg-[#F8FAFC] p-3 text-[12px] text-[#475569] ring-1 ring-[#E2E8F0]">{finding.suggestedFix}</p>
            </div>
          )}

          <div className="mt-3 text-[10px] uppercase tracking-wider text-[#64748B]">
            AI Confidence: <span className="font-black text-[#334155]">{finding.aiConfidence?.toUpperCase()}</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={() => onActionUpdate('accepted')}
              className="h-9 rounded-md border border-[#D8E0EA] text-[11px] font-black uppercase tracking-wide transition-colors"
              style={actionColor('accepted')}
            >
              Accept
            </button>
            <button
              onClick={() => setShowOverride(!showOverride)}
              className="h-9 rounded-md border border-[#D8E0EA] text-[11px] font-black uppercase tracking-wide transition-colors"
              style={actionColor('overridden')}
            >
              Override
            </button>
            <button
              onClick={() => setShowNote(!showNote)}
              className="h-9 rounded-md border border-[#D8E0EA] text-[11px] font-black uppercase tracking-wide transition-colors"
              style={actionColor('added')}
            >
              Add Note
            </button>
          </div>

          {showOverride && (
            <div className="mt-2 rounded-md border border-[#D8E0EA] bg-[#F8FAFC] p-2">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">Reviewer Override Note</div>
              <textarea
                className="w-full rounded-md text-[12px] border border-[#D8E0EA] p-2 resize-none h-20 outline-none focus:border-[#155E75]"
                placeholder="AI finding is incorrect because..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { onActionUpdate('overridden', inputText); setShowOverride(false); }}
                  className="rounded-md text-[11px] font-bold uppercase px-3 py-1"
                  style={{ backgroundColor: dept.colorPrimary, color: 'white' }}
                >
                  Submit Override
                </button>
                <button onClick={() => setShowOverride(false)} className="text-[11px] text-[#6B7280] uppercase px-2">Cancel</button>
              </div>
            </div>
          )}

          {showNote && (
            <div className="mt-2 rounded-md border border-[#D8E0EA] bg-[#F8FAFC] p-2">
              <div className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">Add Reviewer Note</div>
              <textarea
                className="w-full rounded-md text-[12px] border border-[#D8E0EA] p-2 resize-none h-20 outline-none focus:border-[#155E75]"
                placeholder="Additional observation..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => { onActionUpdate('added', inputText); setShowNote(false); }}
                  className="rounded-md text-[11px] font-bold uppercase px-3 py-1"
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
