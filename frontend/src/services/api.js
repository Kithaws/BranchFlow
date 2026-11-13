const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    let errorDetail = 'API Request Failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch (e) {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboardSummary: (orgId = 1) => request(`/dashboard/summary?org_id=${orgId}`),

  // Events
  getEvents: (status) => request(`/events${status ? `?status=${status}` : ''}`),
  getEventDetail: (id) => request(`/events/${id}`),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // Volunteers
  getVolunteers: (orgId = 1) => request(`/volunteers?org_id=${orgId}`),
  getWorkloadAnalysis: (orgId = 1) => request(`/volunteers/workload-analysis?org_id=${orgId}`),
  createVolunteer: (data) => request('/volunteers', { method: 'POST', body: JSON.stringify(data) }),
  updateVolunteer: (id, data) => request(`/volunteers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVolunteer: (id) => request(`/volunteers/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (eventId) => request(`/documents${eventId ? `?event_id=${eventId}` : ''}`),
  getDocumentDetail: (id) => request(`/documents/${id}`),
  generateDocument: (data) => request('/documents/generate', { method: 'POST', body: JSON.stringify(data) }),
  updateDocument: (id, data) => request(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDocument: (id) => request(`/documents/${id}`, { method: 'DELETE' }),

  // Communications
  getCommunications: (eventId) => request(`/communications${eventId ? `?event_id=${eventId}` : ''}`),
  generateCommunication: (data) => request('/communications/generate', { method: 'POST', body: JSON.stringify(data) }),
  deleteCommunication: (id) => request(`/communications/${id}`, { method: 'DELETE' }),

  // Agentic AI & LangGraph
  planEventWithAgent: (prompt, autoApprove = false) =>
    request('/agents/plan-event', {
      method: 'POST',
      body: JSON.stringify({ prompt, auto_approve: autoApprove }),
    }),
  approvePlan: (approvalData) =>
    request('/agents/approve-plan', {
      method: 'POST',
      body: JSON.stringify(approvalData),
    }),
  recommendVolunteers: (eventId) =>
    request('/agents/recommend-volunteers', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId }),
    }),
  getProgressAudit: (eventId) =>
    request(`/agents/progress-audit${eventId ? `?event_id=${eventId}` : ''}`),
  getAgentLogs: (limit = 25) => request(`/agents/logs?limit=${limit}`),

  // Settings & System
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'POST', body: JSON.stringify(data) }),
  resetDemoData: () => request('/settings/reset-demo-data', { method: 'POST' }),
  getHealth: () => request('/health'),
};

