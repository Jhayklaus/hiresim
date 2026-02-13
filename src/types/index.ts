export interface CandidateProfile {
  name: string;
  jobRole: string;
  jobDescription?: string;
  cvText: string;
  resumeFile?: File | null;
}

export interface InterviewSession {
  id: string;
  profile: CandidateProfile;
  transcript: ChatMessage[];
  startTime?: number;
  endTime?: number;
  status: 'idle' | 'active' | 'completed';
  feedback?: InterviewFeedback;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface InterviewFeedback {
  score: number;
  breakdown: {
    clarity: number;
    technicalAccuracy: number;
    confidence: number;
    relevance: number;
    depth: number;
  };
  strengths: string[];
  improvements: string[];
  roadmap: string;
  exampleAnswers: string[];
}
