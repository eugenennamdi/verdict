import { Metadata } from "next";
import { DocsPagination } from "@/components/DocsPagination";
import { Rocket } from "lucide-react";

export const metadata: Metadata = {
  title: "Growth Readiness Score | Documentation",
};

export default function GrowthReadinessPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6 flex items-center gap-4">
        Growth Readiness Score
      </h1>
      
      <p className="text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed">
        The ultimate metric in the Verdict platform is your Growth Readiness Score. It determines whether your startup is actually ready to scale, or if you&apos;re about to burn your marketing budget.
      </p>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 mb-12 flex gap-4 items-center">
        <Rocket className="w-6 h-6 text-orange-500 shrink-0" />
        <p className="text-orange-700 dark:text-orange-400 font-medium m-0 leading-relaxed">
          The Growth Readiness Score is a weighted aggregate of the other 6 pillars (Positioning, Messaging, UX, Conversion, Trust, and Defensibility). It evaluates how prepared the business is to convert cold traffic into revenue.
        </p>
      </div>

      <h2>Interpreting the Score</h2>
      <div className="mt-8 not-prose overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <th className="py-4 px-6 font-black text-sm uppercase tracking-wider text-slate-500 w-28">Score</th>
              <th className="py-4 px-6 font-black text-sm uppercase tracking-wider text-slate-500 w-48">Status</th>
              <th className="py-4 px-6 font-black text-sm uppercase tracking-wider text-slate-500">Interpretation</th>
            </tr>
          </thead>
          <tbody className="text-sm md:text-base">
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-5 px-6 align-top">
                <div className="inline-flex px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black tracking-tight shadow-sm shadow-red-500/10 items-center justify-center min-w-[4.5rem] whitespace-nowrap">
                  0-40
                </div>
              </td>
              <td className="py-5 px-6 align-top font-bold text-slate-900 dark:text-white">Not Ready for Scale</td>
              <td className="py-5 px-6 align-top text-slate-500 dark:text-slate-400 leading-relaxed">
                Do not spend money on paid acquisition. You have critical flaws in your messaging, extreme friction in your UX, or a completely undefined ICP. Fix the foundations.
              </td>
            </tr>
            <tr className="border-b border-slate-100 dark:border-slate-800/50">
              <td className="py-5 px-6 align-top">
                <div className="inline-flex px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black tracking-tight shadow-sm shadow-yellow-500/10 items-center justify-center min-w-[4.5rem] whitespace-nowrap">
                  41-75
                </div>
              </td>
              <td className="py-5 px-6 align-top font-bold text-slate-900 dark:text-white">Leaky Bucket</td>
              <td className="py-5 px-6 align-top text-slate-500 dark:text-slate-400 leading-relaxed">
                You can acquire users, but your conversion rates will be suboptimal. You likely lack strong social proof, or your copy is slightly too generic.
              </td>
            </tr>
            <tr>
              <td className="py-5 px-6 align-top">
                <div className="inline-flex px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black tracking-tight shadow-sm shadow-emerald-500/10 items-center justify-center min-w-[4.5rem] whitespace-nowrap">
                  76-100
                </div>
              </td>
              <td className="py-5 px-6 align-top font-bold text-slate-900 dark:text-white">Ready for Growth</td>
              <td className="py-5 px-6 align-top text-slate-500 dark:text-slate-400 leading-relaxed">
                Your value proposition is lethal, your friction is zero, and your conversion triggers are in place. Pour fuel on the fire.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocsPagination 
        prev={{ title: "Scoring & Enforcement", href: "/docs/scoring" }}
        next={{ title: "Agent & Pricing (OKX.AI)", href: "/docs/pricing" }} 
      />
    </>
  );
}
