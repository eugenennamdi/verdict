'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, Copy, Check, ChevronLeft, Bot, Shield, Database, Coins } from 'lucide-react';
import { Footer } from '@/components/footer';

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

export default function AgentsPage() {
  const [copiedCurl, setCopiedCurl] = useState(false);

  const curlCommand = `curl -X POST https://tryverdict.xyz/api/v1/audit \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{"url": "https://startup.com"}'`;

  const jsonResponse = `{
  "success": true,
  "meta": {
    "url": "https://startup.com",
    "timestamp": "2024-03-20T10:00:00Z",
    "engine": "OKX.AI",
    "version": "v1"
  },
  "data": {
    "positioning_score": 9,
    "messaging_clarity": 10,
    "growth_bottlenecks": [
      {
        "issue": "Enterprise conversion friction",
        "impact": "High",
        "effort": "Medium"
      }
    ],
    "execution_roadmap": [
      {
        "phase": "30-Day",
        "task": "Implement OKX Wallet SSO",
        "why": "Reduces sign-up dropoff by 40%"
      }
    ]
  }
}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-slate-50 dark:bg-[#090C15] selection:bg-orange-500/30">
      {/* Subtle Premium Background */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

      {/* Header */}
      <header className="sticky top-4 z-50 w-[calc(100%-2rem)] max-w-6xl mx-auto px-6 py-4 flex justify-between items-center bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-full transition-all duration-300 mb-8 mt-4 shadow-sm">
        <Link 
          href="/" 
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm group"
          aria-label="Back to Homepage"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400 group-hover:-translate-x-1 transition-transform" />
        </Link>
        <div className="flex items-center gap-4">
          {/* Removed Developer API badge as it was redundant */}
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-20 relative z-10">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Context & Endpoint */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Overview Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm relative overflow-hidden group"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <VerdictLogo className="w-5 h-5 text-orange-500" />
                  <a href="https://www.okx.ai/agents/4686" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 dark:text-white tracking-tight hover:text-orange-500 transition-colors">
                    Verdict ASP
                  </a>
                </div>
                
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Agents can call our API to run brutal, YC-grade audits on any URL autonomously.
                </p>
              </div>
            </motion.div>

            {/* Endpoint Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-[#0D1117] border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-8">
                  <div className="px-3 py-1 rounded-md bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center shadow-sm">
                    <span className="text-green-700 dark:text-green-400 font-black text-xs tracking-wider">POST</span>
                  </div>
                  <h2 className="text-lg font-mono font-semibold text-slate-900 dark:text-white">/api/v1/audit</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Pricing</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">0.5 USDT on X Layer per successful audit.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Authentication</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Bearer token required via Header.</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Database className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Rate Limit</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">1 Request per 12 Hours per Agent.</p>
                    </div>
                  </div>
                </div>
            </motion.div>

          </div>

          {/* Right Column: Code & JSON */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* cURL Example */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0D1117] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative group"
            >
              {/* macOS style header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#161B22] border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]" />
                  <span className="ml-3 text-slate-400 text-xs font-mono">cURL Request</span>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <span className="text-[#FF7B72]">curl</span> <span className="text-[#79C0FF]">-X</span> <span className="text-[#A5D6FF]">POST</span> <span className="text-[#C9D1D9]">https://tryverdict.xyz/api/v1/audit \</span><br/>
                  <span className="text-[#79C0FF]">  -H</span> <span className="text-[#A5D6FF]">"Content-Type: application/json"</span> <span className="text-[#C9D1D9]">\</span><br/>
                  <span className="text-[#79C0FF]">  -H</span> <span className="text-[#A5D6FF]">"Authorization: Bearer &lt;API_KEY&gt;"</span> <span className="text-[#C9D1D9]">\</span><br/>
                  <span className="text-[#79C0FF]">  -d</span> <span className="text-[#A5D6FF]">{`'{"url": "https://startup.com"}'`}</span>
                </pre>
              </div>
            </motion.div>

            {/* JSON Response Schema */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#0D1117] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center px-4 py-3 bg-[#161B22] border-b border-slate-800">
                <Terminal className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-slate-400 text-xs font-mono">Response Schema (200 OK)</span>
              </div>
              <div className="p-6 overflow-x-auto h-[400px] overflow-y-auto custom-scrollbar">
                <pre className="text-sm font-mono leading-relaxed text-[#C9D1D9]">
                  <span className="text-[#C9D1D9]">{`{`}</span><br/>
                  <span className="text-[#7EE787]">  "success"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#79C0FF]">true</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">  "meta"</span><span className="text-[#C9D1D9]">: {`{`}</span><br/>
                  <span className="text-[#7EE787]">    "url"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"https://startup.com"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">    "timestamp"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"2024-03-20T10:00:00Z"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">    "engine"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"OKX.AI"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">    "version"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"v1"</span><br/>
                  <span className="text-[#C9D1D9]">  &#125;,</span><br/>
                  <span className="text-[#7EE787]">  "data"</span><span className="text-[#C9D1D9]">: &#123;</span><br/>
                  <span className="text-[#7EE787]">    "positioning_score"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#79C0FF]">9</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">    "messaging_clarity"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#79C0FF]">10</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">    "growth_bottlenecks"</span><span className="text-[#C9D1D9]">: [</span><br/>
                  <span className="text-[#C9D1D9]">      &#123;</span><br/>
                  <span className="text-[#7EE787]">        "issue"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"Enterprise conversion friction"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">        "impact"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"High"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">        "effort"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"Medium"</span><br/>
                  <span className="text-[#C9D1D9]">      &#125;</span><br/>
                  <span className="text-[#C9D1D9]">    ],</span><br/>
                  <span className="text-[#7EE787]">    "execution_roadmap"</span><span className="text-[#C9D1D9]">: [</span><br/>
                  <span className="text-[#C9D1D9]">      &#123;</span><br/>
                  <span className="text-[#7EE787]">        "phase"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"30-Day"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">        "task"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"Implement OKX Wallet SSO"</span><span className="text-[#C9D1D9]">,</span><br/>
                  <span className="text-[#7EE787]">        "why"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"Reduces sign-up dropoff by 40%"</span><br/>
                  <span className="text-[#C9D1D9]">      &#125;</span><br/>
                  <span className="text-[#C9D1D9]">    ]</span><br/>
                  <span className="text-[#C9D1D9]">  &#125;</span><br/>
                  <span className="text-[#C9D1D9]">&#125;</span>
                </pre>
              </div>
            </motion.div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
