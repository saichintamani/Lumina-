"use client";

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useCinematicEngine, MissionPhase } from '@/lib/memory/cinematicEngine';
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
  const moonRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (moonRef.current && currentPhase === 'INITIALIZING') {
      moonRef.current.rotation.y += 0.0005; // Slow idle rotation
    }
  });

  return (
    <group>
      {/* Base Moon */}
      <Sphere ref={moonRef} args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial 
          color="#888888"
          roughness={0.9}
          metalness={0.1}
          wireframe={currentPhase === 'TERRAIN_GENERATION'}
        />
      </Sphere>

      {/* Dynamic Illumination */}
      <directionalLight 
        position={[Math.cos(timeOfDay) * 10, Math.sin(timeOfDay) * 10, 5]} 
        intensity={2} 
        castShadow 
      />

      {/* Faustini Crater Marker (South Pole ~85S, 30E) */}
      {currentPhase !== 'INITIALIZING' && (
        <group position={[0, -1.48, 0.2]}> {/* Approximate WebGL coord for Faustini */}
          <Html center>
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-green-500/20 animate-ping" />
              <div className="text-[10px] font-mono text-green-400 mt-1 bg-slate-900/80 px-2 py-0.5 rounded backdrop-blur">FAUSTINI (F2)</div>
            </div>
          </Html>
        </group>
      )}

      {/* Traverse Path Visualization (Appears during planning) */}
      {currentPhase === 'TRAVERSE_PLANNING' && (
        <Line
          points={[
            [0, -1.48, 0.2],
            [0.05, -1.47, 0.22],
            [0.08, -1.46, 0.25],
            [0.1, -1.45, 0.3]
          ]}
          color="#3b82f6"
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
  return (
    <div className="w-full h-full bg-[#020617] relative">
      <Canvas shadows camera={{ position: [0, 0, 10], fov: 45 }}>
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
