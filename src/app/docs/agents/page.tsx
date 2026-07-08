import { Metadata } from "next";

export const metadata: Metadata = {
  title: "For Agents | VERDICT",
  description: "Integrate VERDICT's brutal startup scoring into your AI agent via OKX.AI.",
};

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">For Agents (OKX.AI)</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          VERDICT isn't just a web app. It is a highly structured reasoning engine designed to be consumed by other autonomous systems.
        </p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2>Why VERDICT for Agents?</h2>
        <p>
          Most AI systems output conversational "fluff". VERDICT acts as a cynical, objective Silicon Valley auditor that returns strictly structured, deterministic JSON. If your agent is performing due diligence, scraping dealflow, or analyzing competitors, VERDICT provides the ruthless, standardized grading rubric you need without hallucinating subjective pleasantries.
        </p>

        <h2>OKX.AI Integration</h2>
        <p>
          VERDICT is officially listed on the <strong>OKX.AI Agent Network</strong> as a plug-and-play service.
        </p>
        <p>
          Instead of building your own complex web-scraping and multi-agent reasoning pipelines, your agent can simply pass a startup's URL to VERDICT via OKX.AI, and instantly receive a comprehensive 7-pillar JSON report.
        </p>
        
        <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-6 my-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold mt-0 mb-4">Typical Agent Workflow</h3>
          <ol className="mb-0">
            <li><strong>Discovery:</strong> Your VC Dealflow Agent finds a new startup on Product Hunt.</li>
            <li><strong>Invocation:</strong> The agent calls the VERDICT service on OKX.AI, passing the target URL.</li>
            <li><strong>Processing:</strong> VERDICT scrapes the URL, maps it to our 7-Pillar Framework, and calculates the Founder Delusion Index (FDI).</li>
            <li><strong>Consumption:</strong> VERDICT returns a strict JSON payload. Your agent uses the <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">growth_readiness_score</code> to autonomously decide whether to forward the startup to a human partner.</li>
          </ol>
        </div>

        <h2>Core Use Cases</h2>
        <ul>
          <li><strong>VC Dealflow Automation:</strong> Automatically reject startups that score below 50 on the Product-Market Fit pillar.</li>
          <li><strong>Competitor Analysis Bots:</strong> Run weekly audits on competitor landing pages to track their positioning score.</li>
          <li><strong>Due Diligence Agents:</strong> Surface the "Founder Delusion Index" to human partners before taking a pitch meeting.</li>
        </ul>

        <h2>Get Started</h2>
        <p>
          Ready to supercharge your agent? Connect to VERDICT through our OKX.AI listing.
        </p>
        <p>
          <a 
            href="https://www.okx.ai/agents" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600 h-10 px-4 py-2 no-underline"
          >
            View on OKX.AI
          </a>
        </p>
      </div>
    </div>
  );
}
