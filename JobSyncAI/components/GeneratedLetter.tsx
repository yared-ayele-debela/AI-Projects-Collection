import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { GeneratedLetterProps } from '../types';

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

export const GeneratedLetter: React.FC<GeneratedLetterProps> = ({ content, isLoading, onCopy }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    downloadBlob(blob, 'Cover_Letter.txt');
  };

  const handleDownloadDocx = async () => {
    setIsDownloading(true);
    try {
      // Create paragraphs from content
      // We split by newline to handle basic formatting
      const lines = content.split('\n');
      const children = lines.map(line => {
        // Handle empty lines with a non-breaking space or empty paragraph
        return new Paragraph({
            children: [
                new TextRun({
                    text: line,
                    font: "Calibri",
                    size: 24, // 12pt
                }),
            ],
            spacing: { after: 200 }, // 10pt spacing after paragraph
        });
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      downloadBlob(blob, 'Cover_Letter.docx');
    } catch (error) {
      console.error("Error generating DOCX:", error);
      alert("Failed to generate DOCX file.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
        <div className="relative w-16 h-16">
           <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
           <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h3 className="mt-6 text-lg font-medium text-slate-800">Crafting your letter...</h3>
        <p className="text-slate-500 mt-2 text-center max-w-xs">
          Gemini is analyzing your resume against the job requirements. This usually takes about 5-10 seconds.
        </p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 min-h-[400px]">
        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">Ready to generate</p>
        <p className="text-slate-400 text-sm mt-1">Fill in your details and click the button above.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="font-bold text-slate-800">Generated Cover Letter</h2>
        <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <button 
                    onClick={handleDownloadTxt}
                    disabled={isDownloading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-1"
                    title="Download as Text"
                >
                    <DownloadIcon /> TXT
                </button>
                <div className="w-px bg-slate-200 my-0.5"></div>
                <button 
                    onClick={handleDownloadDocx}
                    disabled={isDownloading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-md transition-colors flex items-center gap-1"
                    title="Download as Word Doc"
                >
                    {isDownloading ? (
                        <span className="animate-spin w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full"></span>
                    ) : (
                        <DownloadIcon />
                    )}
                    DOCX
                </button>
            </div>
            
            <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all border shadow-sm ${
                copied 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
            >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied' : 'Copy'}
            </button>
        </div>
      </div>
      <div className="p-8 overflow-y-auto bg-white min-h-[500px]">
        <div className="prose prose-slate max-w-none">
           <pre className="whitespace-pre-wrap font-sans text-slate-700 text-base leading-relaxed">
             {content}
           </pre>
        </div>
      </div>
    </div>
  );
};