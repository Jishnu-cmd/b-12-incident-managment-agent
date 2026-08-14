import React, { useState } from 'react';
import { ShieldAlert, Mail, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('admin@aetherpay.com');
  const [password, setPassword] = useState('admin123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Lead SRE');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isRegistering) {
        await register(name, email, password, role, 'AetherPay Operations');
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setSubmitting(true);
    try {
      await login(demoEmail, demoPass);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-slate-800 space-y-6 relative z-10 shadow-2xl">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-xl shadow-cyan-500/20 flex items-center justify-center mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
            </div>
          </div>

          <h1 className="text-xl font-black tracking-tight text-white">
            AI Incident Agent Command Center
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            AetherPay Global Inc. Enterprise Authentication
          </p>
        </div>

        {/* Quick Demo Login Credentials Bar */}
        <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quick Enterprise Login</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@aetherpay.com', 'admin123')}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition-all text-left truncate"
            >
              👑 Alex Mercer (Manager)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('sre@aetherpay.com', 'sre123')}
              className="px-2.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition-all text-left truncate"
            >
              ⚡ Elena Rostova (Lead SRE)
            </button>
          </div>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex items-center justify-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              !isRegistering ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              isRegistering ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegistering && (
            <div>
              <label className="block text-xs text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs glass-input rounded-xl"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-300 mb-1">Enterprise Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                placeholder="name@aetherpay.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs glass-input rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-xs glass-input rounded-xl"
                required
              />
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs text-slate-300 mb-1">Team Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs glass-input rounded-xl bg-slate-900"
              >
                <option value="Lead SRE">Lead SRE</option>
                <option value="Incident Manager">Incident Manager</option>
                <option value="Engineer">DevOps / Software Engineer</option>
                <option value="Service Desk">Service Desk Specialist</option>
                <option value="Viewer">Operations Viewer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? 'Create AetherPay Account' : 'Authenticate & Enter Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-900">
          Vasireddy Venkatadri Institute of Technology (VVIT) • CSE AIML CSM-C12
        </div>

      </div>
    </div>
  );
};
