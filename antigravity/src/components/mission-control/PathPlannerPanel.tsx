"use client";

import React, { useState, useCallback } from 'react';
import { Route, MapPin, AlertTriangle, Zap, Clock } from 'lucide-react';
import { findPath, PathResult, GRID_SIZE } from '@/lib/physics/pathfindingEngine';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';

export default function PathPlannerPanel() {
  const [startPoint, setStartPoint] = useState<[number, number]>([5, 35]);
  const [endPoint, setEndPoint] = useState<[number, number]>([35, 5]);
  const [result, setResult] = useState<PathResult | null>(null);
  const [isComputing, setIsComputing] = useState(false);

  const computePath = useCallback(() => {
    setIsComputing(true);
    // Use requestAnimationFrame to not block UI
    requestAnimationFrame(() => {
      const pathResult = findPath(startPoint, endPoint);
      setResult(pathResult);
      setIsComputing(false);
    });
  }, [startPoint, endPoint]);

  return (
    <div className="bg-[#001122]/90 border border-emerald-900 p-4 rounded-lg backdrop-blur-md shadow-[0_0_20px_rgba(0,255,100,0.05)]">
      <div className="flex items-center justify-between border-b border-emerald-900 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Route size={16} className="text-emerald-400" />
          <h3 className="text-xs font-mono font-bold text-emerald-400 tracking-widest">A* PATH PLANNER</h3>
        </div>
        <span className="text-[8px] font-mono text-slate-500">HAZARD-AWARE ROUTING</span>
      </div>

      {/* Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-black/50 border border-slate-800 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={10} className="text-green-400" />
            <span className="text-[9px] font-mono text-green-400">START</span>
          </div>
          <div className="flex gap-2">
            <input type="number" min={0} max={GRID_SIZE - 1} value={startPoint[0]}
              onChange={(e) => setStartPoint([parseInt(e.target.value) || 0, startPoint[1]])}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-white"
            />
            <input type="number" min={0} max={GRID_SIZE - 1} value={startPoint[1]}
              onChange={(e) => setStartPoint([startPoint[0], parseInt(e.target.value) || 0])}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-white"
            />
          </div>
        </div>
        <div className="bg-black/50 border border-slate-800 p-2 rounded">
          <div className="flex items-center gap-1 mb-1">
            <MapPin size={10} className="text-red-400" />
            <span className="text-[9px] font-mono text-red-400">GOAL</span>
          </div>
          <div className="flex gap-2">
            <input type="number" min={0} max={GRID_SIZE - 1} value={endPoint[0]}
              onChange={(e) => setEndPoint([parseInt(e.target.value) || 0, endPoint[1]])}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-white"
            />
            <input type="number" min={0} max={GRID_SIZE - 1} value={endPoint[1]}
              onChange={(e) => setEndPoint([endPoint[0], parseInt(e.target.value) || 0])}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[10px] font-mono text-white"
            />
          </div>
        </div>
      </div>

      {/* Compute Button */}
      <button
        onClick={computePath}
        disabled={isComputing}
        className="w-full bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold py-2 rounded transition-all disabled:opacity-50 shadow-[0_0_10px_rgba(0,255,100,0.1)]"
      >
        {isComputing ? '⏳ COMPUTING OPTIMAL PATH...' : '▶ EXECUTE A* PATHFINDING'}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-3 space-y-2">
          <div className="bg-black/50 border border-emerald-800/50 rounded p-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <Route size={12} className="text-emerald-400" />
                <div>
                  <div className="text-[8px] font-mono text-slate-500">WAYPOINTS</div>
                  <div className="text-sm font-mono text-emerald-400 font-bold">{result.path.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-yellow-400" />
                <div>
                  <div className="text-[8px] font-mono text-slate-500">HAZARDS AVOIDED</div>
                  <div className="text-sm font-mono text-yellow-400 font-bold">{result.hazardsAvoided}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-cyan-400" />
                <div>
                  <div className="text-[8px] font-mono text-slate-500">TRAVERSE DIST</div>
                  <div className="text-sm font-mono text-cyan-400 font-bold">{result.distanceKm.toFixed(1)} km</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-purple-400" />
                <div>
                  <div className="text-[8px] font-mono text-slate-500">COMPUTE TIME</div>
                  <div className="text-sm font-mono text-purple-400 font-bold">{result.computeTimeMs.toFixed(1)} ms</div>
                </div>
              </div>
            </div>
          </div>

          {/* Path Cost Bar */}
          <div className="bg-black/30 rounded p-2">
            <div className="flex justify-between mb-1">
              <span className="text-[8px] font-mono text-slate-500">PATH OPTIMALITY</span>
              <span className="text-[8px] font-mono text-emerald-400">{result.totalCost > 0 ? 'FEASIBLE' : 'FALLBACK'}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, 100 - (result.totalCost / 10)))}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
