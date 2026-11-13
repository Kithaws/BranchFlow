import React, { useState, useEffect } from 'react';
import { 
  Settings, Key, Bot, Cpu, Database, 
  Sparkles, CheckCircle2, AlertTriangle, RefreshCw, ExternalLink, Zap
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function SettingsPage({ onSettingsChanged }) {
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-flash');
  const [n8nUrlInput, setN8nUrlInput] = useState('');
  const [n8nEnabled, setN8nEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await api.getSettings();
      setSettingsData(data);
      setSelectedModel(data.gemini_model || 'gemini-1.5-flash');
      setN8nUrlInput(data.n8n_webhook_url || '');
      setN8nEnabled(Boolean(data.n8n_enabled));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const payload = {
        gemini_model: selectedModel,
        n8n_webhook_url: n8nUrlInput,
        n8n_enabled: n8nEnabled
      };
      if (geminiKeyInput.trim()) {
        payload.gemini_api_key = geminiKeyInput.trim();
      }

      const res = await api.updateSettings(payload);
      setGeminiKeyInput('');
      await loadSettings();
      if (onSettingsChanged) onSettingsChanged();
      alert('Settings updated successfully!');
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestN8n = async () => {
    try {
      const res = await api.updateSettings({ n8n_webhook_url: n8nUrlInput, n8n_enabled: n8nEnabled });
      // Send test webhook
      const testRes = await fetch('/api/settings/test-n8n', { method: 'POST' }).then(r => r.json());
      setTestResult(testRes);
    } catch (err) {
      setTestResult({ status: 'error', message: err.message });
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all events, tasks, and documents to realistic demo data?')) return;
    try {
      setIsResetting(true);
      await api.resetDemoData();
      alert('Database successfully reset to initial demo state!');
      window.location.reload();
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          System & AI Engine Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage Google Gemini API keys, agent parameters, and n8n workflow triggers.
        </p>
      </div>

      {/* AI Key Status Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              settingsData?.gemini_active ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Google Gemini AI Engine</h3>
                {settingsData?.gemini_active ? (
                  <Badge variant="success" size="xs">Live API Connected</Badge>
                ) : (
                  <Badge variant="warning" size="xs">Demo Mode (Heuristic)</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {settingsData?.gemini_active
                  ? `Active Model: ${settingsData.gemini_model} (Masked Key: ${settingsData.masked_gemini_key})`
                  : 'Currently running the intelligent fallback simulator. Enter your Gemini API Key below to activate live LLM generation.'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder={settingsData?.gemini_active ? '•••••••••••••••••••••••• (Leave blank to keep current)' : 'AIzaSy...'}
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Keys are stored securely in backend server memory or in the <code>.env</code> file. They are never exposed in browser bundles.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700">Gemini Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Fastest & High Quota)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning & Large Documents)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Updating...' : 'Save AI Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* n8n Automation Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">n8n Workflow Automation (Optional)</h3>
            <p className="text-slate-500 mt-0.5">
              Trigger automated external actions in n8n (such as emailing faculty, posting to Discord, or syncing to Google Calendar) on plan approval.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="n8nToggle"
              checked={n8nEnabled}
              onChange={(e) => setN8nEnabled(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="n8nToggle" className="font-semibold text-slate-700 cursor-pointer">
              Enable n8n Webhook Dispatcher
            </label>
          </div>

          <div>
            <label className="font-bold text-slate-700">Webhook URL</label>
            <input
              type="url"
              placeholder="https://n8n.yourdomain.com/webhook/branchflow-event-created"
              value={n8nUrlInput}
              onChange={(e) => setN8nUrlInput(e.target.value)}
              className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono text-[11px] focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleTestN8n}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Send Test Ping Webhook
            </button>

            {testResult && (
              <span className={`text-[11px] font-mono ${testResult.status === 'success' ? 'text-emerald-600' : 'text-slate-500'}`}>
                {testResult.status === 'skipped' ? 'Simulated (n8n disabled)' : testResult.status === 'success' ? 'Webhook Delivered 200 OK' : 'Ping Dispatched'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Database Maintenance Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database & Demo Reset</h3>
            <p className="text-slate-500 mt-0.5">
              Powered by SQLite with SQLAlchemy 2.0 ORM. Reset anytime to pre-populate realistic IEEE events and volunteers.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-700">Restore Realistic Demo Data</p>
            <p className="text-[11px] text-slate-400">Re-seeds HackZenith, AI Masterclass, 8 volunteers, and active tasks.</p>
          </div>

          <button
            onClick={handleResetDemoData}
            disabled={isResetting}
            className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100 transition-colors disabled:opacity-50"
          >
            {isResetting ? 'Resetting...' : 'Reset Demo Data'}
          </button>
        </div>
      </div>
    </div>
  );
}
