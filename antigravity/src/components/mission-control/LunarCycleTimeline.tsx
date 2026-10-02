"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Sun, Moon, Battery, Thermometer } from 'lucide-react';

/**
 * LunarCycleTimeline
 * ==================
 * A video-player style scrubber that simulates a full 14-day lunar day/night cycle.
 * As the user drags the timeline:
 *  - Sun angle changes from 0° to 180° and back
 *  - Battery levels simulate solar panel charging/draining
 *  - Temperature swings between -173°C (shadow) and +127°C (sunlight)
 *  - Mission events are annotated along the timeline
 */

interface MissionEvent {
  day: number;
  label: string;
  type: 'science' | 'hazard' | 'milestone';
}

const MISSION_EVENTS: MissionEvent[] = [
  { day: 0.5, label: 'LANDING', type: 'milestone' },
  { day: 1.0, label: 'FIRST TRAVERSE', type: 'milestone' },
  { day: 2.5, label: 'DFSAR SCAN #1', type: 'science' },
  { day: 4.0, label: 'ICE DETECTION', type: 'science' },
  { day: 5.5, label: 'SOLAR STORM WARNING', type: 'hazard' },
  { day: 7.0, label: 'LUNAR NOON (MAX ILLUMINATION)', type: 'milestone' },
  { day: 8.5, label: 'SAMPLE COLLECTION', type: 'science' },
  { day: 10.0, label: 'THERMAL ALERT', type: 'hazard' },
  { day: 11.5, label: 'SHADOW ENTRY RISK', type: 'hazard' },
  { day: 13.0, label: 'FINAL UPLINK', type: 'milestone' },
  { day: 14.0, label: 'SUNSET / HIBERNATION', type: 'hazard' },
];

export default function LunarCycleTimeline() {
  const [currentDay, setCurrentDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const animFrame = useRef<number>(0);
  const lastTime = useRef(0);

  const TOTAL_DAYS = 14;

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) return;

    const animate = (timestamp: number) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const dt = (timestamp - lastTime.current) / 1000;
      lastTime.current = timestamp;

      setCurrentDay(prev => {
        const next = prev + dt * 0.5 * playbackSpeed; // 0.5 day/sec base speed
        if (next >= TOTAL_DAYS) {
          setIsPlaying(false);
          return TOTAL_DAYS;
        }
        return next;
      });

      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame.current);
  }, [isPlaying, playbackSpeed]);

  // Derived physics values
  const sunAngle = (currentDay / TOTAL_DAYS) * 360; // Full rotation
  const isNight = sunAngle > 180;
  const solarElevation = Math.sin((sunAngle * Math.PI) / 180) * 90;
  const temperature = isNight ? -173 + Math.random() * 5 : 127 - Math.abs(solarElevation - 45) * 0.5;
  const batteryLevel = isNight 
    ? Math.max(0, 100 - ((currentDay - 7) / 7) * 100) 
    : Math.min(100, (currentDay / 7) * 100);
  const solarPower = isNight ? 0 : Math.max(0, solarElevation * 2.2);

  // Find current/nearest event
  const currentEvent = MISSION_EVENTS.find(e => Math.abs(e.day - currentDay) < 0.3);

  return (
    <div className="bg-[#000814] border border-slate-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#060b19]">
        <div className="flex items-center gap-2">
          {isNight ? <Moon size={14} className="text-indigo-400" /> : <Sun size={14} className="text-yellow-400" />}
          <span className="text-xs font-mono font-bold text-white tracking-widest">14-DAY LUNAR CYCLE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-500">
            SOL {Math.floor(currentDay) + 1} / {TOTAL_DAYS} — {(currentDay % 1 * 24).toFixed(0)}h
          </span>
          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${isNight ? 'bg-indigo-900/50 text-indigo-400 border border-indigo-700' : 'bg-yellow-900/50 text-yellow-400 border border-yellow-700'}`}>
            {isNight ? 'LUNAR NIGHT' : 'LUNAR DAY'}
          </span>
        </div>
      </div>

      {/* Telemetry Strip */}
      <div className="grid grid-cols-4 gap-0 border-b border-slate-800">
        <div className="px-3 py-2 border-r border-slate-800">
          <div className="text-[8px] font-mono text-slate-500">SUN ELEVATION</div>
          <div className={`text-sm font-mono font-bold ${solarElevation > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
            {solarElevation.toFixed(1)}°
          </div>
        </div>
        <div className="px-3 py-2 border-r border-slate-800">
          <div className="text-[8px] font-mono text-slate-500">SURFACE TEMP</div>
          <div className={`text-sm font-mono font-bold ${temperature < 0 ? 'text-blue-400' : 'text-red-400'}`}>
            {temperature.toFixed(0)}°C
          </div>
        </div>
        <div className="px-3 py-2 border-r border-slate-800">
          <div className="text-[8px] font-mono text-slate-500">BATTERY</div>
          <div className={`text-sm font-mono font-bold ${batteryLevel > 50 ? 'text-green-400' : batteryLevel > 20 ? 'text-yellow-400' : 'text-red-400'}`}>
            {batteryLevel.toFixed(0)}%
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="text-[8px] font-mono text-slate-500">SOLAR POWER</div>
          <div className={`text-sm font-mono font-bold ${solarPower > 100 ? 'text-emerald-400' : solarPower > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
            {solarPower.toFixed(0)} W
          </div>
        </div>
      </div>

      {/* Timeline Scrubber */}
      <div className="px-4 py-3">
        {/* Event markers */}
        <div className="relative h-6 mb-1">
          {MISSION_EVENTS.map((event, i) => (
            <div
              key={i}
              className="absolute top-0 transform -translate-x-1/2"
              style={{ left: `${(event.day / TOTAL_DAYS) * 100}%` }}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                event.type === 'hazard' ? 'bg-red-500' : 
                event.type === 'science' ? 'bg-cyan-500' : 'bg-yellow-500'
              } ${Math.abs(event.day - currentDay) < 0.3 ? 'ring-2 ring-white ring-opacity-50 scale-150' : ''} transition-transform`} />
              {Math.abs(event.day - currentDay) < 0.5 && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-[7px] font-mono font-bold ${
                    event.type === 'hazard' ? 'text-red-400' : 
                    event.type === 'science' ? 'text-cyan-400' : 'text-yellow-400'
                  }`}>{event.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Slider */}
        <div className="relative">
          <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900 via-yellow-600 to-indigo-900 opacity-30" />
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-yellow-500 to-cyan-500 rounded-full"
              style={{ width: `${(currentDay / TOTAL_DAYS) * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={TOTAL_DAYS}
            step={0.01}
            value={currentDay}
            onChange={(e) => {
              setCurrentDay(parseFloat(e.target.value));
              setIsPlaying(false);
            }}
            className="relative w-full h-2 appearance-none bg-transparent cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,255,255,0.5)]"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDay(Math.max(0, currentDay - 1))}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <SkipBack size={14} />
            </button>
            <button
              onClick={() => { setIsPlaying(!isPlaying); lastTime.current = 0; }}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => setCurrentDay(Math.min(TOTAL_DAYS, currentDay + 1))}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <SkipForward size={14} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            {[0.5, 1, 2, 4].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`text-[9px] font-mono px-2 py-0.5 rounded transition-colors ${
                  playbackSpeed === speed 
                    ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-700' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
