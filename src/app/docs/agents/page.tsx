import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Agents | VERDICT",
  description: "Integrate VERDICT's brutal startup scoring into your AI agent via OKX.AI.",
};

import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'] });

const FlowDiagram = () => (
  <div className="my-12 p-8 bg-white dark:bg-[#0B0F19] flex flex-col items-center">
    <h3 className={`text-3xl md:text-4xl font-bold mb-12 text-slate-800 dark:text-slate-200 ${caveat.className}`}>
      How VERDICT works for Agents 🤖
    </h3>
    
    <div className="w-full overflow-x-auto pb-4">
      <svg viewBox="0 0 900 200" className="w-full min-w-[800px] h-auto text-slate-800 dark:text-slate-200" style={{ fontFamily: caveat.style.fontFamily }}>
        <defs>
          <marker id="arrowhead-sketchy" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
            <path d="M 0 0 L 8 5 L 0 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        </defs>

        {/* 1. Your Agent */}
        <g transform="translate(40, 50)">
          {/* Sketchy Box */}
          <path d="M 2 2 L 198 0 L 200 78 L 0 80 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="100" y="48" textAnchor="middle" className="text-3xl font-bold" fill="currentColor">Your Agent</text>
        </g>

        {/* 2. OKX.AI */}
        <g transform="translate(350, 50)">
          {/* Sketchy Box */}
          <path d="M 0 3 L 198 1 L 200 79 L 2 78 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* OKX Logo / Text in Green */}
          <text x="100" y="50" textAnchor="middle" className="text-4xl font-bold" fill="#10b981">OKX.AI</text>
        </g>

        {/* 3. VERDICT */}
        <g transform="translate(660, 50)">
          {/* Sketchy Box */}
          <path d="M 1 0 L 199 2 L 198 80 L 0 78 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* VERDICT Logo + Text in Orange */}
          <g transform="translate(30, 26)">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5L12 19L20 5" />
            </svg>
          </g>
          <text x="125" y="50" textAnchor="middle" className="text-4xl font-bold" fill="#f97316">VERDICT</text>
        </g>

        {/* Connections (Forward) */}
        <path d="M 245 70 Q 295 65 340 70" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead-sketchy)" />
        <text x="295" y="60" textAnchor="middle" className="text-lg" fill="currentColor">1. Send URL</text>

        <path d="M 555 70 Q 605 68 650 70" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead-sketchy)" />
        <text x="605" y="60" textAnchor="middle" className="text-lg" fill="currentColor">2. Invoke plugin</text>

        {/* Connections (Return) */}
        <path d="M 650 110 Q 605 112 555 110" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead-sketchy)" />
        <text x="605" y="105" textAnchor="middle" className="text-lg" fill="currentColor">3. JSON score</text>

        <path d="M 340 110 Q 295 115 245 110" fill="none" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arrowhead-sketchy)" />
        <text x="295" y="105" textAnchor="middle" className="text-lg" fill="currentColor">4. Autonomous action</text>

      </svg>
    </div>
  </div>
);

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">For Agents (OKX.AI)</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          VERDICT is a highly structured, objective reasoning engine designed specifically to be consumed by other autonomous systems.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>Why VERDICT for Agents?</h2>
        <p>
          Most AI systems output conversational "fluff". VERDICT acts as a cynical, objective Silicon Valley auditor that returns strictly structured, deterministic JSON. If your agent is performing due diligence or analyzing competitors, VERDICT provides the ruthless, standardized grading rubric you need without hallucinating subjective pleasantries.
        </p>

        <FlowDiagram />

        <h2>Understanding VC Dealflow Automation</h2>
        <p>
          In the startup world, Venture Capitalists (VCs) and angel investors receive thousands of pitches and website links every month from founders asking for money. This massive river of incoming pitches is called their <strong>"Dealflow."</strong>
        </p>
        <p>
          Because humans can't possibly read thousands of startup pitches a month, modern VC firms are building AI Agents to automate this process. <strong>This is where VERDICT becomes incredibly powerful.</strong>
        </p>
        
        <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 my-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold mt-0 mb-4">The Fully Automated Flow</h3>
          <ol className="mb-0 space-y-2">
            <li><strong>Discovery:</strong> Your custom VC Dealflow Agent finds a new startup on Product Hunt.</li>
            <li><strong>Invocation:</strong> The agent passes the startup's URL to VERDICT via the OKX.AI network.</li>
            <li><strong>Processing:</strong> VERDICT scrapes the website, cuts through the marketing fluff, and scores the startup across 7 critical pillars.</li>
            <li><strong>Consumption:</strong> VERDICT returns a strict JSON payload. Your agent uses the <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">growth_readiness_score</code> to autonomously decide whether to instantly reject the startup or forward it to a human partner.</li>
          </ol>
        </div>

        <h2>Get Started</h2>
        <p>
          VERDICT is officially listed on the <strong>OKX.AI Agent Network</strong> as a plug-and-play service. Ready to supercharge your agent's reasoning capabilities?
        </p>
        <p>
          <a 
            href="https://www.okx.ai/agents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600 h-10 px-6 py-2 no-underline shadow-lg shadow-orange-500/20"
          >
            Connect via OKX.AI
          </a>
        </p>
      </div>
    </div>
  );
}
