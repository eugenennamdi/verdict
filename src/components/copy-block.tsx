"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBlock({ text, children }: { text: string; children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group mt-3 mb-4">
      <div className="p-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm overflow-x-auto text-slate-800 dark:text-slate-300 pr-12">
        {children}
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 shadow-sm"
        title="Copy to clipboard"
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
