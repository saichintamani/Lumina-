"use client";

import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Target, Search, CheckCircle2 } from 'lucide-react';

export default function DeepCoreDrill() {
  const [isDrilling, setIsDrilling] = useState(false);
  const [drillDepth, setDrillDepth] = useState(0);
  const [showChart, setShowChart] = useState(false);

  const startDrill = () => {
    setIsDrilling(true);
    setDrillDepth(0);
    setShowChart(false);
  };

  useEffect(() => {
    if (!isDrilling) return;
    const interval = setInterval(() => {
      setDrillDepth(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDrilling(false);
          setShowChart(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isDrilling]);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['Water Ice (H2O)', 'Iron Oxide (FeO)', 'Titanium (TiO2)'],
      textStyle: { color: '#8b949e', fontSize: 9 }
    },
    grid: {
      left: '3%', right: '4%', bottom: '3%', containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['0m', '0.5m', '1.0m', '1.5m', '2.0m', '2.5m', '3.0m'],
      axisLine: { lineStyle: { color: '#30363d' } },
      axisLabel: { color: '#8b949e', fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      name: 'Concentration (%)',
      nameTextStyle: { color: '#8b949e', fontSize: 9 },
      splitLine: { lineStyle: { color: '#21262d' } },
      axisLabel: { color: '#8b949e', fontSize: 9 }
    },
    series: [
      {
        name: 'Water Ice (H2O)',
        type: 'line',
        smooth: true,
        data: [1, 2, 5, 12, 35, 80, 95], // Spikes deep underground
        lineStyle: { color: '#38bdf8', width: 2 },
        itemStyle: { color: '#38bdf8' },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: 'rgba(56, 189, 248, 0.5)' }, { offset: 1, color: 'rgba(56, 189, 248, 0)' }]
          }
        }
      },
      {
        name: 'Iron Oxide (FeO)',
        type: 'line',
        smooth: true,
        data: [45, 42, 38, 30, 25, 20, 18], // Decreases with depth
        lineStyle: { color: '#f87171', width: 2 },
        itemStyle: { color: '#f87171' }
      },
      {
        name: 'Titanium (TiO2)',
        type: 'line',
        smooth: true,
        data: [29, 31, 35, 33, 28, 25, 22], // Peaks in middle
        lineStyle: { color: '#a78bfa', width: 2 },
        itemStyle: { color: '#a78bfa' }
      }
    ]
  };

  return (
    <div className="bg-[#030712] border border-slate-800 rounded-lg p-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Target size={14} className="text-magenta-400 text-pink-400" />
          <h3 className="text-[10px] font-mono font-bold text-slate-300 tracking-widest">DEEP-CORE MINERALOGY</h3>
        </div>
        {!showChart && !isDrilling && (
          <button onClick={startDrill} className="flex items-center gap-1 text-[9px] font-mono bg-pink-900/30 text-pink-400 border border-pink-900/50 px-2 py-1 rounded hover:bg-pink-900/50 transition-colors">
            <Search size={10} /> DEPLOY DRILL
          </button>
        )}
        {showChart && (
          <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
            <CheckCircle2 size={10} /> ANALYSIS COMPLETE
          </span>
        )}
      </div>

      {isDrilling && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3">
          <div className="text-[10px] font-mono text-slate-400 animate-pulse">DRILLING: {drillDepth}% - DEPTH: {(drillDepth * 0.03).toFixed(2)}m</div>
          <div className="w-full max-w-[200px] h-2 bg-slate-900 rounded overflow-hidden border border-slate-700">
            <div className="h-full bg-pink-500 transition-all duration-100" style={{ width: `${drillDepth}%` }} />
          </div>
          <div className="w-1 h-12 bg-gradient-to-b from-pink-500 to-transparent animate-bounce mt-2" />
        </div>
      )}

      {showChart && (
        <div className="h-[200px] w-full animate-in fade-in zoom-in duration-500">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      )}

      {!showChart && !isDrilling && (
        <div className="py-12 flex items-center justify-center text-[10px] font-mono text-slate-600 text-center px-4">
          Select coordinates and deploy drill to extract multi-spectral subsurface profiles.
        </div>
      )}
    </div>
  );
}
