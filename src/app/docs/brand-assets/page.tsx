import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand Assets | Verdict Docs",
  description: "Download official Verdict brand assets and logos.",
};

export default function BrandAssetsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
          Brand Assets
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Official logos and brand guidelines for Verdict. 
          Use these assets when linking to Verdict, building agent integrations, or writing about our architecture.
        </p>
      </div>
      <div>
        <a 
          href="/verdict-brand-assets.zip"
          download
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 !text-white font-bold py-2 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] active:scale-95 no-underline text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download .ZIP
        </a>
      </div>
    </div>
  );
}
