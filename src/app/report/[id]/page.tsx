"use client";
import { Footer } from "@/components/footer";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertTriangle, Target, TrendingUp, ArrowRight, ArrowUpRight, BarChart3, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const springTransition = { type: "spring" as const, stiffness: 200, damping: 20 };

const MotionCard = motion(Card);

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;

  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-6" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse tracking-wide uppercase text-sm">Compiling Verdict...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/50 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-rose-600 dark:text-rose-400 mx-auto mb-6" />
          <h2 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">Audit Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{error || "This report does not exist or has been deleted."}</p>
          <a href="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-orange-500/20">
            Start New Audit <ArrowRight className="w-4 h-4" />
          </a>
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
  
  const pillars = report.growth_plan_30_day || {};
  const verdict = report.key_risks || {};
  const priorityMatrix = report.top_5_priorities || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 md:p-8 lg:p-12 selection:bg-orange-500/20 selection:text-orange-900 overflow-hidden relative">
      {/* Topo Background with subtle pan animation */}
      <motion.div 
        animate={{ backgroundPosition: ["0% 0%", "10% 10%", "0% 0%"] }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
        className="fixed inset-[-50%] z-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'url(/bg-topo.png)', backgroundSize: '600px' }} 
      />

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        
        {/* Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springTransition}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
        >
          <div className="flex items-center gap-5 group">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 transition-all duration-300 flex-shrink-0">
              <img 
                src={`https://www.google.com/s2/favicons?domain=${report.url}&sz=128`} 
                alt={`${report.company_name} logo`} 
                className="w-14 h-14 rounded-xl group-hover:scale-105 transition-transform" 
              />
            </div>
            <div className="flex flex-col justify-center pt-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-2.5">
                {report.company_name}
              </h1>
              <a 
                href={report.url} 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-semibold text-sm w-fit"
              >
                <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4 group-hover:decoration-slate-400 dark:group-hover:decoration-slate-500 transition-colors">
                  {report.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 px-8 py-6 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center min-w-[200px]">
            <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Growth Readiness
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-6xl font-black tracking-tighter ${getScoreColor(report.fdi_overall_score)}`}>{report.fdi_overall_score}</span>
              <span className="text-2xl font-bold text-slate-300 dark:text-slate-600">/100</span>
            </div>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-4xl leading-relaxed"
        >
          {report.executive_summary}
        </motion.p>

        {/* Highlighted Verdict Box */}
        {verdict && (
          <MotionCard 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={springTransition}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden relative rounded-3xl"
          >
            <CardHeader className="pb-4 relative z-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <AlertCircle className="text-slate-800 dark:text-slate-200 w-7 h-7" /> The Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-6">
                  {/* Status Box - Blue */}
                  <div className="bg-blue-50/60 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-800/30 flex-1 flex flex-col justify-center transition-all hover:bg-blue-50/80">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                      <Target className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Status
                    </p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                      {verdict.status}
                    </p>
                  </div>
                  
                  {/* Primary Constraint Box - Rose */}
                  <div className="bg-rose-50/60 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100/50 dark:border-rose-800/30 flex-1 flex flex-col justify-center transition-all hover:bg-rose-50/80">
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-widest font-black mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Primary Constraint
                    </p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white tracking-tight leading-snug">
                      {verdict.primary_constraint}
                    </p>
                  </div>
                </div>
                
                {/* Highest Opportunity Box - Emerald */}
                <div className="lg:col-span-2 bg-emerald-50/60 dark:bg-emerald-900/20 p-8 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 flex flex-col justify-center transition-all hover:bg-emerald-50/80">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black mb-4 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Highest Opportunity
                  </p>
                  <p className="font-black text-2xl text-slate-900 dark:text-white tracking-tight leading-snug">
                    {verdict.highest_opportunity}
                  </p>
                  <p className="text-base font-medium text-slate-500 dark:text-slate-400 mt-4 leading-relaxed">
                    {verdict.estimated_impact}
                  </p>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        )}

        {/* GRF Pillars Grid (Bento Box) */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={springTransition}
        >
          <div className="flex items-center gap-3 mb-8 mt-12">
            <div className="w-1.5 h-6 bg-white dark:bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">7-Pillar Framework Analysis</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(pillars).map(([key, pillar]: [string, any], i) => {
              if (!pillar || typeof pillar !== 'object' || !pillar.score) return null;
              
              const formatKey = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(/\bUx\b/g, 'UX');
              
              return (
                <MotionCard 
                  key={i} 
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all rounded-3xl"
                >
                  <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{formatKey(key)}</CardTitle>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-bold shadow-sm">
                          {pillar.confidence}
                        </Badge>
                        <span className={`font-black text-2xl tracking-tighter ${getScoreColor(pillar.score)}`}>
                          {pillar.score}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={pillar.score} 
                      className="h-2 bg-slate-100 dark:bg-slate-800 mt-5"
                      indicatorClassName={`${getScoreProgressColor(pillar.score)} rounded-full`}
                    />
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">"{pillar.reason}"</p>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Strengths
                        </h4>
                        <ul className="space-y-3">
                          {pillar.strengths?.map((s: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-start gap-2.5 leading-snug">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">+</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Weaknesses
                        </h4>
                        <ul className="space-y-2">
                          {pillar.weaknesses?.map((w: string, idx: number) => (
                            <li key={idx} className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-start gap-2 leading-tight">
                              <span className="text-rose-600 dark:text-rose-400 font-bold mt-0.5">-</span> {w}
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
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={springTransition}
          className="mt-12"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-6 bg-white dark:bg-slate-900 rounded-full" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Priority Matrix</h2>
          </div>
          
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-black/50 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-8 py-5">Task</th>
                    <th className="px-8 py-5">Impact</th>
                    <th className="px-8 py-5">Effort</th>
                    <th className="px-8 py-5">Why it matters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityMatrix.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-5 font-bold text-slate-900 dark:text-white">{item.task}</td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className={`font-bold border-0 shadow-sm
                          ${item.impact === 'High' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : ''}
                          ${item.impact === 'Medium' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''}
                          ${item.impact === 'Low' ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' : ''}
                        `}>
                          {item.impact}
                        </Badge>
                      </td>
                      <td className="px-8 py-5">
                        <Badge variant="outline" className={`font-bold border-0 shadow-sm
                          ${item.effort === 'High' ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30' : ''}
                          ${item.effort === 'Medium' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' : ''}
                          ${item.effort === 'Low' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : ''}
                        `}>
                          {item.effort}
                        </Badge>
                      </td>
                      <td className="px-8 py-5 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{item.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center pt-16 pb-20"
        >
           <a href="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
             Submit another startup <ArrowRight className="w-4 h-4" />
           </a>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
