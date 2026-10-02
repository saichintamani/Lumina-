"use client";

import React, { useState, useEffect } from 'react';
import { Layers, Maximize, Sun, GitCompare } from 'lucide-react';

type TestScenario = 'SCALE' | 'ILLUMINATION';

const KEYPOINTS_SCALE = [
  { a: [20, 30], b: [25, 35], conf: 0.98 },
  { a: [70, 20], b: [75, 25], conf: 0.95 },
  { a: [40, 60], b: [45, 65], conf: 0.91 },
  { a: [80, 80], b: [85, 85], conf: 0.88 },
  { a: [10, 85], b: [15, 90], conf: 0.85 },
];

const KEYPOINTS_ILLUM = [
  { a: [30, 40], b: [30, 40], conf: 0.99 },
  { a: [60, 30], b: [60, 30], conf: 0.94 },
  { a: [20, 70], b: [20, 70], conf: 0.92 },
  { a: [80, 60], b: [80, 60], conf: 0.89 },
  { a: [50, 80], b: [50, 80], conf: 0.97 },
];

export default function MatchingSandbox() {
  const [scenario, setScenario] = useState<TestScenario>('ILLUMINATION');
  const [confidenceFilter, setConfidenceFilter] = useState(0.8);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matches, setMatches] = useState(KEYPOINTS_ILLUM);

  const runModel = (type: TestScenario) => {
    setIsProcessing(true);
    setScenario(type);
    setTimeout(() => {
      setMatches(type === 'SCALE' ? KEYPOINTS_SCALE : KEYPOINTS_ILLUM);
      setIsProcessing(false);
    }, 1500);
  };

  const filteredMatches = matches.filter(m => m.conf >= confidenceFilter);

  return (
    <div className="bg-[#000814] border border-cyan-900/50 rounded-lg p-3 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <GitCompare size={14} className="text-cyan-400" />
          <h3 className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest">LoFTR INVARIANCE SANDBOX</h3>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <button 
          onClick={() => runModel('ILLUMINATION')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[9px] font-mono border transition-all ${
            scenario === 'ILLUMINATION' 
              ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50' 
              : 'bg-black/50 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Sun size={12} /> ILLUMINATION TEST
        </button>
        <button 
          onClick={() => runModel('SCALE')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-[9px] font-mono border transition-all ${
            scenario === 'SCALE' 
              ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500/50' 
              : 'bg-black/50 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Maximize size={12} /> SCALE TEST
        </button>
      </div>

      <div className="relative w-full h-32 bg-black rounded border border-slate-800 flex overflow-hidden">
        {/* Left Image (Reference) */}
        <div className="w-1/2 h-full border-r border-slate-800 relative bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale opacity-70">
          <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-cyan-500 rounded backdrop-blur">
            {scenario === 'SCALE' ? 'TMC-2 (5m/px)' : 'L2 (Morning 12°)'}
          </div>
          {filteredMatches.map((m, i) => (
            <div key={`l-${i}`} className="absolute w-1.5 h-1.5 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_#22c55e]" style={{ left: `${m.a[0]}%`, top: `${m.a[1]}%` }} />
          ))}
        </div>

        {/* Right Image (Target) */}
        <div className={`w-1/2 h-full relative bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale transition-all duration-1000 ${
          scenario === 'SCALE' ? 'scale-125 opacity-90' : 'brightness-50 contrast-125'
        }`}>
          <div className="absolute top-1 right-1 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-cyan-500 rounded backdrop-blur z-10">
            {scenario === 'SCALE' ? 'OHRC (0.25m/px)' : 'L2 (Evening 165°)'}
          </div>
          {filteredMatches.map((m, i) => (
            <div key={`r-${i}`} className="absolute w-1.5 h-1.5 bg-green-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_#22c55e]" style={{ left: `${m.b[0]}%`, top: `${m.b[1]}%` }} />
          ))}
        </div>

        {/* Tie Lines Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {!isProcessing && filteredMatches.map((m, i) => (
            <line 
              key={`line-${i}`}
              x1={`${m.a[0] / 2}%`} 
              y1={`${m.a[1]}%`} 
              x2={`${50 + (m.b[0] / 2)}%`} 
              y2={`${m.b[1]}%`} 
              stroke="#22c55e" 
              strokeWidth="1" 
              strokeOpacity={m.conf}
            />
          ))}
        </svg>

        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30">
            <Layers size={20} className="text-cyan-500 animate-spin mb-2" />
            <div className="text-[10px] font-mono text-cyan-400">COMPUTING TRANSFORM...</div>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-[8px] font-mono text-slate-500 mb-1">
          <span>CONFIDENCE THRESHOLD</span>
          <span>{confidenceFilter.toFixed(2)}</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={confidenceFilter} 
          onChange={(e) => setConfidenceFilter(parseFloat(e.target.value))}
          className="w-full accent-cyan-500"
        />
        <div className="flex justify-between mt-2 text-[9px] font-mono">
          <span className="text-slate-400">Total Keypoints Found:</span>
          <span className="text-cyan-400 font-bold">{isProcessing ? '--' : 2134}</span>
        </div>
        <div className="flex justify-between mt-1 text-[9px] font-mono">
          <span className="text-slate-400">Inliers (Conf &gt; {confidenceFilter.toFixed(2)}):</span>
          <span className="text-green-400 font-bold">{isProcessing ? '--' : filteredMatches.length * 420}</span>
        </div>
      </div>
    </div>
  );
}
