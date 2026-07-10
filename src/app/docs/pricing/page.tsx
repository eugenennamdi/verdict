import { Metadata } from "next";
import Link from "next/link";
import { DocsPagination } from "@/components/DocsPagination";
import { Check, Bot, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Agent & Pricing (OKX.AI) | Documentation",
};

export default function PricingPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Agent & Pricing</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        VERDICT operates on a hybrid model to balance accessibility with the realities of heavy AI compute costs.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        {/* The Web Playground */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-8 bg-white dark:bg-[#0F1423] shadow-sm relative overflow-hidden flex flex-col h-full">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 shrink-0">
            <Globe className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </div>
          <h2 className="text-2xl font-black mb-2 mt-0 shrink-0">Web Playground</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 shrink-0">For normal users & casual exploration.</p>
          <div className="mb-8 shrink-0">
            <span className="text-4xl font-black">Free</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">1 full audit per 12 hours (IP limited)</span>
            </li>
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">Full 7-Pillar framework</span>
            </li>
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300">Headless browser extraction</span>
            </li>
          </ul>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mt-auto">Current Interface</div>
        </div>

        {/* The OKX Agent */}
        <div className="border-2 border-orange-500 rounded-3xl p-8 bg-orange-500/5 shadow-[0_0_40px_rgba(249,115,22,0.1)] relative overflow-hidden flex flex-col h-full">
          <div className="absolute inset-0 bg-mesh opacity-10 pointer-events-none" />
          <div className="absolute top-0 right-8 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-b-lg tracking-widest uppercase shrink-0">
            RECOMMENDED
          </div>
          <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-orange-500/20 shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2 mt-0 relative z-10 shrink-0">VERDICT Pro</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 relative z-10 shrink-0">For Founders, CMOs, Growth Marketers, VCs & high-volume use.</p>
          <div className="mb-8 relative z-10 shrink-0">
            <span className="text-4xl font-black text-orange-500 tracking-tight">Pay-per-use</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1 relative z-10">
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">Unlimited audits</span>
            </li>
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">No monthly SaaS subscription lock-in</span>
            </li>
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">Run autonomously via OKX Agent rails</span>
            </li>
            <li className="flex gap-3">
              <Check className="w-5 h-5 text-orange-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-200 font-medium">Bulk processing capabilities (Coming soon)</span>
            </li>
          </ul>
          <a 
            href="https://www.okx.ai/agents"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 !text-white font-bold rounded-xl text-center transition-all hover:scale-[1.02] relative z-10 shadow-lg shadow-orange-500/20"
          >
            Continue to OKX.AI
          </a>
        </div>
      </div>

      <h2>Why this model?</h2>
      <p>
        The AI industry is filled with companies charging $99/mo for simple prompt wrappers. VERDICT is fundamentally different. Our pipeline relies on computationally expensive operations:
      </p>
      <ul>
        <li>Spinning up cloud-based headless browsers (Firecrawl) to bypass bot protection and render heavy React/Vue applications.</li>
        <li>Aggregating the entire DOM into a massive markdown context window.</li>
        <li>Executing rigorous, multi-stage reasoning and parsing using our proprietary engine powered by <strong>GLM-5.2</strong>.</li>
      </ul>
      <p>
        We refused to gate this behind a flat monthly fee that penalizes infrequent users. By deploying our core engine as an Autonomous Agent on the OKX.AI network, we allow power users to pay exactly for what they compute, while keeping a free playground available for early-stage founders.
      </p>

      <DocsPagination 
        prev={{ title: "Founder Delusion Index", href: "/docs/fdi" }}
      />
    </>
  );
}
