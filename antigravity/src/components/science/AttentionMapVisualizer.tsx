"use client";

import React, { useState, useRef } from 'react';
import { BrainCircuit, Eye } from 'lucide-react';

export default function AttentionMapVisualizer() {
  const [hoverPos, setHoverPos] = useState<{ x: number, y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Calculate percentage position
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setHoverPos({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <div className="bg-[#000814] border border-cyan-900/50 rounded-lg p-3">
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-cyan-400" />
          <h3 className="text-[10px] font-mono font-bold text-cyan-400 tracking-widest">LoFTR SELF-ATTENTION MAPS</h3>
        </div>
      </div>

      <div className="text-[9px] font-mono text-slate-400 mb-3 leading-relaxed">
        Hover over the source image (left) to visualize the Transformer's cross-attention heatmap on the target image (right). This demonstrates how the model achieves illumination invariance by focusing on structural context rather than pixel intensity.
      </div>

      <div className="flex gap-2">
        {/* Source Image */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-1/2 aspect-square bg-slate-900 rounded overflow-hidden cursor-crosshair border border-slate-700 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale brightness-75"
        >
          <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-cyan-500 rounded backdrop-blur">
            SOURCE (DAWN)
          </div>
          {hoverPos && (
            <div 
              className="absolute w-4 h-4 border border-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center bg-cyan-400/20"
              style={{ left: `${hoverPos.x}%`, top: `${hoverPos.y}%` }}
            >
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
            </div>
          )}
        </div>

        {/* Target Image with Heatmap */}
        <div className="relative w-1/2 aspect-square bg-slate-900 rounded overflow-hidden border border-slate-700 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Lunar_surface_by_Chandrayaan-2.jpg/640px-Lunar_surface_by_Chandrayaan-2.jpg')] bg-cover bg-center grayscale contrast-125 brightness-50">
          <div className="absolute top-1 left-1 bg-black/80 px-1 py-0.5 text-[8px] font-mono text-cyan-500 rounded backdrop-blur z-10">
            TARGET (DUSK)
          </div>
          
          {/* Attention Heatmap Overlay */}
          {hoverPos && (
            <div 
              className="absolute inset-0 z-0 opacity-60 mix-blend-screen transition-all duration-75"
              style={{
                background: `radial-gradient(circle at ${hoverPos.x}% ${hoverPos.y}%, rgba(255, 0, 0, 0.8) 0%, rgba(255, 255, 0, 0.5) 15%, rgba(0, 255, 0, 0.2) 30%, transparent 50%)`
              }}
            />
          )}

          {/* Peak Attention Marker */}
          {hoverPos && (
            <div 
              className="absolute w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 shadow-[0_0_10px_white]"
              style={{ left: `${hoverPos.x}%`, top: `${hoverPos.y}%` }}
            />
          )}

          {!hoverPos && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
              <div className="flex flex-col items-center text-cyan-500/50">
                <Eye size={24} className="mb-2" />
                <span className="text-[10px] font-mono">HOVER SOURCE TO ACTIVATE</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
