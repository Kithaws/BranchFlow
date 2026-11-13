import React, { useState, useEffect } from 'react';
import { 
  FileText, Sparkles, Download, Copy, Check, 
  Eye, Edit3, Trash2, Printer, Plus, RefreshCw, X
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { api } from '../services/api';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Doc Generator Form
  const [genForm, setGenForm] = useState({
    doc_type: 'Proposal',
    event_id: '',
    target_audience: 'The Principal & Academic Dean',
    additional_notes: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, evts] = await Promise.all([
        api.getDocuments(),
        api.getEvents()
      ]);
      setDocuments(docs);
      setEvents(evts);
      if (docs.length > 0 && !selectedDoc) {
        setSelectedDoc(docs[0]);
        setEditedContent(docs[0].content);
      }
      if (evts.length > 0 && !genForm.event_id) {
        setGenForm(prev => ({ ...prev, event_id: evts[0].id }));
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

  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc);
    setEditedContent(doc.content);
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!selectedDoc) return;
    try {
      const updated = await api.updateDocument(selectedDoc.id, {
        content: editedContent
      });
      setSelectedDoc(updated);
      setIsEditing(false);
      setDocuments(documents.map(d => d.id === updated.id ? updated : d));
      alert('Document edits saved successfully!');
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      const newDoc = await api.generateDocument({
        ...genForm,
        event_id: genForm.event_id ? parseInt(genForm.event_id) : null
      });
      setDocuments([newDoc, ...documents]);
      setSelectedDoc(newDoc);
      setEditedContent(newDoc.content);
      setIsEditing(false);
    } catch (err) {
      alert('Generation error: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!selectedDoc) return;
    navigator.clipboard.writeText(selectedDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!selectedDoc) return;
    const blob = new Blob([selectedDoc.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
  };

  const docTypes = [
    'Proposal',
    'Permission Letter',
    'Sponsorship Proposal',
    'Budget Draft',
    'Meeting Agenda',
    'Event Report',
    'Post-event Summary'
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              AI Documentation Agent
            </span>
            <span className="text-xs text-slate-400 font-mono">Formal College Document Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Documentation & Approval Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate, review, preview, edit, and export official club letters and reports.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Generator & List, Right Document Editor / Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Generator & List */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI Generator Box */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-600" />
              Generate Document with AI
            </h3>

            <form onSubmit={handleGenerate} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Document Type</label>
                <select
                  value={genForm.doc_type}
                  onChange={(e) => setGenForm({ ...genForm, doc_type: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
                >
                  {docTypes.map((dt) => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Linked Event</label>
                <select
                  value={genForm.event_id}
                  onChange={(e) => setGenForm({ ...genForm, event_id: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Recipient / Target Audience</label>
                <input
                  type="text"
                  value={genForm.target_audience}
                  onChange={(e) => setGenForm({ ...genForm, target_audience: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Additional Instructions (Optional)</label>
                <textarea
                  rows={2}
                  value={genForm.additional_notes}
                  onChange={(e) => setGenForm({ ...genForm, additional_notes: e.target.value })}
                  placeholder="e.g. Include note about Lab 4 reservation and emergency medical standby."
                  className="w-full mt-1 p-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md hover:from-violet-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Agent Generating Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate {genForm.doc_type}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Document Archive List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Generated Documents ({documents.length})
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-violet-500 bg-violet-50/40 shadow-sm ring-2 ring-violet-500/10'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="purple" size="xs">
                        {doc.doc_type}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">
                        v{doc.version}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                      {doc.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Markdown Preview & Live Editor */}
        <div className="lg:col-span-7">
          {selectedDoc ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm flex flex-col min-h-[70vh]">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedDoc.title}</h3>
                  <p className="text-[11px] text-slate-400">Version {selectedDoc.version} • Status: {selectedDoc.status}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                    title={isEditing ? 'Preview Markdown' : 'Edit Markdown'}
                  >
                    {isEditing ? <Eye className="w-4 h-4 text-violet-600" /> : <Edit3 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md</span>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 py-4 overflow-y-auto">
                {isEditing ? (
                  <div className="h-full flex flex-col space-y-3">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={20}
                      className="w-full flex-1 p-4 rounded-2xl border border-slate-200 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-5 py-2 text-xs font-bold bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-slate prose-sm max-w-none text-xs leading-relaxed font-sans space-y-3 text-slate-800 whitespace-pre-line bg-slate-50/40 p-6 rounded-2xl border border-slate-100 font-mono">
                    {selectedDoc.content}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Select or generate a document to preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
