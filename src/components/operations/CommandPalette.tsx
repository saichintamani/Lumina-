"use client";

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useCinematicEngine, MissionPhase } from '@/lib/memory/cinematicEngine';
import { useMissionMemory } from '@/lib/memory/missionMemory';
import { useScenarioManager } from '@/lib/memory/scenarioManager';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { Terminal, Clock, Activity, Cpu, X, FastForward, Navigation, Camera } from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { jumpToPhase, currentPhase } = useCinematicEngine();
  const { recordDecision, decisionHistory } = useMissionMemory();
  const { activeScenarioId, scenarios } = useScenarioManager();
  const { triggerSolarFlare, resolveSolarFlare, spaceWeather, swarmActive, toggleSwarm, toggleCameraMode, latencyMode, toggleLatencyMode } = useTelemetryStore();

  // Toggle the menu when Cmd+K or Ctrl+K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleExport = () => {
    const activeScenario = scenarios.find(s => s.id === activeScenarioId);
    const exportData = {
      timestamp: new Date().toISOString(),
      activeScenario,
      decisionHistory
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mission_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#060b19] border border-slate-700 rounded-lg shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command label="Command Menu" className="flex flex-col w-full h-full">
          
          {/* Header Input */}
          <div className="flex items-center border-b border-slate-700 px-3">
            <Terminal size={18} className="text-slate-400 mr-2" />
            <Command.Input 
              autoFocus 
              placeholder="Type a command or search logs..." 
              className="flex-1 bg-transparent border-none text-white p-4 focus:outline-none placeholder-slate-500 font-mono text-sm"
            />
            <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>

          {/* Search List */}
          <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-slate-500 font-mono">
              No results found.
            </Command.Empty>

            <Command.Group heading="Telemetry & Operations" className="text-xs font-mono text-slate-500 mb-2 px-2 py-1">
              <Command.Item 
                onSelect={handleExport}
                className="flex items-center px-2 py-3 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-mono text-sm"
              >
                <Cpu size={14} className="mr-3 text-emerald-400" /> Export Mission Logs (JSON)
              </Command.Item>

              <Command.Item 
                onSelect={() => { toggleCameraMode(); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-mono text-sm"
              >
                <Camera size={14} className="mr-3 text-amber-400" /> Toggle NavCam (First-Person View)
              </Command.Item>

              <Command.Item 
                onSelect={() => { toggleLatencyMode(); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-mono text-sm"
              >
                <Clock size={14} className="mr-3 text-red-400" /> {latencyMode ? 'Disable' : 'Enable'} Earth-Moon Latency Simulator
              </Command.Item>

              <Command.Item 
                onSelect={() => { toggleSwarm(); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-mono text-sm"
              >
                <FastForward size={14} className="mr-3 text-cyan-400" /> {swarmActive ? 'Recall' : 'Deploy'} Autonomous Scout Swarm
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Mission Phases" className="text-xs font-mono text-slate-500 mb-2 px-2 py-1">
              <Command.Item 
                onSelect={() => { jumpToPhase('ORBITAL_INSERTION'); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 cursor-pointer font-mono text-sm"
              >
                <Navigation size={14} className="mr-3" /> Jump to Orbital Insertion
              </Command.Item>
              <Command.Item 
                onSelect={() => { jumpToPhase('TERRAIN_GENERATION'); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 cursor-pointer font-mono text-sm"
              >
                <Activity size={14} className="mr-3" /> Jump to Terrain Generation
              </Command.Item>
              <Command.Item 
                onSelect={() => { jumpToPhase('TRAVERSE_PLANNING'); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 cursor-pointer font-mono text-sm"
              >
                <FastForward size={14} className="mr-3" /> Jump to Traverse Planning
              </Command.Item>
              <Command.Item 
                onSelect={() => { jumpToPhase('MANUAL_OVERRIDE'); setOpen(false); }}
                className="flex items-center px-2 py-3 rounded hover:bg-pink-500/20 text-slate-300 hover:text-pink-400 cursor-pointer font-mono text-sm"
              >
                <Activity size={14} className="mr-3" /> Engage Manual Override (WASD Driving)
              </Command.Item>
            </Command.Group>

            <Command.Group heading="AI Interventions" className="text-xs font-mono text-slate-500 mb-2 px-2 py-1">
              <Command.Item 
                onSelect={() => {
                  recordDecision({
                    what: 'Manual AI Diagnostic Sweep Triggered',
                    why: 'Operator invoked a priority override to manually inspect thermal and power subsystems.',
                    evidence: ['Command Palette override code received.', 'No prior anomalies detected in orbital phase.'],
                    confidence: 0.99,
                    assumptions: ['Sensors are fully calibrated.', 'Telemetry stream is unimpeded.'],
                    limitations: ['Sweep requires 15 seconds to complete.']
                  });
                  setOpen(false);
                }}
                className="flex items-center px-2 py-3 rounded hover:bg-red-500/20 text-slate-300 hover:text-red-400 cursor-pointer font-mono text-sm"
              >
                <Cpu size={14} className="mr-3" /> Trigger AI Diagnostic Sweep
              </Command.Item>
              
              {!spaceWeather.active ? (
                <Command.Item 
                  onSelect={() => {
                    triggerSolarFlare();
                    setOpen(false);
                  }}
                  className="flex items-center px-2 py-3 rounded hover:bg-orange-500/20 text-slate-300 hover:text-orange-400 cursor-pointer font-mono text-sm"
                >
                  <Activity size={14} className="mr-3 text-orange-500" /> Simulate Class-X Solar Flare
                </Command.Item>
              ) : (
                <Command.Item 
                  onSelect={() => {
                    resolveSolarFlare();
                    setOpen(false);
                  }}
                  className="flex items-center px-2 py-3 rounded hover:bg-green-500/20 text-slate-300 hover:text-green-400 cursor-pointer font-mono text-sm"
                >
                  <Activity size={14} className="mr-3 text-green-500" /> Resolve Solar Flare Event
                </Command.Item>
              )}

              <Command.Item 
                onSelect={() => {
                  toggleSwarm();
                  recordDecision({
                    what: swarmActive ? 'Recalled Micro-Rover Swarm' : 'Deployed Micro-Rover Swarm',
                    why: 'Autonomous distributed mapping using Boids algorithm.',
                    evidence: ['Complex crater topology requires distributed sensing.', 'Primary rover cannot safely navigate steep rims.'],
                    confidence: 0.95,
                    assumptions: ['Swarm battery reserves are sufficient.'],
                    limitations: ['Swarm data downlinks consume high bandwidth.']
                  });
                  setOpen(false);
                }}
                className={`flex items-center px-2 py-3 rounded cursor-pointer font-mono text-sm ${swarmActive ? 'hover:bg-red-500/20 text-slate-300 hover:text-red-400' : 'hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400'}`}
              >
                <Cpu size={14} className={`mr-3 ${swarmActive ? 'text-red-500' : 'text-cyan-500'}`} /> {swarmActive ? 'Recall' : 'Deploy'} Autonomous Swarm (Boids)
              </Command.Item>
            </Command.Group>
            
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
