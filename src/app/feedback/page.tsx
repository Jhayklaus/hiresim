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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-xl font-semibold text-white">Analyzing your interview...</h2>
          <p className="text-sm text-indigo-200/80">Generating performance metrics and feedback.</p>
        </div>
      </div>
    );
  }

  if (!session?.feedback) return null;

  const { feedback } = session;

  const scoreBand =
    feedback.score >= 85
      ? {
          label: 'Outstanding',
          className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        }
      : feedback.score >= 70
      ? {
          label: 'Strong potential',
          className: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        }
      : {
          label: 'Needs practice',
          className: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };

  const handleDownload = async () => {
    const jsPDFModule = await import('jspdf');
    type JsPDFCtorType = new (...args: unknown[]) => {
      internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
      setFillColor: (r: number, g: number, b: number) => void;
      rect: (x: number, y: number, w: number, h: number, style: string) => void;
      setTextColor: (r: number, g: number, b: number) => void;
      setFontSize: (size: number) => void;
      text: (text: string | string[], x: number, y: number) => void;
      setDrawColor: (r: number, g: number, b: number) => void;
      splitTextToSize: (text: string, width: number) => string[];
      save: (fileName: string) => void;
    };
    const JsPDFCtor = (jsPDFModule as { jsPDF: JsPDFCtorType }).jsPDF;
    const pdf = new JsPDFCtor('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const marginX = 18;
    let y = 22;

    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pageWidth, pdf.internal.pageSize.getHeight(), 'F');

    pdf.setTextColor(15, 23, 42);

    pdf.setFontSize(18);
    pdf.text('HireSim Performance Report', marginX, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    const roleLine = `Role: ${session.profile.jobRole}`;
    const metaLine = `Session ${session.id.slice(0, 8)} • ${new Date(
      session.startTime || Date.now()
    ).toLocaleDateString()}`;
    pdf.text(roleLine, marginX, y);
    y += 5;
    pdf.text(metaLine, marginX, y);
    y += 10;

    pdf.setDrawColor(226, 232, 240);
    pdf.rect(marginX - 2, y - 6, pageWidth - marginX * 2 + 4, 26, 'S');

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(24);
    pdf.text(`${feedback.score}%`, marginX, y + 10);

    pdf.setFontSize(10);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Overall score', marginX + 28, y + 10);

    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    const bandLabel = scoreBand.label;
    pdf.text(bandLabel, marginX + 28, y + 16);

    y += 32;

    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Score breakdown', marginX, y);
    y += 4;
    pdf.setDrawColor(226, 232, 240);

    const barWidth = pageWidth - marginX * 2 - 30;
    const barHeight = 3;

    Object.entries(feedback.breakdown).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      y += 7;
      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.text(label, marginX, y);
      pdf.text(`${value}%`, marginX + barWidth + 10, y);
      const filledWidth = (barWidth * value) / 100;
      y += 1;
      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(241, 245, 249);
      pdf.rect(marginX, y, barWidth, barHeight, 'F');
      pdf.setFillColor(79, 70, 229);
      pdf.rect(marginX, y, filledWidth, barHeight, 'F');
    });

    y += 12;

    const addSection = (title: string, items: string[], accent: [number, number, number]) => {
      pdf.setFontSize(11);
      pdf.setTextColor(15, 23, 42);
      pdf.text(title, marginX, y);
      y += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);

      items.forEach((item) => {
        const lines = pdf.splitTextToSize(item, pageWidth - marginX * 2 - 6);
        y += 5;
        const bullet = '•';
        pdf.setTextColor(...accent);
        pdf.text(bullet, marginX, y);
        pdf.setTextColor(71, 85, 105);
        pdf.text(lines as string[], marginX + 4, y);
        y += (lines.length - 1) * 4;
      });

      y += 6;
    };

    addSection('Key strengths', feedback.strengths, [34, 197, 94]);
    addSection('Areas for improvement', feedback.improvements, [234, 179, 8]);

    pdf.setFontSize(11);
    pdf.setTextColor(15, 23, 42);
    pdf.text('Learning roadmap', marginX, y);
    y += 8;
    pdf.setTextColor(71, 85, 105);

    const roadmapText = feedback.roadmap.replace(/[#*_`>-]/g, '');
    const roadmapLines = pdf.splitTextToSize(roadmapText, pageWidth - marginX * 2);
    y += 4;
    pdf.text(roadmapLines as string[], marginX, y);

    const date = new Date(session.startTime || Date.now()).toISOString().split('T')[0];
    const roleSlug = session.profile.jobRole.replace(/\s+/g, '-').toLowerCase();
    pdf.save(`hiresim-feedback-${roleSlug}-${date}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-medium text-indigo-200">
              <Award className="w-4 h-4" />
              <span>AI-generated performance review</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              Interview Analysis
            </h1>
            <p className="text-sm text-slate-300">
              Session {session.id.slice(0, 8)} •{' '}
              {new Date(session.startTime!).toLocaleDateString()}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-white/5 border border-white/15 rounded-lg text-xs md:text-sm font-medium hover:bg-white/10 text-slate-100 flex items-center gap-2 backdrop-blur-xl"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs md:text-sm font-semibold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <ArrowLeft className="w-4 h-4" />
              New Interview
            </button>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 flex flex-col md:flex-row items-center gap-8"
        >
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="rgba(148,163,184,0.3)" strokeWidth="12" fill="transparent" />
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
              <span className="text-4xl font-bold text-white">{feedback.score}%</span>
              <span className="text-xs text-slate-300 font-medium mt-1">Overall score</span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 w-full">
            <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full border text-xs font-medium bg-white/5 border-white/15 text-slate-100">
              <span
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold',
                  scoreBand.className
                )}
              >
                {scoreBand.label}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(feedback.breakdown).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-slate-200 uppercase tracking-wide">
                    <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Key strengths</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {feedback.strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 shrink-0" />
                    <span className="text-sm text-slate-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-white/10 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-semibold text-white">Areas for improvement</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 shrink-0" />
                    <span className="text-sm text-slate-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-white/10 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Learning roadmap</h2>
          </div>
          <div className="p-6 prose prose-invert prose-sm max-w-none text-slate-100">
            <ReactMarkdown>{feedback.roadmap}</ReactMarkdown>
          </div>
        </motion.div>
        
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden">
           <button 
             onClick={() => setExpandedSection(expandedSection === 'transcript' ? null : 'transcript')}
             className="w-full p-6 flex justify-between items-center hover:bg-slate-900/80 transition-colors"
           >
             <span className="text-sm font-semibold text-white">Interview transcript</span>
             {expandedSection === 'transcript' ? <ChevronUp /> : <ChevronDown />}
           </button>
           
           {expandedSection === 'transcript' && (
             <div className="p-6 border-t border-white/10 bg-slate-950/60 space-y-4 max-h-96 overflow-y-auto">
               {session.transcript.map((msg, idx) => (
                 <div key={idx} className="flex flex-col gap-1">
                   <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                     {msg.role}
                   </span>
                   <p
                     className={cn(
                       'text-sm rounded-lg border px-3 py-3',
                       msg.role === 'user'
                         ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-50'
                         : 'bg-slate-900/80 border-white/10 text-slate-50'
                     )}
                   >
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
