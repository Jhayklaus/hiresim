import { create } from 'zustand';
import { CandidateProfile, InterviewSession, ChatMessage, InterviewFeedback } from '@/types';

interface AppState {
  candidateProfile: CandidateProfile | null;
  setCandidateProfile: (profile: CandidateProfile) => void;
  
  session: InterviewSession | null;
  setSession: (session: InterviewSession) => void;
  updateSessionStatus: (status: InterviewSession['status']) => void;
  addChatMessage: (message: ChatMessage) => void;
  setFeedback: (feedback: InterviewFeedback) => void;
  resetSession: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  candidateProfile: null,
  setCandidateProfile: (profile) => set({ candidateProfile: profile }),

  session: null,
  setSession: (session) => set({ session }),
  updateSessionStatus: (status) => set((state) => ({
    session: state.session ? { ...state.session, status } : null
  })),
  addChatMessage: (message) => set((state) => ({
    session: state.session ? {
      ...state.session,
      transcript: [...state.session.transcript, message]
    } : null
  })),
  setFeedback: (feedback) => set((state) => ({
    session: state.session ? { ...state.session, feedback } : null
  })),
  resetSession: () => set({ session: null, candidateProfile: null }),
}));
