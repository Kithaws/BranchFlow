import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Sparkles, Send, Copy, Check, 
  Trash2, Mail, Instagram, MessageCircle, Share2, RefreshCw
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function CommunicationsPage() {
  const [comms, setComms] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [form, setForm] = useState({
    event_id: '',
    topic: 'Registration Open & Early Bird Pass',
    channel: 'WhatsApp',
    tone: 'friendly',
    recipient_group: 'All Students & Coding Groups',
    additional_notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [allComms, allEvents] = await Promise.all([
        api.getCommunications(),
        api.getEvents()
      ]);
      setComms(allComms);
      setEvents(allEvents);
      if (allEvents.length > 0 && !form.event_id) {
        setForm((prev) => ({ ...prev, event_id: allEvents[0].id }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const newComm = await api.generateCommunication({
        ...form,
        event_id: form.event_id ? parseInt(form.event_id) : null
      });
      setComms([newComm, ...comms]);
    } catch (err) {
      alert('Error generating communication: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const channels = ['WhatsApp', 'Email', 'Instagram', 'Discord', 'LinkedIn', 'SMS'];
  const tones = [
    { id: 'professional', label: 'Professional', desc: 'Formal, polite, structured' },
    { id: 'friendly', label: 'Friendly', desc: 'Warm, welcoming, encouraging' },
    { id: 'casual', label: 'Casual / Hype', desc: 'High-energy, emojis, engaging' }
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              AI Communication Agent
            </span>
            <span className="text-xs text-slate-400 font-mono">Multi-Tone Broadcast Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Communications & Broadcast Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate channel-optimized copy for WhatsApp, Discord, Email, and Instagram.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Generator Form, Right Message Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Craft Targeted Message
            </h3>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Target Channel</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {channels.map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setForm({ ...form, channel: ch })}
                      className={`py-2 px-2.5 rounded-xl border font-semibold transition-all ${
                        form.channel === ch
                          ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Tone of Voice</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {tones.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, tone: t.id })}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        form.tone === t.id
                          ? 'border-emerald-500 bg-emerald-50/60 text-emerald-800 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-bold text-[11px]">{t.label}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Linked Event</label>
                <select
                  value={form.event_id}
                  onChange={(e) => setForm({ ...form, event_id: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Message Topic</label>
                <input
                  type="text"
                  required
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  placeholder="e.g. Registration Announcement, Volunteer Briefing, Countdown"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Recipient Audience</label>
                <select
                  value={form.recipient_group}
                  onChange={(e) => setForm({ ...form, recipient_group: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                >
                  <option value="All Students & Coding Groups">All Students & Coding Groups</option>
                  <option value="Registered Attendees">Registered Attendees</option>
                  <option value="Volunteers & Core Leads">Volunteers & Core Leads</option>
                  <option value="Faculty & Department Heads">Faculty & Department Heads</option>
                  <option value="Corporate Sponsors & Mentors">Corporate Sponsors & Mentors</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Key Information & Links (Optional)</label>
                <textarea
                  rows={2}
                  value={form.additional_notes}
                  onChange={(e) => setForm({ ...form, additional_notes: e.target.value })}
                  placeholder="e.g. Mention free food, paid internship offers, registration link: https://zenith.edu/hack"
                  className="w-full mt-1 p-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Agent Crafting Message...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate {form.channel} Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Drafted Messages Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Drafted Announcements & Copy ({comms.length})
            </h3>
            <span className="text-[11px] text-slate-400">Ready to Broadcast</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading communications...</div>
          ) : comms.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              No communications generated yet. Fill the form to create your first broadcast!
            </div>
          ) : (
            comms.map((comm) => {
              const isCopied = copiedId === comm.id;
              return (
                <div
                  key={comm.id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="success" size="xs">
                        {comm.channel}
                      </Badge>
                      <Badge variant="primary" size="xs">
                        {comm.tone}
                      </Badge>
                      <span className="text-xs font-bold text-slate-900">{comm.title}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(comm.id, comm.content)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-sans text-slate-800 whitespace-pre-wrap leading-relaxed select-text font-mono">
                    {comm.content}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span>Target: {comm.recipient_group}</span>
                    <span>Created: {new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
