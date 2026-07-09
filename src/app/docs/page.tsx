import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Why VERDICT Exists | Documentation",
};

export default function DocsIntroPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Why VERDICT Exists</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        The startup ecosystem is plagued by &quot;delusion by echo chamber.&quot; Founders spend months building products, wrapping them in generic marketing fluff, and wondering why they aren&apos;t scaling.
      </p>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-8 mb-12">
        <p className="text-orange-700 dark:text-orange-400 font-medium m-0 mb-4 text-lg leading-relaxed">
          When founders ask for feedback, they get polite nods from friends or superficial critiques from AI wrappers that simply say, &quot;Your website looks great! Maybe add a clearer CTA?&quot;
        </p>
        <p className="text-orange-800 dark:text-orange-300 font-black text-xl m-0 tracking-tight">
          VERDICT is the antidote.
        </p>
      </div>

      <h2>The Problem with &quot;AI Wrappers&quot;</h2>
      <p>
        Most AI tools fail at business analysis because they suffer from <strong>Positivity Bias</strong>. Standard Large Language Models (LLMs) are RLHF-trained to be helpful, polite, and encouraging. If you feed an LLM your landing page and ask for a critique, it will actively search for nice things to say to cushion the blow.
      </p>
      <p>
        In early-stage startups, polite feedback is fatal. You don&apos;t need a cheerleader; you need a diagnosis.
      </p>

      <h2>Our Philosophy</h2>
      <p>
        VERDICT strips away the RLHF positivity bias using aggressive system prompts, strict JSON schema enforcement, and a rigid 7-pillar grading rubric. 
      </p>
      
      <ul className="space-y-4 mb-12">
        <li><strong>We don&apos;t just pass your URL to an LLM.</strong> We run a full headless browser to bypass bot protection, render your JavaScript, and extract your raw DOM.</li>
        <li><strong>We normalize the context.</strong> We force our proprietary reasoning engine to evaluate your company against the harsh reality of the B2B/B2C market.</li>
        <li><strong>Brutal Honesty.</strong> If your startup is a thin wrapper, we will tell you. If your value proposition is a word salad of buzzwords, we will rip it apart.</li>
      </ul>

      <h2>The Web Playground vs. The Autonomous Agent</h2>
      <p>
        Because VERDICT relies on heavy compute—running headless browsers (Firecrawl) and processing massive context windows (Jina AI & OpenAI)—scaling this level of deep analysis is exceptionally expensive.
      </p>
      <p>
        Instead of forcing users into expensive monthly SaaS subscriptions, we engineered a hybrid model:
      </p>
      <ul className="space-y-4 mb-12">
        <li><strong>The Web Playground (This Site):</strong> A free, rate-limited (1 audit per 12 hours) interface designed to let founders experience the brutality of the VERDICT engine firsthand.</li>
        <li><strong>The OKX.AI Agent (The Full Engine):</strong> Our uncapped, autonomous auditor lives natively on the OKX.AI ecosystem. Here, VCs and heavy users can run unlimited audits on a strict pay-per-execution basis using Web3 rails.</li>
      </ul>

      <div className="flex justify-end mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link href="/docs/architecture" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:text-orange-500 dark:hover:text-orange-500 transition-colors">
          Next: Architecture & Pipeline <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
