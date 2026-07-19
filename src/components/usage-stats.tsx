"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView, animate, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const XLayerLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://static.okx.com/cdn/assets/imgs/243/230501A8E74482AB.png" 
    alt="X Layer" 
    className={className} 
    crossOrigin="anonymous" 
  />
);

// Counter component for animated numbers
function AnimatedCounter({ from = 0, to, duration = 2 }: { from?: number, to: number, duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate: (value) => {
          if (ref.current) {
            ref.current.textContent = Math.floor(value).toLocaleString();
          }
        },
      });
      return () => controls.stop();
    }
  }, [inView, from, to, duration]);

  return <span ref={ref}>{from}</span>;
}

interface UsageStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UsageStats({ isOpen, onClose }: UsageStatsProps) {
  const [stats, setStats] = useState({
    total: 0,
    score0_40: 0,
    score41_75: 0,
    score76_100: 0,
    onchain: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return; // Only fetch when opened
    
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data) setStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xl z-[100]"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] p-4 md:p-6 overflow-y-auto flex items-center justify-center pointer-events-none"
          >
            <div className="w-full max-w-6xl mx-auto pointer-events-auto relative">
              
              {/* Header / Close Button */}
              <div className="flex justify-between items-start mb-10 px-2 pb-6 border-b border-white/5">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Real-time Platform Usage</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live metrics and onchain attestations</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isLoading ? (
                <div className="w-full h-[400px] flex justify-center items-center bg-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl">
                   <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Main Box: Total Startups Audited */}
                  <div className="md:col-span-1 bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-2">Startup Teardowns</h3>
                      <div className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                        <AnimatedCounter to={stats.total} duration={2.5} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 mt-6 relative z-10 font-medium">
                      Audits generated since launch.
                    </p>
                  </div>

                  {/* Medium Box: Score Distribution */}
                  <div className="md:col-span-1 bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative">
                    <div className="relative z-10 w-full">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">The Reality Check</h3>
                        <span className="text-[8px] uppercase tracking-wider font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full backdrop-blur-md">Score Distribution</span>
                      </div>
                      
                      <div className="space-y-4">
                        {/* 0-40 Bucket */}
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-red-400">0 - 40 (Needs Work)</span>
                            <span className="text-slate-300"><AnimatedCounter to={stats.score0_40} duration={2} /></span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${stats.total ? (stats.score0_40 / stats.total) * 100 : 0}%` }} 
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full bg-red-500 rounded-full"
                            />
                          </div>
                        </div>
                        
                        {/* 41-75 Bucket */}
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-amber-400">41 - 75 (Average)</span>
                            <span className="text-slate-300"><AnimatedCounter to={stats.score41_75} duration={2} /></span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${stats.total ? (stats.score41_75 / stats.total) * 100 : 0}%` }} 
                              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                              className="h-full bg-amber-500 rounded-full"
                            />
                          </div>
                        </div>

                        {/* 76-100 Bucket */}
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-emerald-400">76 - 100 (Elite)</span>
                            <span className="text-slate-300"><AnimatedCounter to={stats.score76_100} duration={2} /></span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${stats.total ? (stats.score76_100 / stats.total) * 100 : 0}%` }} 
                              transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                              className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Small Box: Onchain Attestations */}
                  <div className="md:col-span-1 bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                     {/* Glow Effect */}
                     <div className="absolute -top-12 -right-12 w-48 h-48 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />
                     
                     <div className="relative z-10 flex justify-between items-start">
                      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Onchain Attestations</h3>
                      <span className="text-[10px] font-black bg-orange-500 text-white px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.6)] animate-pulse tracking-wide">
                        NEW
                      </span>
                    </div>
                    
                    <div className="relative z-10 mt-6">
                      <div className="text-6xl md:text-7xl font-black text-white tracking-tighter">
                        <AnimatedCounter to={stats.onchain} duration={2.5} />
                      </div>
                      <p className="text-sm text-slate-400 mt-4 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                        Minted on X Layer
                        <XLayerLogo className="w-5 h-5 ml-1 drop-shadow-sm opacity-90" />
                      </p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
