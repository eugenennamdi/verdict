import { Metadata } from "next";
import Link from "next/link";
import { DocsPagination } from "@/components/DocsPagination";
import { Check, Bot, Globe } from "lucide-react";
import { CopyBlock } from "@/components/copy-block";

export const metadata: Metadata = {
  title: "Agent & Pricing (OKX.AI) | Documentation",
};

export default function PricingPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">Agent & Pricing</h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        Verdict operates on a hybrid model to balance accessibility with the realities of heavy AI compute costs.
      </p>

      <div className="overflow-x-auto mb-16 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#0F1423] shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <th className="py-4 px-6 font-black text-sm uppercase tracking-wider text-slate-500">Feature</th>
              <th className="py-4 px-6 font-black text-lg">Verdict</th>
              <th className="py-4 px-6 font-black text-lg text-orange-500">Verdict Pro (ASP)</th>
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
                <a href="https://www.okx.ai/agents/4686" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline font-medium">
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
        The AI industry is filled with companies charging $99/mo for simple prompt wrappers. Verdict is fundamentally different. Our pipeline relies on computationally expensive operations:
      </p>
      <ul>
        <li>Spinning up cloud-based headless browsers (Firecrawl) to bypass bot protection and render heavy React/Vue applications.</li>
        <li>Aggregating the entire DOM into a massive markdown context window.</li>
        <li>Executing rigorous, multi-stage reasoning and parsing using our proprietary engine powered by <strong><a href="https://huggingface.co/zai-org/GLM-5.2" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">GLM-5.2</a></strong>.</li>
      </ul>
      <p>
        We refused to gate this behind a flat monthly fee that penalizes infrequent users. By deploying our core engine as an Autonomous Agent on the OKX.AI network, we allow power users to pay exactly for what they compute, while keeping a free playground available for early-stage founders.
      </p>

      <h2>Agentic Payments (x402)</h2>
      <p>
        Verdict uses the <strong>OKX Payment SDK</strong> and the <a href="https://web3.okx.com/onchainos/dev-docs/payments/overview" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">x402 protocol</a> to enable seamless, machine-to-machine micropayments. Built on <a href="https://web3.okx.com/onchainos/dev-docs/xlayer/developer/build-on-xlayer/about-xlayer" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">X Layer</a>, this completely bypasses traditional SaaS subscriptions.
      </p>
      <p>
        When an AI Agent requests an audit, our server intercepts it and returns an <code>HTTP 402 Payment Required</code> challenge. The agent automatically executes the 0.5 USDT transaction on-chain, and re-sends the request with cryptographic proof. Once the SDK validates the transaction, our engine executes the heavy LLM compute and delivers the comprehensive JSON audit directly back to the agent—zero human intervention required.
      </p>

      <h3>Connecting Your Agent</h3>
      <p>
        To allow your AI agent (Claude, Hermes, OpenClaw) to securely pay for Verdict audits, you must equip it with the Onchain OS skill and an Agentic Wallet.
      </p>
      
      <div className="space-y-4 my-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. Install Onchain OS skill</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Paste the following prompt into your agent to install the required capabilities:</p>
          <CopyBlock text="Run npx skills add okx/onchainos-skills to install Onchain OS skills">
            <code className="whitespace-pre">Run npx skills add okx/onchainos-skills to install Onchain OS skills</code>
          </CopyBlock>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. Login</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Create your TEE-secured Agentic Wallet by running the following prompt:</p>
          <CopyBlock text="onchainos wallet login">
            <code className="whitespace-pre">onchainos wallet login</code>
          </CopyBlock>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. Connect to Verdict</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Fund your agentic wallet with USDT on X Layer, paste this connection block to expose the Verdict MCP tool to your agent:</p>
          <CopyBlock text={`I'd like to use the service provided by Verdict:

Service title: Verdict MCP Evaluation Server
Service type: A2MCP
Endpoint: https://tryverdict.xyz/api/evaluate-mcp

Please use OKX Agent Payments Protocol to send a request to this endpoint.`}>
            <code className="whitespace-pre">{`I'd like to use the service provided by Verdict:

Service title: Verdict MCP Evaluation Server
Service type: A2MCP
Endpoint: https://tryverdict.xyz/api/evaluate-mcp

Please use OKX Agent Payments Protocol to send a request to this endpoint.`}</code>
          </CopyBlock>
        </div>
      </div>

      <DocsPagination 
        prev={{ title: "Growth Readiness Score", href: "/docs/growth-readiness" }}
      />
    </>
  );
}
