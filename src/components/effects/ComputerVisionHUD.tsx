"use client";

import React, { useEffect, useState } from 'react';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { ScanFace } from 'lucide-react';

interface BoundingBox {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color: string;
}

const LABELS = [
  'REGOLITH ANOMALY',
  'CRATER RIM',
  'HAZARD: ROCK',
  'SLOPE > 15 DEG',
  'THERMAL VARIANCE',
  'SHADOW DETECTED'
];

export function ComputerVisionHUD() {
  const { cameraMode, missionFailed } = useTelemetryStore();
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);

  // Simulate an active ML model jumping around finding hazards
  useEffect(() => {
    if (cameraMode !== 'FIRST_PERSON' || missionFailed) return;
    
    const interval = setInterval(() => {
      // Randomly decide how many boxes to show (1 to 3)
      const numBoxes = Math.floor(Math.random() * 3) + 1;
      const newBoxes: BoundingBox[] = [];

      for (let i = 0; i < numBoxes; i++) {
        const isHazard = Math.random() > 0.7;
        newBoxes.push({
          id: Math.random(),
          x: 20 + Math.random() * 60, // percentage x (20% to 80%)
          y: 20 + Math.random() * 60, // percentage y (20% to 80%)
          width: 5 + Math.random() * 15, // width 5% to 20%
          height: 5 + Math.random() * 15, // height 5% to 20%
          label: LABELS[Math.floor(Math.random() * LABELS.length)],
          confidence: 70 + Math.random() * 29, // 70 to 99%
          color: isHazard ? '#ef4444' : '#10b981' // Red for hazard, green for nominal
        });
      }

      setBoxes(newBoxes);
    }, 1500); // New detections every 1.5 seconds

    return () => clearInterval(interval);
  }, [cameraMode, missionFailed]);

  // Only render if in First-Person mode and not failed
  if (cameraMode !== 'FIRST_PERSON' || missionFailed) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Reticle / Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center opacity-50">
        <div className="relative w-32 h-32">
          {/* Top Left */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
          {/* Top Right */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
          {/* Bottom Left */}
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
          {/* Bottom Right */}
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
          <div className="absolute inset-0 flex items-center justify-center">
             <ScanFace className="text-cyan-500/30" size={24} />
          </div>
        </div>
      </div>

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20" />

      {/* Bounding Boxes */}
      {boxes.map((box) => (
        <div
          key={box.id}
          className="absolute border-2 transition-all duration-300 animate-in fade-in zoom-in"
          style={{
            left: `${box.x}%`,
            top: `${box.y}%`,
            width: `${box.width}%`,
            height: `${box.height}%`,
            borderColor: box.color,
            boxShadow: `0 0 10px ${box.color}40`,
          }}
        >
          {/* Label Tag */}
          <div 
            className="absolute -top-6 left-[-2px] px-2 py-0.5 text-[10px] font-mono text-white whitespace-nowrap flex items-center gap-2"
            style={{ backgroundColor: box.color }}
          >
            <span>{box.label}</span>
            <span className="opacity-75">{box.confidence.toFixed(1)}%</span>
          </div>
          
          {/* Corner accents for the bounding box */}
          <div className="absolute -top-[2px] -left-[2px] w-2 h-2 bg-white" />
          <div className="absolute -top-[2px] -right-[2px] w-2 h-2 bg-white" />
          <div className="absolute -bottom-[2px] -left-[2px] w-2 h-2 bg-white" />
          <div className="absolute -bottom-[2px] -right-[2px] w-2 h-2 bg-white" />
        </div>
      ))}

      {/* NavCam Status Overlay */}
      <div className="absolute top-24 left-6 text-cyan-400 font-mono text-xs opacity-70">
        <div>[NAVCAM: ACTIVE]</div>
        <div>[ML_DETECTION: ONLINE]</div>
        <div className="animate-pulse">PROCESSING REGOLITH MAP...</div>
      </div>
    </div>
  );
}
