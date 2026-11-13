import React from 'react';
import { Sparkles, Bot, ShieldCheck, Settings as SettingsIcon } from 'lucide-react';
import Badge from '../common/Badge';

export default function Navbar({ systemSettings, onNavigate, onOpenAiModal }) {
  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-800">
            IEEE Student Branch
          </span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            Zenith Institute of Technology
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* AI Status Badge */}
        {systemSettings?.gemini_active ? (
          <div
            onClick={() => onNavigate('settings')}
            className="cursor-pointer"
            title="Gemini API is active. Click to view settings."
          >
            <Badge variant="success" size="sm" className="hidden md:inline-flex">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gemini AI Connected</span>
            </Badge>
          </div>
        ) : (
          <div
            onClick={() => onNavigate('settings')}
            className="cursor-pointer"
            title="Click to add your free Google Gemini API key"
          >
            <Badge variant="warning" size="sm" className="hidden md:inline-flex hover:bg-amber-100">
              <Bot className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo AI Engine (Click to add key)</span>
            </Badge>
          </div>
        )}

        {/* Quick Launch Agent Button */}
        <button
          onClick={onOpenAiModal}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-semibold shadow-sm hover:shadow hover:from-brand-500 hover:to-indigo-500 transition-all duration-150 active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-200 animate-spin-slow" />
          <span>New AI Plan</span>
        </button>

        {/* User profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
            alt="Aarav Sharma"
            className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">Aarav Sharma</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Branch Chair</p>
          </div>
        </div>
      </div>
    </header>
  );
}
