"use client";

import React, { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { RadioTower, Activity, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useRoverControls } from '@/lib/controls/useRoverControls';

export function LatencyHUD() {
  const { latencyMode } = useTelemetryStore();
  const roverControls = useRoverControls();
  
  const [activeInput, setActiveInput] = useState(false);

  useEffect(() => {
    // Check if any key is currently pressed
    const isPressed = roverControls.forward || roverControls.backward || roverControls.left || roverControls.right;
    setActiveInput(isPressed);
  }, [roverControls]);

  if (!latencyMode) return null;

  return (
    <div className="absolute top-16 right-64 z-50 pointer-events-none font-mono flex flex-col gap-2">
      <div className="bg-[#0a0f1c]/90 border border-amber-500/50 p-4 rounded text-xs text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] w-64 backdrop-blur-sm">
        
        <div className="flex items-center gap-2 mb-3 border-b border-amber-500/30 pb-2">
          <RadioTower size={16} className="animate-pulse" />
          <span className="font-bold">DSN LINK ACTIVE</span>
        </div>

        <div className="flex justify-between items-center mb-1">
          <span className="text-amber-500/70">DISTANCE:</span>
          <span>384,400 KM</span>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <span className="text-amber-500/70">RTT LATENCY:</span>
          <span className="text-red-400 font-bold">2.60s</span>
        </div>

        {/* Uplink / Downlink Visualization */}
        <div className="space-y-4">
          {/* UPLINK */}
          <div className="flex items-center gap-3">
            <ArrowUpCircle size={14} className={activeInput ? "text-amber-400" : "text-slate-600"} />
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-amber-400 transition-all ${activeInput ? 'w-full duration-[1300ms] ease-linear' : 'w-0 duration-300'}`}
              />
            </div>
            <span className="text-[10px] w-8">1.3s</span>
          </div>

          {/* DOWNLINK */}
          <div className="flex items-center gap-3">
            <ArrowDownCircle size={14} className={activeInput ? "text-cyan-400" : "text-slate-600"} />
            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-cyan-400 transition-all ${activeInput ? 'w-full duration-[1300ms] ease-linear delay-[1300ms]' : 'w-0 duration-300'}`}
              />
            </div>
            <span className="text-[10px] w-8">1.3s</span>
          </div>
        </div>

        <div className="mt-4 text-[9px] text-amber-500/50 uppercase flex gap-2 items-center">
          <Activity size={10} />
          Buffering telemetry stream...
        </div>

      </div>
    </div>
  );
}
