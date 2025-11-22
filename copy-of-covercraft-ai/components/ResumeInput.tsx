import React, { useState, useCallback } from 'react';
import { ResumeInputProps, InputMode } from '../types';

// Simple Icon Components
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const PasteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

export const ResumeInput: React.FC<ResumeInputProps> = ({ resumeText, setResumeText }) => {
  const [mode, setMode] = useState<InputMode>(InputMode.UPLOAD);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setResumeText(text);
      }
    };
    reader.readAsText(file);
  }, [setResumeText]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-1 rounded">1</span> 
          Your Resume
        </h2>
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMode(InputMode.UPLOAD)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === InputMode.UPLOAD 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setMode(InputMode.PASTE)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              mode === InputMode.PASTE
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Paste
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {mode === InputMode.UPLOAD ? (
          <div className="flex-1  pb-5 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 bg-slate-50 transition-colors hover:bg-slate-100">
            <input
              type="file"
              id="resume-upload"
              accept=".txt,.md,.json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <UploadIcon />
            </div>
            <label
              htmlFor="resume-upload"
              className="cursor-pointer text-blue-600 font-semibold hover:underline mb-2"
            >
              Click to upload
            </label>
            <p className="text-slate-500 text-sm text-center">
              Supported: .txt, .md (Text files)<br/>
              <span className="text-xs text-slate-400 mt-1 block">For PDF/Word, please copy text and use the "Paste" tab.</span>
            </p>
            {fileName && (
              <div className="mt-4 px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {fileName} loaded
              </div>
            )}
            {/* Hidden text area to store value even if not shown, ensuring state consistency if they switch tabs */}
             <div className="hidden">{resumeText}</div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <textarea
              className="flex-1 w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm text-slate-700 placeholder-slate-400 font-mono bg-slate-50"
              placeholder="Paste your full resume text here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <div className="mt-2 text-xs text-slate-400 text-right">
              {resumeText.length} characters
            </div>
          </div>
        )}
      </div>
    </div>
  );
};