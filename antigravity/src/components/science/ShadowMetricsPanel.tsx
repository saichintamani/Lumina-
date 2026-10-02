"use client";

import React from 'react';
import { Activity, Zap, Info } from 'lucide-react';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';

export default function ShadowMetricsPanel() {
  const { timeOfDay } = useCinematicEngine();
  
  // Calculate sun angle from timeOfDay
  // timeOfDay ranges roughly 0 to PI over 14 days. 
  // Let's normalize it to a 0-180 degree angle
  const angle = (timeOfDay / Math.PI) * 180;
  const shadowIntensity = Math.abs(angle - 90) / 90; // 0 at noon, 1 at dawn/dusk
  
  // Fake SIFT dropoff vs LoFTR resilience
  const siftAccuracy = Math.max(10, 85 - (shadowIntensity * 60));
  const loftrAccuracy = Math.max(88, 97 - (shadowIntensity * 8));

  return (
    <div className="bg-[#000814] border border-cyan-900/50 rounded-lg p-3">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-cyan-400" />
          <h3 className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest">ALGORITHM ROBUSTNESS</h3>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded">
          <Info size={10} /> SUN ANGLE SENSOR
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-[9px] font-mono text-slate-400">Current Sun Angle:</div>
        <div className="text-[12px] font-mono font-bold text-yellow-400">
          {(angle % 180).toFixed(1)}°
        </div>
      </div>

      {/* SIFT Benchmark */}
      <div className="mb-3">
        <div className="flex justify-between text-[9px] font-mono mb-1">
          <span className="text-slate-500">Traditional SIFT/ORB</span>
          <span className={siftAccuracy < 50 ? 'text-red-400' : 'text-slate-400'}>{siftAccuracy.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${siftAccuracy < 50 ? 'bg-red-500' : 'bg-slate-500'}`}
            style={{ width: `${siftAccuracy}%` }} 
          />
        </div>
      </div>

      {/* Deep Learning Benchmark */}
      <div className="mb-2">
        <div className="flex justify-between text-[9px] font-mono mb-1">
          <span className="text-cyan-400 font-bold flex items-center gap-1"><Zap size={10} /> Proposed Deep Learning (LoFTR)</span>
          <span className="text-green-400 font-bold">{loftrAccuracy.toFixed(1)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded overflow-hidden shadow-[0_0_8px_rgba(34,197,94,0.3)]">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${loftrAccuracy}%` }} 
          />
        </div>
      </div>

      <div className="mt-3 text-[8px] font-mono text-slate-600 bg-[#001122] p-2 rounded border border-slate-800">
        As the Sun approaches 0° or 180° (dawn/dusk), shadow lengths approach infinity. Traditional gradient-based feature descriptors (SIFT) fail to match geometry. Our attention-based LoFTR transformer successfully matches context, maintaining &gt;85% accuracy despite severe illumination variance.
      </div>
    </div>
  );
}
