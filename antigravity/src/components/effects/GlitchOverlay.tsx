import React, { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';

export default function GlitchOverlay() {
  const { spaceWeather } = useTelemetryStore();
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (spaceWeather.active) {
      // Randomly trigger bursts of glitches
      const interval = setInterval(() => {
        setGlitchActive(Math.random() > 0.5);
      }, 200);
      return () => clearInterval(interval);
    } else {
      setGlitchActive(false);
    }
  }, [spaceWeather.active]);

  if (!spaceWeather.active) return null;

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
        <div className="text-red-500 font-mono text-2xl font-bold animate-pulse bg-black/80 px-6 py-2 border-2 border-red-500 uppercase tracking-widest flex flex-col items-center">
          <span>⚠️ RADIATION WARNING ⚠️</span>
          <span className="text-xs text-red-400 mt-1">CLASS-X SOLAR FLARE INTERFERENCE DETECTED</span>
        </div>
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
