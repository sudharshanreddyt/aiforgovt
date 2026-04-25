'use client';
interface Props { message?: string; onRetry?: () => void; appId?: string; }
export default function ErrorState({ message = 'Unable to load data. Please try again.', onRetry, appId }: Props) {
  return (
    <div className="border border-[#E5E7EB] bg-[#F2F4F6] p-4">
      <div className="text-[11px] uppercase tracking-wide text-[#B91C1C] mb-1">Error</div>
      <div className="text-[13px] text-[#111827]">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-[11px] font-bold uppercase tracking-wide px-3 py-1 border border-[#E5E7EB] bg-white hover:bg-[#F2F4F6]">
          RETRY
        </button>
      )}
    </div>
  );
}
