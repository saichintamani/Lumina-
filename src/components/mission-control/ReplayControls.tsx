"use client";

import React from 'react';
import { useCinematicEngine, MissionPhase } from '@/lib/memory/cinematicEngine';
import { Play, Pause, SkipForward, FastForward, Clock } from 'lucide-react';

const PHASES: MissionPhase[] = [
  'INITIALIZING',
  'ORBITAL_INSERTION',
  'RADAR_ACQUISITION',
  'TERRAIN_GENERATION',
  'AI_REASONING',
  'LANDING_SIMULATION',
  'TRAVERSE_PLANNING',
  'MISSION_SUCCESS'
];

export default function ReplayControls() {
  const { currentPhase, isPaused, togglePause, nextPhase, jumpToPhase, playbackSpeed, setSpeed } = useCinematicEngine();

  const currentIndex = PHASES.indexOf(currentPhase);
  const progress = (currentIndex / (PHASES.length - 1)) * 100;

  return (
    <div className="glass-panel p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold font-mono text-white flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> MISSION TIMELINE REPLAY
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setSpeed(playbackSpeed === 1 ? 2 : 1)}
            className={`px-2 py-1 rounded border text-xs font-mono transition-colors ${playbackSpeed === 2 ? 'bg-blue-500 text-white border-blue-400' : 'text-slate-400 border-slate-700 hover:text-white'}`}
          >
            2x SPEED
          </button>
        </div>
      </div>

      {/* Advanced Segments Progress Bar */}
      <div className="relative w-full h-4 rounded-full flex gap-1 p-1 bg-slate-900/50 border border-slate-800">
        {PHASES.map((phase, i) => {
          const isActive = i === currentIndex;
          const isPast = i < currentIndex;
          
          return (
            <div 
              key={phase}
              onClick={() => jumpToPhase(phase)}
              className="group relative flex-1 h-full rounded-full cursor-pointer transition-all duration-300"
            >
              {/* Background fill */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-500 ease-out ${isActive ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : isPast ? 'bg-blue-900/40' : 'bg-slate-800/50 group-hover:bg-slate-700'}`}
              />
              
              {/* Animated pulse indicator for active phase */}
              {isActive && (
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20" />
              )}
              
              {/* Hover Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <div className="bg-black/90 border border-slate-700 text-[10px] font-mono text-white px-2 py-1 rounded shadow-lg">
                  {phase.replace('_', ' ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[10px] font-mono px-2">
        <span className="text-slate-500">T-MINUS</span>
        <span className="text-blue-400 font-bold tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all">
          {currentPhase.replace('_', ' ')}
        </span>
        <span className="text-slate-500">T-PLUS</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <button 
          onClick={togglePause}
          className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
        >
          {isPaused ? <Play size={20} className="ml-1" /> : <Pause size={20} />}
        </button>

        <button 
          onClick={nextPhase}
          disabled={currentIndex === PHASES.length - 1}
          className="text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
        >
          <SkipForward size={20} />
        </button>
      </div>

      {/* Phase Jump Grid */}
      <div className="grid grid-cols-4 gap-2 mt-2">
        {PHASES.map((phase) => (
          <button
            key={phase}
            onClick={() => jumpToPhase(phase)}
            className={`relative overflow-hidden text-[9px] font-mono p-1.5 rounded border transition-all truncate
              ${currentPhase === phase 
                ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]' 
                : 'bg-black/40 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-300'}
            `}
          >
            {currentPhase === phase && (
              <div className="absolute left-0 top-0 w-0.5 h-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,1)]" />
            )}
            {phase.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
