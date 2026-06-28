"use client";

import React, { useEffect } from 'react';
import { usePresentationStore, PRESENTATION_SLIDES } from '@/lib/presentation/usePresentationStore';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { Play, Pause, SkipBack, SkipForward, X, Presentation } from 'lucide-react';

export default function DemonstrationMode() {
  const { isActive, currentSlideIndex, togglePresentationMode, nextSlide, prevSlide, jumpToSlide } = usePresentationStore();
  const { jumpToPhase } = useCinematicEngine();
  const { cameraMode, toggleCameraMode, latencyMode, toggleLatencyMode, swarmActive, toggleSwarm, triggerSolarFlare, resolveSolarFlare } = useTelemetryStore();

  const slide = PRESENTATION_SLIDES[currentSlideIndex];

  // Synchronize Simulation State with Presentation Slides
  useEffect(() => {
    if (!isActive) return;

    // A simple state machine that enforces the presentation narrative
    switch (slide.id) {
      case 'intro':
        jumpToPhase('INITIALIZING');
        // Reset everything
        if (cameraMode === 'FIRST_PERSON') toggleCameraMode();
        if (latencyMode) toggleLatencyMode();
        if (swarmActive) toggleSwarm();
        resolveSolarFlare();
        break;
      case 'problem':
        jumpToPhase('ORBITAL_INSERTION');
        break;
      case 'science':
        // The presenter will manually click the Science Workspace tab, but we can set the 3D phase
        jumpToPhase('TRAVERSE_PLANNING');
        break;
      case 'exploration':
        jumpToPhase('MANUAL_OVERRIDE');
        if (cameraMode !== 'FIRST_PERSON') toggleCameraMode();
        if (!latencyMode) toggleLatencyMode();
        break;
      case 'ai':
        // Emphasize the AI Orchestrator (maybe reset to orbit for clarity)
        jumpToPhase('MANUAL_OVERRIDE');
        if (cameraMode === 'FIRST_PERSON') toggleCameraMode();
        if (latencyMode) toggleLatencyMode();
        break;
      case 'scenario':
        triggerSolarFlare();
        break;
      case 'planning':
        resolveSolarFlare();
        jumpToPhase('TRAVERSE_PLANNING');
        if (!swarmActive) toggleSwarm();
        break;
      case 'results':
        jumpToPhase('MISSION_SUCCESS');
        break;
      case 'summary':
        // Grand finale view
        jumpToPhase('MISSION_SUCCESS');
        if (cameraMode === 'FIRST_PERSON') toggleCameraMode();
        break;
    }
  }, [currentSlideIndex, isActive]);

  if (!isActive) {
    return (
      <button 
        onClick={togglePresentationMode}
        className="fixed bottom-4 right-4 z-50 bg-slate-900/80 hover:bg-cyan-900/80 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 px-4 py-2 rounded-full flex items-center gap-2 transition-all backdrop-blur-sm shadow-lg group"
      >
        <Presentation size={16} />
        <span className="text-xs font-mono opacity-0 group-hover:opacity-100 w-0 group-hover:w-auto overflow-hidden transition-all duration-300">DEMO MODE</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[800px] bg-slate-950/90 border border-cyan-500/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex flex-col font-sans animate-in slide-in-from-bottom-8 duration-500">
      
      {/* Top Progress Bar */}
      <div className="h-1 w-full bg-slate-900 flex">
        {PRESENTATION_SLIDES.map((_, i) => (
          <div 
            key={i} 
            className={`flex-1 h-full transition-all duration-500 ${i <= currentSlideIndex ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]' : 'bg-transparent'}`}
          />
        ))}
      </div>

      <div className="flex p-6 gap-6">
        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-cyan-400 font-mono text-xs mb-2 tracking-widest uppercase">{slide.subtitle}</div>
          <h2 className="text-2xl font-bold text-white mb-3">{slide.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{slide.description}</p>
        </div>

        {/* Controls Area */}
        <div className="flex flex-col items-center justify-center gap-4 border-l border-slate-800 pl-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className="p-3 rounded-full bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>
            <div className="w-16 text-center font-mono text-slate-500 text-sm">
              {currentSlideIndex + 1} / {PRESENTATION_SLIDES.length}
            </div>
            <button 
              onClick={nextSlide}
              disabled={currentSlideIndex === PRESENTATION_SLIDES.length - 1}
              className="p-3 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-30 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
          </div>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={togglePresentationMode}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
