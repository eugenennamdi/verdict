"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";

export function Footer() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="w-full py-6 px-6 mt-auto bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        <div className="flex items-center text-[13px] font-medium text-slate-500 dark:text-slate-400">
          <span>Built by</span>
          <img 
            src="https://eugenennamdi.com/favicon.png" 
            alt="Eugene Nnamdi" 
            className="w-5 h-5 rounded-full mx-2 shadow-sm object-cover"
            onError={(e) => {
               (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAxMGEyIDIgMCAxIDAgMC00IDIgMiAwIDAgMCAwIDR6Ii8+PHBhdGggZD0iTTcuNCAxOGE1IDUgMCAwIDEgOS4yIDB6Ii8+PC9zdmc+';
            }}
          />
          <a href="https://eugenennamdi.com" target="_blank" rel="noreferrer" className="text-slate-900 dark:text-white hover:underline decoration-slate-300 dark:decoration-slate-600 underline-offset-4 mr-1">
            Eugene Nnamdi
          </a>
        </div>

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
    </footer>
  );
}
