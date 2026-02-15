'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Clock, PhoneOff, AlertCircle, Volume2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { generateInterviewResponse } from '@/app/actions/deepseek';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export default function InterviewPage() {
  const router = useRouter();
  const { candidateProfile, session, setSession } = useAppStore();
  
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Initialize Session
  useEffect(() => {
    if (!candidateProfile) {
      router.push('/');
      return;
    }

    if (!session) {
      const newSession = {
        id: crypto.randomUUID(),
        profile: candidateProfile,
        transcript: [],
        startTime: Date.now(),
        status: 'active' as const
      };
      setSession(newSession);
      
      // Trigger initial greeting
      handleSendMessage('', newSession.transcript);
    }
  }, [candidateProfile, router]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleEndInterview();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle User Speech
  useEffect(() => {
    setCurrentTranscript(transcript);
  }, [transcript]);

  // Auto-send when user stops speaking (with debounce)
  useEffect(() => {
    if (!listening && transcript.trim() && !isProcessing) {
      handleSendMessage(transcript);
      resetTranscript();
    }
  }, [listening, transcript]);

  const handleEndInterview = () => {
    SpeechRecognition.stopListening();
    window.speechSynthesis.cancel();
    router.push('/feedback');
  };

  const handleSendMessage = async (text: string, currentHistory?: ChatMessage[]) => {
    if (!candidateProfile || isProcessing) return;

    const history = currentHistory || session?.transcript || [];
    
    // Add user message if text exists (skip for initial greeting)
    const updatedHistory = [...history];
    if (text) {
      const userMessage: ChatMessage = {
        role: 'user',
        text: text,
        timestamp: Date.now()
      };
      updatedHistory.push(userMessage);
      
      // Update store immediately
      if (session) {
        setSession({ ...session, transcript: updatedHistory });
      }
    }

    setIsProcessing(true);
    
    try {
      // Call DeepSeek Server Action
      const { text: responseText, error } = await generateInterviewResponse(
        updatedHistory, 
        text || "START_INTERVIEW", 
        candidateProfile
      );

      if (error) {
        console.error(error);
        return;
      }

      const modelMessage: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      updatedHistory.push(modelMessage);

      // Update store
      if (session) {
        setSession({ ...session, transcript: updatedHistory });
      } else {
        // Fallback if session wasn't ready (rare)
         const newSession = {
            id: crypto.randomUUID(),
            profile: candidateProfile,
            transcript: updatedHistory,
            startTime: Date.now(),
            status: 'active' as const
          };
          setSession(newSession);
      }

      // Speak response
      speakResponse(responseText);

    } catch (err) {
      console.error('Failed to generate response:', err);
    } finally {
      setIsProcessing(false);
      setCurrentTranscript('');
    }
  };

  const speakResponse = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Improved Voice Selection Logic
    const voices = window.speechSynthesis.getVoices();
    // Prefer "Google US English" or similar high-quality voices
    const preferredVoice = voices.find(v => 
      v.name.includes("Google US English") || 
      v.name.includes("Google") ||
      (v.name.includes("Natural") && v.lang.startsWith("en")) ||
      v.name.includes("Samantha")
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    // Adjust rate and pitch for more natural feel
    utterance.rate = 1.0; 
    utterance.pitch = 1.0; 
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      // Optional: Auto-start listening after bot finishes?
      // SpeechRecognition.startListening({ continuous: true });
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      window.speechSynthesis.cancel();
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-2xl text-center border border-white/20">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Browser Not Supported</h2>
          <p className="text-white/70">Please use Google Chrome for speech recognition features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-col overflow-hidden relative">
      
      {/* Ambient Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex-none relative z-50 p-6 flex justify-between items-center border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
             <span className="font-bold text-lg">AI</span>
          </div>
          <div>
            <h2 className="font-semibold text-white/90">DeepSeek Interviewer</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${session?.status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <p className="text-xs text-white/50">Live Session</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full text-white/80 font-medium border border-white/10">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Main Visualizer Area */}
        <div className="flex-1 flex flex-col relative z-0 min-w-0 transition-all duration-300">
          <main className="flex-1 relative flex flex-col items-center justify-center p-8">
            
            {/* Central Avatar / Visualizer */}
            <div className="relative z-0 flex items-center justify-center">
              {/* Outer Ripples (Listening State) */}
              <AnimatePresence>
                {listening && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          delay: i * 0.6,
                          ease: "easeOut"
                        }}
                        className="absolute inset-0 bg-indigo-500/20 rounded-full z-0"
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Core Orb */}
              <motion.div
                animate={{
                  scale: isSpeaking ? [1, 1.1, 1, 1.2, 1] : isProcessing ? [1, 0.9, 1] : 1,
                  rotate: isProcessing ? 360 : 0,
                }}
                transition={{
                  scale: isSpeaking ? { duration: 0.5, repeat: Infinity } : isProcessing ? { duration: 2, repeat: Infinity } : {},
                  rotate: isProcessing ? { duration: 2, repeat: Infinity, ease: "linear" } : {},
                }}
                className={cn(
                  "w-48 h-48 rounded-full flex items-center justify-center relative z-10 transition-all duration-500 shadow-[0_0_60px_rgba(99,102,241,0.3)]",
                  isSpeaking ? "bg-gradient-to-br from-indigo-400 to-purple-600" :
                  listening ? "bg-gradient-to-br from-red-400 to-pink-600 shadow-[0_0_60px_rgba(244,63,94,0.3)]" :
                  isProcessing ? "bg-gradient-to-br from-amber-300 to-orange-500" :
                  "bg-gradient-to-br from-slate-700 to-slate-600"
                )}
              >
                 {/* Inner Icon */}
                 <div className="text-white/90">
                    {isSpeaking ? <Volume2 className="w-16 h-16 animate-pulse" /> :
                     listening ? <Mic className="w-16 h-16" /> :
                     isProcessing ? <motion.div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear"}} /> :
                     <MicOff className="w-16 h-16 opacity-50" />}
                 </div>
              </motion.div>
            </div>

            {/* Status Text */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-center space-y-2 z-10"
            >
              <h3 className="text-2xl font-light text-white/90 tracking-wide">
                {listening ? "Listening..." : 
                 isProcessing ? "Thinking..." : 
                 isSpeaking ? "Speaking..." : 
                 "Tap microphone to start"}
              </h3>
              <p className="text-white/40 text-sm h-6">
                {listening ? currentTranscript || "Go ahead, I'm listening..." : ""}
              </p>
            </motion.div>

            {session?.transcript && session.transcript.length > 0 && (
              <div className="mt-8 max-w-3xl mx-auto px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center shadow-lg shadow-indigo-500/20">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-indigo-300 mb-2">
                  Current question
                </p>
                <p className="text-sm md:text-base text-white/80 leading-relaxed">
                  {session.transcript[session.transcript.length - 1].text}
                </p>
              </div>
            )}

          </main>

          {/* Bottom Controls */}
          <footer className="flex-none relative z-10 p-8 flex justify-center gap-6 items-center">
            <button
              onClick={toggleListening}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border border-white/10",
                listening 
                  ? "bg-red-500 text-white scale-110 shadow-red-500/40" 
                  : "bg-white text-indigo-900 hover:scale-105 hover:bg-indigo-50"
              )}
            >
              {listening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            
            <button 
              onClick={handleEndInterview}
              className="px-6 py-4 rounded-full bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-200 border border-white/10 hover:border-red-500/30 transition-all font-medium flex items-center gap-2"
            >
              <PhoneOff className="w-5 h-5" />
              <span>End Interview</span>
            </button>
          </footer>
        </div>

      </div>
    </div>
  );
}
