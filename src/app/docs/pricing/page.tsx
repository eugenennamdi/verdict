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

      <div className="overflow-x-auto mb-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0F1423] shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <th className="py-4 px-6 font-black text-sm uppercase tracking-wider text-slate-500">Feature</th>
              <th className="py-4 px-6 font-black text-lg">VERDICT</th>
              <th className="py-4 px-6 font-black text-lg text-orange-500">VERDICT Pro (ASP)</th>
            </tr>
          </thead>
          <tbody className="text-sm md:text-base">
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-4 px-6 font-medium">Target Audience</td>
              <td className="py-4 px-6 text-slate-500">Normal users & casual exploration</td>
              <td className="py-4 px-6 text-slate-500">Founders, CMOs, Growth Marketers, VCs</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-4 px-6 font-medium">Pricing Model</td>
              <td className="py-4 px-6 font-bold">Free</td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#26A17B] flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 339.43 295.27" className="w-3 h-3 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M191.19,144.8v0c-1.2.09-7.4,0.46-21.23,0.46-11,0-18.81-.33-21.55-0.46v0c-42.51-1.87-74.24-9.27-74.24-18.13s31.73-16.25,74.24-18.15v28.91c2.78,0.2,10.74.67,21.74,0.67,13.2,0,19.81-.55,21-0.66v-28.9c42.42,1.89,74.08,9.29,74.08,18.13s-31.65,16.24-74.08,18.12h0Zm0-39.25V79.68h59.2V40.23H89.21V79.68H148.4v25.86c-48.11,2.21-84.29,11.74-84.29,23.16s36.18,20.94,84.29,23.16v82.9h42.78V151.83c48-2.21,84.12-11.73,84.12-23.14s-36.09-20.93-84.12-23.15h0Zm0,0h0Z" fill="white" fillRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-bold text-slate-900 dark:text-white slashed-zero tabular-nums font-mono">0.5</span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">USDT</span>
                  </div>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">/ audit</span>
                </div>
              </td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-4 px-6 font-medium">Usage Limits</td>
              <td className="py-4 px-6 text-slate-500">1 full audit per 12 hours (IP limited)</td>
              <td className="py-4 px-6 text-slate-500">Unlimited audits</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-4 px-6 font-medium">Monthly SaaS Lock-in</td>
              <td className="py-4 px-6 text-slate-500">None</td>
              <td className="py-4 px-6 text-slate-500">None</td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-4 px-6 font-medium">Platform</td>
              <td className="py-4 px-6 text-slate-500">Current Interface</td>
              <td className="py-4 px-6 text-slate-500">
                <a href="https://www.okx.ai/agents" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-medium">
                  Run via OKX Agent rails
                </a>
              </td>
            </tr>
            <tr>
              <td className="py-4 px-6 font-medium">Bulk Processing</td>
              <td className="py-4 px-6 text-slate-500">No</td>
              <td className="py-4 px-6 text-slate-500">Coming soon</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Why this model?</h2>
      <p>
        The AI industry is filled with companies charging $99/mo for simple prompt wrappers. VERDICT is fundamentally different. Our pipeline relies on computationally expensive operations:
      </p>
      <ul>
        <li>Spinning up cloud-based headless browsers (Firecrawl) to bypass bot protection and render heavy React/Vue applications.</li>
        <li>Aggregating the entire DOM into a massive markdown context window.</li>
        <li>Executing rigorous, multi-stage reasoning and parsing using our proprietary engine powered by <strong><a href="https://huggingface.co/zai-org/GLM-5.2" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">GLM-5.2</a></strong>.</li>
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
