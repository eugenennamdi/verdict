import Link from "next/link";
import { ArrowLeft, BookOpen, Cpu, Target, CheckCircle2, TrendingDown, Rocket } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Introduction", href: "/docs", icon: BookOpen },
    { name: "Architecture", href: "/docs/architecture", icon: Cpu },
    { name: "The 7-Pillar Framework", href: "/docs/framework", icon: Target },
    { name: "Scoring & Enforcement", href: "/docs/scoring", icon: CheckCircle2 },
    { name: "Growth Readiness Score", href: "/docs/growth-readiness", icon: Rocket },
    { name: "Founder Delusion Index", href: "/docs/fdi", icon: TrendingDown },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 md:w-72 xl:w-80 shrink-0 border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0F1423] hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/50">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white flex items-center justify-center">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4"
              >
                <path 
                  d="M4 5L12 19L20 5" 
                  stroke="currentColor" 
                  strokeWidth="4" 
                  strokeMiterlimit="10"
                  strokeLinecap="butt" 
                  strokeLinejoin="miter" 
                />
              </svg>
            </div>
            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">VERDICT</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 px-2">Documentation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all group">
                <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-orange-500 transition-colors" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
          <Link href="/" className={buttonVariants({ variant: "outline", className: "w-full justify-start gap-2 h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" })}>
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 flex justify-center">
        <div className="max-w-4xl w-full px-8 py-12 md:px-16 lg:px-24">
          <div className="prose prose-slate dark:prose-invert prose-orange max-w-none prose-headings:font-black prose-h1:tracking-tight prose-h1:text-4xl prose-h2:tracking-tight prose-a:text-orange-500 hover:prose-a:text-orange-600 prose-img:rounded-xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
