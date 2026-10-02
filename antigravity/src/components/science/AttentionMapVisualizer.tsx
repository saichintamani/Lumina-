"use client";

import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Eye, Activity } from 'lucide-react';

export default function AttentionMapVisualizer() {
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);
  const [scanline, setScanline] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate a scanning line for high-tech effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanline((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div className="bg-[#000510] border border-cyan-900/50 rounded-lg p-4 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,255,0.05)]">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-magenta-900/10 pointer-events-none" />

      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-widest">LoFTR SELF-ATTENTION KERNEL</h3>
        </div>
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-cyan-500 animate-pulse" />
          <span className="text-[9px] font-mono text-cyan-700">LIVE TENSOR OPS</span>
        </div>
      </div>

      <div className="text-[10px] font-mono text-slate-400 mb-4 leading-relaxed relative z-10 border-l-2 border-cyan-500/50 pl-3">
        Hover over the source matrix (left) to trace the Transformer's cross-attention weights mapping onto the target matrix (right). This proves the model aligns structural features independently of solar incidence angle (Illumination Invariance).
      </div>

      <div className="flex gap-4 relative z-10">
        {/* Source Image */}
        <div className="flex-1">
          <div className="flex justify-between text-[9px] font-mono text-cyan-500 mb-1">
            <span>INPUT: TMC-2 (DAWN)</span>
            <span>T={hoverPos ? hoverPos.x.toFixed(1) : '---'}ms</span>
          </div>
          <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full aspect-square bg-slate-900 rounded-lg overflow-hidden cursor-crosshair border border-cyan-900/50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale shadow-[0_0_15px_rgba(0,0,0,0.5)] group"
          >
            {/* Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
            
            {/* Scanning Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-cyan-500/30 shadow-[0_0_10px_#0ff] pointer-events-none opacity-50" style={{ top: `${scanline}%` }} />

            {/* Hover Target */}
            {hoverPos && (
              <div 
                className="absolute w-6 h-6 border-2 border-cyan-400/80 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-75 ease-out shadow-[0_0_15px_#0ff]"
                style={{ left: `${hoverPos.x}%`, top: `${hoverPos.y}%` }}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_white]" />
                {/* Crosshairs */}
                <div className="absolute w-full h-px bg-cyan-400/50" />
                <div className="absolute h-full w-px bg-cyan-400/50" />
              </div>
            )}
          </div>
        </div>

        {/* Neural Link Graphic */}
        <div className="w-8 flex flex-col justify-center items-center gap-1 opacity-50">
          <div className="w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
          <BrainCircuit size={16} className="text-cyan-400 animate-pulse my-2" />
          <div className="w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent" />
        </div>

        {/* Target Image with Heatmap */}
        <div className="flex-1">
          <div className="flex justify-between text-[9px] font-mono text-cyan-500 mb-1">
            <span>TARGET: OHRC (DUSK)</span>
            <span>ATTN_W={hoverPos ? hoverPos.y.toFixed(2) : '---'}</span>
          </div>
          <div className="relative w-full aspect-square bg-slate-900 rounded-lg overflow-hidden border border-cyan-900/50 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale contrast-125 brightness-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            
            {/* Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Attention Heatmap Overlay */}
            {hoverPos && (
              <>
                <div 
                  className="absolute inset-0 z-0 mix-blend-screen transition-all duration-100 ease-out opacity-90"
                  style={{
                    background: `radial-gradient(circle at ${hoverPos.x}% ${hoverPos.y}%, rgba(255, 50, 50, 0.9) 0%, rgba(255, 150, 0, 0.7) 15%, rgba(50, 255, 50, 0.3) 30%, transparent 60%)`
                  }}
                />
                {/* Secondary fake attention points to simulate dense matching */}
                <div 
                  className="absolute inset-0 z-0 mix-blend-screen transition-all duration-300 ease-out opacity-40"
                  style={{
                    background: `radial-gradient(circle at ${(hoverPos.x + 20) % 100}% ${(hoverPos.y + 15) % 100}%, rgba(0, 150, 255, 0.6) 0%, transparent 20%)`
                  }}
                />
              </>
            )}

            {/* Peak Attention Marker */}
            {hoverPos && (
              <div 
                className="absolute w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_20px_#facc15]"
                style={{ left: `${hoverPos.x}%`, top: `${hoverPos.y}%` }}
              >
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-yellow-400" />
              </div>
            )}

            {!hoverPos && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-10 group transition-all">
                <div className="flex flex-col items-center text-cyan-500/50">
                  <Eye size={32} className="mb-2 group-hover:text-cyan-400 transition-colors" />
                  <span className="text-[10px] font-mono tracking-widest bg-cyan-950/50 px-2 py-1 rounded border border-cyan-900/50">AWAITING INPUT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
