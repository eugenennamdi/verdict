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

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const Icon = mounted 
    ? (theme === 'light' ? Sun : (theme === 'dark' ? Moon : Monitor))
    : Monitor;
    
  const label = mounted
    ? (theme === 'light' ? 'Light' : (theme === 'dark' ? 'Dark' : 'System'))
    : 'System';

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

        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 text-[13px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors group relative"
          title={`Current: ${label} (click to cycle)`}
        >
          <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {label}
        </button>

      </div>
    </footer>
  );
}
