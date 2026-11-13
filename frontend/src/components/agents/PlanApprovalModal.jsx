import React, { useState } from 'react';
import { 
  CheckCircle2, X, AlertTriangle, ShieldCheck, 
  Calendar, Users, IndianRupee, MapPin, Clock, Edit2
} from 'lucide-react';
import Badge from '../common/Badge';

export default function PlanApprovalModal({ planData, tasks, volunteerRecs, onApprove, onCancel, isApproving }) {
  if (!planData) return null;

  const [editableTasks, setEditableTasks] = useState(tasks || []);
  const [editablePlan, setEditablePlan] = useState(planData);
  const [activeTab, setActiveTab] = useState('overview'); // overview, tasks, schedule

  const handleTaskVolunteerChange = (taskIndex, volId, volName) => {
    const updated = [...editableTasks];
    updated[taskIndex].assigned_volunteer_id = volId ? parseInt(volId) : null;
    updated[taskIndex].assigned_volunteer_name = volName;
    setEditableTasks(updated);
  };

  const handleConfirm = () => {
    onApprove({
      approved: true,
      event_data: editablePlan,
      tasks_data: editableTasks,
      volunteer_assignments: volunteerRecs || []
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-navy-900 via-slate-800 to-navy-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Human-in-the-Loop Gate
                </span>
                <span className="text-xs text-slate-400">Review & Approve Agent Plan</span>
              </div>
              <h3 className="text-xl font-bold mt-1 text-white">
                {editablePlan.title || 'Generated Event Plan'}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="px-6 border-b border-slate-200 flex gap-4 text-xs font-semibold bg-slate-50/50">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Schedule
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'tasks'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tasks & Volunteer Recommendations ({editableTasks.length})
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Event Metadata Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Budget</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">₹{editablePlan.budget?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Participants</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{editablePlan.expected_participants} Students</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Duration</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{editablePlan.duration_days} Day(s)</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">Venue</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1 truncate" title={editablePlan.venue}>
                    {editablePlan.venue || 'Campus Auditorium'}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Event Synopsis
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  {editablePlan.description}
                </p>
              </div>

              {/* Teams & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Organizing Teams */}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Proposed Organizing Teams
                  </h5>
                  <div className="space-y-2">
                    {editablePlan.teams?.map((team, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{team.name}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {team.headcount} Volunteers
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{team.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed Schedule */}
                <div>
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Timeline & Schedule
                  </h5>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {editablePlan.schedule?.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-bold text-brand-600">{item.time}</span>
                          <span className="text-[10px] text-slate-400">{item.team}</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 mt-0.5">{item.title}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Human Organizer Responsibility:</strong> The AI Volunteer Management Agent has recommended best-fit volunteers based on skills and capacity limits. Please review and adjust any assignments before committing to the database.
                </span>
              </div>

              <div className="space-y-2">
                {editableTasks.map((task, idx) => {
                  const rec = volunteerRecs?.find(r => r.task_title === task.title);
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === 'Urgent' ? 'danger' : task.priority === 'High' ? 'warning' : 'default'} size="xs">
                            {task.priority || 'Medium'}
                          </Badge>
                          <span className="text-xs font-bold text-slate-800">{task.title}</span>
                          <span className="text-[11px] text-slate-500">({task.category})</span>
                        </div>
                        {rec && (
                          <p className="text-[11px] text-indigo-700 mt-1">
                            🤖 AI Suggestion: <strong>{rec.recommended_volunteer_name}</strong> {rec.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                          {task.estimated_hours || 2} hrs
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                          {rec?.recommended_volunteer_name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Discard & Close
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              disabled={isApproving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isApproving ? 'Saving & Committing...' : 'Approve Plan & Commit to DB'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
