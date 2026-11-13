import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, CheckSquare, Sparkles, TrendingUp, 
  Clock, AlertCircle, ArrowUpRight, Bot, RefreshCw, ChevronRight
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function DashboardPage({ onNavigate, onOpenAiModal }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      setData(res);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading branch executive metrics...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const charts = data?.charts || {};
  const upcomingEvents = data?.upcoming_events || [];
  const recentActivities = data?.recent_activities || [];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time branch telemetry, active event workflows, and volunteer workload distribution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSummary}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 bg-white"
            title="Refresh metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenAiModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold shadow-sm hover:from-brand-500 hover:to-indigo-500 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Event Planner</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={metrics.total_events || 0}
          change={`${metrics.active_events || 0} Active`}
          trend="up"
          icon={Calendar}
          color="brand"
        />
        <StatCard
          title="Total Volunteers"
          value={metrics.total_volunteers || 0}
          change={`${metrics.available_volunteers || 0} Available`}
          trend="neutral"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Pending Tasks"
          value={metrics.pending_tasks || 0}
          change={metrics.overdue_tasks > 0 ? `${metrics.overdue_tasks} Overdue` : 'On Schedule'}
          trend={metrics.overdue_tasks > 0 ? 'down' : 'up'}
          icon={CheckSquare}
          color={metrics.overdue_tasks > 0 ? 'rose' : 'amber'}
        />
        <StatCard
          title="Milestone Completion"
          value={`${metrics.task_completion_percentage || 0}%`}
          change={`${metrics.completed_tasks || 0} Done`}
          trend="up"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Completion Progress Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Task Milestone Status
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              Total: {metrics.total_tasks || 0}
            </span>
          </div>

          <div className="h-52 flex items-center justify-center">
            {charts.task_progress && charts.task_progress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.task_progress}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {charts.task_progress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No task data available.</p>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            {charts.task_progress?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volunteers by Department Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Volunteer Distribution by Department
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">
              {metrics.total_volunteers || 0} Active Volunteers
            </span>
          </div>

          <div className="h-56">
            {charts.volunteers_by_department && charts.volunteers_by_department.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.volunteers_by_department} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="department" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    interval={0} 
                    angle={-15} 
                    textAnchor="end" 
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} 
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Volunteers" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No volunteer data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Upcoming Events & Recent Agent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                Upcoming Branch Events
              </h3>
              <button
                onClick={() => onNavigate('events')}
                className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onNavigate('events')}
                    className="p-3.5 rounded-xl border border-slate-200/90 hover:border-brand-300 hover:bg-slate-50/60 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={event.status === 'active' ? 'success' : 'primary'} size="xs">
                          {event.status}
                        </Badge>
                        <h4 className="text-xs font-bold text-slate-900">{event.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                        <span>🗓️ {event.start_date || 'Upcoming'}</span>
                        <span>👥 {event.expected_participants} Pax</span>
                        <span>📍 {event.venue || 'Campus'}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {event.tasks_count} tasks
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming events planned.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenAiModal}
              className="w-full py-2.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate New Event with AI Planner</span>
            </button>
          </div>
        </div>

        {/* Recent AI Agent Activities */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-600" />
                Recent AI Agent Traces
              </h3>
              <button
                onClick={() => onNavigate('agents')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
              >
                <span>Agent Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentActivities.length > 0 ? (
                recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800">
                          {act.agent_name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {act.action_name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant={act.status === 'success' ? 'success' : act.status === 'warning' ? 'warning' : 'default'} size="xs">
                        {act.status}
                      </Badge>
                      <p className="text-[10px] text-slate-400 mt-0.5">{act.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No recent agent actions logged.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Powered by LangGraph Engine</span>
            <span className="font-mono">SQLite State Store</span>
          </div>
        </div>
      </div>
    </div>
  );
}
