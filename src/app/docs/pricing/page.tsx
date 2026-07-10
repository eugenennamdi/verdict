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
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13.435 9.824v-1.12c3.264-.132 5.66-.814 5.66-1.624 0-.847-2.554-1.548-5.934-1.67V4h7.27v2.688H15.06v1.045c2.772.132 4.824.7 4.824 1.387 0 .732-2.31 1.336-5.378 1.462v9.21c0 .434-.308.784-.732.852l-2.424.37c-.368.056-.708-.222-.732-.593v-9.742c-3.068-.126-5.377-.73-5.377-1.462 0-.683 2.052-1.254 4.824-1.386V5.644h-5.37v-2.4h7.27v2.4c-3.38.125-5.934.726-5.934 1.673 0 .81 2.396 1.492 5.66 1.624v1.122c-3.282-.134-5.68-.84-5.68-1.68 0-.876 2.575-1.598 5.958-1.73v-.857h-1.964v5.28h5.65v1.18h-1.964v-.857c3.383.132 5.958.854 5.958 1.73 0 .84-2.398 1.546-5.68 1.68z" />
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
