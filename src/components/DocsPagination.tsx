import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface DocsPaginationProps {
  prev?: {
    title: string;
    href: string;
  };
  next?: {
    title: string;
    href: string;
  };
}

export function DocsPagination({ prev, next }: DocsPaginationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800/50">
      {prev ? (
        <Link 
          href={prev.href} 
          className="flex flex-col items-start p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left no-underline"
        >
          <span className="text-slate-900 dark:text-slate-200 font-medium mb-1">{prev.title}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 group-hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </span>
        </Link>
      ) : (
        <div></div>
      )}

      {next ? (
        <Link 
          href={next.href} 
          className="flex flex-col items-end p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-right no-underline"
        >
          <span className="text-slate-900 dark:text-slate-200 font-medium mb-1">{next.title}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 group-hover:text-orange-500 transition-colors">
            Next <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      ) : (
        <div></div>
      )}
    </div>
  );
}
