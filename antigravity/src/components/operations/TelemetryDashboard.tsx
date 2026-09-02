"use client";

import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';

export default function TelemetryDashboard() {
  const { currentPhase } = useCinematicEngine();
  
  // Simulated data state for Image Registration Metrics
  const [inlierStream, setInlierStream] = useState<number[]>([]);
  const [timeStream, setTimeStream] = useState<string[]>([]);
  const [reprojectionError, setReprojectionError] = useState(1.2);

  useEffect(() => {
    // Fill initial data
    const now = new Date();
    const initData: number[] = [];
    const initTime: string[] = [];
    for (let i = 20; i > 0; i--) {
      initData.push(Math.random() * 5 + 85); // 85-90% inlier ratio
      initTime.push(new Date(now.getTime() - i * 1000).toLocaleTimeString([], { hour12: false }));
    }
    setInlierStream(initData);
    setTimeStream(initTime);

    // Live update interval
    const interval = setInterval(() => {
      setInlierStream(prev => {
        const next = [...prev.slice(1)];
        // Add new simulated inlier ratio value
        next.push(Math.random() * 5 + 85);
        return next;
      });
      
      setTimeStream(prev => [...prev.slice(1), new Date().toLocaleTimeString([], { hour12: false })]);
      
      // Update reprojection error (should ideally be < 1.0 px)
      setReprojectionError(prev => {
        return Math.max(0.5, Math.min(2.0, prev + (Math.random() * 0.2 - 0.1)));
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [currentPhase]);

  const inlierOption = {
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
        data: inlierStream,
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { color: '#3ddc84', width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(61, 220, 132, 0.5)' },
              { offset: 1, color: 'rgba(61, 220, 132, 0)' }
            ]
          }
        }
      }
    ]
  };

  const errorOption = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 5,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.3, '#22c55e'], // < 1.5px is good
              [0.7, '#f59e0b'],
              [1, '#ef4444']
            ]
          }
        },
        pointer: { icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z', length: '12%', width: 10, offsetCenter: [0, '-60%'] },
        axisTick: { length: 12, lineStyle: { color: 'auto', width: 1 } },
        splitLine: { length: 15, lineStyle: { color: 'auto', width: 2 } },
        axisLabel: { color: '#64748b', fontSize: 10, distance: -40 },
        title: { offsetCenter: [0, '-20%'], fontSize: 10, color: '#94a3b8' },
        detail: { fontSize: 16, offsetCenter: [0, '0%'], valueAnimation: true, color: 'inherit', formatter: '{value} px' },
        data: [{ value: Number(reprojectionError.toFixed(2)), name: 'REPROJECTION ERR' }]
      }
    ]
  };

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-black/40 border border-slate-800 rounded p-2">
        <h4 className="text-[10px] font-mono text-slate-500 mb-1">FEATURE INLIER RATIO (%)</h4>
        <div className="h-full w-full min-h-[100px]">
          <ReactECharts option={inlierOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
      
      <div className="flex-1 bg-black/40 border border-slate-800 rounded p-2 flex flex-col">
        <h4 className="text-[10px] font-mono text-slate-500 mb-1">MATCH QUALITY</h4>
        <div className="h-full w-full min-h-[100px]">
          <ReactECharts option={errorOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
