import React from 'react';
import { 
  Bot, Calendar, Users, FileText, CheckCircle2, 
  ArrowRight, ShieldAlert, Sparkles, Clock, Check
} from 'lucide-react';

export default function AgentWorkflowGraph({ currentStep = 'idle', traces = [] }) {
  const nodes = [
    {
      id: 'intake',
      stepNum: 0,
      title: 'Prompt Intake',
      role: 'User Requirement',
      icon: Sparkles,
      color: 'bg-slate-100 text-slate-700 border-slate-300'
    },
    {
      id: 'plan_generated',
      stepNum: 1,
      title: 'Event Planning Agent',
      role: 'Requirement Extraction & Schedule',
      icon: Calendar,
      color: 'bg-brand-50 text-brand-700 border-brand-300'
    },
    {
      id: 'volunteers_recommended',
      stepNum: 2,
      title: 'Volunteer Agent',
      role: 'Skill Match & Workload Guard',
      icon: Users,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-300'
    },
    {
      id: 'documents_drafted',
      stepNum: 3,
      title: 'Documentation Agent',
      role: 'Proposal & Permission Drafting',
      icon: FileText,
      color: 'bg-violet-50 text-violet-700 border-violet-300'
    },
    {
      id: 'waiting_human_approval',
      stepNum: 4,
      title: 'Human-in-the-Loop',
      role: 'Organizer Review & Approval',
      icon: ShieldAlert,
      color: 'bg-amber-50 text-amber-700 border-amber-300'
    },
    {
      id: 'persisted',
      stepNum: 5,
      title: 'Database & n8n',
      role: 'Atomic Persistence & Triggers',
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300'
    }
  ];

  const getStepStatus = (index) => {
    if (currentStep === 'persisted') return 'completed';
    if (currentStep === 'waiting_human_approval' && index <= 4) {
      return index === 4 ? 'active' : 'completed';
    }
    if (currentStep === 'documents_drafted' && index <= 3) {
      return index === 3 ? 'active' : 'completed';
    }
    if (currentStep === 'volunteers_recommended' && index <= 2) {
      return index === 2 ? 'active' : 'completed';
    }
    if (currentStep === 'plan_generated' && index <= 1) {
      return index === 1 ? 'active' : 'completed';
    }
    return index === 0 && currentStep !== 'idle' ? 'completed' : 'pending';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-brand-600" />
            LangGraph Agent State Machine
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time execution graph with non-blocking human-in-the-loop checkpoint.
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
          State: {currentStep}
        </span>
      </div>

      {/* Node flow diagram */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 relative">
        {nodes.map((node, idx) => {
          const status = getStepStatus(idx);
          const Icon = node.icon;
          
          let cardBorder = 'border-slate-200 bg-slate-50/50 opacity-70';
          let iconBg = 'bg-slate-200 text-slate-500';
          
          if (status === 'completed') {
            cardBorder = 'border-emerald-300 bg-emerald-50/30';
            iconBg = 'bg-emerald-100 text-emerald-700';
          } else if (status === 'active') {
            cardBorder = 'border-brand-500 bg-brand-50/40 shadow-sm ring-2 ring-brand-400/20';
            iconBg = 'bg-brand-600 text-white animate-pulse';
          }

          return (
            <div key={node.id} className="flex items-center">
              <div className={`w-full rounded-xl border p-3 flex flex-col justify-between transition-all duration-200 ${cardBorder}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconBg}`}>
                    {status === 'completed' ? <Check className="w-4 h-4 text-emerald-600" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    0{idx}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate" title={node.title}>
                    {node.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5" title={node.role}>
                    {node.role}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Traces Feed if present */}
      {traces.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-2">Live Agent Traces:</p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {traces.map((trace, i) => (
              <div key={i} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                    Step {trace.step || i + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-slate-800">{trace.agent}: </span>
                    <span className="text-slate-600">{trace.summary}</span>
                  </div>
                </div>
                {trace.duration_ms && (
                  <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trace.duration_ms}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
