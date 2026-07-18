import Link from "next/link";
import { ArrowLeft, BookOpen, Cpu, Layers, CheckCircle2, Rocket, Bot, Palette } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: "Introduction", href: "/docs", icon: BookOpen },
    { name: "Architecture", href: "/docs/architecture", icon: Cpu },
    { name: "The 7-Pillar Framework", href: "/docs/framework", icon: Layers },
    { name: "Scoring & Enforcement", href: "/docs/scoring", icon: CheckCircle2 },
    { name: "Growth Readiness Score", href: "/docs/growth-readiness", icon: Rocket },
    { name: "Agent & Pricing (OKX.AI)", href: "/docs/pricing", icon: Bot },
    { name: "Brand Assets", href: "/docs/brand-assets", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col md:flex-row">
      {/* Mobile Top Navigation */}
      <div className="md:hidden flex flex-col sticky top-0 z-50 bg-white/80 dark:bg-[#0F1423]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 group">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-500 group-hover:scale-105 transition-transform">
              <path d="M4 5L12 19L20 5" stroke="currentColor" strokeWidth="4" strokeMiterlimit="10" strokeLinecap="butt" strokeLinejoin="miter"/>
            </svg>
            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">VERDICT</span>
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "sm", className: "h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" })}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to App
          </Link>
        </div>
        <nav className="flex overflow-x-auto px-4 pb-3 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/50 text-xs font-semibold text-slate-600 dark:text-slate-300 active:bg-orange-100 dark:active:bg-orange-900/30">
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 md:w-72 xl:w-80 shrink-0 border-r border-slate-200 dark:border-slate-800/50 bg-white dark:bg-[#0F1423] hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/50">
          <Link href="/" className="flex items-center gap-2 group">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-orange-500 group-hover:scale-105 transition-transform"
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
          <Link href="/" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 text-slate-900 dark:text-slate-200 font-medium transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-400" />
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
