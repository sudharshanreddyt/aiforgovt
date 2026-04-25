'use client';
import { useState } from 'react';
import { Finding, DepartmentId } from '@/lib/types';
import { DEPARTMENTS, DEMO_DEPARTMENTS } from '@/lib/constants';
import Badge from './Badge';
import { countFindings } from '@/lib/utils';

interface Props {
  findings: Finding[];
}

export default function FindingsOverview({ findings }: Props) {
  const [showModal, setShowModal] = useState(false);
  const counts = countFindings(findings);
  const actionableCount = counts.critical + counts.warning;

  return (
    <>
      <div className="border border-[#E5E7EB] bg-white">
        <div className="px-3 py-2 bg-[#0D2340] text-white text-[11px] font-bold uppercase tracking-widest">
          Findings Overview
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-4 text-center mb-4">
            {[
              { label: 'Critical', val: counts.critical, color: '#B91C1C' },
              { label: 'Warning', val: counts.warning, color: '#92400E' },
              { label: 'Info', val: counts.info, color: '#1E40AF' },
              { label: 'Pass', val: counts.pass, color: '#065F46' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="text-[28px] font-bold" style={{ color }}>{val}</div>
                <div className="text-[10px] uppercase tracking-wider text-[#9CA3AF]">{label}</div>
              </div>
            ))}
          </div>
          {actionableCount > 0 && (
            <p className="text-[12px] text-[#374151] mb-3">
              {actionableCount} {actionableCount === 1 ? 'issue requires' : 'issues require'} your attention before the permit can be issued.
            </p>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="w-full text-[11px] font-bold uppercase tracking-wide py-2 border border-[#E5E7EB] hover:bg-[#F2F4F6]"
          >
            View Full AI Findings Report
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0D2340] text-white shrink-0">
              <span className="text-[13px] font-bold uppercase tracking-wide">AI Findings Report — APP-2026-4471</span>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white text-[18px]">x</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4">
              {DEMO_DEPARTMENTS.map(deptId => {
                const deptFindings = findings.filter(f => f.departmentId === deptId);
                if (deptFindings.length === 0) return null;
                const dept = DEPARTMENTS[deptId];
                const dc = countFindings(deptFindings);
                const issues = deptFindings.filter(f => f.severity === 'critical' || f.severity === 'warning');
                return (
                  <div key={deptId} className="mb-6">
                    <div
                      className="text-[11px] font-bold uppercase tracking-widest py-1 px-2 mb-3 flex items-center gap-2"
                      style={{ borderLeft: `4px solid ${dept.colorPrimary}`, backgroundColor: dept.colorLight }}
                    >
                      <span style={{ color: dept.colorDark }}>{dept.name}</span>
                      <span className="text-[10px] font-normal" style={{ color: dept.colorDark }}>
                        — {dc.critical}C / {dc.warning}W / {dc.pass}P
                      </span>
                    </div>
                    {deptFindings.map(f => (
                      <div key={f.id} className="mb-3 pl-2">
                        <div className="flex items-start gap-2">
                          <Badge variant={f.severity} small />
                          <div>
                            <div className="text-[12px] font-semibold text-[#111827]">{f.title}</div>
                            <div className="text-[11px] text-[#374151] mt-0.5">{f.description}</div>
                            <div className="text-[10px] text-[#6B7280] mt-0.5 font-mono">
                              {f.codeAuthority} {f.codeCitation} | {f.pageRef}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
