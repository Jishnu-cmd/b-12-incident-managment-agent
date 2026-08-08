import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Cpu, Terminal, Activity, Network, FileText, 
  CheckCircle2, Play, RefreshCw, Zap, User, Clock, Check
} from 'lucide-react';
import { api } from '../services/api';
import type { Incident } from '../types';
import { SeverityBadge } from '../components/SeverityBadge';
import { StatusBadge } from '../components/StatusBadge';

interface IncidentDetailProps {
  incidentId: string;
  onBack: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ incidentId, onBack }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'cmdb' | 'rag'>('logs');
  const [executing, setExecuting] = useState(false);
  const [execOutput, setExecOutput] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidentById(incidentId);
      setIncident(data);
    } catch (err) {
      console.error('Failed to fetch incident details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [incidentId]);

  const handleApprove = async () => {
    try {
      setApproving(true);
      await api.approveRemediation(incidentId);
      await fetchDetail();
    } catch (err) {
      console.error('Failed to approve remediation', err);
    } finally {
      setApproving(false);
    }
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      setExecOutput('Initializing execution sandbox for remediation tool...');
      const res = await api.executeRemediation(incidentId);
      setExecOutput(res.output);
      await fetchDetail();
    } catch (err) {
      console.error('Failed to execute remediation', err);
    } finally {
      setExecuting(false);
    }
  };

  const handleReanalyze = async () => {
    try {
      setLoading(true);
      await api.reanalyzeIncident(incidentId);
      await fetchDetail();
    } catch (err) {
      console.error('Failed to reanalyze', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Running Multi-Agent Investigation Pipeline...</span>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        Incident not found. <button onClick={onBack} className="text-indigo-400 underline">Return to Dashboard</button>
      </div>
    );
  }

  const logEvidence = incident.evidences?.find(e => e.source_type === 'LOG');
  const ragEvidences = incident.evidences?.filter(e => e.source_type === 'RAG_DOCUMENT' || e.source_type === 'HISTORICAL_INCIDENT') || [];
  const remediation = incident.remediations?.[0];

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReanalyze}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-run AI Analysis</span>
          </button>
          
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {/* SECTION 1 — Incident Header & Metadata */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className="text-lg font-mono font-bold text-indigo-400">{incident.id}</span>
              <SeverityBadge priority={incident.priority} severity={incident.severity} />
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs font-mono">
                {incident.service}
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white">{incident.title}</h1>
          </div>

          <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Created: {new Date(incident.created_at).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Team: {incident.assigned_team || 'Triage Queue'}</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">Reported Symptom Description</span>
          {incident.description}
        </div>
      </div>

      {/* SECTION 2 — AI Analysis & Triage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="md:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Agent Triage Summary</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {incident.ai_analysis?.summary || 'Triage completed. Multimodal analysis correlated symptoms across logs and Prometheus metrics.'}
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Classification</span>
              <span className="text-xs font-bold text-indigo-300">{incident.category || 'Application'}</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Impact</span>
              <span className="text-xs font-bold text-rose-300">{incident.ai_analysis?.impact || incident.severity}</span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">Urgency</span>
              <span className="text-xs font-bold text-amber-300">{incident.ai_analysis?.urgency || 'High'}</span>
            </div>
          </div>
        </div>

        {/* RCA Confidence Gauge */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col items-center justify-center text-center space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Diagnostic Confidence</span>
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
              <circle 
                cx="48" 
                cy="48" 
                r="38" 
                stroke="#38bdf8" 
                strokeWidth="8" 
                strokeDasharray={2 * Math.PI * 38}
                strokeDashoffset={2 * Math.PI * 38 * (1 - (incident.ai_analysis?.confidence || 85) / 100)}
                strokeLinecap="round"
                fill="transparent" 
              />
            </svg>
            <span className="absolute text-xl font-black text-cyan-400 font-mono">
              {incident.ai_analysis?.confidence || 85}%
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            {incident.ai_analysis?.confidence && incident.ai_analysis.confidence >= 90 ? 'Eligible for Auto-Healing' : 'Requires Approval'}
          </span>
        </div>

      </div>

      {/* SECTION 4 — Root Cause Analysis (RCA) Box */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-slate-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Root Cause Diagnosis (RCA)</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Multi-Source Synthesis
          </span>
        </div>

        <div className="text-sm font-semibold text-cyan-200">
          {incident.ai_analysis?.root_cause || 'Root cause under investigation.'}
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">Correlated Evidence Points:</span>
          <ul className="space-y-1 text-xs text-slate-300">
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Log pattern matched stack trace error threshold in application daemon.</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Prometheus latency p99 metric spiked simultaneously with incident timestamp.</span>
            </li>
            <li className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Vector similarity matched SOP document SOP-API-001 and past resolution INC-1002.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* SECTION 3 — Multi-Source Evidence Viewer (4 Tabs) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        
        {/* Evidence Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Logs Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'metrics' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Monitoring Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('cmdb')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'cmdb' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>CMDB Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('rag')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'rag' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>RAG & Historical SOPs</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'logs' && (
          <div className="terminal-window p-4 rounded-xl text-xs space-y-2 overflow-x-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-500 font-mono text-[10px]">
              <span>LOG STREAM • SERVICE: {incident.service}</span>
              <span>TIMESTAMP FILTERED</span>
            </div>
            <pre className="text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
              {logEvidence?.content || `[2026-08-08 10:32:01] [INFO] Request pipeline started on ${incident.service}
[2026-08-08 10:32:02] [WARN] Connection pool usage reached 95% threshold.
[2026-08-08 10:32:03] [ERROR] psycopg2.OperationalError: FATAL: remaining connection slots are reserved.
[2026-08-08 10:32:04] [ERROR] QueuePool limit of size 20 overflow 10 reached, connection timed out after 30.00s.
[2026-08-08 10:32:05] [CRITICAL] Service health check returned HTTP 502 Bad Gateway.`}
            </pre>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">CPU Utilization</span>
              <span className="text-xl font-bold text-rose-400 font-mono">91.5%</span>
              <span className="text-[10px] text-rose-400 block mt-1">↑ Threshold exceeded</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Memory Utilization</span>
              <span className="text-xl font-bold text-amber-400 font-mono">89.0%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Warning zone</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">HTTP 5xx Error Rate</span>
              <span className="text-xl font-bold text-rose-400 font-mono">32.5%</span>
              <span className="text-[10px] text-rose-400 block mt-1">Critical Spike</span>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block">p99 Latency</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">4200 ms</span>
              <span className="text-[10px] text-slate-400 block mt-1">SLA: 500 ms</span>
            </div>
          </div>
        )}

        {activeTab === 'cmdb' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-300">Configuration Item (CI) Dependency Graph</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs space-y-1">
                <span className="text-[10px] text-indigo-400 font-semibold block">Target CI</span>
                <div className="font-bold text-white">{incident.service}</div>
                <div className="text-[10px] text-slate-400">Tier-1 Mission Critical</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Upstream Dependency</span>
                <div className="font-semibold text-slate-200">AWS Nginx Load Balancer</div>
                <div className="text-[10px] text-amber-400">Degraded (HTTP 502)</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">Downstream Impact</span>
                <div className="font-semibold text-slate-200">Checkout Mobile POS</div>
                <div className="text-[10px] text-rose-400">60% Transaction Failures</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rag' && (
          <div className="space-y-3">
            {ragEvidences.map((e) => (
              <div key={e.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300">{e.source_reference}</span>
                  <span className="text-[10px] font-mono text-cyan-400">Relevance: {(e.relevance_score * 100).toFixed(1)}%</span>
                </div>
                <p className="text-xs text-slate-300">{e.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* SECTION 5 — Auto-Healing & Remediation Controls Console */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Play className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Auto-Healing & Remediation Control Console</h3>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400">Risk Level:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
              {remediation?.risk_level || 'Low'}
            </span>
          </div>
        </div>

        {/* Recommended Solution Steps */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-indigo-300 block">AI Recommended Solution Plan:</span>
          <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
            {incident.ai_analysis?.recommendation || 'No recommendation available.'}
          </pre>
        </div>

        {/* Execution & Approval Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          
          <div className="text-xs text-slate-400">
            Approval Status: <span className="font-bold text-white uppercase">{remediation?.approval_status || 'PENDING'}</span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            {remediation?.approval_status === 'PENDING_APPROVAL' && (
              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{approving ? 'Approving...' : 'Grant Human Approval'}</span>
              </button>
            )}

            <button
              onClick={handleExecute}
              disabled={executing || incident.status === 'RESOLVED'}
              className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg ${
                incident.status === 'RESOLVED'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-emerald-600/25 active:scale-95'
              }`}
            >
              {executing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Executing Remediation...</span>
                </>
              ) : incident.status === 'RESOLVED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Incident Resolved</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute Approved Tool & Verify</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Execution Output Stream */}
        {execOutput && (
          <div className="terminal-window p-4 rounded-xl text-xs space-y-2 mt-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-emerald-400 font-mono text-[10px]">
              <span>EXECUTOR CONSOLE OUTPUT STREAM</span>
              <span>STATUS: VERIFIED</span>
            </div>
            <pre className="text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
              {execOutput}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
