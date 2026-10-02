"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle, Activity } from 'lucide-react';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';

export default function LatencyMiniGame() {
  const { latencyMode, toggleLatencyMode } = useTelemetryStore();
  const [packetQueue, setPacketQueue] = useState<number[]>([]);
  const [keysPressed, setKeysPressed] = useState<string[]>([]);

  // Track keystrokes to show latency in action
  useEffect(() => {
    if (!latencyMode) {
      setPacketQueue([]);
      setKeysPressed([]);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setKeysPressed(prev => Array.from(new Set([...prev, e.key])));
        // Add a packet to the queue (delay 2600ms)
        const id = Date.now();
        setPacketQueue(prev => [...prev, id]);
        
        setTimeout(() => {
          setPacketQueue(prev => prev.filter(p => p !== id));
        }, 2600);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeysPressed(prev => prev.filter(k => k !== e.key));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [latencyMode]);

  return (
    <div className={`border rounded-lg overflow-hidden transition-colors duration-500 ${latencyMode ? 'bg-[#1a0f0f] border-red-900/50' : 'bg-[#030712] border-slate-800'}`}>
      <div className={`flex items-center justify-between px-3 py-2 border-b ${latencyMode ? 'bg-red-950/30 border-red-900/50' : 'border-slate-800'}`}>
        <div className="flex items-center gap-2">
          {latencyMode ? (
            <WifiOff size={14} className="text-red-500 animate-pulse" />
          ) : (
            <Wifi size={14} className="text-emerald-500" />
          )}
          <span className={`text-[10px] font-mono font-bold tracking-widest ${latencyMode ? 'text-red-400' : 'text-slate-300'}`}>
            EARTH-MOON COMMS
          </span>
        </div>
        <button
          onClick={toggleLatencyMode}
          className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
            latencyMode 
              ? 'bg-red-900/50 text-red-200 border-red-700 hover:bg-red-800' 
              : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50 hover:bg-emerald-900/50'
          }`}
        >
          {latencyMode ? 'DISABLE 2.6s LATENCY' : 'ENABLE 2.6s LATENCY'}
        </button>
      </div>

      <div className="p-3">
        {!latencyMode ? (
          <div className="text-[10px] font-mono text-slate-500 text-center py-4">
            Direct link active. Zero latency.<br/>
            Click to enable speed-of-light delay (2.6s Round Trip).
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between bg-red-950/20 border border-red-900/30 p-2 rounded">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle size={12} />
                <span className="text-[9px] font-mono">2.6s ROUND-TRIP DELAY ACTIVE</span>
              </div>
              <div className="text-[12px] font-mono font-bold text-red-500 font-mono flex items-center gap-1">
                2600 <span className="text-[9px]">MS</span>
              </div>
            </div>

            {/* Input display */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-[8px] font-mono text-red-500/70 mb-1">LOCAL KEYSTROKES (EARTH)</div>
                <div className="flex gap-1 h-6">
                  {keysPressed.length > 0 ? keysPressed.map(k => (
                    <div key={k} className="w-6 h-6 bg-red-900/50 border border-red-700 rounded flex items-center justify-center text-[10px] font-mono text-red-200 uppercase">
                      {k.replace('Arrow', '')}
                    </div>
                  )) : (
                    <div className="text-[9px] font-mono text-red-900/50 flex items-center h-full">WAITING FOR INPUT (W,A,S,D)...</div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-[8px] font-mono text-red-500/70 mb-1">PACKETS IN TRANSIT (SPACE)</div>
                <div className="flex gap-1 justify-end h-4">
                  {packetQueue.slice(-10).map((p, i) => (
                    <div key={p} className="w-1.5 h-full bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                  {packetQueue.length === 0 && <span className="text-[9px] font-mono text-red-900/50">QUEUE EMPTY</span>}
                </div>
              </div>
            </div>
            
            <div className="mt-1 flex items-center justify-between text-[8px] font-mono text-red-500/50">
              <span>Drive rover to see lag.</span>
              <Activity size={10} className="animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
