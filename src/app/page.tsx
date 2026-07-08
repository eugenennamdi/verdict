"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ChevronRight, Check, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Footer } from "@/components/footer";

const springTransition = { type: "spring" as const, stiffness: 400, damping: 30 };

const VerdictLogo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M4 5L12 19L20 5" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeMiterlimit="10"
      strokeLinecap="butt" 
      strokeLinejoin="miter" 
    />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    company_name: string;
    target_audience: string;
    core_value_prop: string;
    primary_cta: string;
  } | null>(null);

  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingPhase(p => {
        const hangIndex = isAuditing ? 5 : 2; // Hang on the last item's spinner
        return p < hangIndex ? p + 1 : p;
      });
    }, isAuditing ? 3500 : 4000); // Slightly faster cycles
    return () => clearInterval(interval);
  }, [isLoading, isAuditing]);

  const analyzeLoadingPhrases = [
    "Bypassing bot protection",
    "Rendering JavaScript & DOM",
    "Extracting company metadata"
  ];

  const generateLoadingPhrases = [
    "Evaluating Positioning & ICP alignment",
    "Critiquing Messaging & Copy",
    "Analyzing Website UX & Flow",
    "Auditing Conversion Triggers",
    "Reviewing Trust & Social Proof",
    "Synthesizing final verdict"
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
        setUrl(formattedUrl);
      }

      const res = await fetch('/api/engine/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract context. Please try another URL.');
      }
      
      // API call finished! Force all checkmarks to green
      setLoadingPhase(3);
      
      // Wait 1 second for user to register the success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setExtractedData({
        company_name: data.company_name || '',
        target_audience: data.target_audience || '',
        core_value_prop: data.inferred_description || '',
        primary_cta: data.primary_cta || '',
      });
      setIsAuditing(true);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/engine/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          ...extractedData,
          inferred_description: extractedData?.core_value_prop
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate audit.');
      }
      
      // API call finished! Force all checkmarks to green
      setLoadingPhase(6);
      
      // Wait 1 second exactly before redirecting so they see the final checkmark
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push(`/report/${data.report_id}`);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : 'Something went wrong.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex-1 w-full flex flex-col relative">
      
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none bg-mesh" />

      {/* Header */}
      <header className="sticky top-4 z-50 w-[calc(100%-2rem)] max-w-6xl mx-auto px-6 py-4 flex justify-between items-center glass-panel rounded-full transition-all duration-300 mb-8 mt-4">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <VerdictLogo className="w-8 h-8 text-orange-500 group-hover:scale-105 transition-transform" />
          <span className="font-black tracking-tight text-xl text-slate-900 dark:text-white">VERDICT</span>
        </Link>
        <nav className="flex items-center gap-4">
          <a 
            href="https://www.okx.ai/agents"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors"
          >
            <Bot className="w-4 h-4" />
            For Agents
          </a>
          <Link 
            href="/docs" 
            className="text-sm font-bold px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Documentation
          </Link>
        </nav>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-2xl text-center space-y-8 z-10">
          
          <AnimatePresence mode="wait">
            {!isAuditing ? (
              <motion.div 
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                transition={springTransition}
                className="w-full max-w-2xl mx-auto"
              >
                <div className="space-y-6 mb-12">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                    Find the bottleneck <br className="hidden md:block" />
                    killing your growth in <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">60 seconds.</span>
                  </h1>
                  <p className="text-xl text-slate-500 dark:text-slate-400 font-medium tracking-wide max-w-xl mx-auto leading-relaxed">
                    Stop guessing why you aren&apos;t scaling. Drop your URL for a brutally honest, YC-grade audit.
                  </p>
                </div>

                <form onSubmit={handleAnalyze}>
                  <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-slate-400 dark:focus-within:border-slate-600 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
                    <div className="pl-5">
                      <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <Input 
                      type="text"
                      placeholder="e.g., stripe.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      required
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck="false"
                      disabled={isLoading}
                      className="border-0 bg-transparent dark:bg-transparent disabled:bg-transparent dark:disabled:bg-transparent text-lg py-7 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-none font-medium rounded-none"
                    />
                    <div className="pr-2">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide rounded-xl px-6 h-11 transition-all active:scale-95 w-[140px] sm:w-36 flex items-center justify-center relative overflow-hidden shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] [-webkit-tap-highlight-color:transparent]"
                      >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
                        Analyze
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Extracting Context Checklist */}
                <AnimatePresence>
                  {isLoading && !isAuditing && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex justify-center mt-8">
                        <div className="w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-start space-y-5 border border-white/40 dark:border-slate-700/50 shadow-2xl relative overflow-hidden">
                          {/* Terminal Header */}
                          <div className="absolute top-0 left-0 w-full h-10 bg-slate-100/40 dark:bg-slate-800/40 flex items-center px-4">
                            <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-400"></div>
                              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                            </div>
                            <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 ml-4">VERDICT ENGINE v0</span>
                          </div>

                          <div className="pt-8 w-full flex flex-col space-y-4">
                            {analyzeLoadingPhrases.map((phrase, idx) => (
                               <div key={idx} className={`flex items-center gap-4 transition-all duration-500 font-mono ${loadingPhase >= idx ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-2'}`}>
                                  {loadingPhase > idx ? (
                                     <div className="w-5 h-5 rounded-sm bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                        <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                                     </div>
                                  ) : loadingPhase === idx ? (
                                     <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                        <div className="w-2 h-4 bg-orange-500 animate-pulse"></div>
                                     </div>
                                  ) : (
                                     <div className="w-5 h-5 rounded-sm border border-slate-300 dark:border-slate-700 shrink-0" />
                                  )}
                                  <span className={`text-[13px] ${loadingPhase >= idx ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                                    {phrase}
                                  </span>
                               </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="audit-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...springTransition, delay: 0.1 }}
                className="text-center space-y-8"
              >
                <div className="flex justify-center mb-6">
                  <VerdictLogo className="w-16 h-16 text-orange-500 drop-shadow-xl" />
                </div>
                
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-3xl overflow-hidden text-left">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 pb-6">
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Context Extracted</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      Here&apos;s what our engine found. Make edits if necessary to ensure the audit is perfectly calibrated.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <form onSubmit={handleExtract} className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Company Name</label>
                        <Input 
                          value={extractedData?.company_name || ""} 
                          onChange={e => setExtractedData({...extractedData!, company_name: e.target.value})}
                          className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 dark:focus-visible:border-slate-800"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Target Audience</label>
                        <Input 
                          value={extractedData?.target_audience || ""} 
                          onChange={e => setExtractedData({...extractedData!, target_audience: e.target.value})}
                          className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 dark:focus-visible:border-slate-800"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Inferred Description</label>
                        <Textarea 
                          value={extractedData?.core_value_prop || ""} 
                          onChange={e => setExtractedData({...extractedData!, core_value_prop: e.target.value})}
                          className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-4 min-h-[100px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 dark:focus-visible:border-slate-800"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Primary CTA</label>
                        <Input 
                          value={extractedData?.primary_cta || ""} 
                          onChange={e => setExtractedData({...extractedData!, primary_cta: e.target.value})}
                          className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-200 dark:focus-visible:border-slate-800"
                        />
                      </div>

                      <div className="pt-4 flex gap-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsAuditing(false)}
                          disabled={isLoading}
                          className="h-12 px-6 rounded-xl border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className={`flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl h-12 shadow-lg shadow-orange-500/20 transition-all relative overflow-hidden ${!isLoading && 'active:scale-[0.98]'}`}
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
                          Confirm & Generate Verdict
                          <ChevronRight className="w-5 h-5 ml-1 shrink-0" />
                        </Button>
                      </div>
                    </form>

                    {/* Generating Verdict Checklist */}
                    <AnimatePresence>
                      {isAuditing && isLoading && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-8 mt-2"
                        >
                          <div className="flex justify-center mt-6">
                            <div className="w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col items-start space-y-5 border border-white/40 dark:border-slate-700/50 shadow-2xl relative overflow-hidden">
                              {/* Terminal Header */}
                              <div className="absolute top-0 left-0 w-full h-10 bg-slate-100/40 dark:bg-slate-800/40 flex items-center px-4">
                                <div className="flex gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                </div>
                                <span className="text-[11px] uppercase font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 ml-4">VERDICT ENGINE v0</span>
                              </div>

                              <div className="pt-8 w-full flex flex-col space-y-4">
                                {generateLoadingPhrases.map((phrase, idx) => (
                                   <div key={idx} className={`flex items-center gap-4 transition-all duration-500 font-mono ${loadingPhase >= idx ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-2'}`}>
                                      {loadingPhase > idx ? (
                                         <div className="w-5 h-5 rounded-sm bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                                            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                                         </div>
                                      ) : loadingPhase === idx ? (
                                         <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                            <div className="w-2 h-4 bg-orange-500 animate-pulse"></div>
                                         </div>
                                      ) : (
                                         <div className="w-5 h-5 rounded-sm border border-slate-300 dark:border-slate-700 shrink-0" />
                                      )}
                                      <span className={`text-[13px] ${loadingPhase >= idx ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                                        {phrase}
                                      </span>
                                   </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  );
}
