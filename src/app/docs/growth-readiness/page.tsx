import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Rocket, AlertTriangle } from "lucide-react";

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
        The ultimate metric in the VERDICT platform is your Growth Readiness Score. It determines whether your startup is actually ready to scale, or if you're about to burn your marketing budget.
      </p>

      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 mb-12 flex gap-4 items-center">
        <Rocket className="w-6 h-6 text-orange-500 shrink-0" />
        <p className="text-orange-700 dark:text-orange-400 font-medium m-0 leading-relaxed">
          The Growth Readiness Score is a weighted aggregate of the other 6 pillars (Positioning, Messaging, UX, Conversion, Trust, and Defensibility). It evaluates how prepared the business is to convert cold traffic into revenue.
        </p>
      </div>

      <h2>Interpreting the Score</h2>
      <div className="space-y-6 mt-8 not-prose">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5 items-start">
          <div className="shrink-0">
            <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-lg tracking-tight shadow-sm shadow-red-500/10 flex items-center justify-center min-w-[5rem]">
              0-40
            </div>
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-2 leading-none">Not Ready for Scale</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-0">Do not spend money on paid acquisition. You have critical flaws in your messaging, extreme friction in your UX, or a completely undefined ICP. Fix the foundations.</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5 items-start">
          <div className="shrink-0">
            <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-black text-lg tracking-tight shadow-sm shadow-yellow-500/10 flex items-center justify-center min-w-[5rem]">
              41-75
            </div>
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-2 leading-none">Leaky Bucket</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-0">You can acquire users, but your conversion rates will be suboptimal. You likely lack strong social proof, or your copy is slightly too generic.</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row gap-5 items-start">
          <div className="shrink-0">
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-lg tracking-tight shadow-sm shadow-emerald-500/10 flex items-center justify-center min-w-[5rem]">
              76-100
            </div>
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0 mb-2 leading-none">Ready for Growth</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-0">Your value proposition is lethal, your friction is zero, and your conversion triggers are in place. Pour fuel on the fire.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link href="/docs/scoring" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Previous: Scoring & Enforcement
        </Link>
        <Link href="/docs/fdi" className="flex items-center gap-2 text-slate-900 dark:text-white font-bold hover:text-orange-500 dark:hover:text-orange-500 transition-colors">
          Next: Founder Delusion Index <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </>
  );
}
