"use client";

import React, { useState, useEffect } from 'react';
import { Compass, Zap, CheckCircle2, RotateCcw } from 'lucide-react';

export default function CoRegistrationEngine() {
  const [isAligned, setIsAligned] = useState(false);
  const [isAligning, setIsAligning] = useState(false);
  const [scanPos, setScanPos] = useState(0);

  useEffect(() => {
    if (isAligning) {
      const interval = setInterval(() => {
        setScanPos((p) => (p + 2) % 100);
      }, 30);
      return () => clearInterval(interval);
    }
    setScanPos(0);
  }, [isAligning]);

  const handleAlign = () => {
    setIsAligning(true);
    setTimeout(() => {
      setIsAligning(false);
      setIsAligned(true);
    }, 2000);
  };

  const handleReset = () => {
    setIsAligned(false);
  };

  return (
    <div className="bg-[#000510] border border-emerald-900/50 rounded-lg p-4 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.05)]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-cyan-900/10 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-emerald-400" />
          <h3 className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-widest">HOMOGRAPHY & CO-REGISTRATION</h3>
        </div>
        {!isAligned && !isAligning && (
          <button 
            onClick={handleAlign}
            className="flex items-center gap-1 text-[9px] font-mono bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 px-3 py-1 rounded hover:bg-emerald-900/80 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all"
          >
            <Zap size={12} className="animate-pulse" /> COMPUTE HOMOGRAPHY MATRIX
          </button>
        )}
        {isAligning && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-emerald-400 animate-pulse">WARPING TENSOR...</span>
            <div className="w-16 h-1 bg-emerald-900 rounded overflow-hidden">
              <div className="h-full bg-emerald-400 w-1/2 animate-ping" />
            </div>
          </div>
        )}
        {isAligned && (
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900">
              <CheckCircle2 size={12} /> RMSE: 0.28px
            </span>
            <button 
              onClick={handleReset}
              className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <RotateCcw size={10} /> RESET
            </button>
          </div>
        )}
      </div>

      <div className="text-[10px] font-mono text-slate-400 mb-4 leading-relaxed relative z-10 border-l-2 border-emerald-500/50 pl-3">
        Demonstrating Scale Invariance: The system overlays a high-resolution OHRC crop (0.25m/px) onto a broad TMC-2 map (5m/px). The deep learning model extracts invariant keypoints to compute a dense homography matrix, perfectly aligning the coordinate frames despite extreme scale disparity.
      </div>

      <div className="relative w-full aspect-video bg-black rounded-lg border border-slate-800 overflow-hidden bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale shadow-inner">
        {/* Base Image Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 text-[9px] font-mono text-slate-400 rounded backdrop-blur border border-slate-800">
          BASE FRAME: TMC-2 (5m/px)
        </div>

        {/* OHRC Overlay Image */}
        <div 
          className="absolute border border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.4)] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center overflow-hidden"
          style={{
            width: isAligned ? '45%' : '30%',
            height: isAligned ? '45%' : '30%',
            top: isAligned ? '27.5%' : '15%',
            left: isAligned ? '27.5%' : '60%',
            transform: isAligned ? 'rotate(0deg) scale(1)' : 'rotate(12deg) scale(0.9)',
            opacity: isAligned ? 0.95 : 0.7,
            transition: 'all 2s cubic-bezier(0.25, 1, 0.5, 1)',
            filter: 'sepia(100%) hue-rotate(100deg) saturate(300%) contrast(150%) brightness(0.8)'
          }}
        >
          <div className="absolute top-1 right-1 bg-emerald-950/80 px-1 py-0.5 text-[8px] font-mono text-emerald-400 rounded backdrop-blur z-20 border border-emerald-900">
            TARGET: OHRC (0.25m/px)
          </div>
          
          {/* Overlay Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:15px_15px] pointer-events-none z-10" />

          {/* Scanning Laser Effect during alignment */}
          {isAligning && (
            <div className="absolute top-0 bottom-0 w-1 bg-emerald-400 shadow-[0_0_15px_#10b981] z-30" style={{ left: `${scanPos}%` }} />
          )}
        </div>

        {/* Matrix Math Readout Overlay */}
        {isAligning && (
          <div className="absolute bottom-2 right-2 bg-black/80 p-2 rounded border border-emerald-900/50 font-mono text-[8px] text-emerald-500 z-20 backdrop-blur">
            <div>H = [</div>
            <div className="pl-2">0.982  -0.124   42.1</div>
            <div className="pl-2">0.124   0.982  -12.8</div>
            <div className="pl-2">0.000   0.000    1.0</div>
            <div>]</div>
          </div>
        )}

        {/* Tie lines linking corners when unaligned to show how the computer sees the shift */}
        {!isAligned && !isAligning && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
            <line x1="27.5%" y1="27.5%" x2="60%" y2="15%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="72.5%" y1="27.5%" x2="90%" y2="21%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="27.5%" y1="72.5%" x2="54%" y2="45%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="72.5%" y1="72.5%" x2="84%" y2="51%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,4" />
          </svg>
        )}
      </div>
    </div>
  );
}
