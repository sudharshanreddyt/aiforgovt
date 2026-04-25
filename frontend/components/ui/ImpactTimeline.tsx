'use client';

const TRADITIONAL = [
  { label: 'Submit Application', time: null },
  { label: 'Backlog wait', time: '2–3 weeks', isDelay: true },
  { label: 'Zoning Review (sequential)', time: '4–6 weeks', isDelay: true },
  { label: 'Building Review (sequential)', time: '4–6 weeks', isDelay: true },
  { label: 'Fire Review (sequential)', time: '4–6 weeks', isDelay: true },
  { label: 'ADA Review (sequential)', time: '4–6 weeks', isDelay: true },
  { label: 'Revision Requested', time: null },
  { label: 'Revision wait', time: '4–8 weeks', isDelay: true },
  { label: 'Permit Issued', time: null },
];

const PERMITFLOW = [
  { label: 'Submit Application', time: null },
  { label: 'AI Pre-Screening', time: '< 2 minutes', isAI: true },
  { label: 'All 4 Departments in Parallel', time: '< 1 week', isParallel: true },
  { label: 'Reviewer Actions', time: '1–2 days', isDelay: false },
  { label: 'Permit Issued', time: null },
];

export default function ImpactTimeline() {
  return (
    <div className="grid grid-cols-2 gap-8 p-8 bg-white border border-[#E5E7EB]">
      {/* Traditional */}
      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#374151] mb-6">Traditional Permit Review</h3>
        <div className="relative">
          {TRADITIONAL.map((step, i) => (
            <div key={i} className="flex gap-3 mb-1">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${step.isDelay ? 'bg-[#E5E7EB] border-[#9CA3AF]' : 'bg-[#6B7280] border-[#374151]'}`} />
                {i < TRADITIONAL.length - 1 && <div className="w-0.5 flex-1 bg-[#E5E7EB] my-0.5 min-h-[20px]" />}
              </div>
              <div className="pb-2">
                <div className={`text-[12px] ${step.isDelay ? 'text-[#9CA3AF]' : 'text-[#374151] font-semibold'}`}>
                  {step.label}
                </div>
                {step.time && (
                  <div className="text-[11px] font-bold text-[#DC2626] mt-0.5">{step.time}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-[#FEF2F2] border border-[#FECACA]">
          <div className="text-[20px] font-bold text-[#DC2626]">6–18 MONTHS</div>
          <div className="text-[11px] text-[#9CA3AF]">Average total time to permit</div>
        </div>
      </div>

      {/* PermitFlow */}
      <div>
        <h3 className="text-[13px] font-bold uppercase tracking-widest text-[#059669] mb-6">With PermitFlow</h3>
        <div className="relative">
          {PERMITFLOW.map((step, i) => (
            <div key={i} className="flex gap-3 mb-1">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full border-2 ${step.isAI ? 'bg-[#7C3AED] border-[#7C3AED]' : step.isParallel ? 'bg-[#1D4ED8] border-[#1D4ED8]' : 'bg-[#059669] border-[#059669]'}`} />
                {i < PERMITFLOW.length - 1 && <div className="w-0.5 flex-1 bg-[#A7F3D0] my-0.5 min-h-[32px]" />}
              </div>
              <div className="pb-3">
                <div className="text-[12px] text-[#374151] font-semibold">{step.label}</div>
                {step.time && (
                  <div className={`text-[11px] font-bold mt-0.5 ${step.isAI ? 'text-[#7C3AED]' : 'text-[#059669]'}`}>{step.time}</div>
                )}
                {step.isParallel && (
                  <div className="flex gap-1 mt-1">
                    {['Zoning', 'Building', 'Fire', 'ADA'].map(d => (
                      <span key={d} className="text-[9px] px-1.5 py-0.5 bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] font-bold">{d}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-[#ECFDF5] border border-[#A7F3D0]">
          <div className="text-[20px] font-bold text-[#059669]">1–3 WEEKS</div>
          <div className="text-[11px] text-[#6B7280]">With PermitFlow</div>
        </div>
      </div>

      {/* Bottom comparison */}
      <div className="col-span-2 mt-4 pt-4 border-t border-[#E5E7EB] grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'Time Saved', val: '90%+', color: '#059669' },
          { label: 'Annual US Permits', val: '2M+', color: '#1D4ED8' },
          { label: 'TAM', val: '$2.5B+', color: '#7C3AED' },
        ].map(({ label, val, color }) => (
          <div key={label}>
            <div className="text-[28px] font-bold" style={{ color }}>{val}</div>
            <div className="text-[11px] uppercase tracking-wider text-[#9CA3AF]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
