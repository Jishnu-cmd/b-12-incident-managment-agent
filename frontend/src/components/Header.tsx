import React from 'react';
import { ShieldAlert, Search, Bell, Settings, Activity } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 px-6 py-2.5">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Logo & Subtitle */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              AI INCIDENT AGENT
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Autonomous Incident Response Command Center
            </p>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents, services, logs, docs..."
              className="w-full pl-9 pr-12 py-1.5 text-xs glass-input rounded-xl focus:ring-1 focus:ring-cyan-500"
            />
            <kbd className="absolute right-3 top-2 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-400 bg-slate-800 rounded border border-slate-700">
              ⌘ K
            </kbd>
          </div>
        </div>

        {/* Right Status Indicators & User Profile */}
        <div className="flex items-center space-x-5">
          
          {/* System Status Operational */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">System Status:</span>
            <span className="text-[11px] font-bold text-emerald-400">Operational</span>
          </div>

          {/* AI Confidence 91.2% Gauge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="transparent" />
                <circle cx="8" cy="8" r="6" stroke="#c084fc" strokeWidth="2" strokeDasharray={2 * Math.PI * 6} strokeDashoffset={2 * Math.PI * 6 * 0.088} fill="transparent" />
              </svg>
            </div>
            <span className="text-[11px] text-slate-400">AI Confidence</span>
            <span className="text-[11px] font-bold text-purple-300 font-mono">91.2%</span>
          </div>

          {/* Notifications & Settings Icons */}
          <div className="flex items-center space-x-2">
            <button className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 flex items-center justify-center">
                3
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center space-x-2.5 border-l border-slate-800 pl-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
              AD
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-white">Admin</div>
              <div className="text-[10px] text-slate-400">Incident Manager</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
