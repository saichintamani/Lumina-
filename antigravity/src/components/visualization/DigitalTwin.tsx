"use client";

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html, Line, Stats, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useCinematicEngine, MissionPhase } from '@/lib/memory/cinematicEngine';
import { useVisualLayers } from '@/lib/memory/visualLayerManager';
import gsap from 'gsap';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { useRoverControls } from '@/lib/controls/useRoverControls';
import LunarDustEngine from './LunarDustEngine';

// ----------------------------------------------------
// Cinematic Camera Controller
// ----------------------------------------------------
function CinematicCameraController() {
  const { currentPhase } = useCinematicEngine();
  const cameraRef = useRef<any>(null);
  const setCameraPosition = useTelemetryStore(state => state.setCameraPosition);
  const roverPosition = useTelemetryStore(state => state.roverPosition);

  useFrame(() => {
    if (cameraRef.current) {
      setCameraPosition(cameraRef.current.object.position.toArray());

      // Third-Person Follow Camera logic for MANUAL_OVERRIDE
      if (currentPhase === 'MANUAL_OVERRIDE') {
        const camera = cameraRef.current.object;
        const controls = cameraRef.current;
        
        // Calculate a position slightly behind and above the rover
        // Rover is roughly around [0, -1.48, 0.2]
        const offset = new THREE.Vector3(0, 0.05, -0.15); // Offset relative to rover
        
        // Since rover is mostly on the bottom hemisphere, let's just use absolute positioning for now
        // to keep it simple, pushing the camera "up" (y) and "back" (z) from the rover's position.
        const targetCamPos = new THREE.Vector3(
          roverPosition[0], 
          roverPosition[1] + 0.1, 
          roverPosition[2] + 0.15
        );

        const targetLookAt = new THREE.Vector3(...roverPosition);

        // Smoothly interpolate (lerp) camera position and lookAt target
        camera.position.lerp(targetCamPos, 0.05);
        controls.target.lerp(targetLookAt, 0.05);
      }
    }
  });

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
      'MISSION_SUCCESS': { pos: [2, 1, 4], target: [0, 0, 0] },
      'MANUAL_OVERRIDE': { pos: [0, -1.38, 0.35], target: [0, -1.48, 0.2] } // Initial jump to rover
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

  // Disable orbit controls during manual override so WASD takes full control
  return (
    <OrbitControls 
      ref={cameraRef} 
      enableZoom={currentPhase !== 'MANUAL_OVERRIDE'} 
      enablePan={currentPhase !== 'MANUAL_OVERRIDE'} 
      enableRotate={currentPhase !== 'MANUAL_OVERRIDE'} 
      maxDistance={20} 
      minDistance={1.05} 
    />
  );
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

  // Orbiter & Rover References
  const orbiterRef = useRef<THREE.Mesh>(null);
  const dataLinkRef = useRef<any>(null);
  const roverRef = useRef<THREE.Mesh>(null);

  // Manual Override States
  const setRoverPosition = useTelemetryStore(state => state.setRoverPosition);
  const roverControls = useRoverControls();
  const manualRoverPos = useRef(new THREE.Vector3(0, -1.48, 0.2));

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    if (moonGroupRef.current) {
      // Continuous beautiful rotation for the whole lunar globe
      if (['INITIALIZING', 'ORBITAL_INSERTION'].includes(currentPhase)) {
        moonGroupRef.current.rotation.y += 0.001; 
      }
    }

    // Orbiter Simulation (Fast Polar Orbit)
    if (orbiterRef.current && dataLinkRef.current) {
      const radius = 2.2;
      const speed = 0.5;
      const x = 0;
      const y = Math.sin(elapsedTime * speed) * radius;
      const z = Math.cos(elapsedTime * speed) * radius;
      
      orbiterRef.current.position.set(x, y, z);

      // Data link active only when orbiter is above the southern hemisphere (y < 0)
      if (y < 0) {
        dataLinkRef.current.visible = true;
        // The array of points must be dynamically updated. 
        // In three.js geometry we can update positions:
        const positions = dataLinkRef.current.geometry.attributes.position.array;
        positions[0] = x; positions[1] = y; positions[2] = z; // Orbiter
        positions[3] = 0; positions[4] = -1.48; positions[5] = 0.2; // Faustini
        dataLinkRef.current.geometry.attributes.position.needsUpdate = true;
      } else {
        dataLinkRef.current.visible = false;
      }
    }

    // Rover Traverse Animation & Manual Override
    if (roverRef.current) {
      if (currentPhase === 'MANUAL_OVERRIDE') {
        // Apply WASD controls
        const speed = 0.0005;
        if (roverControls.forward) manualRoverPos.current.z -= speed;
        if (roverControls.backward) manualRoverPos.current.z += speed;
        if (roverControls.left) manualRoverPos.current.x -= speed;
        if (roverControls.right) manualRoverPos.current.x += speed;

        // Keep it glued to the sphere surface (radius ~ 1.48 in this region)
        // Normalize vector and multiply by radius
        manualRoverPos.current.normalize().multiplyScalar(1.48);

        roverRef.current.position.copy(manualRoverPos.current);
        setRoverPosition(roverRef.current.position.toArray());

      } else if (currentPhase === 'TRAVERSE_PLANNING' || currentPhase === 'MISSION_SUCCESS') {
        const path = [
          [0, -1.48, 0.2],
          [0.05, -1.47, 0.22],
          [0.08, -1.46, 0.25],
          [0.1, -1.45, 0.3]
        ];
        // Simple ping-pong animation along the 4 points
        const t = (Math.sin(elapsedTime * 0.5) + 1) / 2; // 0 to 1
        const totalSegments = path.length - 1;
        const segment = Math.floor(t * totalSegments);
        const segmentT = (t * totalSegments) - segment;
        
        if (segment < totalSegments) {
          const start = path[segment];
          const end = path[segment + 1];
          roverRef.current.position.set(
            start[0] + (end[0] - start[0]) * segmentT,
            start[1] + (end[1] - start[1]) * segmentT,
            start[2] + (end[2] - start[2]) * segmentT
          );
          setRoverPosition(roverRef.current.position.toArray());
          // Sync manual pos to end of animation so it doesn't snap if they override
          manualRoverPos.current.copy(roverRef.current.position);
        }
      }
    }
  });

  return (
    <group ref={moonGroupRef} rotation={[0.027, 0, 0]}> {/* 1.54 degree axial tilt */}
      {/* Base Moon */}
      {showTerrain && (
        <Sphere args={[1.5, 256, 256]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial 
            map={texture}
            displacementMap={texture}
            displacementScale={0.06} // Aggressive 3D displacement
            color={showSlopeHeatmap ? "#ff8888" : "#ffffff"} // Heatmap tint
            roughness={0.85}
            metalness={0.05}
            wireframe={showElevation || currentPhase === 'TERRAIN_GENERATION'}
          />
        </Sphere>
      )}

      {/* Subtle Atmospheric Glow (Rim) */}
      <Sphere args={[1.55, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial 
          color="#ffeedd"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

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

      {/* Traverse Path & Rover Visualization */}
      {(currentPhase === 'TRAVERSE_PLANNING' || showMissionRoute || currentPhase === 'MISSION_SUCCESS' || currentPhase === 'MANUAL_OVERRIDE') && (
        <>
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
          {/* Animated/Manual Rover Blip */}
          <mesh ref={roverRef} position={[0, -1.48, 0.2]}>
            <sphereGeometry args={[0.005, 8, 8]} />
            <meshBasicMaterial color={currentPhase === 'MANUAL_OVERRIDE' ? "#ff00ff" : "#00ff00"} />
            <Html center position={[0, -0.02, 0]}>
              <div className={`text-[6px] font-mono font-bold whitespace-nowrap animate-pulse ${currentPhase === 'MANUAL_OVERRIDE' ? 'text-pink-500' : 'text-green-400'}`}>
                {currentPhase === 'MANUAL_OVERRIDE' ? 'PRAGYAN_MANUAL' : 'PRAGYAN_ACTV'}
              </div>
            </Html>
          </mesh>
          <LunarDustEngine />
        </>
      )}

      {/* Orbital Relay Satellite & Data Link */}
      {currentPhase !== 'INITIALIZING' && (
        <group>
          <mesh ref={orbiterRef}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
            <Html center position={[0, 0.05, 0]}>
              <div className="bg-black/60 border border-slate-500/50 p-1 rounded backdrop-blur">
                <p className="text-[8px] font-mono font-bold text-slate-200 whitespace-nowrap">CH2 ORBITER RELAY</p>
              </div>
            </Html>
          </mesh>
          <line ref={dataLinkRef}>
            <bufferGeometry attach="geometry">
              <float32BufferAttribute attach="attributes-position" args={[new Float32Array(6), 3]} />
            </bufferGeometry>
            <lineBasicMaterial attach="material" color="#3b82f6" transparent opacity={0.5} />
          </line>
        </group>
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
        <ambientLight intensity={0.15} />
        
        {/* Cinematic Rim Light */}
        <directionalLight position={[-4, 2, -6]} intensity={1.5} color="#ffcc88" />
        
        {/* Fill Light */}
        <pointLight position={[0, -3, 0]} intensity={0.5} color="#5577aa" />
        
        {/* Multi-layered Parallax Starfield */}
        <group>
          <Stars radius={100} depth={50} count={3000} factor={3} saturation={0} fade speed={0.5} />
          <Stars radius={150} depth={80} count={2000} factor={4} saturation={0.5} fade speed={1} />
        </group>
        
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
