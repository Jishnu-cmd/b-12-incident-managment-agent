import React, { useState } from 'react';
import { X, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../types';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newIncident: Incident) => void;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [service, setService] = useState('Payment API');
  const [environment, setEnvironment] = useState('Production');
  const [source, setSource] = useState('Web Portal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !service) {
      setError('Please fill in all mandatory fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const newInc = await api.createIncident({
        title,
        description,
        service,
        environment,
        source
      });
      onSuccess(newInc);
      onClose();
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to ingest incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ingest New Incident</h3>
              <p className="text-xs text-slate-400">Multi-Agent AI will automatically triage, retrieve SOPs & correlate logs.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Incident Title *</label>
            <input
              type="text"
              placeholder="e.g. Production API returning HTTP 502 Bad Gateway"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs glass-input focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Affected Service *</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
              >
                <option value="Payment API" className="bg-slate-900">Payment API</option>
                <option value="PostgreSQL Production Cluster" className="bg-slate-900">PostgreSQL Production Cluster</option>
                <option value="Inventory Microservice" className="bg-slate-900">Inventory Microservice</option>
                <option value="User Authentication Service" className="bg-slate-900">User Authentication Service</option>
                <option value="AWS Ingress Gateway" className="bg-slate-900">AWS Ingress Gateway</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs glass-input"
              >
                <option value="Production" className="bg-slate-900">Production</option>
                <option value="Staging" className="bg-slate-900">Staging</option>
                <option value="Development" className="bg-slate-900">Development</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Source Channel</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input"
            >
              <option value="Web Portal" className="bg-slate-900">Web Portal</option>
              <option value="Alert System" className="bg-slate-900">Monitoring Alert System</option>
              <option value="Email" className="bg-slate-900">Email Ingestion</option>
              <option value="API" className="bg-slate-900">REST API Gateway</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              placeholder="Describe symptoms, error codes, logs, timestamp, affected users..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs glass-input focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Quick Presets for Demo */}
          <div className="pt-2">
            <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">Quick Test Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTitle('Database connection timeout on user login API');
                  setDescription('Production login service failing with psycopg2.OperationalError FATAL: remaining connection slots reserved for non-replication superuser connections.');
                  setService('PostgreSQL Production Cluster');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-[10px] text-indigo-300 border border-indigo-500/20"
              >
                Preset 1: DB Connection Timeout
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitle('HTTP 502 Bad Gateway on checkout microservice');
                  setDescription('Checkout microservice returning HTTP 502 error since 10:42 AM. Gunicorn workers crashlooping with exit code 139.');
                  setService('Payment API');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 text-[10px] text-cyan-300 border border-cyan-500/20"
              >
                Preset 2: Nginx 502 API Error
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing Incident...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit & Trigger AI Agent</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
