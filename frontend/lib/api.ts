import { API_BASE } from './constants';
import { Application, Finding, DepartmentReview, ReviewerAction, AIReviewProgress } from './types';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) } });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getApplication: (appId: string) =>
    fetchJSON<Application>(`${API_BASE}/api/applications/${appId}`),

  createApplication: (data: Record<string, string>) =>
    fetchJSON<Application>(`${API_BASE}/api/applications/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadDocument: async (appId: string, file: File, documentType: string) => {
    const form = new FormData();
    form.append('file', file);
    form.append('document_type', documentType);
    const res = await fetch(`${API_BASE}/api/applications/${appId}/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`Upload error ${res.status}`);
    return res.json();
  },

  getApplicationStatus: (appId: string) =>
    fetchJSON(`${API_BASE}/api/applications/${appId}/status`),

  triggerReview: (appId: string) =>
    fetchJSON(`${API_BASE}/api/ai/review/${appId}`, { method: 'POST' }),

  getReviewProgress: (appId: string) =>
    fetchJSON<AIReviewProgress>(`${API_BASE}/api/ai/review/${appId}/progress`),

  getFindings: (appId: string) =>
    fetchJSON<Finding[]>(`${API_BASE}/api/findings/${appId}`),

  getDeptFindings: (appId: string, deptId: string) =>
    fetchJSON<Finding[]>(`${API_BASE}/api/findings/${appId}/${deptId}`),

  updateFindingAction: (findingId: string, action: ReviewerAction, note?: string, reviewerId?: string) =>
    fetchJSON<Finding>(`${API_BASE}/api/findings/${findingId}/action`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewer_action: action, reviewer_note: note, reviewer_id: reviewerId }),
    }),

  getDeptReview: (appId: string, deptId: string) =>
    fetchJSON<DepartmentReview>(`${API_BASE}/api/reviews/${appId}/${deptId}`),

  submitDecision: (reviewId: string, decision: string, note: string, reviewerId: string) =>
    fetchJSON(`${API_BASE}/api/reviews/${reviewId}/decision`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, decision_note: note, reviewer_id: reviewerId }),
    }),

  generateLetter: (reviewId: string) =>
    fetchJSON<{ letter: string }>(`${API_BASE}/api/reviews/${reviewId}/letter`, { method: 'POST' }),
};
