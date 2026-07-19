"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, ChevronRight, Check, Bot, X, AlertCircle } from "lucide-react";
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
  const posthog = usePostHog();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedData, setExtractedData] = useState<{
    company_name: string;
    target_audience: string;
    core_value_prop: string;
    primary_cta: string;
  } | null>(null);

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);

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
    setErrorMsg("");
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
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("The AI engine timed out or returned an invalid response. Please try again.");
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === 'RATE_LIMIT_EXCEEDED') {
           setShowPaywall(true);
           setIsLoading(false);
           return;
        }
        if (data.error === 'MODEL_HIGH_DEMAND') {
          throw new Error("The AI model is currently experiencing high demand. Please wait a few minutes, refresh the page, and try again.");
        }
        throw new Error(data.error || 'Failed to extract context. Please try another URL.');
      }
      
      // API call finished! Force all checkmarks to green
      setLoadingPhase(3);
      
      posthog?.capture('url_analyzed', {
        url: formattedUrl
      });
      
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
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    posthog?.capture('audit_started', {
      url,
      company: extractedData?.company_name
    });
    
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
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("The AI engine timed out or returned an invalid response. Please try again.");
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === 'RATE_LIMIT_EXCEEDED') {
           setShowPaywall(true);
           setIsLoading(false);
           return;
        }
        if (data.error === 'MODEL_HIGH_DEMAND') {
          throw new Error("The AI model is currently experiencing high demand. Please wait a few minutes, refresh the page, and try again.");
        }
        throw new Error(data.error || 'Failed to generate audit.');
      }
      
      // API call finished! Force all checkmarks to green
      setLoadingPhase(6);
      
      // Wait 1 second exactly before redirecting so they see the final checkmark
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      posthog?.capture('audit_completed', {
        report_id: data.report_id,
        url
      });
      
      router.push(`/report/${data.report_id}`);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'Something went wrong.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex-1 w-full flex flex-col relative">
      
      {/* Premium Mesh Background & Noise */}
      <div className="absolute inset-0 z-0 opacity-60 dark:opacity-40 pointer-events-none bg-mesh mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 w-full max-w-7xl mx-auto px-6 sm:px-12 py-8 flex justify-between items-center transition-all duration-300">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <VerdictLogo className="w-8 h-8 text-orange-500 group-hover:scale-105 transition-transform" />
          <span className="font-black tracking-tight text-xl text-slate-900 dark:text-white">VERDICT</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/agents"
            className="group flex items-center gap-2 text-[13px] font-bold px-5 py-2.5 rounded-lg bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 text-orange-500 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-orange-600 dark:hover:text-orange-400 transition-all shadow-sm"
          >
            <Bot className="w-4 h-4 transition-opacity" />
            <span className="hidden sm:inline">For Agents</span>
            <span className="sm:hidden">Agents</span>
          </Link>
        </div>
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
                className="w-full max-w-2xl mx-auto relative"
              >
                <div className="w-full flex justify-center mb-8">
                  <a 
                    href="https://www.producthunt.com/products/verdict-7" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-transparent shadow-sm transition-all group backdrop-blur-md w-max"
                  >
                    <svg className="w-3.5 h-3.5 text-[#FF6154]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M13.626 12.067C14.717 12.067 15.602 11.182 15.602 10.091C15.602 9 14.717 8.115 13.626 8.115H10.515V12.067H13.626ZM10.515 14.509V18.172H8.082V5.65H13.626C16.06 5.65 18.035 7.625 18.035 10.058C18.035 12.491 16.06 14.466 13.626 14.466H10.515V14.509ZM12 0C5.372 0 0 5.372 0 12C0 18.628 5.372 24 12 24C18.628 24 24 18.628 24 12C24 5.372 18.628 0 12 0Z" />
                    </svg>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 tracking-tight whitespace-nowrap">
                      We&apos;re live on <span className="font-bold text-slate-900 dark:text-white">Product Hunt</span>
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                <div className="space-y-6 mb-12 text-center mt-4">
                  <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1]">
                    Find the bottleneck <br className="hidden md:block" />
                    killing your growth in <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">60 seconds.</span>
                  </h1>
                  <p className="text-xl text-slate-500 dark:text-slate-400 font-medium tracking-wide max-w-xl mx-auto leading-relaxed">
                    Stop guessing why you aren&apos;t scaling. Drop your URL for a brutally honest, YC-grade audit.
                  </p>
                </div>

                <form onSubmit={handleAnalyze}>
                  <div className="group relative flex items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border-2 border-slate-200/50 dark:border-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 focus-within:border-slate-300 dark:focus-within:border-slate-700 focus-within:-translate-y-0.5 overflow-hidden transition-all duration-300 p-1">
                    <div className="pl-5">
                      <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-slate-500 dark:group-focus-within:text-slate-400 transition-colors duration-300" />
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
                      className="border-0 bg-transparent dark:bg-transparent disabled:bg-transparent dark:disabled:bg-transparent text-lg sm:text-xl py-6 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-none font-medium rounded-none w-full"
                    />
                    <div className="pr-1">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide rounded-xl px-6 sm:px-8 h-12 transition-all active:scale-[0.98] w-[140px] sm:w-[160px] flex items-center justify-center relative [-webkit-tap-highlight-color:transparent] group/btn"
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span className="text-sm sm:text-base mr-1 sm:mr-2">Analyze</span>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-left"
                    >
                      <div className="mt-0.5"><AlertCircle className="w-5 h-5" /></div>
                      <div className="text-sm font-medium">{errorMsg}</div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                        <div className="w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 pt-14 flex flex-col items-start space-y-5 border-2 border-slate-200/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden">
                          {/* Terminal Header */}
                          <div className="absolute top-0 left-0 w-full h-10 flex items-center px-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-3">Verdict Engine v0</span>
                          </div>

                          <div className="w-full flex flex-col space-y-4">
                            {analyzeLoadingPhrases.map((phrase, idx) => (
                               <div key={idx} className={`flex items-center gap-4 transition-all duration-500 font-mono ${loadingPhase >= idx ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
                                  {loadingPhase > idx ? (
                                     <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                     </div>
                                  ) : loadingPhase === idx ? (
                                     <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                        <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                                     </div>
                                  ) : (
                                     <div className="w-5 h-5 rounded border-2 border-slate-200 dark:border-slate-800 shrink-0" />
                                  )}
                                  <span className={`text-[13px] ${loadingPhase >= idx ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-slate-600'}`}>
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
                
                <AnimatePresence>
                  {errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-left"
                    >
                      <div className="mt-0.5"><AlertCircle className="w-5 h-5" /></div>
                      <div className="text-sm font-medium">{errorMsg}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
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
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Company Name</label>
                        <Input 
                          value={extractedData?.company_name || ""} 
                          onChange={e => setExtractedData({...extractedData!, company_name: e.target.value})}
                          className="bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white rounded-xl transition-colors"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Audience</label>
                        <Input 
                          value={extractedData?.target_audience || ""} 
                          onChange={e => setExtractedData({...extractedData!, target_audience: e.target.value})}
                          className="bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Inferred Description</label>
                        <Textarea 
                          value={extractedData?.core_value_prop || ""} 
                          onChange={e => setExtractedData({...extractedData!, core_value_prop: e.target.value})}
                          className="bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-4 min-h-[100px] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white rounded-xl transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Primary CTA</label>
                        <Input 
                          value={extractedData?.primary_cta || ""} 
                          onChange={e => setExtractedData({...extractedData!, primary_cta: e.target.value})}
                          className="bg-transparent border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-base py-6 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white rounded-xl transition-colors"
                        />
                      </div>

                      <div className="pt-4 flex gap-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setIsAuditing(false)}
                          disabled={isLoading}
                          className="h-12 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isLoading}
                          className={`flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl h-12 transition-all relative overflow-hidden ${!isLoading && 'active:scale-[0.98]'}`}
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
                            <div className="w-full max-w-md bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 pt-14 flex flex-col items-start space-y-5 border-2 border-slate-200/50 dark:border-slate-800/50 shadow-sm relative overflow-hidden">
                              {/* Terminal Header */}
                              <div className="absolute top-0 left-0 w-full h-10 flex items-center px-4 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 ml-3">Verdict Engine v0</span>
                              </div>

                              <div className="w-full flex flex-col space-y-4">
                                {generateLoadingPhrases.map((phrase, idx) => (
                                   <div key={idx} className={`flex items-center gap-4 transition-all duration-500 font-mono ${loadingPhase >= idx ? 'opacity-100 translate-x-0' : 'opacity-30 -translate-x-2'}`}>
                                      {loadingPhase > idx ? (
                                         <div className="w-5 h-5 rounded flex items-center justify-center shrink-0 bg-slate-900 dark:bg-white text-white dark:text-slate-900">
                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                         </div>
                                      ) : loadingPhase === idx ? (
                                         <div className="w-5 h-5 flex items-center justify-center shrink-0">
                                            <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                                         </div>
                                      ) : (
                                         <div className="w-5 h-5 rounded border-2 border-slate-200 dark:border-slate-800 shrink-0" />
                                      )}
                                      <span className={`text-[13px] ${loadingPhase >= idx ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400 dark:text-slate-600'}`}>
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

      {/* Rate Limit / Teaser Wall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
              onClick={() => setShowPaywall(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[101] p-4 md:p-6 overflow-y-auto flex items-center justify-center"
            >
              <div className="w-full max-w-5xl bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-[2rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] relative flex flex-col my-auto h-max">
                <button 
                  onClick={() => setShowPaywall(false)}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-10 mt-2 relative z-10">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    Upgrade your plan
                  </h3>
                  {/* Text removed as requested */}
                </div>

                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                  {/* Free Plan Card */}
                  <div className="border border-slate-200 dark:border-slate-800/50 rounded-3xl p-8 bg-white dark:bg-slate-900/50 shadow-sm flex flex-col h-full">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shrink-0">
                      <VerdictLogo className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <h4 className="text-2xl font-black mb-1 shrink-0">Verdict</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 text-sm shrink-0">For normal users & casual exploration.</p>
                    <div className="mb-8 shrink-0">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">Free</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">1 full audit per 12 hours (IP limited)</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Full 7-Pillar framework</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Headless browser extraction</span>
                      </li>
                    </ul>
                    <button 
                      onClick={() => setShowPaywall(false)}
                      className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-center transition-colors text-sm"
                    >
                      Your current plan
                    </button>
                  </div>

                  {/* Pro Plan Card */}
                  <div className="border-2 border-orange-500 rounded-3xl p-8 bg-orange-50 dark:bg-orange-500/5 shadow-[0_0_40px_rgba(249,115,22,0.1)] relative overflow-hidden flex flex-col h-full">
                    <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none mix-blend-overlay" />
                    <div className="absolute top-0 right-6 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg tracking-widest uppercase shrink-0">
                      RECOMMENDED
                    </div>
                    
                    {/* Glowing orbs for the premium card */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />
                    
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-orange-500/20 shrink-0">
                      <VerdictLogo className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-2xl font-black mb-1 relative z-10 shrink-0">Verdict Pro</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 relative z-10 text-sm shrink-0">For Founders, CMOs, VCs, Growth Marketers, Indie Hackers & high-volume usage.</p>
                    <div className="mb-8 relative z-10 shrink-0 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#26A17B] flex items-center justify-center shrink-0 shadow-sm border border-[#26A17B]/20">
                        <svg viewBox="0 0 339.43 295.27" className="w-6 h-6 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M191.19,144.8v0c-1.2.09-7.4,0.46-21.23,0.46-11,0-18.81-.33-21.55-0.46v0c-42.51-1.87-74.24-9.27-74.24-18.13s31.73-16.25,74.24-18.15v28.91c2.78,0.2,10.74.67,21.74,0.67,13.2,0,19.81-.55,21-0.66v-28.9c42.42,1.89,74.08,9.29,74.08,18.13s-31.65,16.24-74.08,18.12h0Zm0-39.25V79.68h59.2V40.23H89.21V79.68H148.4v25.86c-48.11,2.21-84.29,11.74-84.29,23.16s36.18,20.94,84.29,23.16v82.9h42.78V151.83c48-2.21,84.12-11.73,84.12-23.14s-36.09-20.93-84.12-23.15h0Zm0,0h0Z" fill="white" fillRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight font-mono leading-none slashed-zero">0.5</span>
                        <span className="text-xl font-bold text-slate-500 dark:text-slate-400 leading-none">USDT</span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 font-medium text-sm self-end pb-0.5">/ audit</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1 relative z-10">
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Unlimited audits</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">No monthly SaaS subscription lock-in</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Run autonomously via OKX Agent rails</span>
                      </li>
                      <li className="flex gap-3">
                        <Check className="w-5 h-5 text-orange-500 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">Bulk processing capabilities (Coming soon)</span>
                      </li>
                    </ul>
                    
                    <a 
                      href="https://www.okx.ai/agents/4686"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 !text-white font-bold rounded-xl text-center transition-all hover:scale-[1.02] active:scale-[0.98] relative z-10 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] border border-orange-400/20 text-sm"
                    >
                      Continue to OKX.AI
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>



      <Footer />
    </div>
  );
}
