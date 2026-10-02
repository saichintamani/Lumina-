"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

export default function ScaleMagnifier() {
  const [isOpen, setIsOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // For the demonstration, we'll use placeholder textures that look like lunar surfaces.
  // In a real app, these would be the actual TMC and OHRC orthomosaics.
  const tmcImage = "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1000&auto=format&fit=crop"; // Blurry/Generic
  const ohrcImage = "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop"; // Sharp/High Res

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/80 border border-cyan-500/50 hover:bg-cyan-900/50 text-cyan-400 px-4 py-2 rounded font-mono text-xs transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)] backdrop-blur-md"
      >
        <Maximize2 size={14} />
        <span>ACTIVATE SCALE-INVARIANCE LENS (TMC vs OHRC)</span>
      </button>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
      <div className="relative w-full max-w-5xl h-[80vh] bg-[#000510] border border-cyan-900 shadow-[0_0_50px_rgba(0,255,255,0.1)] rounded-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-12 border-b border-cyan-900 bg-[#000814] flex items-center justify-between px-4 shrink-0">
          <div>
            <h2 className="text-cyan-400 font-mono font-bold text-sm tracking-widest">SIH26166: SCALE INVARIANCE DEMONSTRATION</h2>
            <p className="text-[10px] text-slate-400 font-mono">Hover over the 5m/px TMC base map to reveal perfectly co-registered 0.25m/px OHRC imagery.</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-red-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Magnifier Area */}
        <div 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative flex-1 w-full bg-slate-900 overflow-hidden cursor-crosshair"
          style={{
            backgroundImage: `url(${tmcImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) contrast(1.2)' // Make it look like a raw lunar scan
          }}
        >
          {/* Base Map Label */}
          <div className="absolute top-4 left-4 bg-black/60 border border-slate-700 px-3 py-1 rounded">
            <span className="text-xs font-mono text-slate-300">TMC SENSOR (5m/pixel)</span>
          </div>

          {/* The Magnifying Glass (OHRC Image) */}
          <div 
            className="absolute pointer-events-none rounded-full border-2 border-cyan-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.4),_0_0_20px_#0ff]"
            style={{
              width: '250px',
              height: '250px',
              left: mousePos.x - 125,
              top: mousePos.y - 125,
              backgroundImage: `url(${ohrcImage})`,
              backgroundSize: `${containerRef.current ? containerRef.current.offsetWidth * 2 : 2000}px`,
              // The math here aligns the zoomed background perfectly with the base image, but scales it up
              backgroundPosition: `-${mousePos.x * 2 - 125}px -${mousePos.y * 2 - 125}px`,
              filter: 'grayscale(100%) contrast(1.5) brightness(1.2)', // Different processing to distinguish OHRC
              transition: 'none'
            }}
          >
            {/* Crosshair in the center of the magnifier */}
            <div className="absolute inset-0 flex items-center justify-center opacity-50">
              <div className="w-full h-[1px] bg-cyan-400 absolute"></div>
              <div className="h-full w-[1px] bg-cyan-400 absolute"></div>
            </div>
            <div className="absolute bottom-2 right-4 bg-black/80 px-2 py-0.5 rounded border border-cyan-800">
               <span className="text-[10px] font-mono text-cyan-400">OHRC (0.25m/px)</span>
            </div>
          </div>
        </div>
        
        {/* Footer Metrics */}
        <div className="h-10 border-t border-cyan-900 bg-[#000814] flex items-center justify-between px-4 shrink-0 font-mono text-[10px]">
          <div className="flex gap-6 text-slate-400">
            <span>COORDINATE: {(mousePos.x * 0.12).toFixed(2)}°S, {(mousePos.y * 0.15).toFixed(2)}°E</span>
            <span>SCALE RATIO: 1:20 (TMC:OHRC)</span>
            <span className="text-cyan-400">STATUS: CORE REGISTERED (LoFTR)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
