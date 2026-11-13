import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Plus, Clock, AlertCircle, CheckCircle2, 
  User, Calendar, Filter, LayoutGrid, List as ListIcon, X, AlertTriangle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // kanban, list
  const [selectedEventFilter, setSelectedEventFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Logistics',
    priority: 'Medium',
    status: 'pending',
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimated_hours: 3.0,
    event_id: '',
    assigned_volunteer_id: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTasks, allEvents, allVols] = await Promise.all([
        api.getTasks(selectedEventFilter ? { event_id: selectedEventFilter } : {}),
        api.getEvents(),
        api.getVolunteers()
      ]);
      setTasks(allTasks);
      setEvents(allEvents);
      setVolunteers(allVols);
      if (allEvents.length > 0 && !newTask.event_id) {
        setNewTask((prev) => ({ ...prev, event_id: allEvents[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEventFilter]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      alert('Error updating task: ' + err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.createTask({
        ...newTask,
        event_id: parseInt(newTask.event_id),
        assigned_volunteer_id: newTask.assigned_volunteer_id ? parseInt(newTask.assigned_volunteer_id) : null,
        estimated_hours: parseFloat(newTask.estimated_hours) || 2.0
      });
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert('Error creating task: ' + err.message);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const columns = [
    { id: 'pending', title: 'Pending', color: 'border-amber-400 bg-amber-500/10' },
    { id: 'in_progress', title: 'In Progress', color: 'border-sky-400 bg-sky-500/10' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-400 bg-emerald-500/10' }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Task Orchestration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor deliverables, detect overdue deadlines, and assign volunteers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Event Filter */}
          <select
            value={selectedEventFilter}
            onChange={(e) => setSelectedEventFilter(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-200 p-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Events</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Main Board */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="bg-slate-100/70 rounded-3xl p-4 border border-slate-200/80 flex flex-col min-h-[60vh]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full border ${col.color}`} />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{col.title}</h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">No tasks in this lane</div>
                  ) : (
                    colTasks.map((task) => {
                      const isOverdue = task.status !== 'completed' && task.due_date && task.due_date < todayStr;
                      return (
                        <div
                          key={task.id}
                          className={`bg-white rounded-2xl p-4 border shadow-sm transition-all hover:shadow-md ${
                            isOverdue ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                task.priority === 'Urgent'
                                  ? 'danger'
                                  : task.priority === 'High'
                                  ? 'warning'
                                  : 'default'
                              }
                              size="xs"
                            >
                              {task.priority}
                            </Badge>
                            <span className="text-[10px] font-mono text-slate-400">
                              {task.estimated_hours}h
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 mt-2">{task.title}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>

                          {/* Overdue alert pill */}
                          {isOverdue && (
                            <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>OVERDUE: Due {task.due_date}</span>
                            </div>
                          )}

                          {/* Footer: Assignee & status transition */}
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5 text-slate-600 truncate max-w-[140px]" title={task.assigned_volunteer?.name}>
                              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{task.assigned_volunteer?.name || 'Unassigned'}</span>
                            </div>

                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="text-[10px] font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Task Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-900">{task.title}</td>
                    <td className="p-4 text-slate-500">{task.category}</td>
                    <td className="p-4">
                      <Badge
                        variant={task.priority === 'Urgent' ? 'danger' : task.priority === 'High' ? 'warning' : 'default'}
                        size="xs"
                      >
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="p-4 capitalize">
                      <Badge variant={task.status === 'completed' ? 'success' : task.status === 'in_progress' ? 'info' : 'default'} size="xs">
                        {task.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-mono">{task.due_date || 'N/A'}</td>
                    <td className="p-4">{task.assigned_volunteer?.name || 'Unassigned'}</td>
                    <td className="p-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-[11px] p-1.5 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Task</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Confirm audio/visual setup"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700">Linked Event</label>
                <select
                  required
                  value={newTask.event_id}
                  onChange={(e) => setNewTask({ ...newTask, event_id: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Sponsorship">Sponsorship</option>
                    <option value="PR & Media">PR & Media</option>
                    <option value="Hospitality">Hospitality</option>
                    <option value="Documentation">Documentation</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">Est. Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask({ ...newTask, estimated_hours: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700">Assign Volunteer (Optional)</label>
                <select
                  value={newTask.assigned_volunteer_id}
                  onChange={(e) => setNewTask({ ...newTask, assigned_volunteer_id: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {volunteers.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.current_task_count}/{v.max_tasks} tasks)
                    </option>
                  ))}
                </select>
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
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
