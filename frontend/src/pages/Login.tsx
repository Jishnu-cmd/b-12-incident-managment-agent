import React, { useState } from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        
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
            AetherPay Global Inc. Enterprise Authentication (Clerk OTP)
          </p>
        </div>

        {/* Verification Info Badge */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 text-xs space-y-1 text-slate-300">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Clerk User Verification</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Every user registration and login requires <strong className="text-cyan-300">Email OTP</strong> or <strong className="text-cyan-300">Phone Number SMS OTP</strong> verification. All logins are persistently saved to database.
          </p>
        </div>

        {/* Toggle Mode Bar */}
        <div className="flex items-center justify-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              !isSignUp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In with OTP
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              isSignUp ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register (Clerk OTP)
          </button>
        </div>

        {/* Clerk Auth Embedded UI Box */}
        <div className="flex justify-center">
          {!isSignUp ? (
            <SignIn 
              appearance={{
                elements: {
                  card: 'glass-panel bg-[#0b1329]/90 border border-slate-800 shadow-2xl rounded-3xl p-6 text-white',
                  headerTitle: 'text-white text-lg font-extrabold',
                  headerSubtitle: 'text-slate-400 text-xs',
                  socialButtonsBlockButton: 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800',
                  formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl py-2.5',
                  formFieldInput: 'glass-input bg-slate-900 border border-slate-800 text-white rounded-xl',
                  footerActionLink: 'text-cyan-400 hover:text-cyan-300'
                }
              }}
            />
          ) : (
            <SignUp 
              appearance={{
                elements: {
                  card: 'glass-panel bg-[#0b1329]/90 border border-slate-800 shadow-2xl rounded-3xl p-6 text-white',
                  headerTitle: 'text-white text-lg font-extrabold',
                  headerSubtitle: 'text-slate-400 text-xs',
                  socialButtonsBlockButton: 'bg-slate-900 border border-slate-800 text-white hover:bg-slate-800',
                  formButtonPrimary: 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold rounded-xl py-2.5',
                  formFieldInput: 'glass-input bg-slate-900 border border-slate-800 text-white rounded-xl',
                  footerActionLink: 'text-cyan-400 hover:text-cyan-300'
                }
              }}
            />
          )}
        </div>

        <div className="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-900">
          Vasireddy Venkatadri Institute of Technology (VVIT) • CSE AIML CSM-C12
        </div>

      </div>
    </div>
  );
};
