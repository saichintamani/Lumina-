"use client";

import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';

export default function TelemetryDashboard() {
  const { currentPhase } = useCinematicEngine();
  
  // Simulated data state
  const [dataStream, setDataStream] = useState<number[]>([]);
  const [timeStream, setTimeStream] = useState<string[]>([]);
  const [thermalValue, setThermalValue] = useState(25);

  useEffect(() => {
    // Fill initial data
    const now = new Date();
    const initData: number[] = [];
    const initTime: string[] = [];
    for (let i = 20; i > 0; i--) {
      initData.push(Math.random() * 20 + 80); // 80-100% battery
      initTime.push(new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour12: false }));
    }
    setDataStream(initData);
    setTimeStream(initTime);

    // Live update interval
    const interval = setInterval(() => {
      setDataStream(prev => {
        const next = [...prev.slice(1)];
        // If in Traverse Planning, simulate power drain
        const drop = currentPhase === 'TRAVERSE_PLANNING' ? Math.random() * 5 + 2 : Math.random() * 2 - 1;
        const last = prev[prev.length - 1];
        next.push(Math.max(0, Math.min(100, last - drop)));
        return next;
      });
      
      setTimeStream(prev => [...prev.slice(1), new Date().toLocaleTimeString([], { hour12: false })]);
      
      // Update thermal
      setThermalValue(prev => {
        const temp = prev + (Math.random() * 2 - 1);
        return currentPhase === 'ORBITAL_INSERTION' ? temp + 2 : temp;
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase]);

  const powerOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { top: 10, right: 10, bottom: 20, left: 35 },
    xAxis: {
      type: 'category',
      data: timeStream,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#64748b', fontSize: 9 }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      splitLine: { lineStyle: { color: '#1e293b' } },
      axisLabel: { color: '#64748b', fontSize: 9 }
    },
    series: [
      {
        data: dataStream,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#3b82f6', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0)' }
            ]
          }
        }
      }
    ]
  };

  const thermalOption = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: -150,
        max: 150,
        splitNumber: 6,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.25, '#3b82f6'],
              [0.75, '#22c55e'],
              [1, '#ef4444']
            ]
          }
        },
        pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 10, offsetCenter: [0, '-60%'] },
        axisTick: { length: 12, lineStyle: { color: 'auto', width: 1 } },
        splitLine: { length: 15, lineStyle: { color: 'auto', width: 2 } },
        axisLabel: { color: '#64748b', fontSize: 10, distance: -40 },
        title: { offsetCenter: [0, '-20%'], fontSize: 10, color: '#94a3b8' },
        detail: { fontSize: 16, offsetCenter: [0, '0%'], valueAnimation: true, color: 'inherit' },
        data: [{ value: Math.round(thermalValue), name: 'THERMAL (C)' }]
      }
    ]
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-black/40 border border-slate-800 rounded p-2">
        <h4 className="text-[10px] font-mono text-slate-500 mb-1">MAIN BUS VOLTAGE</h4>
        <div className="h-full w-full min-h-[100px]">
          <ReactECharts option={powerOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
      
      <div className="flex-1 bg-black/40 border border-slate-800 rounded p-2 flex flex-col">
        <h4 className="text-[10px] font-mono text-slate-500 mb-1">ENVIRONMENTAL CONTROL</h4>
        <div className="h-full w-full min-h-[100px]">
          <ReactECharts option={thermalOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
