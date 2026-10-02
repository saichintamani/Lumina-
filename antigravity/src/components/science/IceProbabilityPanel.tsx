"use client";

import React, { useState, useEffect } from 'react';
import { Brain, Activity } from 'lucide-react';

export default function IceProbabilityPanel() {
  const [cpr, setCpr] = useState(0.85);
  const [dop, setDop] = useState(0.40);
  const [temp, setTemp] = useState(105);
  
  const [probability, setProbability] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<string>("CALCULATING...");
  const [isInferring, setIsInferring] = useState(false);

  useEffect(() => {
    const fetchInference = async () => {
      setIsInferring(true);
      try {
        const response = await fetch('/api/ml/predict-ice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpr,
            dop,
            temperature_k: temp,
            slope_deg: 10, // Fixed constants for demo
            roughness: 0.05
          })
        });
        const data = await response.json();
        setProbability(data.ice_probability_percent);
        setConfidence(data.confidence_interval);
      } catch (e) {
        console.error("Failed to fetch ML inference");
      } finally {
        setIsInferring(false);
      }
    };

    // Debounce the API call slightly for smooth slider interaction
    const timer = setTimeout(() => {
      fetchInference();
    }, 150);
    return () => clearTimeout(timer);
  }, [cpr, dop, temp]);

  // Determine color based on probability
  const getColor = () => {
    if (probability === null) return 'text-slate-500';
    if (probability > 75) return 'text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)]';
    if (probability > 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-[#001122]/90 border border-cyan-900 p-4 rounded-lg mt-4 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.05)]">
      <div className="flex items-center justify-between border-b border-cyan-900 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-widest">LIVE ML INFERENCE (DFSAR)</h3>
        </div>
        <Activity size={14} className={`text-cyan-500 ${isInferring ? 'animate-pulse' : ''}`} />
      </div>

      <div className="space-y-4">
        {/* ML Result Display */}
        <div className="bg-black/50 border border-slate-800 p-3 rounded flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <span className="text-[10px] font-mono text-slate-400 mb-1 z-10">SUBSURFACE ICE PROBABILITY</span>
          <div className={`text-3xl font-mono font-bold z-10 transition-colors duration-300 ${getColor()}`}>
            {probability !== null ? `${probability.toFixed(1)}%` : '--'}
          </div>
          <div className="mt-1 flex items-center gap-2 z-10">
            <span className="text-[8px] font-mono text-slate-500">CONFIDENCE:</span>
            <span className={`text-[9px] font-mono font-bold ${confidence === 'HIGH' ? 'text-cyan-400' : confidence === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>
              [{confidence}]
            </span>
          </div>
        </div>

        {/* Interactive Sliders */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-cyan-300">DFSAR L-Band CPR</label>
              <span className="text-[10px] font-mono text-slate-400">{cpr.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="1.5" step="0.05" 
              value={cpr} onChange={(e) => setCpr(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-cyan-300">Degree of Polarization</label>
              <span className="text-[10px] font-mono text-slate-400">{dop.toFixed(2)}</span>
            </div>
            <input 
              type="range" min="0.1" max="1.0" step="0.05" 
              value={dop} onChange={(e) => setDop(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono text-cyan-300">Surface Temp (K)</label>
              <span className="text-[10px] font-mono text-slate-400">{temp} K</span>
            </div>
            <input 
              type="range" min="40" max="250" step="5" 
              value={temp} onChange={(e) => setTemp(parseInt(e.target.value))}
              className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
