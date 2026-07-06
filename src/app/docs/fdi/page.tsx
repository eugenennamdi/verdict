import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Founder Delusion Index | Documentation",
};

export default function FDIPage() {
  return (
    <>
      <h1 className="text-5xl font-black tracking-tight mb-6">
        Founder Delusion Index
      </h1>
      
      <div className="mt-8 bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
        <h2 className="flex items-center gap-2 mt-0 mb-4">
          <AlertTriangle className="w-5 h-5 text-slate-500" />
          Coming Soon
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-0 leading-relaxed text-lg">
          We are currently developing the <strong>Founder Delusion Index (FDI)</strong>. This will be a secondary metric that measures the delta between <em>what the founder thinks the company is</em> and <em>what the market actually sees</em>. Stay tuned!
        </p>
      </div>

      <div className="flex justify-between mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
        <Link href="/docs/growth-readiness" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /> Previous: Growth Readiness Score
        </Link>
      </div>
    </>
  );
}
