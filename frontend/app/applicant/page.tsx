'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import FileUploadZone from '@/components/ui/FileUploadZone';
import { DEMO_APP_ID } from '@/lib/constants';

export default function ApplicantLanding() {
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [projectType, setProjectType] = useState('');
  const [description, setDescription] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [archFile, setArchFile] = useState<File | null>(null);
  const [mepFile, setMepFile] = useState<File | null>(null);
  const [demoFileAttached, setDemoFileAttached] = useState(false);
  const [existingId, setExistingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDemoData = () => {
    setAddress('2247 18th St NW, Washington, DC 20009');
    setProjectType('restaurant_change_of_use');
    setDescription('Change of use from retail (Group M) to restaurant (Group A-2). Interior renovation of 2,800 sf.');
    setApplicantName('Maria L. Chen');
    setApplicantEmail('maria.chen@sunrisecafe.com');
    setDemoFileAttached(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const app = await api.createApplication({ applicant_name: applicantName, applicant_email: applicantEmail, address, project_type: projectType, project_description: description });
      if (archFile) await api.uploadDocument(app.id, archFile, 'architectural_plans');
      if (mepFile) await api.uploadDocument(app.id, mepFile, 'mep_plans');
      router.push(`/applicant/${app.id}`);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  const goToExisting = () => {
    if (existingId.trim()) router.push(`/applicant/${existingId.trim()}`);
    else router.push(`/applicant/${DEMO_APP_ID}`);
  };

  const inputClass = 'w-full rounded-md border border-[#D8E0EA] bg-white px-3 py-2.5 text-[13px] text-[#172033] outline-none transition focus:border-[#155E75] focus:ring-4 focus:ring-cyan-900/10';

  return (
    <div className="min-h-screen bg-[#EEF3F7]">
      <header className="border-b border-white/10 bg-[#102A43]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-[14px] font-black text-[#102A43]">PF</div>
            <div>
              <div className="text-[18px] font-bold text-white">PermitFlow</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">Applicant portal</div>
            </div>
          </div>
          <button onClick={goToExisting} className="pf-button rounded-md border border-white/20 px-4 py-2 text-[12px] font-bold text-white hover:bg-white/10">
            Open demo status
          </button>
        </div>
      </header>

      <main className="pf-grid-bg">
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-5 py-7 lg:grid-cols-[0.86fr_1.14fr]">
          <aside className="space-y-5">
            <div className="rounded-lg bg-[#102A43] p-6 text-white shadow-[0_22px_62px_rgba(16,42,67,0.18)]">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-100/70">DC Department of Buildings</div>
              <h1 className="mt-4 text-[36px] font-black leading-[1.05] tracking-tight">Submit once. Review everywhere.</h1>
              <p className="mt-4 text-[14px] leading-6 text-slate-100/80">
                Upload a permit packet and watch zoning, building, fire, and accessibility review run in parallel with cited plan findings before formal routing.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2">
                {[
                  ['1', 'Project'],
                  ['2', 'Plans'],
                  ['3', 'AI screen'],
                ].map(([n, label]) => (
                  <div key={n} className="rounded-md border border-white/12 bg-white/9 p-3">
                    <div className="text-[20px] font-black">{n}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-cyan-100/65">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pf-card p-5">
              <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">What happens next</div>
              <div className="mt-4 space-y-4">
                {[
                  ['Document parsing', 'Plans, schedules, and narratives are converted into a structured project model.'],
                  ['Parallel agency checks', 'Specialist agents compare the packet against adopted codes and local constraints.'],
                  ['Human review cockpit', 'Department reviewers verify each cited finding before issuing a decision.'],
                ].map(([title, body]) => (
                  <div key={title} className="border-l-4 border-[#155E75] pl-4">
                    <div className="text-[13px] font-black text-[#172033]">{title}</div>
                    <p className="mt-1 text-[12px] leading-5 text-[#64748B]">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="pf-card overflow-hidden">
            <div className="border-b border-[#D8E0EA] bg-white px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">New application</div>
                  <h2 className="mt-1 text-[24px] font-black tracking-tight text-[#102A43]">Permit pre-screening intake</h2>
                </div>
                <button
                  onClick={loadDemoData}
                  className="pf-button rounded-md border border-[#C4B5FD] bg-[#F5F3FF] px-4 py-2 text-[11px] font-black uppercase tracking-wide text-[#6D28D9] hover:bg-[#EDE9FE]"
                >
                  Load demo packet
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Project address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} required className={inputClass} placeholder="Street address, Washington, DC" />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Project type</label>
                  <select value={projectType} onChange={e => setProjectType(e.target.value)} required className={inputClass}>
                    <option value="">Select project type...</option>
                    <option value="restaurant_change_of_use">Restaurant Change of Use</option>
                    <option value="new_construction">New Construction</option>
                    <option value="renovation">Renovation / Alteration</option>
                    <option value="addition">Addition</option>
                    <option value="tenant_improvement">Tenant Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Applicant name</label>
                  <input value={applicantName} onChange={e => setApplicantName(e.target.value)} required className={inputClass} />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Applicant email</label>
                  <input type="email" value={applicantEmail} onChange={e => setApplicantEmail(e.target.value)} required className={inputClass} />
                </div>

                <div className="lg:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.16em] text-[#475569]">Project description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Briefly describe the proposed work..." />
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-[#D8E0EA] bg-[#F8FAFC] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#64748B]">Upload documents</div>
                    <p className="mt-1 text-[12px] text-[#64748B]">PDF only, up to 50MB per file.</p>
                  </div>
                  <span className="rounded-md bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#64748B] ring-1 ring-[#D8E0EA]">Secure intake</span>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <FileUploadZone label="Architectural Plans" required onFile={setArchFile} demoFile={demoFileAttached} />
                  <FileUploadZone label="MEP Plans" onFile={setMepFile} />
                  <FileUploadZone label="Narrative / Other" onFile={() => {}} />
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="pf-button flex-1 rounded-md bg-[#102A43] py-3 text-[13px] font-black uppercase tracking-wide text-white shadow-lg shadow-slate-900/10 disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Submit for AI pre-screening'}
                </button>
                <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
                  <input value={existingId} onChange={e => setExistingId(e.target.value)} placeholder="APP-2026-4471" className="w-36 rounded-md border border-[#D8E0EA] bg-white px-2 py-2 font-mono text-[11px] outline-none" />
                  <button type="button" onClick={goToExisting} className="font-black text-[#155E75]">View status</button>
                </div>
              </div>
            </form>
          </section>
        </section>
      </main>
    </div>
  );
}
