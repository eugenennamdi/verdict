import { Metadata } from "next";
import { DocsPagination } from "@/components/DocsPagination";

export const metadata: Metadata = {
  title: "Agentic Payments (x402) | Documentation",
};

export default function X402DocsPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Agentic Payments (x402)</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        VERDICT uses the <strong>OKX Payment SDK</strong> and the <strong>x402 protocol</strong> to enable seamless, machine-to-machine micropayments for our Pro Agent endpoint.
      </p>

      <h2>What is x402?</h2>
      <p>
        The <code>x402</code> standard is an evolution of the HTTP 402 "Payment Required" status code. It is designed to allow AI Agents, Smart Contracts, and autonomous systems to securely pay for API usage on-demand, without human intervention or monthly subscriptions.
      </p>
      
      <p>
        When an AI Agent requests a high-compute audit from the VERDICT MCP endpoint, here is exactly what happens under the hood:
      </p>

      <div className="space-y-6 my-10">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">1</span>
            The Challenge
          </h3>
          <p className="text-slate-600 dark:text-slate-400 m-0">
            The agent sends an unauthenticated request to VERDICT. Our server intercepts it using the OKX Payment SDK and immediately returns an <code>HTTP 402 Payment Required</code> challenge containing the required amount (0.5 USDT) and the destination wallet.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">2</span>
            The Transaction
          </h3>
          <p className="text-slate-600 dark:text-slate-400 m-0">
            The requesting agent parses the challenge and automatically executes the transaction on the <strong>X Layer</strong> blockchain using the user's Agentic Wallet.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-black text-sm">3</span>
            Verification & Delivery
          </h3>
          <p className="text-slate-600 dark:text-slate-400 m-0">
            The agent re-sends the request with a cryptographic proof of the transaction (an L402 token). The OKX SDK validates the transaction instantly. Once verified, VERDICT's internal engine executes the heavy LLM compute and delivers the comprehensive JSON audit directly back to the agent.
          </p>
        </div>
      </div>

      <h2>Why Agentic Commerce?</h2>
      <p>
        By leveraging the OKX Payment SDK, VERDICT completely bypasses the traditional SaaS model. There are no credit card forms, no API key management, and no monthly lock-ins. You simply authorize your Agentic Wallet, and pay exactly for the compute you consume on a per-audit basis.
      </p>

      <DocsPagination 
        prev={{ title: "Agent & Pricing (OKX.AI)", href: "/docs/pricing" }}
      />
    </>
  );
}
