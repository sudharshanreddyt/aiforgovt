'use client';
import { useState } from 'react';
import { DepartmentId } from '@/lib/types';
import { api } from '@/lib/api';

interface Props {
  reviewId: string;
  departmentId: DepartmentId;
  onDecision?: (decision: string) => void;
  hasActioned: boolean;
}

export default function DecisionBar({ reviewId, departmentId, onDecision, hasActioned }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<string>('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openModal = (decision: string) => {
    setPendingDecision(decision);
    setShowModal(true);
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await api.submitDecision(reviewId, pendingDecision, note, `REV-${departmentId.toUpperCase()}-001`);
      onDecision?.(pendingDecision);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="flex items-center h-12 px-3 gap-3 border-t border-[#E5E7EB] bg-[#F2F4F6] shrink-0">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#374151] mr-auto">Department Decision</span>
        <button
          disabled={!hasActioned}
          onClick={() => openModal('approved')}
          className="text-[11px] font-bold uppercase px-4 py-1.5 border-2 disabled:opacity-40"
          style={{ borderColor: '#059669', color: '#059669' }}
        >
          Approve
        </button>
        <button
          disabled={!hasActioned}
          onClick={() => openModal('conditional')}
          className="text-[11px] font-bold uppercase px-4 py-1.5 border-2 disabled:opacity-40"
          style={{ borderColor: '#D97706', color: '#D97706' }}
        >
          Conditional
        </button>
        <button
          disabled={!hasActioned}
          onClick={() => openModal('rejected')}
          className="text-[11px] font-bold uppercase px-4 py-1.5 border-2 disabled:opacity-40"
          style={{ borderColor: '#DC2626', color: '#DC2626' }}
        >
          Reject
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-[#E5E7EB] p-6 w-[480px] shadow-xl">
            <div className="text-[13px] font-bold uppercase tracking-wide mb-3">
              Confirm {pendingDecision.toUpperCase()}
            </div>
            <textarea
              className="w-full h-28 border border-[#E5E7EB] p-3 text-[12px] resize-none outline-none mb-3"
              placeholder="Decision note (optional)..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowModal(false)} className="text-[11px] uppercase px-4 py-2 border border-[#E5E7EB]">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="text-[11px] font-bold uppercase px-4 py-2 text-white disabled:opacity-50"
                style={{ backgroundColor: pendingDecision === 'approved' ? '#059669' : pendingDecision === 'rejected' ? '#DC2626' : '#D97706' }}
              >
                {submitting ? 'SUBMITTING...' : `Confirm ${pendingDecision.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
