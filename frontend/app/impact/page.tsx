import Link from 'next/link';
import ImpactTimeline from '@/components/ui/ImpactTimeline';

export default function ImpactPage() {
  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      <header className="bg-[#0D2340] h-[60px] flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
          <span className="text-white/30">|</span>
          <span className="text-white/80 text-[12px] uppercase tracking-widest">Impact Overview</span>
        </div>
        <Link href="/demo" className="text-white/70 text-[11px] font-bold uppercase tracking-wide border border-white/20 px-3 py-1 hover:bg-white/10">
          Back to Demo
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#0D2340] uppercase tracking-tight">Today vs PermitFlow</h1>
          <p className="text-[12px] text-[#6B7280] mt-1">How AI parallel review compresses 9 months into weeks.</p>
          <div className="border-b border-[#E5E7EB] mt-3" />
        </div>
        <ImpactTimeline />
      </div>
    </div>
  );
}
