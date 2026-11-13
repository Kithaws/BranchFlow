import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Bot,
  Users,
  CheckSquare,
  FileText,
  MessageSquare,
  Settings,
  Sparkles,
  ExternalLink,
  GitBranch
} from 'lucide-react';

export default function Sidebar({ currentTab, onNavigate, onGoToLanding }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'agents', label: 'AI Workspace', icon: Bot, badge: 'Agentic' },
    { id: 'volunteers', label: 'Volunteers', icon: Users },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'communications', label: 'Communications', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <GitBranch className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              BranchFlow
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                AI
              </span>
            </span>
            <p className="text-[11px] text-slate-400">Student Org OS</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
          Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-sm shadow-brand-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Landing Page Button */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <button
          onClick={onGoToLanding}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Landing Page</span>
          </div>
          <span className="text-[10px] text-slate-500">Preview</span>
        </button>

        <div className="px-3 py-2 rounded-xl bg-slate-800/50 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            LangGraph Agent Core
          </span>
          <span className="font-mono text-[10px] text-slate-500">v1.0</span>
        </div>
      </div>
    </aside>
  );
}

