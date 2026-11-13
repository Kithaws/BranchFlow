import React, { useState, useEffect } from 'react';
import { 
  Bot, Sparkles, Send, Play, ShieldAlert, CheckCircle2, 
  Calendar, Users, FileText, MessageSquare, Activity, 
  Clock, ArrowRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import AgentWorkflowGraph from '../components/agents/AgentWorkflowGraph';
import PlanApprovalModal from '../components/agents/PlanApprovalModal';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function AgentWorkspacePage({ onEventCreated }) {
  const [prompt, setPrompt] = useState(
    'Organize a two-day AI workshop for 100 students with 10 volunteers and a budget of ₹15,000.'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionState, setExecutionState] = useState('idle'); // idle, running, waiting_human_approval, persisted
  const [traces, setTraces] = useState([]);
  const [planResult, setPlanResult] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [activeTab, setActiveTab] = useState('runner'); // runner, agents_directory, live_audit
  
  // Progress audit state
  const [eventsList, setEventsList] = useState([]);
  const [selectedAuditAuditId, setSelectedAuditAuditId] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Fetch events for audit dropdown
  useEffect(() => {
    api.getEvents().then(res => {
      setEventsList(res);
      if (res.length > 0) setSelectedAuditAuditId(res[0].id);
    }).catch(console.error);
  }, []);

  const agents = [
    {
      name: 'Event Planning Agent',
      role: 'Requirement Extraction & Schedule Generation',
      icon: Calendar,
      color: 'text-brand-600 bg-brand-50 border-brand-200',
      description: 'Extracts event parameters from natural language, formats multi-day schedules, structures organizing teams, and establishes task checklists.'
    },
    {
      name: 'Volunteer Management Agent',
      role: 'Skill-Matching & Workload Balancer',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      description: 'Matches tasks with volunteer competencies, detects burnout imbalance, and submits recommendations without auto-assigning.'
    },
    {
      name: 'Documentation Agent',
      role: 'Proposals, Permissions & Sponsorship Decks',
      icon: FileText,
      color: 'text-violet-600 bg-violet-50 border-violet-200',
      description: 'Generates institutional permission letters, executive event proposals, itemized budget drafts, and post-event IEEE summaries in Markdown.'
    },
    {
      name: 'Communication Agent',
      role: 'Multi-Tone Channel Copywriter',
      icon: MessageSquare,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      description: 'Drafts announcements, reminders, and captions formatted specifically for WhatsApp, Instagram, Email, and Discord across 3 distinct tones.'
    },
    {
      name: 'Progress Monitoring Agent',
      role: 'Real-Time Database Milestone Auditor',
      icon: Activity,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      description: 'Continuously audits task tables in SQLite, flags overdue milestones, identifies volunteer schedule clashes, and prescribes corrective actions.'
    }
  ];

  const presets = [
    'Organize a two-day AI workshop for 100 students with 10 volunteers and a budget of ₹15,000.',
    'Plan a 36-hour national hackathon for 250 participants with 20 volunteers and ₹85,000 budget.',
    'Organize an autonomous robotics symposium with 300 students and ₹40,000 budget.'
  ];

  const handleRunWorkflow = async () => {
    if (!prompt.trim()) return;
    try {
      setIsExecuting(true);
      setExecutionState('running');
      setTraces([
        {
          step: 0,
          agent: 'LangGraph Orchestrator',
          action: 'initiate_workflow',
          status: 'running',
          summary: `Initiating multi-agent state graph for: "${prompt.slice(0, 60)}..."`,
          timestamp: new Date().toISOString()
        }
      ]);

      const res = await api.planEventWithAgent(prompt, false);
      setPlanResult(res);
      setTraces(res.agent_traces || []);
      setExecutionState('waiting_human_approval');
      setShowApprovalModal(true);
    } catch (err) {
      console.error(err);
      alert('Error running agent workflow: ' + err.message);
      setExecutionState('idle');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleApprovePlan = async (approvalData) => {
    try {
      setIsApproving(true);
      const res = await api.approvePlan(approvalData);
      setShowApprovalModal(false);
      setExecutionState('persisted');
      
      setTraces(prev => [
        ...prev,
        {
          step: 5,
          agent: 'LangGraph Orchestrator',
          action: 'atomic_persistence',
          status: 'completed',
          summary: `Human approval received. Persisted event #${res.event_id} and generated tasks to SQLite. Webhook dispatched.`,
          timestamp: new Date().toISOString()
        }
      ]);

      if (onEventCreated) onEventCreated();
      alert(`Success! Event #${res.event_id} has been approved and saved to the database.`);
    } catch (err) {
      console.error(err);
      alert('Approval failed: ' + err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleRunAudit = async () => {
    try {
      setIsAuditing(true);
      const res = await api.getProgressAudit(selectedAuditAuditId || null);
      setAuditResult(res);
    } catch (err) {
      console.error(err);
      alert('Audit failed: ' + err.message);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Agentic AI Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">LangGraph Multi-Agent Architecture</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            AI Agent Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinate specialized agents with structured tool-calling, database queries, and human-in-the-loop validation.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('runner')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'runner' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Workflow Runner
          </button>
          <button
            onClick={() => setActiveTab('agents_directory')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'agents_directory' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agent Directory (5)
          </button>
          <button
            onClick={() => setActiveTab('live_audit')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'live_audit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Progress Auditor
          </button>
        </div>
      </div>

      {activeTab === 'runner' && (
        <div className="space-y-6">
          {/* Natural Language Prompt Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Describe Event in Natural Language
              </label>
              <span className="text-[11px] text-slate-400">
                Gemini 1.5 Flash + LangGraph StateGraph
              </span>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Organize a two-day AI workshop for 100 students with 10 volunteers and a budget of ₹15,000..."
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all font-sans placeholder:text-slate-400"
              />
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400">Sample Prompts:</span>
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(preset)}
                  className="text-[11px] px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand-700 hover:bg-brand-50/50 hover:border-brand-200 transition-all truncate max-w-xs"
                  title={preset}
                >
                  {preset.slice(0, 45)}...
                </button>
              ))}
            </div>

            {/* Run Button */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Requires human approval before persisting.</span>
              </div>

              <button
                onClick={handleRunWorkflow}
                disabled={isExecuting || !prompt.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-md hover:from-brand-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing LangGraph Agents...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Execute Multi-Agent Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Execution Visualizer */}
          <AgentWorkflowGraph currentStep={executionState} traces={traces} />

          {/* Pending Approval Alert Bar if paused */}
          {executionState === 'waiting_human_approval' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    Execution Paused at Human Approval Gate
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Plan, schedules, and volunteer suggestions generated. Ready for organizer review.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowApprovalModal(true)}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm"
              >
                Open Review Modal
              </button>
            </div>
          )}
        </div>
      )}

      {/* Agents Directory */}
      {activeTab === 'agents_directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${agent.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="primary" size="xs">
                      Agent Node 0{i + 1}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{agent.name}</h3>
                  <p className="text-xs font-semibold text-brand-600 mt-0.5">{agent.role}</p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{agent.description}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Input: JSON / DB</span>
                  <span>LangGraph Native</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Live Progress Auditor Tab */}
      {activeTab === 'live_audit' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                Run AI Progress Monitoring Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Analyzes live task tables in SQLite, detects overdue items and volunteer scheduling clashes.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedAuditAuditId}
                onChange={(e) => setSelectedAuditAuditId(e.target.value)}
                className="text-xs font-medium rounded-xl border border-slate-200 p-2 bg-white text-slate-800 focus:outline-none"
              >
                <option value="">Audit All Events (Branch-Wide)</option>
                {eventsList.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>

              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>Audit Now</span>
              </button>
            </div>
          </div>

          {auditResult && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Tasks Audited</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{auditResult.total_tasks}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                  <p className="text-[11px] font-semibold text-emerald-700 uppercase">Completed</p>
                  <p className="text-xl font-bold text-emerald-800 mt-1">{auditResult.completed_tasks}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200">
                  <p className="text-[11px] font-semibold text-amber-700 uppercase">Pending</p>
                  <p className="text-xl font-bold text-amber-800 mt-1">{auditResult.pending_tasks}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200">
                  <p className="text-[11px] font-semibold text-rose-700 uppercase">Overdue Items</p>
                  <p className="text-xl font-bold text-rose-800 mt-1">{auditResult.overdue_tasks_count}</p>
                </div>
              </div>

              {/* Insights & Recommended Next Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Agent Insights & Warnings
                  </h4>
                  <div className="space-y-2">
                    {auditResult.insights?.map((ins, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        {ins}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Recommended Organizer Next Steps
                  </h4>
                  <div className="space-y-2">
                    {auditResult.recommended_actions?.map((act, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-brand-50/50 border border-brand-200 text-xs text-brand-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Human Approval Modal */}
      {showApprovalModal && planResult && (
        <PlanApprovalModal
          planData={planResult.plan}
          tasks={planResult.tasks}
          volunteerRecs={planResult.volunteer_recommendations}
          onApprove={handleApprovePlan}
          onCancel={() => setShowApprovalModal(false)}
          isApproving={isApproving}
        />
      )}
    </div>
  );
}

