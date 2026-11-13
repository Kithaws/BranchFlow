import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, IndianRupee, MapPin, Sparkles, 
  Plus, CheckCircle, Clock, ChevronRight, CheckSquare, 
  FileText, X, AlertCircle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function EventsPage({ onOpenAiModal }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Manual create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: 'Workshop',
    budget: 15000,
    expected_participants: 100,
    venue: 'Campus Main Auditorium',
    duration_days: 1,
    description: ''
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.getEvents(filterStatus === 'all' ? null : filterStatus);
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        loadEventDetail(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventDetail = async (id) => {
    try {
      setSelectedEventId(id);
      setLoadingDetail(true);
      const detail = await api.getEventDetail(id);
      setEventDetail(detail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filterStatus]);

  const handleManualCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createEvent(newEvent);
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        event_type: 'Workshop',
        budget: 15000,
        expected_participants: 100,
        venue: 'Campus Main Auditorium',
        duration_days: 1,
        description: ''
      });
      fetchEvents();
    } catch (err) {
      alert('Error creating event: ' + err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Event Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track schedules, organizing teams, checklists, and tasks across college events.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            + Manual Event
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-semibold">
        {['all', 'active', 'planning', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Event List, Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Event Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">No events found matching filter.</p>
              <button
                onClick={onOpenAiModal}
                className="mt-3 text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                + Plan an event with AI
              </button>
            </div>
          ) : (
            events.map((ev) => {
              const isSelected = ev.id === selectedEventId;
              return (
                <div
                  key={ev.id}
                  onClick={() => loadEventDetail(ev.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={ev.status === 'active' ? 'success' : ev.status === 'planning' ? 'primary' : 'default'}
                      size="xs"
                    >
                      {ev.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-400">
                      ₹{ev.budget?.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2 line-clamp-1">{ev.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{ev.description}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>🗓️ {ev.start_date || 'Upcoming'}</span>
                    <span>👥 {ev.expected_participants} Pax</span>
                    <span className="font-semibold text-brand-600">{ev.tasks_count || 0} tasks</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Event Detail Inspector */}
        <div className="lg:col-span-7">
          {loadingDetail ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Loading event blueprint...
            </div>
          ) : eventDetail ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-6">
              {/* Event Header */}
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="primary" size="sm">
                    {eventDetail.event.event_type}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    ID #{eventDetail.event.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{eventDetail.event.title}</h2>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{eventDetail.event.description}</p>
              </div>

              {/* Quick stats pills */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Budget</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">₹{eventDetail.event.budget?.toLocaleString()}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Headcount</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{eventDetail.event.expected_participants} Students</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Venue</p>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate">{eventDetail.event.venue || 'Campus'}</p>
                </div>
              </div>

              {/* Schedule Timeline */}
              {eventDetail.schedule && eventDetail.schedule.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    Timeline & Run of Show
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {eventDetail.schedule.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-brand-600">{item.time}</span>
                          <p className="text-xs font-semibold text-slate-800 mt-0.5">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.details}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                          {item.team}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizing Teams */}
              {eventDetail.teams && eventDetail.teams.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Required Organizing Teams
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {eventDetail.teams.map((t, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{t.name}</span>
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {t.headcount} Pax
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{t.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks List linked to this event */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Active Event Tasks ({eventDetail.tasks?.length || 0})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {eventDetail.tasks?.map((task) => (
                    <div key={task.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'} size="xs">
                          {task.status}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-800">{task.title}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {task.assigned_volunteer ? `Assigned: ${task.assigned_volunteer.name}` : 'Unassigned'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Select an event to view full details.
            </div>
          )}
        </div>
      </div>

      {/* Manual Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Event</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualCreate} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. AI Robotics Workshop"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Event Type</label>
                  <select
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none"
                  >
                    <option value="Workshop">Workshop</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Conference">Conference</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Cultural Fest">Cultural Fest</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Budget (₹)</label>
                  <input
                    type="number"
                    value={newEvent.budget}
                    onChange={(e) => setNewEvent({ ...newEvent, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700">Expected Headcount</label>
                  <input
                    type="number"
                    value={newEvent.expected_participants}
                    onChange={(e) => setNewEvent({ ...newEvent, expected_participants: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700">Duration (Days)</label>
                  <input
                    type="number"
                    value={newEvent.duration_days}
                    onChange={(e) => setNewEvent({ ...newEvent, duration_days: parseInt(e.target.value) || 1 })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Venue</label>
                <input
                  type="text"
                  value={newEvent.venue}
                  onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Synopsis / Description</label>
                <textarea
                  rows={2}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 rounded-xl shadow-sm"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
