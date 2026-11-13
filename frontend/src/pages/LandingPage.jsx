import React from 'react';
import { 
  GitBranch, Sparkles, ArrowRight, Bot, Users, 
  FileText, MessageSquare, Activity, ShieldCheck, 
  CheckCircle, Zap, Terminal, Layers
} from 'lucide-react';

export default function LandingPage({ onEnterApp }) {
  const features = [
    {
      icon: CalendarIcon,
      title: 'AI Event Planner Agent',
      desc: 'Transforms single-sentence natural language requirements into complete schedules, team rosters, and task checklists.',
      badge: 'LangGraph'
    },
    {
      icon: Users,
      title: 'Volunteer Workload Balancer',
      desc: 'Matches tasks based on volunteer skills, detects burnout risks, and guards against overloading core leads.',
      badge: 'Human-in-Loop'
    },
    {
      icon: FileText,
      title: 'AI Documentation Agent',
      desc: 'Instantly drafts official event proposals, Dean permission letters, sponsorship pitch decks, and post-event reports.',
      badge: 'Markdown & PDF'
    },
    {
      icon: MessageSquare,
      title: 'Multi-Tone Communications',
      desc: 'Broadcasts channel-optimized messages for WhatsApp, Instagram, Email, and Discord in professional, friendly, or casual tones.',
      badge: 'Multi-Channel'
    },
    {
      icon: Activity,
      title: 'Progress Monitoring Agent',
      desc: 'Audits real database task statuses, highlights overdue deadlines, resolves schedule clashes, and prescribes next actions.',
      badge: 'Real-time Audit'
    },
    {
      icon: ShieldCheck,
      title: 'Agentic Safety & Control',
      desc: 'Agents never silently commit changes. Organizers inspect, modify, and authorize state changes with human approval gates.',
      badge: 'Controlled AI'
    }
  ];

  function CalendarIcon(props) {
    return <Layers {...props} />;
  }

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Banner & Header */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <GitBranch className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              BranchFlow
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Agentic AI
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-500 transition-all duration-150 active:scale-95"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-brand-300 mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>The Next-Generation Agentic Platform for College Student Organizations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Organize College Events in Seconds with{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">
            Autonomous AI Agents
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          BranchFlow eliminates the chaotic spreadsheet grind for college clubs, IEEE branches, and hackathon teams. Describe your event in plain English, and our LangGraph multi-agent system builds schedules, matches volunteers, drafts proposals, and tracks milestones — with full human organizer approval.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnterApp}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 text-white text-sm font-bold shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-95 transition-all duration-150"
          >
            <span>Open BranchFlow Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/80 text-sm font-semibold transition-colors"
          >
            <Terminal className="w-4 h-4" />
            <span>View Architecture & Code</span>
          </a>
        </div>

        {/* Live Prompt Simulation Card */}
        <div className="mt-16 bg-gradient-to-b from-slate-900 to-navy-900 rounded-3xl border border-slate-800 p-6 sm:p-8 text-left shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-400">Agentic Workflow: Natural Language to Database</span>
            </div>
            <span className="font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
              LangGraph State Machine
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-brand-300">
              <span className="text-slate-500">// User prompt input:</span>
              <p className="text-white mt-1">
                "Organize a two-day AI workshop for 100 students with 10 volunteers and a budget of ₹15,000."
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-brand-400 font-semibold">1. Event Planning Agent</span>
                <p className="text-slate-400 text-[11px] mt-1">Extracted: 2 Days, 100 Pax, ₹15k, 4 Teams, 7 Milestone Tasks</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-indigo-400 font-semibold">2. Volunteer Agent</span>
                <p className="text-slate-400 text-[11px] mt-1">Skills matched: Rohan (Tech), Sneha (Logistics), Ananya (Outreach)</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-violet-400 font-semibold">3. Documentation Agent</span>
                <p className="text-slate-400 text-[11px] mt-1">Generated: Official Dean Proposal & Lab 4 Permission Request</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-amber-500/30 bg-amber-500/5">
                <span className="text-amber-400 font-semibold">4. Human Approval Gate</span>
                <p className="text-amber-200/80 text-[11px] mt-1">Awaiting organizer review before database write</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Engineered Specifically for Student Communities
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Not a generic chatbot. A cohesive multi-agent system built on LangGraph, Google Gemini, and SQLite.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/40 hover:bg-slate-900 transition-all duration-200 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2025 BranchFlow. Powered by Google Gemini & LangGraph.</p>
        <button
          onClick={onEnterApp}
          className="text-brand-400 hover:text-brand-300 font-semibold"
        >
          Enter Management App →
        </button>
      </footer>
    </div>
  );
}

