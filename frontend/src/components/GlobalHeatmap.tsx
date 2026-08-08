import React from 'react';

export const GlobalHeatmap: React.FC = () => {
  return (
    <div className="relative w-full h-44 rounded-xl bg-[#030712] border border-slate-800/80 overflow-hidden flex items-center justify-center">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      />

      {/* World Map Outline SVG */}
      <svg className="w-full h-full opacity-30 text-slate-500" viewBox="0 0 1000 500" fill="currentColor">
        <path d="M150,150 Q200,100 300,150 T450,180 T600,140 T800,160 Q850,250 750,350 T500,400 T250,350 Z" opacity="0.3" />
        {/* Americas */}
        <path d="M180,120 Q220,140 250,220 T220,380 T160,250 Z" fill="currentColor" opacity="0.4" />
        {/* Europe & Africa */}
        <path d="M480,110 Q540,120 560,200 T530,350 T460,220 Z" fill="currentColor" opacity="0.4" />
        {/* Asia & Australia */}
        <path d="M650,100 Q780,110 820,240 T780,360 T680,220 Z" fill="currentColor" opacity="0.4" />
      </svg>

      {/* Pulsing Heatmap Dots matching screenshot */}
      <div className="absolute top-1/3 left-1/4 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-rose-500/20 animate-ping absolute" />
        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/50" />
      </div>

      <div className="absolute top-1/4 left-1/2 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-amber-500/20 animate-ping absolute" />
        <div className="w-4 h-4 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
      </div>

      <div className="absolute top-1/2 right-1/4 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-amber-500/20 animate-ping absolute" />
        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
      </div>

      <div className="absolute bottom-1/3 right-1/3 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 animate-ping absolute" />
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
      </div>

      {/* Legend Footer */}
      <div className="absolute bottom-2 left-3 flex items-center space-x-3 text-[10px] font-medium text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>High</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Medium</span>
        </span>
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Low</span>
        </span>
      </div>
    </div>
  );
};
