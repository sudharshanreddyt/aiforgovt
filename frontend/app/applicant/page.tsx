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

  return (
    <div className="min-h-screen bg-[#F2F4F6]">
      {/* Masthead */}
      <header className="bg-[#0D2340] h-[60px] flex items-center px-6">
        <span className="font-bold text-[18px] text-white tracking-tight">PermitFlow</span>
        <span className="text-white/30 mx-3">|</span>
        <span className="text-white/80 text-[13px] uppercase tracking-widest">District of Columbia — Department of Buildings</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-[22px] font-bold text-[#0D2340] uppercase tracking-tight">PermitFlow — Building Permit Pre-Screening Service</h1>
          <p className="text-[12px] text-[#6B7280] mt-1">District of Columbia &middot; Fiscal Year 2026</p>
          <div className="border-b border-[#E5E7EB] mt-3" />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-[#E5E7EB]">
            <div className="bg-[#0D2340] px-4 py-3 text-white text-[13px] font-bold uppercase tracking-wide">
              New Permit Application
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#374151] mb-1">Project Address</label>
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="w-full border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#9CA3AF] bg-white"
                  placeholder="Street address, Washington, DC"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#374151] mb-1">Project Type</label>
                <select
                  value={projectType}
                  onChange={e => setProjectType(e.target.value)}
                  required
                  className="w-full border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#9CA3AF] bg-white"
                >
                  <option value="">Select project type...</option>
                  <option value="restaurant_change_of_use">Restaurant Change of Use</option>
                  <option value="new_construction">New Construction</option>
                  <option value="renovation">Renovation / Alteration</option>
                  <option value="addition">Addition</option>
                  <option value="tenant_improvement">Tenant Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#374151] mb-1">Project Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#9CA3AF] resize-none bg-white"
                  placeholder="Briefly describe the proposed work..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#374151] mb-1">Applicant Name</label>
                  <input
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    required
                    className="w-full border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#9CA3AF] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wide text-[#374151] mb-1">Applicant Email</label>
                  <input
                    type="email"
                    value={applicantEmail}
                    onChange={e => setApplicantEmail(e.target.value)}
                    required
                    className="w-full border border-[#E5E7EB] px-3 py-2 text-[13px] outline-none focus:border-[#9CA3AF] bg-white"
                  />
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] pt-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#374151] mb-3">Upload Documents</div>
                <div className="space-y-2">
                  <FileUploadZone label="Architectural Plans (Required)" required onFile={setArchFile} demoFile={demoFileAttached} />
                  <FileUploadZone label="MEP Plans" onFile={setMepFile} />
                  <FileUploadZone label="Narrative / Other" onFile={() => {}} />
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-2">Accepted formats: PDF only. Max 50MB per file.</p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 text-[13px] font-bold uppercase tracking-wide text-white disabled:opacity-60"
                style={{ backgroundColor: '#0D2340' }}
              >
                {submitting ? 'SUBMITTING...' : 'Submit for AI Pre-Screening'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={loadDemoData}
            className="text-[11px] font-bold uppercase tracking-wide text-[#7C3AED] border border-[#DDD6FE] px-4 py-2 bg-[#F5F3FF] hover:bg-[#EDE9FE]"
          >
            Load Demo Application
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[12px] text-[#6B7280]">
            Have an existing application?{' '}
            <input
              value={existingId}
              onChange={e => setExistingId(e.target.value)}
              placeholder="APP-2026-4471"
              className="border-b border-[#E5E7EB] px-1 text-[12px] outline-none w-28 mx-1"
            />
            <button onClick={goToExisting} className="text-[#1D4ED8] font-bold underline ml-1">
              View Status
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
