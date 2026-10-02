"use client";

import React, { useState } from 'react';
import { Compass, Zap, CheckCircle2 } from 'lucide-react';

export default function CoRegistrationEngine() {
  const [isAligned, setIsAligned] = useState(false);
  const [isAligning, setIsAligning] = useState(false);

  const handleAlign = () => {
    setIsAligning(true);
    setTimeout(() => {
      setIsAligning(false);
      setIsAligned(true);
    }, 1500);
  };

  const handleReset = () => {
    setIsAligned(false);
  };

  return (
    <div className="bg-[#000814] border border-cyan-900/50 rounded-lg p-3">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Compass size={14} className="text-cyan-400" />
          <h3 className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest">CO-REGISTRATION & ALIGNMENT</h3>
        </div>
        {!isAligned && !isAligning && (
          <button 
            onClick={handleAlign}
            className="flex items-center gap-1 text-[9px] font-mono bg-cyan-900/30 text-cyan-400 border border-cyan-900/50 px-2 py-0.5 rounded hover:bg-cyan-900/50 transition-colors"
          >
            <Zap size={10} /> COMPUTE HOMOGRAPHY
          </button>
        )}
        {isAligning && (
          <span className="text-[9px] font-mono text-cyan-400 animate-pulse">WARPING IMAGE...</span>
        )}
        {isAligned && (
          <div className="flex gap-2 items-center">
            <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
              <CheckCircle2 size={10} /> RMSE: 0.42px
            </span>
            <button 
              onClick={handleReset}
              className="text-[9px] font-mono text-slate-500 hover:text-slate-300 underline"
            >
              RESET
            </button>
          </div>
        )}
      </div>

      <div className="text-[9px] font-mono text-slate-400 mb-3 leading-relaxed">
        Demonstrating Scale Invariance: Overlaying a high-resolution OHRC image (0.25m/px) onto a base TMC-2 map (5m/px). The system computes a homography matrix from the matched keypoints to perfectly align the two coordinate frames.
      </div>

      <div className="relative w-full h-40 bg-black rounded border border-slate-800 overflow-hidden bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale opacity-80">
        <div className="absolute top-2 left-2 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-cyan-500 rounded backdrop-blur">
          BASE: TMC-2 (5m/px)
        </div>

        {/* OHRC Overlay Image */}
        <div 
          className="absolute border-2 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center contrast-125"
          style={{
            // When unaligned: small, rotated, shifted
            // When aligned: takes up the middle section perfectly overlaid
            width: isAligned ? '50%' : '30%',
            height: isAligned ? '50%' : '30%',
            top: isAligned ? '25%' : '10%',
            left: isAligned ? '25%' : '60%',
            transform: isAligned ? 'rotate(0deg)' : 'rotate(15deg)',
            opacity: isAligned ? 0.9 : 0.6,
            transition: 'all 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: 'sepia(100%) hue-rotate(80deg) saturate(300%)' // Greenish tint to distinguish it
          }}
        >
          <div className="absolute top-1 right-1 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-emerald-400 rounded backdrop-blur z-10">
            OVERLAY: OHRC (0.25m/px)
          </div>
          
          {/* Show grid lines to emphasize it's an overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.2)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
        </div>

        {/* Tie lines linking corners when unaligned to show how the computer sees the shift */}
        {!isAligned && !isAligning && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-50">
            <line x1="25%" y1="25%" x2="60%" y2="10%" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="75%" y1="25%" x2="90%" y2="18%" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="25%" y1="75%" x2="52%" y2="40%" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
            <line x1="75%" y1="75%" x2="82%" y2="48%" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
          </svg>
        )}
      </div>
    </div>
  );
}
