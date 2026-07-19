"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor, Activity } from "lucide-react";
import { UsageStats } from "./usage-stats";

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
   
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <>
    <footer className="w-full py-8 sm:py-6 px-6 mt-auto bg-transparent transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4 relative w-full">
        
        {/* Left: Author */}
        <div className="order-3 sm:order-1 w-full sm:w-auto flex items-center justify-center sm:justify-start text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span>Built by</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://eugenennamdi.com/favicon.png" 
            alt="Eugene Nnamdi" 
            className="w-5 h-5 rounded-full mx-2 shadow-sm object-cover"
            onError={(e) => {
               (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAxMGEyIDIgMCAxIDAgMC00IDIgMiAwIDAgMCAwIDR6Ii8+PHBhdGggZD0iTTcuNCAxOGE1IDUgMCAwIDEgOS4yIDB6Ii8+PC9zdmc+';
            }}
          />
          <a href="https://eugenennamdi.com" target="_blank" rel="noreferrer" className="text-slate-900 dark:text-white hover:underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4">
            Eugene Nnamdi
          </a>
        </div>

        {/* Center: Social & Brand Links */}
        <div className="order-1 sm:order-2 w-full sm:w-auto flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
          <a href="/docs" className="text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors">
            Documentation
          </a>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-800"></div>

          <div className="flex items-center gap-1">
            <a 
            href="https://x.com/tryverdict" 
            target="_blank" 
            rel="noreferrer" 
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all" 
            title="Follow us on X"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </a>
          <a 
            href="https://github.com/eugenennamdi/verdict" 
            target="_blank" 
            rel="noreferrer" 
            className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all" 
            title="View on GitHub"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-4 h-4 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path></svg>
          </a>
        </div>
        </div>

        {/* Right: Theme Toggler & Stats */}
        <div className="order-2 sm:order-3 w-full sm:w-auto flex items-center justify-center sm:justify-end gap-6 sm:gap-8">
          <button 
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-2 p-1.5 px-3 rounded-2xl bg-slate-200/50 dark:bg-slate-800/30 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
            title="Real-time Platform Usage"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest text-[10px]">Live Stats</span>
          </button>

          {mounted ? (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-800/30">
              <button 
                onClick={() => setTheme('system')}
                className={`p-2 rounded-xl transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="System theme"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('light')}
                className={`p-2 rounded-xl transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="Light theme"
              >
                <Sun className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700/80 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                title="Dark theme"
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="h-[40px] w-[116px] bg-slate-200/50 dark:bg-slate-800/30 rounded-2xl animate-pulse" />
          )}
        </div>

      </div>
    </footer>
    <UsageStats isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </>
  );
}
