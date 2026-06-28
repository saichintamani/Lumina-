"use client";

import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { Target } from 'lucide-react';

export default function MiniMapHUD() {
  const { cameraPosition } = useTelemetryStore();
  
  // Normalize camera position for the map (-5 to 5 maps to 0% to 100%)
  const maxRange = 5;
  const xPercent = Math.max(0, Math.min(100, ((cameraPosition[0] + maxRange) / (maxRange * 2)) * 100));
  const zPercent = Math.max(0, Math.min(100, ((cameraPosition[2] + maxRange) / (maxRange * 2)) * 100));

  return (
    <div className="glass-panel p-3 flex flex-col gap-2 w-48 border-r-2 border-r-blue-500 shadow-[0_4px_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
      <h3 className="text-[10px] font-mono text-slate-400 font-bold tracking-widest flex items-center gap-1 z-10">
        <Target size={12} className="text-blue-400" />
        GLOBAL RADAR
      </h3>
      
      {/* Radar grid backdrop */}
      <div className="w-full h-32 bg-slate-900/80 rounded border border-slate-700 relative overflow-hidden flex items-center justify-center">
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
        
        {/* Radar sweeping arc */}
        <div className="absolute w-full h-full rounded-full border border-blue-500/20 animate-[spin_4s_linear_infinite]" 
             style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(59,130,246,0.4) 100%)' }} />

        {/* Camera footprint blip */}
        <div 
          className="absolute w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)] transition-all duration-300 z-10"
          style={{ left: `${xPercent}%`, top: `${zPercent}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75" />
        </div>
      </div>
      
      <div className="flex justify-between text-[8px] font-mono text-slate-500 z-10">
        <span>LAT: {(cameraPosition[0] * 10).toFixed(2)}</span>
        <span>LON: {(cameraPosition[2] * 10).toFixed(2)}</span>
      </div>
    </div>
  );
}
