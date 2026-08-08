import React from 'react';
import { 
  LayoutDashboard, ShieldAlert, Bot, Database, Eye, ChevronDown, 
  Wrench, Network, BarChart3, Bell, Settings
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidentCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, incidentCount = 5 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: incidentCount },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'observability', label: 'Observability', icon: Eye, hasDropdown: true },
    { id: 'sandbox', label: 'Automation', icon: Wrench },
    { id: 'cmdb', label: 'CMDB Topology', icon: Network },
    { id: 'evaluation', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 12 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-65px)]">
      
      {/* Navigation List */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'incidents' && activeTab === 'incident-detail');
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/30 to-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* AI SYSTEM HEALTH Card (Sidebar Bottom) */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3 mt-6">
        <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">AI SYSTEM HEALTH</div>
        
        <div className="flex items-center justify-center py-1">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.06)" strokeWidth="6" fill="transparent" />
              <circle 
                cx="40" 
                cy="40" 
                r="32" 
                stroke="#10b981" 
                strokeWidth="6" 
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - 0.98)}
                strokeLinecap="round"
                fill="transparent" 
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-base font-black text-emerald-400 font-mono">98%</div>
              <div className="text-[8px] text-emerald-400/90 font-medium">Healthy</div>
            </div>
          </div>
        </div>

        {/* Sub-Service Status List */}
        <div className="space-y-1.5 text-[11px] pt-1 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>LLM Service</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Healthy</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>RAG Service</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Healthy</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Vector DB</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Healthy</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Tool Sandbox</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Healthy</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Log Analyzer</span>
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Warning</span>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>CMDB Sync</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">Healthy</span>
          </div>
        </div>

      </div>

    </aside>
  );
};
