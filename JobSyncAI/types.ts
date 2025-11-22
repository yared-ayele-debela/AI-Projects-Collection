export enum InputMode {
  UPLOAD = 'UPLOAD',
  PASTE = 'PASTE'
}

export interface GenerationState {
  isLoading: boolean;
  error: string | null;
  result: string | null;
}

export interface ResumeInputProps {
  resumeText: string;
  setResumeText: (text: string) => void;
}

export interface JobInputProps {
  jobDescription: string;
  setJobDescription: (text: string) => void;
}

export interface GeneratedLetterProps {
  content: string;
  isLoading: boolean;
  onCopy: () => void;
}