import React from 'react';

export const GlobeGraphic: React.FC = () => {
  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      {/* Outer Pulse Ring */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
      <div className="absolute -inset-2 rounded-full border border-emerald-500/10 animate-spin opacity-40" style={{ animationDuration: '20s' }} />

      {/* SVG Cyber Wireframe Globe */}
      <svg className="w-40 h-40 transform animate-spin" style={{ animationDuration: '35s' }} viewBox="0 0 100 100">
        <defs>
          <radialGradient id="globeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Globe Base Circle */}
        <circle cx="50" cy="50" r="45" fill="url(#globeGrad)" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.6" strokeDasharray="3 2" />

        {/* Latitude Lines */}
        <ellipse cx="50" cy="50" rx="45" ry="12" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.7" />
        <ellipse cx="50" cy="50" rx="45" ry="26" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.6" />
        <ellipse cx="50" cy="50" rx="45" ry="38" fill="none" stroke="#06b6d4" strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Longitude Lines */}
        <ellipse cx="50" cy="50" rx="12" ry="45" fill="none" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.7" />
        <ellipse cx="50" cy="50" rx="26" ry="45" fill="none" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.6" />
        <ellipse cx="50" cy="50" rx="38" ry="45" fill="none" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.5" />

        {/* Pulsing Node Markers */}
        <circle cx="30" cy="35" r="2" fill="#ef4444" className="animate-pulse" />
        <circle cx="65" cy="40" r="2.5" fill="#f59e0b" className="animate-pulse" />
        <circle cx="45" cy="65" r="2" fill="#10b981" className="animate-pulse" />
        <circle cx="75" cy="60" r="1.8" fill="#38bdf8" className="animate-pulse" />
      </svg>
    </div>
  );
};
