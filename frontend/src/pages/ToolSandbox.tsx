import React, { useEffect, useState } from 'react';
import { Wrench, Play, Terminal, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const ToolSandbox: React.FC = () => {
  const [tools, setTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('restart_service');
  const [targetService, setTargetService] = useState<string>('Payment API');
  const [userRole, setUserRole] = useState<string>('Engineer');
  const [executing, setExecuting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchToolsList = async () => {
      try {
        const list = await api.getTools();
        setTools(list);
      } catch (err) {
        console.error('Failed to load tools list', err);
      }
    };
    fetchToolsList();
  }, []);

  const activeToolObj = tools.find(t => t.tool_name === selectedTool) || {
    tool_name: 'restart_service',
    display_name: 'Restart Service Daemon',
    description: 'Gracefully restarts application background worker processes.',
    risk_level: 'Low',
    allowed_roles: ['Admin', 'Incident Manager', 'Engineer']
  };

  const handleExecute = async () => {
    try {
      setExecuting(true);
      setConsoleOutput(`[SANDBOX] Dispatching execution signal for tool '${selectedTool}' on target '${targetService}'...`);
      setExecutionStatus('RUNNING');

      const res = await api.executeTool({
        tool_name: selectedTool,
        target_service: targetService,
        user_role: userRole
      });

      setConsoleOutput(res.output);
      setExecutionStatus(res.status);
    } catch (err: any) {
      setConsoleOutput(`[SANDBOX ERROR] Execution failed: ${err.response?.data?.detail || err.message}`);
      setExecutionStatus('FAILED');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white">Model Context Protocol (MCP) Tool Testing Sandbox</h2>
          </div>
          <p className="text-xs text-slate-400">
            Interactive control panel to test and verify safe remediation script execution, role-based access checks, and health diagnostics.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-mono flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Safety Policy Matrix: Active</span>
        </div>
      </div>

      {/* Grid: Left Tool Selector & Parameters | Right Terminal Console */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Tool Configurator */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Select Tool & Parameters</h3>

          {/* Tool Selector */}
          <div>
            <label className="block text-xs text-slate-300 mb-1">Target Remediation Tool</label>
            <select
              value={selectedTool}
              onChange={(e) => {
                setSelectedTool(e.target.value);
                const obj = tools.find(t => t.tool_name === e.target.value);
                if (obj && obj.default_service) setTargetService(obj.default_service);
              }}
              className="w-full px-3.5 py-2 text-xs glass-input rounded-xl font-semibold"
            >
              {tools.map((t) => (
                <option key={t.tool_name} value={t.tool_name} className="bg-slate-900">
                  {t.display_name} ({t.risk_level} Risk)
                </option>
              ))}
            </select>
          </div>

          {/* Description Box */}
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Tool Details</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">{activeToolObj.description}</p>
            <div className="pt-2 flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Allowed Roles:</span>
              <span className="text-cyan-300 font-mono">{activeToolObj.allowed_roles?.join(', ')}</span>
            </div>
          </div>

          {/* Target Service */}
          <div>
            <label className="block text-xs text-slate-300 mb-1">Target Service / Host</label>
            <input
              type="text"
              value={targetService}
              onChange={(e) => setTargetService(e.target.value)}
              className="w-full px-3.5 py-2 text-xs glass-input rounded-xl font-mono"
            />
          </div>

          {/* User Role */}
          <div>
            <label className="block text-xs text-slate-300 mb-1">User Execution Role</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="w-full px-3.5 py-2 text-xs glass-input rounded-xl font-mono"
            >
              <option value="Engineer" className="bg-slate-900">Engineer (Standard)</option>
              <option value="Admin" className="bg-slate-900">Admin (Elevated)</option>
              <option value="Incident Manager" className="bg-slate-900">Incident Manager</option>
              <option value="Service Desk" className="bg-slate-900">Service Desk (Restricted)</option>
              <option value="Viewer" className="bg-slate-900">Viewer (ReadOnly)</option>
            </select>
          </div>

          {/* Execute Action Button */}
          <button
            onClick={handleExecute}
            disabled={executing}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
          >
            {executing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Executing Sandbox Script...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                <span>Execute Tool via MCP</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Console Stream Output */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Sandbox Execution Console</h3>
            </div>

            {executionStatus && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                executionStatus === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                STATUS: {executionStatus}
              </span>
            )}
          </div>

          <div className="terminal-window p-4 rounded-xl text-xs flex-1 min-h-[320px] max-h-[420px] overflow-y-auto space-y-1">
            {consoleOutput ? (
              <pre className="text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                {consoleOutput}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono space-y-2 py-16">
                <Terminal className="w-8 h-8 text-slate-700 animate-pulse" />
                <span>Select a tool on the left and click "Execute Tool via MCP" to stream live execution logs.</span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
