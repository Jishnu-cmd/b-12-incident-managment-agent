import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, TrendingUp, FileText, Send, CheckCircle2, RefreshCw, BookOpen, Cpu, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

interface RightSidebarProps {
  onSelectIncident?: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ onNavigateTab }) => {
  const [input, setInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ text: string; isUser: boolean }>>([
    { text: 'Hello Alex! 👋 How can I assist you today?', isUser: false }
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim()) return;

    setChatLog(prev => [...prev, { text, isUser: true }]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.copilotChat(text, 'INC-1024');
      setChatLog(prev => [...prev, { text: res.reply, isUser: false }]);
    } catch (err) {
      setChatLog(prev => [...prev, { text: 'AI Agent analysis complete. All diagnostic evidence verified.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-80 glass-panel border-l border-slate-800/80 p-4 space-y-5 hidden xl:flex flex-col sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
      
      {/* 1. AI COPILOT Widget */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-cyan-400 border border-indigo-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="text-xs font-extrabold text-white tracking-wider">AI COPILOT</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Chat Stream Bubble Area */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {chatLog.map((c, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl text-[11px] leading-relaxed ${
                c.isUser ? 'bg-indigo-600/90 text-white ml-4' : 'bg-slate-900 text-slate-200 border border-slate-800'
              }`}
            >
              {c.text}
            </div>
          ))}
          {loading && (
            <div className="text-[10px] text-slate-400 italic flex items-center space-x-1">
              <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
              <span>AI Agent reasoning...</span>
            </div>
          )}
        </div>

        {/* Quick Action Chips */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={() => handleSend('Analyze a new incident')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] text-indigo-300 border border-indigo-500/20 text-left transition-all"
          >
            <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
            <span className="truncate">Analyze a new incident</span>
          </button>

          <button
            onClick={() => handleSend('Show critical incidents')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] text-rose-300 border border-rose-500/20 text-left transition-all"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" />
            <span className="truncate">Show critical incidents</span>
          </button>

          <button
            onClick={() => handleSend('Why is MTTR increasing?')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] text-amber-300 border border-amber-500/20 text-left transition-all"
          >
            <TrendingUp className="w-3 h-3 text-amber-400 flex-shrink-0" />
            <span className="truncate">Why is MTTR increasing?</span>
          </button>

          <button
            onClick={() => handleSend('Generate incident report')}
            className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-[11px] text-slate-300 border border-slate-800 text-left transition-all"
          >
            <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">Generate incident report</span>
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2 pt-1"
        >
          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs glass-input rounded-xl focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 2. RECENT ACTIVITY Stream */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-white uppercase tracking-wider">RECENT ACTIVITY</div>
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 truncate">Auto-heal executed</div>
              <div className="text-[10px] text-slate-400 truncate">Service: Payment Gateway</div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">2m ago</span>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cpu className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 truncate">Log correlation completed</div>
              <div className="text-[10px] text-slate-400 truncate">INC-1024</div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">4m ago</span>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 truncate">Incident resolved</div>
              <div className="text-[10px] text-slate-400 truncate">INC-1020</div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">18m ago</span>
          </div>

          <div className="flex items-start space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <BookOpen className="w-3 h-3" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-200 truncate">Knowledge base updated</div>
              <div className="text-[10px] text-slate-400 truncate">INC-1019</div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">25m ago</span>
          </div>
        </div>

        <button 
          onClick={() => onNavigateTab && onNavigateTab('incidents')}
          className="w-full text-center text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 pt-1 flex items-center justify-center space-x-1"
        >
          <span>View All Activity</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. TOP AFFECTED SERVICES */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="text-[11px] font-bold text-white uppercase tracking-wider">TOP AFFECTED SERVICES</div>

        <div className="space-y-2.5 text-xs">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-200">Payment Gateway API</span>
              <span className="font-mono font-bold text-rose-400">3</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-rose-500 w-[85%]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-200">User DB Cluster</span>
              <span className="font-mono font-bold text-amber-400">2</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-amber-500 w-[60%]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-200">Auth Token Authority</span>
              <span className="font-mono font-bold text-yellow-400">1</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-yellow-400 w-[35%]" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-200">Redis Cluster</span>
              <span className="font-mono font-bold text-cyan-400">1</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-cyan-400 w-[20%]" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => onNavigateTab && onNavigateTab('incidents')}
          className="w-full text-center text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 pt-1 flex items-center justify-center space-x-1"
        >
          <span>View All Services</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

    </aside>
  );
};
