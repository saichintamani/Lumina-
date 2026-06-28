"use client";

import { useCinematicEngine } from '@/lib/memory/cinematicEngine';
import { Battery, Thermometer, Zap } from 'lucide-react';

export default function SubsystemHUD() {
  const { timeOfDay } = useCinematicEngine();
  
  // Calculate simulated metrics based on timeOfDay (0 to 24)
  // At noon (12), sun is highest, solar power is max.
  const isDaylight = timeOfDay > 6 && timeOfDay < 18;
  const solarEfficiency = isDaylight ? Math.sin(((timeOfDay - 6) / 12) * Math.PI) : 0;
  
  // Battery drops at night, charges during day
  const batteryLevel = isDaylight ? 40 + (solarEfficiency * 60) : 40 - ((Math.abs(timeOfDay - 12) / 12) * 20);
  
  // Temperature is hot during day, cold at night (Celsius)
  const temp = isDaylight ? -50 + (solarEfficiency * 150) : -150 - (Math.abs(timeOfDay - 12) * 5);

  return (
    <div className="glass-panel p-4 flex flex-col gap-3 w-64 border-l-2 border-l-blue-500 shadow-[0_4px_30px_rgba(59,130,246,0.15)]">
      <h3 className="text-[10px] font-mono text-slate-400 font-bold tracking-widest flex items-center gap-2">
        <Zap size={14} className="text-yellow-400" />
        SUBSYSTEMS
      </h3>

      <div className="flex flex-col gap-2 mt-2">
        {/* Battery */}
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-300 flex items-center gap-1"><Battery size={12}/> BATTERY</span>
          <span className={batteryLevel > 30 ? "text-green-400" : "text-red-400"}>
            {batteryLevel.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${batteryLevel > 30 ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}
            style={{ width: `${Math.max(0, Math.min(100, batteryLevel))}%` }}
          />
        </div>

        {/* Solar */}
        <div className="flex justify-between items-center text-xs font-mono mt-2">
          <span className="text-slate-300 flex items-center gap-1"><Zap size={12}/> SOLAR ARRAY</span>
          <span className="text-yellow-400">
            {(solarEfficiency * 100).toFixed(0)}% EFF
          </span>
        </div>
        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-400 transition-all duration-1000"
            style={{ width: `${solarEfficiency * 100}%` }}
          />
        </div>

        {/* Thermal */}
        <div className="flex justify-between items-center text-xs font-mono mt-2">
          <span className="text-slate-300 flex items-center gap-1"><Thermometer size={12}/> EXTERNAL TEMP</span>
          <span className={temp > 0 ? "text-orange-400" : "text-blue-400"}>
            {temp.toFixed(1)}°C
          </span>
        </div>
      </div>
    </div>
  );
}
