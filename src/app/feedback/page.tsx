'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download, ChevronDown, ChevronUp, Star, Award, TrendingUp, BookOpen, ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { generateFeedback as generateFeedbackAction } from '@/app/actions/deepseek';

export default function FeedbackPage() {
  const router = useRouter();
  const { session, setFeedback } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('strengths');

  useEffect(() => {
    if (!session || !session.transcript.length) {
      // If no session, go back home
      if (!loading) router.push('/');
      return;
    }

    if (session.feedback) {
      setLoading(false);
      return;
    }

    generateFeedback();
  }, [session, router]);

  const generateFeedback = async () => {
    try {
      const result = await generateFeedbackAction(session!.transcript, session!.profile.jobRole);

      if (result.error) {
         throw new Error(result.error);
      }
      
      if (result.feedback) {
         setFeedback(result.feedback);
      }
    } catch (error) {
      console.error("Feedback generation error:", error);
      // Fallback only if absolutely necessary, but try to alert user first
      alert("Failed to generate AI feedback. Showing example data for preview.");
      
      setFeedback({
        score: 75,
        breakdown: { clarity: 80, technicalAccuracy: 70, confidence: 75, relevance: 85, depth: 65 },
        strengths: ["Good communication flow", "Relevant experience mentioned", "Polite demeanor"],
        improvements: ["Elaborate more on technical details", "Provide concrete examples", "Speak more confidently"],
        roadmap: "Focus on System Design and Algorithms.",
        exampleAnswers: ["Instead of 'I did X', say 'I led the implementation of X which resulted in Y'."]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-gray-800">Analyzing your interview...</h2>
          <p className="text-gray-500">Generating performance metrics and feedback.</p>
        </div>
      </div>
    );
  }

  if (!session?.feedback) return null;

  const { feedback } = session;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interview Analysis</h1>
            <p className="text-gray-500">Session ID: {session.id.slice(0, 8)} • {new Date(session.startTime!).toLocaleDateString()}</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => window.print()} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
               <Download className="w-4 h-4" />
               Download PDF
             </button>
             <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
               <ArrowLeft className="w-4 h-4" />
               New Interview
             </button>
          </div>
        </div>

        {/* Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke={feedback.score >= 80 ? "#22c55e" : feedback.score >= 60 ? "#eab308" : "#ef4444"} 
                strokeWidth="12" 
                fill="transparent" 
                strokeDasharray={440} 
                strokeDashoffset={440 - (440 * feedback.score) / 100} 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900">{feedback.score}%</span>
              <span className="text-sm text-gray-500 font-medium">Overall Score</span>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6 w-full">
            {Object.entries(feedback.breakdown).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-700 capitalize">
                  <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${value}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Detailed Feedback Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-gray-900">Key Strengths</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {feedback.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Improvements */}
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-gray-900">Areas for Improvement</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Roadmap & Examples */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-bold text-gray-900">Learning Roadmap</h2>
          </div>
          <div className="p-6 prose prose-blue max-w-none text-gray-700">
            <ReactMarkdown>{feedback.roadmap}</ReactMarkdown>
          </div>
        </motion.div>
        
        {/* Transcript (Optional/Collapsible) */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
           <button 
             onClick={() => setExpandedSection(expandedSection === 'transcript' ? null : 'transcript')}
             className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
           >
             <span className="font-bold text-gray-900">Interview Transcript</span>
             {expandedSection === 'transcript' ? <ChevronUp /> : <ChevronDown />}
           </button>
           
           {expandedSection === 'transcript' && (
             <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4 max-h-96 overflow-y-auto">
               {session.transcript.map((msg, idx) => (
                 <div key={idx} className="flex flex-col gap-1">
                   <span className="text-xs font-bold text-gray-500 uppercase">{msg.role}</span>
                   <p className="text-gray-800 bg-white p-3 rounded-lg border border-gray-200 text-sm">
                     {msg.text}
                   </p>
                 </div>
               ))}
             </div>
           )}
        </div>

      </div>
    </div>
  );
}
