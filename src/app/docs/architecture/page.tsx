import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Architecture & Pipeline | Documentation",
};

export default function ArchitecturePage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Architecture & Pipeline</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        VERDICT is not a simple prompt wrapper. It is a multi-stage data extraction and reasoning pipeline designed to simulate a consultant's due diligence process in 60 seconds.
      </p>

      <div className="space-y-12">
        <section>
          <h2>1. Headless Extraction (Firecrawl)</h2>
          <p>
            When you submit a URL, standard scraping tools often fail. Modern SaaS landing pages are heavily client-side rendered (React, Vue, Next.js) and protected by Cloudflare or Datadome. 
          </p>
          <p>
            VERDICT utilizes a headless browser infrastructure via <strong>Firecrawl</strong> to:
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
          <p className="text-slate-300 mb-4">
            Before the deep audit begins, VERDICT runs a preliminary normalization pass using glm 5.2 to establish the ground truth. This phase strips away marketing jargon, parsing the raw HTML structure to identify the true core value proposition (what the product actually does versus what the founder claims it does).
          </p>
          <ol>
            <li><strong>Validation:</strong> We verify the URL actually belongs to a SaaS, B2B, or B2C startup. If you submit a personal blog, a GitHub repo, or an agency, the engine rejects it.</li>
            <li><strong>De-fluffing:</strong> We extract the actual company name, identify the real target audience, and generate an "Inferred Description" that strips away your marketing buzzwords and states <em>exactly</em> what your product physically does.</li>
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

      <div className="flex justify-between mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link href="/docs" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Previous: Introduction
        </Link>
        <Link href="/docs/framework" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:text-orange-500 dark:hover:text-orange-500 transition-colors">
          Next: The 7 Pillars <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
