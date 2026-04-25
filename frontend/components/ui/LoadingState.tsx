'use client';
export default function LoadingState({ message = 'Retrieving application data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-widest text-[#6B7280] mb-2">Loading</div>
        <div className="text-[13px] text-[#374151]">{message}</div>
      </div>
    </div>
  );
}
