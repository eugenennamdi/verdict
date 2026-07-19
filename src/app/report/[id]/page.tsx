"use client";
import { Footer } from "@/components/footer";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, Target, TrendingUp, ArrowLeft, ArrowUpRight, AlertCircle, ImageDown, Share2, Link2, Check } from "lucide-react";
import { motion } from "framer-motion";

const springTransition = { type: "spring" as const, stiffness: 200, damping: 20 };

const XLayerLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://static.okx.com/cdn/assets/imgs/243/230501A8E74482AB.png" 
    alt="X Layer" 
    className={className} 
    crossOrigin="anonymous" 
  />
);

const MotionCard = motion(Card);

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShareX = () => {
    const text = `Verdict (@tryverdict) just ran a brutal AI audit on ${report?.company_name || 'this startup'}.\n\nScore: ${report?.fdi_overall_score}/100 (Attested onchain via @XLayerOfficial)\n\nRead the full breakdown:`;
    const url = window.location.href;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadImage = async () => {
    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 150));
    try {
      const element = document.getElementById('report-content');
      if (!element) return;
      
      const { toJpeg } = await import('html-to-image');

      const filter = (node: HTMLElement) => {
        if (node?.getAttribute && node.getAttribute('data-export-ignore') === 'true') {
          return false;
        }
        return true;
      };

      const dataUrl = await toJpeg(element, { 
        quality: 0.95, 
        pixelRatio: 1.2, // Keeps text crisp but prevents mobile/Safari canvas crash
        style: {
          transform: 'none',
          margin: '0',
          position: 'relative'
        },
        filter: filter,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#020617' : '#f8fafc' 
      });
      
      // Direct image download to device
      const link = document.createElement('a');
      link.download = `${report?.company_name || 'Verdict'}_Growth_Audit.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Image generation failed", e);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/report/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setReport(data);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-6" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse tracking-wide uppercase text-sm">Compiling Verdict...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-rose-600 dark:text-rose-400 mx-auto mb-6" />
          <h2 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Audit Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{error || "This report does not exist or has been deleted."}</p>
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-orange-500/20">
            Start New Audit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 50) return "text-orange-500";
    return "text-rose-600 dark:text-rose-400";
  };

  const getScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-rose-500";
  };
  
  const pillars = (report.growth_plan_30_day || {}) as Record<string, unknown>;
  const verdict = (report.key_risks || {}) as Record<string, unknown>;
  const priorityMatrix = (report.top_5_priorities || []) as Record<string, unknown>[];

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <div className="text-slate-900 dark:text-white p-6 md:p-12 lg:p-16 selection:bg-orange-500/20 selection:text-orange-900 relative" id="report-content">
      {/* Premium Mesh Background */}
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none bg-mesh" data-html2canvas-ignore="true" data-export-ignore="true" />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Top Navigation */}
        <div className="mb-8" data-export-ignore="true">
           <Link 
             href="/" 
             className="group inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors font-medium text-sm"
           >
             <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
             Start new audit
           </Link>
        </div>
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
        >
          <div className="flex items-center gap-5 group">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 transition-all duration-300 flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`/api/proxy-logo?domain=${encodeURIComponent(String(report.url))}`} 
                alt={`${String(report.company_name)} logo`} 
                className="w-14 h-14 rounded-xl group-hover:scale-105 transition-transform bg-white object-contain" 
              />
            </div>
            <div className="flex flex-col justify-center pt-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-2.5">
                {String(report.company_name)}
              </h1>
              <a 
                href={String(report.url).startsWith('http') ? String(report.url) : `https://${String(report.url)}`} 
                target="_blank" 
                rel="noreferrer" 
                className={`inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold text-sm w-fit ${isDownloading ? 'invisible' : 'visible'}`}
              >
                <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 group-hover:decoration-slate-400 dark:group-hover:decoration-slate-500 transition-colors">
                  {String(report.url).replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-[200px]">
            <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col items-center w-full">
              <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1 flex items-center gap-1.5 relative group cursor-help">
                <TrendingUp className="w-3.5 h-3.5" /> Growth Readiness
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50 text-left font-medium leading-relaxed normal-case hidden md:block">
                  <strong className="block mb-1 text-orange-400 dark:text-orange-500 uppercase tracking-widest">How we score:</strong>
                  Positioning (20%)<br/>
                  Messaging (15%)<br/>
                  Website &amp; UX (15%)<br/>
                  Conversion (15%)<br/>
                  Growth Foundation (15%)<br/>
                  Trust &amp; Credibility (10%)<br/>
                  Market &amp; Competition (10%)
                </span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-6xl font-black tracking-tighter ${getScoreColor(Number(report.fdi_overall_score))}`}>{String(report.fdi_overall_score)}</span>
                <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">/100</span>
              </div>
              {Boolean(report.attestation_hash) && (
                <a
                  href={`https://www.okx.com/explorer/xlayer/tx/${report.attestation_hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-all bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm group"
                >
                  <XLayerLogo className="w-4 h-4 group-hover:scale-110 transition-transform drop-shadow-sm" />
                  Attested Onchain
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hero Bento */}
        {verdict && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Executive Summary Box (Span 2) */}
            <div className="md:col-span-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl flex flex-col justify-center transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80">
               <h3 className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
                 <AlertCircle className="w-3 h-3" /> Executive Summary
               </h3>
               <p className="text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                 {String(report.executive_summary)}
               </p>
            </div>

            {/* Status Box */}
            <div className="bg-blue-50/40 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 p-8 rounded-3xl flex flex-col justify-center transition-colors hover:bg-blue-50/80 dark:hover:bg-blue-900/20">
               <h3 className="text-[10px] uppercase tracking-widest font-black text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                 <Target className="w-3 h-3" /> Status
               </h3>
               <p className="font-black text-4xl tracking-tight text-slate-900 dark:text-white">
                 {String(verdict.status)}
               </p>
            </div>

            {/* Primary Constraint */}
            <div className="bg-rose-50/40 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-800/30 p-8 rounded-3xl flex flex-col transition-colors hover:bg-rose-50/80 dark:hover:bg-rose-900/20">
               <h3 className="text-[10px] uppercase tracking-widest font-black text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-2">
                 <AlertTriangle className="w-3 h-3" /> Primary Constraint
               </h3>
               <p className="font-bold text-lg text-slate-900 dark:text-white leading-snug">
                 {String(verdict.primary_constraint)}
               </p>
            </div>

            {/* Highest Opportunity (Span 2) */}
            <div className="md:col-span-2 bg-emerald-50/40 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-800/30 p-8 rounded-3xl flex flex-col transition-colors hover:bg-emerald-50/80 dark:hover:bg-emerald-900/20">
               <h3 className="text-[10px] uppercase tracking-widest font-black text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                 <TrendingUp className="w-3 h-3" /> Highest Opportunity
               </h3>
               <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-snug mb-2">
                 {String(verdict.highest_opportunity)}
               </p>
               <p className="text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 leading-relaxed">
                 {String(verdict.estimated_impact)}
               </p>
            </div>
          </motion.div>
        )}

        {/* GRF Pillars Grid (Bento Box) */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ ...springTransition, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8 mt-12">
            <div className="w-1.5 h-6 bg-white dark:bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">7-Pillar Framework Analysis</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(pillars).map(([key, pillarRaw]: [string, unknown], i) => {
              const pillar = pillarRaw as Record<string, unknown>;
              if (!pillar || typeof pillar !== 'object' || !pillar.score) return null;
              
              const formatKey = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\bUx\b/g, 'UX');
              
              return (
                <MotionCard 
                  key={i} 
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-all rounded-3xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                >
                  <CardHeader className="pb-4 border-b border-slate-100/50 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{formatKey(key)}</CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold shadow-sm">
                          {String(pillar.confidence)}
                        </Badge>
                        <span className={`font-black text-2xl tracking-tighter ${getScoreColor(Number(pillar.score))}`}>
                          {String(pillar.score)}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={Number(pillar.score)} 
                      className="h-2 bg-slate-100 dark:bg-slate-800 mt-5"
                      indicatorClassName={`${getScoreProgressColor(Number(pillar.score))} rounded-full`}
                    />
                  </CardHeader>
                  <CardContent className="p-6 space-y-5">
                    <p className="text-[15px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {String(pillar.reason)}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                      <div className="flex-1 space-y-3">
                        <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {(pillar.strengths as string[] | undefined)?.map((s: string, idx: number) => (
                            <li key={idx} className="text-[13px] text-slate-600 dark:text-slate-400 font-medium flex items-start gap-2 leading-tight">
                              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">+</span> <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex-1 space-y-3">
                        <h4 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                          Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {(pillar.weaknesses as string[] | undefined)?.map((w: string, idx: number) => (
                            <li key={idx} className="text-[13px] text-slate-600 dark:text-slate-400 font-medium flex items-start gap-2 leading-tight">
                              <span className="text-rose-500 font-bold shrink-0 mt-0.5">-</span> <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </MotionCard>
              );
            })}
          </div>
        </motion.div>

        {/* Priority Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...springTransition, delay: 0.4 }}
          className="mt-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-white dark:bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Priority Matrix</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {priorityMatrix.map((item: Record<string, unknown>, i: number) => (
              <div 
                key={i} 
                className="group bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/50 p-6 rounded-2xl flex flex-col md:flex-row md:items-center gap-6 transition-all hover:bg-white/80 dark:hover:bg-slate-900/80 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-2 transition-colors">
                    {String(item.task)}
                  </h4>
                  <p className="text-[15px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    {String(item.why)}
                  </p>
                </div>
                <div className="flex flex-row md:flex-col gap-3 shrink-0 bg-slate-50/50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100/50 dark:border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 w-14 text-right">Impact</span>
                    <Badge variant="outline" className={`font-bold border-0 shadow-sm w-20 justify-center
                      ${item.impact === 'High' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : ''}
                      ${item.impact === 'Medium' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''}
                      ${item.impact === 'Low' ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                    `}>
                      {String(item.impact)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-widest font-black text-slate-400 dark:text-slate-500 w-14 text-right">Effort</span>
                    <Badge variant="outline" className={`font-bold border-0 shadow-sm w-20 justify-center
                      ${item.effort === 'High' ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' : ''}
                      ${item.effort === 'Medium' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''}
                      ${item.effort === 'Low' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : ''}
                    `}>
                      {String(item.effort)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hybrid Action Pill Section (Floating Dock) */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          data-export-ignore="true"
        >
          <div className="flex items-center p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/50 shadow-2xl dark:shadow-slate-900/50">
            
            {/* Save Report */}
            <button 
              onClick={downloadImage}
              disabled={isDownloading}
              className="group flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Saving</span>
                </>
              ) : (
                <>
                  <ImageDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span className="hidden sm:inline">Save Report</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>

            {/* Vertical Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Copy Link */}
            <button 
              onClick={handleCopyLink}
              className="group flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />}
              <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy Link'}</span>
              <span className="sm:hidden">{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Vertical Divider */}
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Share on X */}
            <button 
              onClick={handleShareX}
              className="group flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-300"
            >
              <Share2 className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              <span className="hidden sm:inline">Share on X</span>
              <span className="sm:hidden">Share</span>
            </button>

          </div>
        </motion.div>


      </div>
      </div>
      </div>
      <Footer minimal={true} />
    </>
  );
}
