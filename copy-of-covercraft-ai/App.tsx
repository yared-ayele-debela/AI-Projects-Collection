import React, { useState } from 'react';
import { ResumeInput } from './components/ResumeInput';
import { JobInput } from './components/JobInput';
import { GeneratedLetter } from './components/GeneratedLetter';
import { generateCoverLetter } from './services/geminiService';
import { GenerationState } from './types';

const App: React.FC = () => {
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const handleGenerate = async () => {
    setState({ ...state, isLoading: true, error: null });
    try {
      const letter = await generateCoverLetter(resumeText, jobDescription);
      setState({
        isLoading: false,
        error: null,
        result: letter,
      });
    } catch (error: any) {
      setState({
        isLoading: false,
        error: error.message || "Something went wrong",
        result: null,
      });
    }
  };

  const handleCopy = () => {
    if (state.result) {
      navigator.clipboard.writeText(state.result);
    }
  };

  const canGenerate = resumeText.length > 50 && jobDescription.length > 50;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              AI
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
             JobSync
            </h1>
          </div>
          
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Hero */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Create the perfect cover letter in seconds.
          </h2>
          <p className="text-lg text-slate-600">
            Upload your resume, paste the job description, and let our AI craft a personalized letter that gets you hired.
          </p>
        </div>

        {/* Error Banner */}
        {state.error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 max-w-4xl mx-auto animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        {/* Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 h-[600px]">
          <div className="flex flex-col gap-6 h-full">
            <div className="flex-1 h-1/2">
               <ResumeInput resumeText={resumeText} setResumeText={setResumeText} />
            </div>
            <div className="flex-1 h-1/2">
               <JobInput jobDescription={jobDescription} setJobDescription={setJobDescription} />
            </div>
          </div>
          
          {/* Output Section (Desktop: Right Column, Mobile: Stacked) */}
          <div className="h-full">
             <GeneratedLetter 
               content={state.result || ''} 
               isLoading={state.isLoading}
               onCopy={handleCopy}
             />
          </div>
        </div>

        {/* Action Bar (Sticky on mobile usually, but inline here for desktop focus) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 flex justify-center items-center shadow-lg lg:static lg:shadow-none lg:border-0 lg:bg-transparent lg:p-0 lg:mb-12">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || state.isLoading}
              className={`
                w-full max-w-sm lg:max-w-xs flex items-center justify-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg shadow-lg transition-all transform hover:scale-105 active:scale-95
                ${!canGenerate || state.isLoading 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none transform-none' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/30 ring-4 ring-transparent hover:ring-blue-100'}
              `}
            >
              {state.isLoading ? (
                 <>Thinking...</>
              ) : (
                 <>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" clipRule="evenodd" />
                   </svg>
                   Generate Letter
                 </>
              )}
            </button>
        </div>
      </main>
    </div>
  );
};

export default App;