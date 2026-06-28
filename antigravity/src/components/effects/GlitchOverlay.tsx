import React, { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';

export default function GlitchOverlay() {
  const { spaceWeather, missionFailed } = useTelemetryStore();
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (spaceWeather.active || missionFailed) {
      // Randomly trigger bursts of glitches
      const interval = setInterval(() => {
        setGlitchActive(Math.random() > (missionFailed ? 0.2 : 0.5));
      }, 200);
      return () => clearInterval(interval);
    } else {
      setGlitchActive(false);
    }
  }, [spaceWeather.active, missionFailed]);

  if (!spaceWeather.active && !missionFailed) return null;

  return (
    <div className={`pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-difference ${glitchActive ? 'opacity-100' : 'opacity-30'}`}>
      {/* Scanline / Noise */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #000 2px, #000 4px)',
          backgroundSize: '100% 4px',
          animation: 'scrollBg 10s linear infinite'
        }}
      />
      
      {/* RGB Split / Chromatic Aberration Simulation */}
      {glitchActive && (
        <>
          <div className="absolute inset-0 translate-x-[4px] bg-red-500/20 mix-blend-color-burn" style={{ clipPath: `inset(${Math.random() * 80}% 0 ${Math.random() * 80}% 0)` }} />
          <div className="absolute inset-0 -translate-x-[4px] bg-blue-500/20 mix-blend-color-dodge" style={{ clipPath: `inset(${Math.random() * 80}% 0 ${Math.random() * 80}% 0)` }} />
        </>
      )}

      {/* Screen Tear */}
      {glitchActive && Math.random() > 0.7 && (
        <div className="absolute top-1/2 left-0 w-full h-8 bg-white/10 translate-x-[20px] skew-x-12 mix-blend-overlay" />
      )}
      
      {/* Warning Overlay */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center">
        {missionFailed ? (
          <div className="text-red-500 font-mono text-4xl font-bold animate-pulse bg-black/80 px-10 py-4 border-4 border-red-500 uppercase tracking-widest flex flex-col items-center shadow-[0_0_50px_rgba(255,0,0,0.5)]">
            <span>💀 MISSION FAILED 💀</span>
            <span className="text-sm text-red-400 mt-2">THERMAL SYSTEMS OFFLINE. BATTERY DEPLETED. ROVER FROZEN.</span>
            <span className="text-xs text-slate-500 mt-4">REFRESH TO RESTART</span>
          </div>
        ) : (
          <div className="text-orange-500 font-mono text-2xl font-bold animate-pulse bg-black/80 px-6 py-2 border-2 border-orange-500 uppercase tracking-widest flex flex-col items-center">
            <span>⚠️ RADIATION WARNING ⚠️</span>
            <span className="text-xs text-orange-400 mt-1">CLASS-X SOLAR FLARE INTERFERENCE DETECTED</span>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scrollBg {
          from { background-position: 0 0; }
          to { background-position: 0 100%; }
        }
      `}</style>
    </div>
  );
}
