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
    <div className="border-t border-[#D8E0EA] shrink-0" style={{ maxHeight: expanded ? '340px' : '48px' }}>
      {/* Header bar */}
      <div
        className="h-12 flex items-center px-3 gap-3 bg-white border-b border-[#D8E0EA] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#475569] flex-1">
          {expanded ? 'v' : '>'} Review Letter Draft - {dept.shortName} Department
        </span>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={generateLetter}
            disabled={isGenerating}
            className="rounded-md text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 border border-[#D8E0EA] bg-white hover:bg-[#F8FAFC] disabled:opacity-50"
            style={{ color: dept.colorPrimary }}
          >
            {isGenerating ? 'GENERATING...' : letter ? 'REGENERATE' : 'GENERATE LETTER'}
          </button>
          {letter && (
            <button onClick={copyText} className="rounded-md text-[10px] font-bold uppercase text-[#64748B] px-2 py-1.5 border border-[#D8E0EA] bg-white hover:bg-[#F8FAFC]">
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
