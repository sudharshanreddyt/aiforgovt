'use client';
import { useState } from 'react';
import { DepartmentId } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';
import { api } from '@/lib/api';

interface Props {
  reviewId: string;
  departmentId: DepartmentId;
  initialLetter?: string;
}

export default function ReviewLetterPanel({ reviewId, departmentId, initialLetter }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [letter, setLetter] = useState(initialLetter || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const dept = DEPARTMENTS[departmentId];

  const generateLetter = async () => {
    setIsGenerating(true);
    setLetter('');
    try {
      const data = await api.generateLetter(reviewId);
      const fullText = data.letter;
      let i = 0;
      const interval = setInterval(() => {
        i += 10;
        setLetter(fullText.slice(0, i));
        if (i >= fullText.length) {
          setLetter(fullText);
          clearInterval(interval);
          setIsGenerating(false);
        }
      }, 16);
    } catch {
      setIsGenerating(false);
      setLetter('Error generating letter. Check API connection.');
    }
  };

  const copyText = () => navigator.clipboard.writeText(letter);

  return (
    <div className="border-t border-[#E5E7EB] shrink-0" style={{ maxHeight: expanded ? '340px' : '44px' }}>
      {/* Header bar */}
      <div
        className="h-11 flex items-center px-3 gap-3 bg-[#F2F4F6] border-b border-[#E5E7EB] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#374151] flex-1">
          {expanded ? '▼' : '▶'} Review Letter Draft — {dept.shortName} Department
        </span>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={generateLetter}
            disabled={isGenerating}
            className="text-[10px] font-bold uppercase tracking-wide px-3 py-1 border border-[#E5E7EB] bg-white hover:bg-[#F2F4F6] disabled:opacity-50"
            style={{ color: dept.colorPrimary }}
          >
            {isGenerating ? 'GENERATING...' : letter ? 'REGENERATE' : 'GENERATE LETTER'}
          </button>
          {letter && (
            <button onClick={copyText} className="text-[10px] font-bold uppercase text-[#6B7280] px-2 py-1 border border-[#E5E7EB] bg-white hover:bg-[#F2F4F6]">
              COPY
            </button>
          )}
        </div>
      </div>

      {/* Expanded letter area */}
      {expanded && (
        <textarea
          value={letter || (isGenerating ? 'Generating letter...' : 'Click GENERATE LETTER to draft the official review letter.')}
          onChange={(e) => setLetter(e.target.value)}
          className="w-full h-[296px] p-4 text-[12px] leading-[1.8] resize-none outline-none bg-white border-0 font-mono"
          placeholder="Click GENERATE LETTER to draft the official review letter."
        />
      )}
    </div>
  );
}
