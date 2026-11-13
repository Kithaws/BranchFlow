import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, AlertTriangle, ShieldCheck, 
  Plus, Star, Mail, Phone, BookOpen, Sparkles, X, Check, RefreshCw
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVol, setNewVol] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    skills: 'Python, Event Operations',
    max_tasks: 4
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [vols, anal] = await Promise.all([
        api.getVolunteers(),
        api.getWorkloadAnalysis()
      ]);
      setVolunteers(vols);
      setAnalysis(anal);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddVolunteer = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = newVol.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createVolunteer({
        ...newVol,
        skills: skillsArray,
        max_tasks: parseInt(newVol.max_tasks) || 4
      });

      setShowAddModal(false);
      setNewVol({
        name: '',
        email: '',
        phone: '',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        skills: 'Python, Event Operations',
        max_tasks: 4
      });
      loadData();
    } catch (err) {
      alert('Error adding volunteer: ' + err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              AI Volunteer Management Agent
            </span>
            <span className="text-xs text-slate-400 font-mono">Workload Balancer Active</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Volunteer Roster & Workload Guard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track volunteer competencies, prevent core lead burnout, and approve task allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Volunteer</span>
          </button>
        </div>
      </div>

      {/* Workload Balancer Banner */}
      {analysis && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  analysis.workload_imbalance_detected
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {analysis.workload_imbalance_detected ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {analysis.workload_imbalance_detected
                    ? 'Workload Imbalance Alert Detected'
                    : 'Volunteer Workload is Well Balanced'}
                </h3>
                <p className="text-xs text-slate-500">
                  Branch Utilization: <strong>{analysis.overall_utilization_percent}%</strong> |{' '}
                  {analysis.available_count} available, {analysis.overloaded_count} at capacity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {analysis.burnout_risk_volunteers?.length > 0 && (
                <Badge variant="danger" size="sm">
                  ⚠️ {analysis.burnout_risk_volunteers.length} Burnout Risk
                </Badge>
              )}
              {analysis.underutilized_volunteers?.length > 0 && (
                <Badge variant="info" size="sm">
                  💡 {analysis.underutilized_volunteers.length} Underutilized
                </Badge>
              )}
            </div>
          </div>

          {/* Insights Pills */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {analysis.insights?.map((ins, idx) => (
              <p key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{ins}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Volunteers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">Loading roster...</div>
        ) : volunteers.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">No volunteers added yet.</div>
        ) : (
          volunteers.map((vol) => {
            const isOverloaded = vol.current_task_count >= vol.max_tasks;
            const utilizationPct = Math.round((vol.current_task_count / Math.max(1, vol.max_tasks)) * 100);

            return (
              <div
                key={vol.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isOverloaded ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(vol.name)}`}
                        alt={vol.name}
                        className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-50"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{vol.name}</h3>
                        <p className="text-[11px] text-slate-500">{vol.department} • {vol.year}</p>
                      </div>
                    </div>
                    {isOverloaded ? (
                      <Badge variant="danger" size="xs">
                        Overloaded
                      </Badge>
                    ) : (
                      <Badge variant="success" size="xs">
                        {vol.availability_status}
                      </Badge>
                    )}
                  </div>

                  {/* Skills badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {vol.skills?.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Contact details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{vol.email}</span>
                    </p>
                    {vol.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vol.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-slate-500 font-medium">Task Capacity</span>
                    <span className="font-bold text-slate-800">
                      {vol.current_task_count} / {vol.max_tasks} ({utilizationPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOverloaded ? 'bg-rose-500' : utilizationPct > 70 ? 'bg-amber-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(100, utilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Volunteer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add New Volunteer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVolunteer} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newVol.name}
                  onChange={(e) => setNewVol({ ...newVol, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={newVol.email}
                  onChange={(e) => setNewVol({ ...newVol, email: e.target.value })}
                  placeholder="rahul@college.edu"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={newVol.department}
                    onChange={(e) => setNewVol({ ...newVol, department: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Year</label>
                  <select
                    value={newVol.year}
                    onChange={(e) => setNewVol({ ...newVol, year: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={newVol.skills}
                  onChange={(e) => setNewVol({ ...newVol, skills: e.target.value })}
                  placeholder="Python, Graphic Design, Sponsorship, AV Logistics"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Max Task Capacity</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={newVol.max_tasks}
                  onChange={(e) => setNewVol({ ...newVol, max_tasks: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl shadow-sm"
                >
                  Save Volunteer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
