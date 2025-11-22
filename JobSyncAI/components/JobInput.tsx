import React from 'react';
import { JobInputProps } from '../types';

export const JobInput: React.FC<JobInputProps> = ({ jobDescription, setJobDescription }) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-1 rounded">2</span>
          Job Description
        </h2>
      </div>
      
      <div className="p-6 flex-1 flex flex-col h-full">
        <textarea
          className="flex-1 w-full p-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm text-slate-700 placeholder-slate-400 font-mono bg-slate-50"
          placeholder="Paste the job description here (Responsibilities, Requirements, etc.)..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="mt-2 text-xs text-slate-400 text-right">
          {jobDescription.length} characters
        </div>
      </div>
    </div>
  );
};