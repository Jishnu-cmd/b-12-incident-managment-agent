import React, { useState, useEffect } from 'react';
import { X, Trash2, CheckCircle2, ShieldAlert, Cpu, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../types';

interface EditIncidentModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const EditIncidentModal: React.FC<EditIncidentModalProps> = ({ incident, isOpen, onClose, onUpdated }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('P2');
  const [status, setStatus] = useState('INVESTIGATING');
  const [assignedTeam, setAssignedTeam] = useState('Backend Infra');
  const [loading, setLoading] = useState(false);
  const [executingFix, setExecutingFix] = useState(false);
  const [fixOutput, setFixOutput] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      setTitle(incident.title || '');
      setPriority(incident.priority || 'P2');
      setStatus(incident.status || 'INVESTIGATING');
      setAssignedTeam(incident.assigned_team || 'Backend Infra');
      setFixOutput(null);
    }
  }, [incident]);

  if (!isOpen || !incident) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.updateIncident(incident.id, {
        title,
        priority,
        status,
        assigned_team: assignedTeam
      });
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update incident', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete incident ${incident.id}?`)) return;
    try {
      setLoading(true);
      await api.deleteIncident(incident.id);
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete incident', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSolveIncident = async () => {
    try {
      setExecutingFix(true);
      setFixOutput(`[AI AGENT] Executing auto-healing remediation for ${incident.id} on service '${incident.service}'...`);

      const res = await api.executeRemediation(incident.id);
      setFixOutput(res.output);
      setStatus('RESOLVED');
      onUpdated();
    } catch (err: any) {
      setFixOutput(`[ERROR] Remediation execution failed: ${err.message}`);
    } finally {
      setExecutingFix(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-2xl border border-slate-800 p-6 space-y-5 relative shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-extrabold text-white">Manage & Solve Incident {incident.id}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Diagnostics Summary */}
        <div className="bg-slate-900/90 p-4 rounded-xl border border-indigo-500/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Identification & Diagnosis</span>
            </span>
            <span className="font-mono font-bold text-emerald-400">
              Confidence: {incident.ai_analysis?.confidence || 92}%
            </span>
          </div>

          <p className="text-slate-300 text-xs leading-relaxed">
            {incident.ai_analysis?.root_cause || 'AI identified high connection pool contention on Payment Gateway database node leading to HTTP 500 error spikes.'}
          </p>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
            <span>Recommended Action: <strong className="text-cyan-300">{incident.ai_analysis?.recommendation || 'Restart Service Daemon & Expand Pool'}</strong></span>
            <button
              type="button"
              onClick={handleSolveIncident}
              disabled={executingFix || status === 'RESOLVED'}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-md shadow-emerald-600/30 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {executingFix ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Fix...</span>
                </>
              ) : status === 'RESOLVED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Incident Resolved</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5" />
                  <span>⚡ Solve & Auto-Heal Incident</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Terminal Output Stream */}
        {fixOutput && (
          <div className="terminal-window p-3 rounded-xl text-xs max-h-36 overflow-y-auto">
            <pre className="text-slate-200 font-mono leading-relaxed text-[11px] whitespace-pre-wrap">
              {fixOutput}
            </pre>
          </div>
        )}

        {/* CRUD Edit Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1">Incident Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs glass-input rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-input rounded-xl bg-slate-900"
              >
                <option value="P1">P1 Critical</option>
                <option value="P2">P2 High</option>
                <option value="P3">P3 Medium</option>
                <option value="P4">P4 Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-input rounded-xl bg-slate-900"
              >
                <option value="NEW">New</option>
                <option value="INVESTIGATING">Investigating</option>
                <option value="APPROVED">Approved</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Assigned Team</label>
              <input
                type="text"
                value={assignedTeam}
                onChange={(e) => setAssignedTeam(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-input rounded-xl"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 flex items-center space-x-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Incident</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
