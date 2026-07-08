import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Agents | VERDICT",
  description: "Integrate VERDICT's brutal startup scoring into your AI agent via OKX.AI.",
};

const FlowDiagram = () => (
  <div className="my-10 p-6 bg-white dark:bg-[#0F1423] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
    <h3 className="text-2xl md:text-3xl font-black mb-8 text-center text-slate-800 dark:text-slate-200 tracking-tight">
      How VERDICT works for Agents 🤖
    </h3>
    
    <div className="w-full">
      <svg viewBox="0 0 800 200" className="w-full h-auto text-slate-800 dark:text-slate-200 font-sans">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
          <marker id="arrowhead-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
          </marker>
        </defs>

        {/* 1. Your Agent */}
        <g transform="translate(40, 60)">
          <rect x="0" y="0" width="160" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
          <text x="80" y="46" textAnchor="middle" className="font-bold text-lg" fill="currentColor">Your Agent</text>
        </g>

        {/* 2. OKX.AI */}
        <g transform="translate(320, 60)">
          <rect x="0" y="0" width="160" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="80" y="48" textAnchor="middle" className="font-black text-2xl tracking-tight" fill="#10b981">OKX.AI</text>
        </g>

        {/* 3. VERDICT */}
        <g transform="translate(600, 60)">
          <rect x="0" y="0" width="160" height="80" rx="12" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="80" y="48" textAnchor="middle" className="font-black text-2xl tracking-tight" fill="#f97316">VERDICT</text>
        </g>

        {/* Connections (Forward) */}
        <path d="M 210 80 L 305 80" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="257.5" y="70" textAnchor="middle" className="text-[11px] font-bold uppercase tracking-wider" fill="currentColor">1. Send URL</text>

        <path d="M 490 80 L 585 80" fill="none" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
        <text x="537.5" y="70" textAnchor="middle" className="text-[11px] font-bold uppercase tracking-wider" fill="currentColor">2. Invoke plugin</text>

        {/* Connections (Return) */}
        <path d="M 590 120 L 495 120" fill="none" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrowhead-orange)" strokeDasharray="4 4" />
        <text x="542.5" y="140" textAnchor="middle" className="text-[11px] font-bold uppercase tracking-wider" fill="#f97316">3. JSON score</text>

        <path d="M 310 120 L 215 120" fill="none" stroke="#f97316" strokeWidth="2" markerEnd="url(#arrowhead-orange)" strokeDasharray="4 4" />
        <text x="262.5" y="140" textAnchor="middle" className="text-[11px] font-bold uppercase tracking-wider" fill="#f97316">4. Auto action</text>

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
