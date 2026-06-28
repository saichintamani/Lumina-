"use client";

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html, Line, Stats, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useCinematicEngine, MissionPhase } from '@/lib/memory/cinematicEngine';
import { useVisualLayers } from '@/lib/memory/visualLayerManager';
import gsap from 'gsap';

// ----------------------------------------------------
// Cinematic Camera Controller
// ----------------------------------------------------
function CinematicCameraController() {
  const { currentPhase } = useCinematicEngine();
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current.object;
    const controls = cameraRef.current;

    // Define Camera Keyframes based on Mission Phase
    const keyframes: Record<MissionPhase, { pos: [number, number, number], target: [number, number, number] }> = {
      'INITIALIZING': { pos: [0, 0, 10], target: [0, 0, 0] },
      'ORBITAL_INSERTION': { pos: [3, 2, 5], target: [0, 0, 0] },
      'RADAR_ACQUISITION': { pos: [1.5, 3, 2], target: [0, 1.5, 0] },
      'TERRAIN_GENERATION': { pos: [0.5, 1.6, 1.5], target: [0, 1.5, 0] }, // Faustini Crater zoom
      'AI_REASONING': { pos: [0.2, 1.55, 0.2], target: [0, 1.5, 0] },
      'LANDING_SIMULATION': { pos: [0.05, 1.52, 0.05], target: [0, 1.5, 0] },
      'TRAVERSE_PLANNING': { pos: [0.02, 1.51, 0.02], target: [0, 1.5, 0] },
      'MISSION_SUCCESS': { pos: [2, 1, 4], target: [0, 0, 0] }
    };

    const targetKeyframe = keyframes[currentPhase];

    // Animate Camera Position
    gsap.to(camera.position, {
      x: targetKeyframe.pos[0],
      y: targetKeyframe.pos[1],
      z: targetKeyframe.pos[2],
      duration: 3,
      ease: 'power3.inOut'
    });

    // Animate OrbitControls Target
    gsap.to(controls.target, {
      x: targetKeyframe.target[0],
      y: targetKeyframe.target[1],
      z: targetKeyframe.target[2],
      duration: 3,
      ease: 'power3.inOut'
    });

  }, [currentPhase]);

  return <OrbitControls ref={cameraRef} enableZoom={true} enablePan={true} maxDistance={20} minDistance={1.05} />;
}

// ----------------------------------------------------
// Moon Object & Shaders
// ----------------------------------------------------
function MoonModel() {
  const { currentPhase, timeOfDay } = useCinematicEngine();
  const { showTerrain, showElevation, showSlopeHeatmap, showIllumination, showMissionRoute } = useVisualLayers();
  const moonGroupRef = useRef<THREE.Group>(null);

  // Load realistic lunar textures
  const texture = useTexture('/moon_color.jpg');

  useFrame(() => {
    if (moonGroupRef.current) {
      // Continuous beautiful rotation for the whole lunar globe
      // Stop rotation during close-up phases for precise planning
      if (['INITIALIZING', 'ORBITAL_INSERTION'].includes(currentPhase)) {
        moonGroupRef.current.rotation.y += 0.001; 
      }
    }
  });

  return (
    <group ref={moonGroupRef} rotation={[0.027, 0, 0]}> {/* 1.54 degree axial tilt */}
      {/* Base Moon */}
      {showTerrain && (
        <Sphere args={[1.5, 128, 128]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            map={texture}
            bumpMap={texture}
            bumpScale={0.02}
            color={showSlopeHeatmap ? "#ff8888" : "#ffffff"} // Heatmap tint
            roughness={1}
            metalness={0.05}
            wireframe={showElevation || currentPhase === 'TERRAIN_GENERATION'}
          />
        </Sphere>
      )}

      {/* Dynamic Illumination */}
      {showIllumination && (
        <directionalLight 
          position={[Math.cos(timeOfDay) * 10, Math.sin(timeOfDay) * 10, 5]} 
          intensity={2} 
          castShadow 
        />
      )}

      {/* Scientific Region Markers */}
      {currentPhase !== 'INITIALIZING' && (
        <group>
          {/* Faustini Crater (South Pole ~85S, 30E) */}
          <group position={[0, -1.48, 0.2]}>
            <Sphere args={[0.02, 16, 16]}>
              <meshBasicMaterial color="#3b82f6" />
            </Sphere>
            <Html center position={[0, -0.05, 0]}>
              <div className="bg-black/80 border border-blue-500/50 backdrop-blur p-2 rounded shadow-[0_0_10px_rgba(59,130,246,0.5)]">
                <p className="text-[10px] font-mono font-bold text-blue-400 whitespace-nowrap">FAUSTINI F2 (PRIMARY)</p>
                <p className="text-[8px] font-mono text-slate-400">85.4°S, 30.1°E</p>
              </div>
            </Html>
          </group>

          {/* Shackleton Crater (South Pole ~89S, 0E) */}
          <group position={[0, -1.495, 0]}>
            <Sphere args={[0.015, 16, 16]}>
              <meshBasicMaterial color="#eab308" />
            </Sphere>
            <Html center position={[0, -0.05, 0]}>
              <div className="bg-black/80 border border-yellow-500/50 backdrop-blur p-1.5 rounded opacity-70 hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-mono font-bold text-yellow-400 whitespace-nowrap">SHACKLETON (PSR)</p>
              </div>
            </Html>
          </group>

          {/* Malapert Massif (South Pole ~85S, 11E) */}
          <group position={[-0.1, -1.47, 0.1]}>
            <Sphere args={[0.015, 16, 16]}>
              <meshBasicMaterial color="#10b981" />
            </Sphere>
            <Html center position={[0, -0.05, 0]}>
              <div className="bg-black/80 border border-green-500/50 backdrop-blur p-1.5 rounded opacity-70 hover:opacity-100 transition-opacity">
                <p className="text-[9px] font-mono font-bold text-green-400 whitespace-nowrap">MALAPERT MASSIF</p>
              </div>
            </Html>
          </group>
        </group>
      )}

      {/* Traverse Path Visualization (Appears during planning or if toggle is true) */}
      {(currentPhase === 'TRAVERSE_PLANNING' || showMissionRoute) && (
        <Line
          points={[
            [0, -1.48, 0.2],
            [0.05, -1.47, 0.22],
            [0.08, -1.46, 0.25],
            [0.1, -1.45, 0.3]
          ]}
          color={showSlopeHeatmap ? "#ef4444" : "#3b82f6"} // Red route if hazards are on
          lineWidth={3}
          dashed={true}
        />
      )}
    </group>
  );
}

// ----------------------------------------------------
// Main Canvas Component
// ----------------------------------------------------
export default function DigitalTwin() {
  const { showPerformanceStats } = useVisualLayers();

  return (
    <div className="w-full h-full bg-[#020617] relative">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
        {showPerformanceStats && <Stats className="!absolute !top-12 !left-4" />}
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.05} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <React.Suspense fallback={
          <Html center>
            <div className="text-blue-500 font-mono text-xs animate-pulse">INITIALIZING LUNAR DEM...</div>
          </Html>
        }>
          <MoonModel />
        </React.Suspense>
        
        <CinematicCameraController />
      </Canvas>
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.9)'
      }} />
    </div>
  );
}
