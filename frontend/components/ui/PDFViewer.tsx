'use client';
import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { Finding, DepartmentId, BoundingBox } from '@/lib/types';
import { DEPARTMENTS } from '@/lib/constants';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const SEVERITY_PIN_COLOR: Record<string, string> = {
  critical: '#B91C1C', warning: '#B45309', info: '#1E40AF', pass: '#065F46',
};

interface Props {
  pdfUrl: string;
  findings: Finding[];
  departmentId: DepartmentId;
  selectedFindingId: string | null;
  onFindingClick: (id: string) => void;
}

export default function PDFViewer({ pdfUrl, findings, departmentId, selectedFindingId, onFindingClick }: Props) {
  const [numPages, setNumPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const [pageHeight, setPageHeight] = useState<number>(800);
  const dept = DEPARTMENTS[departmentId];

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => setNumPages(numPages), []);
  const onPageLoadSuccess = useCallback((page: any) => {
    setPageWidth(page.width);
    setPageHeight(page.height);
  }, []);

  const findingsOnPage = findings.filter(f => f.boundingBox?.page === currentPage);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#243447]">
      {/* Controls bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#111827] border-b border-black/30 shrink-0">
        <span className="mr-2 rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wide text-white" style={{ backgroundColor: dept.colorPrimary }}>
          Evidence viewer
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          className="rounded-md text-[11px] font-bold uppercase text-white/70 px-2 py-1 border border-white/20 hover:border-white/50 disabled:opacity-30"
        >
          PREV
        </button>
        <span className="text-[11px] text-white/60 font-mono">
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
          disabled={currentPage >= numPages}
          className="rounded-md text-[11px] font-bold uppercase text-white/70 px-2 py-1 border border-white/20 hover:border-white/50 disabled:opacity-30"
        >
          NEXT
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="rounded-md text-[11px] font-bold text-white/70 px-2 py-1 border border-white/20 hover:border-white/50">-</button>
          <span className="text-[11px] text-white/60 font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="rounded-md text-[11px] font-bold text-white/70 px-2 py-1 border border-white/20 hover:border-white/50">+</button>
          <button onClick={() => setScale(1.0)} className="rounded-md text-[11px] font-bold text-white/70 px-2 py-1 border border-white/20 hover:border-white/50 ml-1">FIT</button>
        </div>
      </div>

      {/* PDF content */}
      <div className="flex-1 overflow-auto flex justify-center py-5">
        <div className="relative inline-block">
          <Document file={pdfUrl} onLoadSuccess={onLoadSuccess} loading={<div className="text-white/50 p-8 text-[13px]">Loading PDF...</div>} error={<NoPDF />}>
            <Page
              pageNumber={currentPage}
              scale={scale}
              onLoadSuccess={onPageLoadSuccess}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>

          {/* Annotation pins */}
          {findingsOnPage.map((finding, idx) => {
            const bbox = finding.boundingBox as BoundingBox;
            if (!bbox) return null;
            const isSelected = selectedFindingId === finding.id;
            const pinNum = findings.findIndex(f => f.id === finding.id) + 1;
            const color = isSelected ? dept.colorPrimary : SEVERITY_PIN_COLOR[finding.severity] || '#6B7280';

            const renderedWidth = pageWidth * scale;
            const renderedHeight = pageHeight * scale;

            return (
              <div
                key={finding.id}
                style={{
                  position: 'absolute',
                  left: `${(bbox.x / pageWidth) * renderedWidth}px`,
                  top: `${(bbox.y / pageHeight) * renderedHeight}px`,
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  backgroundColor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  zIndex: 10,
                  boxShadow: isSelected ? `0 0 0 3px white, 0 0 0 5px ${dept.colorPrimary}` : '0 2px 6px rgba(0,0,0,0.5)',
                  transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onClick={() => onFindingClick(finding.id)}
                title={finding.title}
              >
                {pinNum}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NoPDF() {
  return (
    <div className="bg-white w-[600px] h-[800px] flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
      <div className="text-[12px] uppercase tracking-wider text-gray-400 mb-2">Sample Plan PDF</div>
      <div className="text-[11px] text-gray-400">Place sample-plan.pdf in /public</div>
      <div className="mt-6 grid grid-cols-1 gap-3 w-72 px-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-32 bg-gray-100 rounded border border-gray-200 mt-2" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}
