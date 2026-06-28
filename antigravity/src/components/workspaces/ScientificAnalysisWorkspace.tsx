"use client";

import React from 'react';
import { useScenarioManager } from '@/lib/memory/scenarioManager';
import { useVisualLayers } from '@/lib/memory/visualLayerManager';
import { ShieldAlert, Layers, Map as MapIcon, Sun, Eye, Activity } from 'lucide-react';

export default function ScientificAnalysisWorkspace() {
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarioManager();
  const layers = useVisualLayers();

  const activeScenario = scenarios.find(s => s.id === activeScenarioId);

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white overflow-hidden p-6 gap-6">
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-widest text-blue-500">SCIENTIFIC ANALYSIS</h2>
          <p className="text-sm text-slate-400 font-mono mt-1">Multi-Scenario Visualization & Validation</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Scenario Selection */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2">
            <MapIcon size={16} /> MISSION SCENARIOS
          </h3>
          {scenarios.map(scenario => (
            <div 
              key={scenario.id} 
              onClick={() => setActiveScenario(scenario.id)}
              className={`p-4 rounded border cursor-pointer transition-all ${activeScenarioId === scenario.id ? 'bg-blue-500/10 border-blue-500' : 'bg-[#060b19] border-slate-800 hover:border-slate-600'}`}
            >
              <h4 className="font-bold font-mono text-blue-400 text-sm mb-2">{scenario.name}</h4>
              <p className="text-xs text-slate-400 mb-4">{scenario.description}</p>
              <div className="flex flex-wrap gap-2">
                {scenario.constraints.map(c => (
                  <span key={c} className="px-2 py-0.5 bg-black rounded text-[10px] font-mono text-slate-500">{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Active Scenario Details & Uncertainty */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2">
            <ShieldAlert size={16} /> UNCERTAINTY & DATA QUALITY
          </h3>
          
          {activeScenario && Object.entries(activeScenario.dataVersions).map(([key, version]) => (
            <div key={key} className="p-4 rounded border border-slate-800 bg-[#060b19] flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h4 className="font-mono text-sm text-slate-300">{key}</h4>
                <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${version.validationStatus === 'VALIDATED' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}`}>
                  {version.validationStatus}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                    <span>CONFIDENCE INTERVAL</span>
                    <span className="text-blue-400">{(version.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${version.confidence * 100}%` }} />
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-500 block mb-1">PROCESSING HISTORY:</span>
                <ul className="list-disc list-inside text-xs text-slate-400 ml-1 space-y-1">
                  {version.processingHistory.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Visualization Layers Toggles */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2">
          <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2">
            <Layers size={16} /> VISUALIZATION LAYERS
          </h3>
          
          <div className="flex flex-col gap-2">
            {[
              { id: 'showTerrain', label: 'Standard Terrain Mapping', icon: MapIcon },
              { id: 'showElevation', label: 'Elevation Wireframe', icon: Activity },
              { id: 'showSlopeHeatmap', label: 'Slope & Hazard Heatmap', icon: ShieldAlert },
              { id: 'showIllumination', label: 'Dynamic Solar Illumination', icon: Sun },
              { id: 'showPerformanceStats', label: 'Render Performance Diagnostics', icon: Eye }
            ].map(({ id, label, icon: Icon }) => {
              const isActive = layers[id as keyof typeof layers] as boolean;
              return (
                <button
                  key={id}
                  onClick={() => layers.toggleLayer(id as any)}
                  className={`flex items-center justify-between p-4 rounded border transition-colors ${isActive ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-[#060b19] border-slate-800 text-slate-500 hover:border-slate-600'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span className="text-xs font-mono font-bold">{label}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
