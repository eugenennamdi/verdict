import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Scoring & Enforcement | Documentation",
};

export default function ScoringPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Scoring & Enforcement</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        VERDICT does not guess your score. It operates on a strict, mathematically constrained rubric enforced by JSON Schema.
      </p>

      <h2>The Rubric</h2>
      <p>
        For each of the first 6 pillars (Positioning, Messaging, UX, Conversion, Trust, Defensibility), the engine assigns a score from <strong>0 to 10</strong> based on the following criteria:
      </p>

      <ul>
        <li><strong>0-3 (Critical Failure):</strong> The startup completely lacks this element. (e.g., No target audience identified, extremely confusing messaging, zero social proof).</li>
        <li><strong>4-6 (Weak/Generic):</strong> The element exists but is poorly executed. (e.g., &quot;We help teams work better&quot;, fake-sounding testimonials).</li>
        <li><strong>7-8 (Competent):</strong> Good, standard execution. (e.g., Clear headline, decent onboarding).</li>
        <li><strong>9-10 (World-Class):</strong> Exceptional execution that creates a massive competitive advantage. (e.g., Undeniable ROI, deep network effects, viral onboarding loop).</li>
      </ul>

      <h2>Enforcing the Rubric (Beating Positivity Bias)</h2>
      <p>
        Standard LLMs suffer from <strong>Positivity Bias</strong>—they desperately want to tell you that you are doing a good job. Left unchecked, an LLM will give every startup a 9/10 for &quot;Messaging&quot; just because the website has words on it.
      </p>
      <p>To counteract this, VERDICT uses:</p>
      <ol>
        <li><strong>Aggressive Persona Prompting:</strong> The system prompt strictly commands the model to act as a cynical, hyper-critical auditor who actively searches for flaws.</li>
        <li><strong>Schema Constraints:</strong> We use structured output (JSON schema) to force the model to justify its low scores before it outputs the number.</li>
        <li><strong>Hard Limits:</strong> We instruct the model that scores of 9 or 10 must be incredibly rare and require overwhelming evidence.</li>
      </ol>

      <h2>The Overall Score (0-100)</h2>
      <p>
        The final <strong>Growth Readiness Score</strong> is a calculated weighted average of the 6 pillars, mapped to a 0-100 scale. It represents the company&apos;s overall readiness to scale and deploy capital into growth channels.
      </p>

      <div className="flex justify-between mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link href="/docs/framework" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Previous: 7-Pillar Framework
        </Link>
        <Link href="/docs/growth-readiness" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:text-orange-500 dark:hover:text-orange-500 transition-colors">
          Next: Growth Readiness Score <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
