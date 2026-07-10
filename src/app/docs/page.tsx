import { Metadata } from "next";
import { DocsPagination } from "@/components/DocsPagination";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
        <p className="text-slate-900 dark:text-white font-medium m-0 mb-4 text-lg leading-relaxed">
          When founders ask for feedback, they get polite nods from friends or superficial critiques from AI wrappers that simply say, &quot;Your website looks great! Maybe add a clearer CTA?&quot;
        </p>
        <p className="text-orange-500 font-black text-xl m-0 tracking-tight">
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

      <h2>Who is VERDICT for?</h2>
      <p>
        Designed to give brutally honest, actionable insights for those who build and scale.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
        {[
          { role: "Founders", desc: "Validate your messaging and ensure your core value prop lands instantly." },
          { role: "VCs & Investors", desc: "Quickly audit portfolio companies to identify obvious growth bottlenecks." },
          { role: "Growth Marketers", desc: "Find friction points in the funnel before throwing massive ad spend at it." },
          { role: "Product Managers", desc: "Ensure your product positioning aligns seamlessly with user expectations." },
          { role: "Agencies", desc: "Audit prospective clients in 60 seconds to pitch higher-ROI retainers." },
          { role: "Indie Hackers", desc: "Get unbiased feedback when you've been staring at your own code for too long." }
        ].map((item, idx) => (
          <Card key={idx} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="p-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 mt-0">{item.role}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm m-0 leading-relaxed">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2>VERDICT vs. VERDICT Pro</h2>
      <p>
        VERDICT burns through a lot of compute. Spinning up headless browsers (Firecrawl) and processing massive amounts of context means running this kind of deep analysis gets expensive fast.
      </p>
      <p>
        Instead of forcing users into expensive monthly SaaS subscriptions, we engineered a hybrid model:
      </p>
      <ul className="space-y-4 mb-12">
        <li><strong>VERDICT:</strong> A free, rate-limited (1 audit per 12 hours) interface designed to let founders experience the brutality of the engine firsthand.</li>
        <li><strong>VERDICT Pro (ASP on OKX.AI):</strong> Our uncapped, autonomous auditor lives natively on the OKX.AI ecosystem. Here, VCs and heavy users can run unlimited audits on a strict pay-per-execution basis using Web3 rails.</li>
      </ul>
      <DocsPagination next={{ title: "Architecture & Pipeline", href: "/docs/architecture" }} />
    </>
  );
}
