import { Metadata } from "next";
import { DocsPagination } from "@/components/DocsPagination";
export const metadata: Metadata = {
  title: "Architecture & Pipeline | Documentation",
};

export default function ArchitecturePage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Architecture & Pipeline</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        Verdict is not a simple prompt wrapper. It is a multi-stage data extraction and reasoning pipeline designed to simulate a consultant&apos;s due diligence process in 60 seconds.
      </p>

      <div className="space-y-12">
        <section>
          <h2>1. Headless Extraction (Firecrawl)</h2>
          <p>
            When you submit a URL, standard scraping tools often fail. Modern SaaS landing pages are heavily client-side rendered (React, Vue, Next.js) and protected by Cloudflare or Datadome. 
          </p>
          <p>
            Verdict utilizes a headless browser infrastructure via <strong>Firecrawl</strong> to:
          </p>
          <ul>
            <li>Bypass basic bot protection.</li>
            <li>Fully execute client-side JavaScript.</li>
            <li>Wait for the DOM to settle and render dynamic elements.</li>
            <li>Strip out styling/HTML and extract the pure Markdown context of the page.</li>
          </ul>
        </section>

        <section>
          <h2>2. Context Normalization</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            Before the deep audit begins, Verdict runs a preliminary normalization pass using <a href="https://huggingface.co/zai-org/GLM-5.2" target="_blank" rel="noopener noreferrer">GLM-5.2</a> to establish the ground truth. This phase strips away marketing jargon, parsing the raw HTML structure to identify the true core value proposition (what the product actually does versus what the founder claims it does).
          </p>
          <ol>
            <li><strong>Validation:</strong> We verify the URL actually belongs to a SaaS, B2B, or B2C startup. If you submit a personal blog, a GitHub repo, or an agency, the engine rejects it.</li>
            <li><strong>De-fluffing:</strong> We extract the actual company name, identify the real target audience, and generate an &quot;Inferred Description&quot; that strips away your marketing buzzwords and states <em>exactly</em> what your product physically does.</li>
          </ol>
        </section>

        <section>
          <h2>3. The Grading Engine</h2>
          <p>
            Once the ground truth is established, the data is passed to our rigorous grading engine. The engine evaluates the startup against our proprietary 7-Pillar Framework.
          </p>
          <p>
            To prevent LLM drift and hallucination, the engine is constrained by:
          </p>
          <ul>
            <li><strong>Aggressive System Prompts:</strong> Instructing the model to act as a cynical, pattern-matching investor.</li>
            <li><strong>Strict JSON Schemas:</strong> Forcing the output to conform to our exact scoring ranges (0-10, 0-20, 0-100) and structured feedback fields.</li>
          </ul>
          <p>
            The result is saved to a PostgreSQL database (Supabase) and rendered instantly on the client.
          </p>
        </section>
      </div>

      <div className="mt-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
        <h2 className="mt-0 text-xl font-bold mb-4">Compute Costs & Rate Limiting</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-0 leading-relaxed">
          Running headless browsers on-demand, fetching assets, and reasoning over massive DOM context windows is extremely compute-heavy. To protect our infrastructure, the Web App strictly enforces an IP-based rate limit via <strong>Vercel KV (Redis)</strong>. If you require unlimited, scalable audits without rate limits, the Verdict pipeline can be executed autonomously via the <strong>OKX.AI Agent Ecosystem</strong>.
        </p>
      </div>

      <DocsPagination 
        prev={{ title: "Introduction", href: "/docs" }}
        next={{ title: "The 7-Pillar Framework", href: "/docs/framework" }} 
      />
    </>
  );
}
