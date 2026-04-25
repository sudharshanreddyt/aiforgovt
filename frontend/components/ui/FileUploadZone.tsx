'use client';
import { useRef, useState } from 'react';

interface Props {
  label: string;
  required?: boolean;
  onFile: (file: File | null) => void;
  demoFile?: boolean;
}

export default function FileUploadZone({ label, required, onFile, demoFile }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    onFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') handleFile(f);
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const displayFile = file || (demoFile ? { name: 'architectural_plans_v3.pdf', size: 4.2 * 1024 * 1024 } as File : null);

  return (
    <div
      className={`min-h-[118px] rounded-lg border transition cursor-pointer ${isDragging ? 'border-[#155E75] bg-cyan-50 shadow-inner' : 'border-dashed border-[#CBD5E1] bg-white hover:border-[#155E75] hover:shadow-sm'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !displayFile && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {displayFile ? (
        <div className="flex h-full min-h-[118px] items-center justify-between gap-3 px-4 py-3">
          <div>
            <div className="mb-2 inline-flex rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">Attached</div>
            <div className="text-[12px] font-black text-[#172033]">{displayFile.name}</div>
            <div className="mt-1 text-[10px] text-[#64748B]">{(displayFile.size / (1024 * 1024)).toFixed(1)} MB</div>
          </div>
          <button onClick={remove} className="rounded-md border border-[#D8E0EA] px-2 py-1 text-[10px] font-bold uppercase text-[#64748B] hover:text-[#334155]">
            Remove
          </button>
        </div>
      ) : (
        <div className="flex min-h-[118px] flex-col items-center justify-center px-3 py-4 text-center">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-[#EEF3F7] text-[18px] font-black text-[#155E75]">+</div>
          <div className="text-[11px] font-black uppercase tracking-wide text-[#334155] mb-1">
            {label} {required && <span className="text-[#DC2626]">*</span>}
          </div>
          <div className="text-[11px] text-[#64748B]">Drag PDF here or click to browse</div>
        </div>
      )}
    </div>
  );
}
