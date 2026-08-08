import React, { useState } from 'react';
import { Bot, Send, User } from 'lucide-react';
import { api } from '../services/api';

interface CopilotChatProps {
  selectedIncidentId?: string;
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ selectedIncidentId }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: `Hello! I am your AI Incident Management Copilot. I have context on incident ${selectedIncidentId || 'INC-1001'}. How can I assist your investigation today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { sender: 'user', text: textToSend, time: userTime }]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.copilotChat(textToSend, selectedIncidentId || 'INC-1001');
      const agentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [...prev, { sender: 'agent', text: res.reply, time: agentTime }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'agent', text: 'Error connecting to AI Copilot service.', time: userTime }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-cyan-400 border border-indigo-500/20">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Incident Copilot Assistant</h2>
            <p className="text-xs text-slate-400">Ask natural language questions regarding logs, metrics, CMDB dependencies, or RCA.</p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-mono">
          Context: {selectedIncidentId || 'INC-1001 (Payment API)'}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 font-medium">Quick Prompts:</span>
        <button
          onClick={() => handleSend('Why is this incident happening? Explain root cause.')}
          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 border border-slate-800 transition-all"
        >
          Why is this incident happening?
        </button>
        <button
          onClick={() => handleSend('What logs support this root cause diagnosis?')}
          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-indigo-300 border border-slate-800 transition-all"
        >
          Show supporting log traces
        </button>
        <button
          onClick={() => handleSend('What is the recommended auto-healing solution?')}
          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-emerald-300 border border-slate-800 transition-all"
        >
          What is the recommended solution?
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 min-h-[420px] max-h-[500px] overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              m.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-900 border border-cyan-500/30 text-cyan-400'
            }`}>
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
              m.sender === 'user'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                : 'bg-slate-900/90 text-slate-200 border border-slate-800'
            }`}>
              <div className="whitespace-pre-wrap">{m.text}</div>
              <div className={`text-[10px] mt-1.5 ${m.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'}`}>
                {m.time}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>AI Copilot reasoning...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-3"
      >
        <input
          type="text"
          placeholder="Ask AI Copilot about root cause, log evidence, metrics, or remediation steps..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-3 text-xs glass-input rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
};
