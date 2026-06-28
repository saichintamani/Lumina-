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

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-slate-800 rounded overflow-hidden cursor-pointer">
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }} 
        />
        <div className="absolute top-0 right-0 h-full w-full flex justify-between px-1">
          {PHASES.map((p, i) => (
            <div key={p} className="w-px h-full bg-slate-900/50" />
          ))}
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
        <span>T-MINUS</span>
        <span className="text-blue-400 font-bold">{currentPhase.replace('_', ' ')}</span>
        <span>T-PLUS</span>
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
      <div className="grid grid-cols-4 gap-2 mt-4">
        {PHASES.map((phase) => (
          <button
            key={phase}
            onClick={() => jumpToPhase(phase)}
            className={`text-[9px] font-mono p-1 rounded border transition-all truncate
              ${currentPhase === phase ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-500 hover:border-slate-600'}
            `}
          >
            {phase.replace('_', ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}
