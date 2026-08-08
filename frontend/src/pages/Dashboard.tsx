import React, { useEffect, useState } from 'react';
import { 
  ArrowRight, ShieldAlert, Zap, Clock, Activity, ChevronRight, Edit3
} from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import type { Incident } from '../types';
import { GlobeGraphic } from '../components/GlobeGraphic';
import { GlobalHeatmap } from '../components/GlobalHeatmap';
import { EditIncidentModal } from '../components/EditIncidentModal';

interface DashboardProps {
  onSelectIncident: (id: string) => void;
  onOpenCreateModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectIncident, onOpenCreateModal, onNavigateTab }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedEditIncident, setSelectedEditIncident] = useState<Incident | null>(null);

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data.incidents);
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  // MTTR Chart Dual Line Data matching screenshot
  const mttrData = [
    { time: '10:00 AM', Manual: 50, AISystem: 8 },
    { time: '10:15 AM', Manual: 38, AISystem: 7 },
    { time: '10:30 AM', Manual: 22, AISystem: 5 },
    { time: '10:45 AM', Manual: 12, AISystem: 4.8 },
    { time: '11:00 AM', Manual: 8, AISystem: 4.2 },
  ];

  // Incidents By Category Donut Data
  const categoryData = [
    { name: 'Application', value: 40, color: '#38bdf8' },
    { name: 'Database', value: 20, color: '#c084fc' },
    { name: 'Infrastructure', value: 20, color: '#f59e0b' },
    { name: 'Network', value: 10, color: '#ef4444' },
    { name: 'Other', value: 10, color: '#10b981' },
  ];

  // AI Resolution Outcome Donut Data
  const outcomeData = [
    { name: 'Auto-Heal Executed', value: 45, color: '#10b981' },
    { name: 'AI Recommended', value: 35, color: '#38bdf8' },
    { name: 'Human Resolved', value: 15, color: '#f59e0b' },
    { name: 'Escalated', value: 5, color: '#ef4444' },
  ];

  const recentIncidentsList = incidents.length > 0 ? incidents : [
    { id: 'INC-1024', title: 'Payment API Down', service: 'Payment Gateway', priority: 'P1', status: 'Investigating', confidence: 92, age: '2m ago' },
    { id: 'INC-1023', title: 'DB Connection Pool Exhausted', service: 'User DB Cluster', priority: 'P2', status: 'Analyzing', confidence: 87, age: '15m ago' },
    { id: 'INC-1022', title: 'Email Service Latency High', service: 'Mail Service', priority: 'P3', status: 'Pending', confidence: 78, age: '32m ago' },
    { id: 'INC-1021', title: 'Cache Hit Ratio Dropped', service: 'Redis Cluster', priority: 'P4', status: 'Pending', confidence: 64, age: '1h ago' },
    { id: 'INC-1020', title: 'Authentication Failures Spike', service: 'Auth Service', priority: 'P2', status: 'Resolved', confidence: 93, age: '2h ago' },
  ];

  return (
    <div className="space-y-5 pb-12">
      
      {/* 1. HERO MISSION CONTROL CARD */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-[#0b1329] via-[#0b1736] to-[#070b14]">
        
        {/* Left Column: Mission Control Header */}
        <div className="space-y-3 max-w-xl z-10">
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>MISSION CONTROL</span>
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            Autonomous. Intelligent. Always On.
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Multi-agent AI system that triages, analyzes, and resolves IT incidents with speed, accuracy, and confidence.
          </p>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => onNavigateTab('copilot')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 shadow-lg shadow-emerald-600/30 transition-all transform active:scale-95"
            >
              <span>Explore System</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-all"
            >
              <span>Report Incident</span>
            </button>
          </div>
        </div>

        {/* Center: Glowing 3D Wireframe Cyber Globe */}
        <div className="z-10 flex items-center justify-center my-2 lg:my-0">
          <GlobeGraphic />
        </div>

        {/* Right Column: Mini Stat Cards Grid */}
        <div className="grid grid-cols-2 gap-3 z-10 w-full lg:w-auto">
          
          <div className="glass-card rounded-xl p-3 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Incidents</span>
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">{incidents.length || 5}</div>
            <div className="w-full h-1 bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 w-3/4" />
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Critical Incidents</span>
              </span>
            </div>
            <div className="text-xl font-extrabold text-white font-mono">4</div>
            <div className="w-full h-1 bg-amber-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 w-4/5" />
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>Auto-Heal Success</span>
              </span>
            </div>
            <div className="text-xl font-extrabold text-yellow-400 font-mono">91.2%</div>
            <div className="w-full h-1 bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-400 w-[91%]" />
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>MTTR Today</span>
              </span>
            </div>
            <div className="text-xl font-extrabold text-cyan-400 font-mono">4.2 min</div>
            <div className="w-full h-1 bg-cyan-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 w-1/2" />
            </div>
          </div>

        </div>

      </div>

      {/* 2. PRIORITY SNAPSHOT GRID */}
      <div className="space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">PRIORITY SNAPSHOT</div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="glass-card rounded-2xl p-4 border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-slate-900/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase">
                P1 CRITICAL
              </span>
              <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white font-mono">4</span>
              <span className="text-xs text-rose-400/90 font-medium">Requires Immediate Action</span>
            </div>

            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1 pt-1"
            >
              <span>View Incidents</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase">
                P2 HIGH
              </span>
              <Activity className="w-4 h-4 text-amber-400" />
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white font-mono">1</span>
              <span className="text-xs text-amber-400/90 font-medium">High Priority</span>
            </div>

            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1 pt-1"
            >
              <span>View Incidents</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-slate-900/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 uppercase">
                P3 MEDIUM
              </span>
              <Activity className="w-4 h-4 text-yellow-400" />
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white font-mono">1</span>
              <span className="text-xs text-yellow-400/90 font-medium">Medium Priority</span>
            </div>

            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-[11px] font-semibold text-yellow-400 hover:text-yellow-300 flex items-center space-x-1 pt-1"
            >
              <span>View Incidents</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 to-slate-900/60 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 uppercase">
                P4 LOW
              </span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-white font-mono">0</span>
              <span className="text-xs text-cyan-400/90 font-medium">Low Priority</span>
            </div>

            <button
              onClick={() => onNavigateTab('incidents')}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 pt-1"
            >
              <span>View Incidents</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* 3. TRIPLE ANALYTICS CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Chart 1: MTTR TREND */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">MTTR TREND (MINUTES)</h3>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center space-x-1 text-purple-400">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Manual</span>
              </span>
              <span className="flex items-center space-x-1 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>AI System</span>
              </span>
            </div>
          </div>

          <div className="absolute top-12 right-12 z-10 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold shadow-lg">
            ✓ 91.3% improvement with AI system
          </div>

          <div className="h-44 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mttrData}>
                <defs>
                  <linearGradient id="manualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="Manual" stroke="#a855f7" strokeWidth={2} fill="url(#manualGrad)" />
                <Area type="monotone" dataKey="AISystem" stroke="#10b981" strokeWidth={2} fill="url(#aiGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: CATEGORY */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">INCIDENTS BY CATEGORY</h3>
            <span className="text-[10px] text-slate-400 font-mono">Last 7 Days</span>
          </div>

          <div className="h-44 w-full flex items-center justify-between">
            <div className="w-1/2 h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="text-[9px] text-slate-400 uppercase">Total</div>
                <div className="text-lg font-black text-white font-mono">5</div>
              </div>
            </div>

            <div className="w-1/2 space-y-1.5 text-[11px]">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="truncate max-w-[80px]">{cat.name}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-400">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 3: OUTCOME */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI RESOLUTION OUTCOME</h3>
            <span className="text-[10px] text-slate-400 font-mono">Last 7 Days</span>
          </div>

          <div className="h-44 w-full flex items-center justify-between">
            <div className="w-1/2 h-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={outcomeData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <div className="text-[9px] text-slate-400 uppercase">Total</div>
                <div className="text-lg font-black text-white font-mono">100%</div>
              </div>
            </div>

            <div className="w-1/2 space-y-1.5 text-[11px]">
              {outcomeData.map((out) => (
                <div key={out.name} className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5 text-slate-300">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: out.color }} />
                    <span className="truncate max-w-[85px]">{out.name}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-400">{out.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. RECENT INCIDENTS TABLE & GLOBAL HEATMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Table */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider">RECENT INCIDENTS</div>
            <button 
              onClick={() => onNavigateTab('incidents')}
              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-semibold tracking-wider uppercase">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">TITLE</th>
                  <th className="py-2.5 px-3">SERVICE</th>
                  <th className="py-2.5 px-3">PRIORITY</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">AI CONFIDENCE</th>
                  <th className="py-2.5 px-3 text-right">MANAGE / SOLVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentIncidentsList.map((inc: any) => {
                  let pBadge = 'badge-p3';
                  if (inc.priority === 'P1') pBadge = 'badge-p1';
                  else if (inc.priority === 'P2') pBadge = 'badge-p2';
                  else if (inc.priority === 'P4') pBadge = 'badge-p4';

                  let statusColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
                  if (inc.status === 'Resolved' || inc.status === 'RESOLVED') statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
                  else if (inc.status === 'Investigating' || inc.status === 'Analyzing') statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

                  const confVal = inc.ai_analysis?.confidence || inc.confidence || 85;

                  return (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td 
                        onClick={() => onSelectIncident(inc.id)}
                        className="py-2.5 px-3 font-mono font-bold text-rose-400 flex items-center space-x-1.5 cursor-pointer"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{inc.id}</span>
                      </td>

                      <td onClick={() => onSelectIncident(inc.id)} className="py-2.5 px-3 font-semibold text-white truncate max-w-[140px] cursor-pointer">
                        {inc.title}
                      </td>

                      <td className="py-2.5 px-3 text-slate-300 truncate max-w-[110px]">
                        {inc.service}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pBadge}`}>
                          {inc.priority}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${statusColor}`}>
                          {inc.status}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-emerald-400 text-[11px]">{confVal}%</span>
                          <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${confVal}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedEditIncident(inc)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/60 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center space-x-1 ml-auto transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Manage / Solve</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">GLOBAL INCIDENT HEATMAP</h3>
            <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] font-mono text-cyan-400 border border-slate-700">
              Live Map +
            </span>
          </div>

          <GlobalHeatmap />
        </div>

      </div>

      {/* Edit, Solve & Delete Modal */}
      <EditIncidentModal
        incident={selectedEditIncident}
        isOpen={!!selectedEditIncident}
        onClose={() => setSelectedEditIncident(null)}
        onUpdated={fetchIncidents}
      />

    </div>
  );
};
