'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileText, Briefcase, ArrowRight, Loader2, CheckCircle2, Sparkles, BrainCircuit, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { parseCV } from './actions';
import { cn } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const setCandidateProfile = useAppStore((state) => state.setCandidateProfile);
  
  const [jobRole, setJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole || !file) {
      setError('Please provide both a Job Role and a CV.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await parseCV(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      setCandidateProfile({
        name: 'Candidate', // We could extract this too, but for now generic
        jobRole,
        jobDescription,
        cvText: result.text,
        resumeFile: file
      });

      router.push('/interview');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white selection:bg-indigo-500/30">
      
      {/* Background Grid/Glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">HireSim</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="https://github.com" target="_blank" className="hover:text-white transition-colors">GitHub</a>
          </nav>
        </header>

        <div className="flex-1 grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Powered by DeepSeek V3</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-purple-200">
                Master Your Next <br />
                Tech Interview.
              </h1>
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                Experience a realistic, voice-first AI interview tailored to your CV. 
                Get real-time feedback, detailed scoring, and a personalized learning roadmap.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {[
                { icon: BrainCircuit, title: "Context Aware", desc: "Questions based on your actual CV & Role" },
                { icon: Mic, title: "Voice Interaction", desc: "Speak naturally with our real-time voice agent" },
                { icon: CheckCircle2, title: "Instant Feedback", desc: "Detailed performance breakdown & scoring" },
                { icon: Sparkles, title: "Smart Analysis", desc: "Powered by advanced LLM reasoning" },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <feature.icon className="w-8 h-8 text-indigo-400 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Action Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="relative"
          >
            {/* Decorative blob behind card */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-20 transform rotate-3 scale-105" />
            
            <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                Start Your Session
                <span className="text-xs font-normal px-2 py-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">Free</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Target Job Role
                  </label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Upload CV (PDF)
                  </label>
                  <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 hover:bg-slate-800/50 hover:border-indigo-500/50 transition-all text-center cursor-pointer group">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required
                    />
                    <div className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-indigo-400 transition-colors">
                      {file ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                             <FileText className="w-6 h-6 text-indigo-400" />
                          </div>
                          <span className="text-sm font-medium text-white">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-sm">Drop PDF here or click to browse</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Job Description <span className="text-slate-500 text-xs">(Optional)</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description for better context..."
                    className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all min-h-[80px] placeholder:text-slate-600 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5",
                    isSubmitting && "opacity-70 cursor-not-allowed transform-none"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Profile...
                    </>
                  ) : (
                    <>
                      Start Interview
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>

        <motion.section
          id="features"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-24 md:mt-32 space-y-10"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Features built for real prep</h2>
            <p className="mt-3 text-slate-400">
              Everything in HireSim is designed to feel like a real hiring loop,
              not a toy chatbot.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: BrainCircuit,
                title: 'CV-aware questions',
                desc: 'The agent reads your CV and targets questions to your stack, projects, and level.',
              },
              {
                icon: Mic,
                title: 'Voice-first experience',
                desc: 'Speak and listen just like a real onsite. No copy-paste prompts or typing walls.',
              },
              {
                icon: CheckCircle2,
                title: 'Actionable feedback',
                desc: 'Get structured scoring, strengths, and concrete next steps after each session.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg shadow-indigo-500/10 flex flex-col gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="how-it-works"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mt-24 md:mt-32 space-y-12"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-slate-400">
              From CV upload to actionable feedback in four simple steps.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                icon: Upload,
                title: 'Upload your CV',
                desc: 'Drop in your PDF so the AI can understand your background.',
              },
              {
                icon: Briefcase,
                title: 'Set your target role',
                desc: 'Tell HireSim what role you are preparing for.',
              },
              {
                icon: Mic,
                title: 'Join the live AI interview',
                desc: 'Speak naturally with a voice-first interviewer that adapts to you.',
              },
              {
                icon: CheckCircle2,
                title: 'Review scores and feedback',
                desc: 'Get a detailed breakdown with strengths, gaps, and next steps.',
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="relative p-5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg shadow-indigo-500/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Step {index + 1}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
