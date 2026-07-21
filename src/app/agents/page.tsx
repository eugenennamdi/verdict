'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, ChevronLeft, Shield, Database, Coins } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const singleCurl = `curl -X POST https://tryverdict.xyz/api/evaluate-mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "evaluate_startup",
      "arguments": {
        "url": "https://startup.com"
      }
    }
  }'`;

  const singleJson = `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\\n  \\"company_name\\": \\"Startup Inc\\",\\n  \\"growth_readiness_score\\": 92,\\n  \\"actionable_feedback\\": [...]\\n}"
      }
    ]
  }
}`;

  const bulkCurl = `curl -X POST https://tryverdict.xyz/api/bulk-evaluate-mcp \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <API_KEY>" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "bulk_evaluate_startups",
      "arguments": {
        "urls": [
          "https://startup1.com",
          "https://startup2.com"
        ]
      }
    }
  }'`;

  const bulkJson = `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[\\n  { \\"url\\": \\"https://startup1.com\\", \\"growth_readiness_score\\": 92 },\\n  { \\"url\\": \\"https://startup2.com\\", \\"growth_readiness_score\\": 45 }\\n]"
      }
    ]
  }
}`;

  const currentCurl = activeTab === 'single' ? singleCurl : bulkCurl;
  const currentJson = activeTab === 'single' ? singleJson : bulkJson;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(currentCurl);
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
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-20 relative z-10">
        
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Context & Endpoint */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Overview Card with Tabs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl p-8 shadow-sm relative overflow-hidden group flex flex-col"
            >
              <div className="relative z-10 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <VerdictLogo className="w-5 h-5 text-orange-500" />
                  <a href="https://www.okx.ai/agents/4686" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-900 dark:text-white tracking-tight hover:text-orange-500 transition-colors">
                    Verdict
                  </a>
                </div>
                
                <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  Autonomously run single growth audits or bulk screen entire deal-flows via OKX.AI.
                </p>
              </div>

              {/* Tabs */}
              <div className="relative z-10 flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'single' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Single Audit
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'bulk' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Bulk Screener
                </button>
              </div>
            </motion.div>

            {/* Endpoint Card */}
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#0D1117] border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
            >
                <div className="flex items-center gap-3 mb-8">
                  <div className="px-3 py-1 rounded-md bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-center justify-center shadow-sm">
                    <span className="text-green-700 dark:text-green-400 font-black text-xs tracking-wider">POST</span>
                  </div>
                  <h2 className="text-lg font-mono font-semibold text-slate-900 dark:text-white">
                    {activeTab === 'single' ? '/api/evaluate-mcp' : '/api/bulk-evaluate-mcp'}
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Pricing</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        {activeTab === 'single' ? '0.5 USDT on X Layer per successful audit.' : '10.0 USDT on X Layer per bulk execution.'}
                      </p>
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
                      <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
                        {activeTab === 'single' ? 'Unlimited requests via x402 & Onchain OS.' : 'No strict limit. Up to 20 URLs per request.'}
                      </p>
                    </div>
                  </div>
                </div>
            </motion.div>

          </div>

          {/* Right Column: Code & JSON */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            <motion.div 
              key={`curl-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
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
                  <span className="text-[#FF7B72]">curl</span> <span className="text-[#79C0FF]">-X</span> <span className="text-[#A5D6FF]">POST</span> <span className="text-[#C9D1D9]">https://tryverdict.xyz{activeTab === 'single' ? '/api/evaluate-mcp' : '/api/bulk-evaluate-mcp'} \\</span><br/>
                  <span className="text-[#79C0FF]">  -H</span> <span className="text-[#A5D6FF]">"Content-Type: application/json"</span> <span className="text-[#C9D1D9]">\\</span><br/>
                  <span className="text-[#79C0FF]">  -H</span> <span className="text-[#A5D6FF]">"Authorization: Bearer &lt;API_KEY&gt;"</span> <span className="text-[#C9D1D9]">\\</span><br/>
                  <span className="text-[#79C0FF]">  -d</span> <span className="text-[#A5D6FF]">{activeTab === 'single' ? `'{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "evaluate_startup",
      "arguments": {
        "url": "https://startup.com"
      }
    }
  }'` : `'{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "bulk_evaluate_startups",
      "arguments": {
        "urls": [
          "https://startup1.com",
          "https://startup2.com"
        ]
      }
    }
  }'`}</span>
                </pre>
              </div>
            </motion.div>

            {/* JSON Response Schema */}
            <motion.div 
              key={`json-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="bg-[#0D1117] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="flex items-center px-4 py-3 bg-[#161B22] border-b border-slate-800">
                <Terminal className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-slate-400 text-xs font-mono">Response Schema (200 OK)</span>
              </div>
              <div className="p-6 overflow-x-auto h-[400px] overflow-y-auto custom-scrollbar">
                <pre className="text-sm font-mono leading-relaxed text-[#C9D1D9]">
                  {activeTab === 'single' ? (
                    <>
                      <span className="text-[#C9D1D9]">{"{"}</span><br/>
                      <span className="text-[#7EE787]">  "jsonrpc"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"2.0"</span><span className="text-[#C9D1D9]">,</span><br/>
                      <span className="text-[#7EE787]">  "id"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#79C0FF]">1</span><span className="text-[#C9D1D9]">,</span><br/>
                      <span className="text-[#7EE787]">  "result"</span><span className="text-[#C9D1D9]">: {"{"}</span><br/>
                      <span className="text-[#7EE787]">    "content"</span><span className="text-[#C9D1D9]">: [</span><br/>
                      <span className="text-[#C9D1D9]">      {"{"}</span><br/>
                      <span className="text-[#7EE787]">        "type"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"text"</span><span className="text-[#C9D1D9]">,</span><br/>
                      <span className="text-[#7EE787]">        "text"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"{\\n  \\"company_name\\": \\"Startup Inc\\",\\n  \\"growth_readiness_score\\": 92,\\n  \\"actionable_feedback\\": [...]\\n}"</span><br/>
                      <span className="text-[#C9D1D9]">      {"}"}</span><br/>
                      <span className="text-[#C9D1D9]">    ]</span><br/>
                      <span className="text-[#C9D1D9]">  {"}"}</span><br/>
                      <span className="text-[#C9D1D9]">{"}"}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[#C9D1D9]">{"{"}</span><br/>
                      <span className="text-[#7EE787]">  "jsonrpc"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"2.0"</span><span className="text-[#C9D1D9]">,</span><br/>
                      <span className="text-[#7EE787]">  "id"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#79C0FF]">1</span><span className="text-[#C9D1D9]">,</span><br/>
                      <span className="text-[#7EE787]">  "result"</span><span className="text-[#C9D1D9]">: {"{"}</span><br/>
                      <span className="text-[#7EE787]">    "content"</span><span className="text-[#C9D1D9]">: [</span><br/>
                      <span className="text-[#C9D1D9]">      {"{"}</span><br/>
                      <span className="text-[#7EE787]">        "type"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"text"</span><span className="text-[#C9D1D9]">,</span><br/>
                      <span className="text-[#7EE787]">        "text"</span><span className="text-[#C9D1D9]">: </span><span className="text-[#A5D6FF]">"[\\n  { \\"url\\": \\"https://startup1.com\\", \\"growth_readiness_score\\": 92 },\\n  { \\"url\\": \\"https://startup2.com\\", \\"growth_readiness_score\\": 45 }\\n]"</span><br/>
                      <span className="text-[#C9D1D9]">      {"}"}</span><br/>
                      <span className="text-[#C9D1D9]">    ]</span><br/>
                      <span className="text-[#C9D1D9]">  {"}"}</span><br/>
                      <span className="text-[#C9D1D9]">{"}"}</span>
                    </>
                  )}
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
