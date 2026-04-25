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
      className={`border transition-colors cursor-pointer ${isDragging ? 'border-[#374151] bg-[#E5E7EB]' : 'border-dashed border-[#D1D5DB] bg-[#F2F4F6] hover:border-[#9CA3AF]'}`}
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
        <div className="flex items-center justify-between px-3 py-2">
          <div>
            <div className="text-[12px] font-semibold text-[#111827]">{displayFile.name}</div>
            <div className="text-[10px] text-[#6B7280]">{(displayFile.size / (1024 * 1024)).toFixed(1)} MB</div>
          </div>
          <button onClick={remove} className="text-[10px] font-bold uppercase text-[#6B7280] hover:text-[#374151] px-2 py-1 border border-[#E5E7EB]">
            Remove
          </button>
        </div>
      ) : (
        <div className="text-center py-4 px-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-[#374151] mb-1">
            {label} {required && <span className="text-[#DC2626]">*</span>}
          </div>
          <div className="text-[11px] text-[#9CA3AF]">Drag PDF here or click to browse</div>
        </div>
      )}
    </div>
  );
}
