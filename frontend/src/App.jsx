import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import AgentWorkspacePage from './pages/AgentWorkspacePage';
import VolunteersPage from './pages/VolunteersPage';
import TasksPage from './pages/TasksPage';
import DocumentsPage from './pages/DocumentsPage';
import CommunicationsPage from './pages/CommunicationsPage';
import SettingsPage from './pages/SettingsPage';
import { api } from './services/api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // landing, dashboard, events, agents, volunteers, tasks, documents, communications, settings
  const [systemSettings, setSystemSettings] = useState(null);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSystemSettings(data);
    } catch (e) {
      console.error('Error loading settings', e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleOpenAiModal = () => {
    setCurrentPage('agents');
  };

  // If user is on the public landing page
  if (currentPage === 'landing') {
    return <LandingPage onEnterApp={() => setCurrentPage('dashboard')} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentPage}
        onNavigate={(tab) => setCurrentPage(tab)}
        onGoToLanding={() => setCurrentPage('landing')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          systemSettings={systemSettings}
          onNavigate={(tab) => setCurrentPage(tab)}
          onOpenAiModal={handleOpenAiModal}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab) => setCurrentPage(tab)}
              onOpenAiModal={handleOpenAiModal}
            />
          )}

          {currentPage === 'events' && (
            <EventsPage onOpenAiModal={handleOpenAiModal} />
          )}

          {currentPage === 'agents' && (
            <AgentWorkspacePage
              onEventCreated={() => {
                // Event was persisted; reload settings or navigate
                loadSettings();
              }}
            />
          )}

          {currentPage === 'volunteers' && <VolunteersPage />}

          {currentPage === 'tasks' && <TasksPage />}

          {currentPage === 'documents' && <DocumentsPage />}

          {currentPage === 'communications' && <CommunicationsPage />}

          {currentPage === 'settings' && (
            <SettingsPage onSettingsChanged={loadSettings} />
          )}
        </main>
      </div>
    </div>
  );
}

