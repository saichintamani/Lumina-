"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html, Line, Stats, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { useCinematicEngine, MissionPhase } from '@/lib/memory/cinematicEngine';
import { useVisualLayers } from '@/lib/memory/visualLayerManager';
import gsap from 'gsap';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { useRoverControls } from '@/lib/controls/useRoverControls';
import LunarDustEngine from './LunarDustEngine';
import RoverSwarm from './RoverSwarm';

// ----------------------------------------------------
// Cinematic Camera Controller
// ----------------------------------------------------
function CinematicCameraController() {
  const { currentPhase } = useCinematicEngine();
  const cameraRef = useRef<any>(null);
  const setCameraPosition = useTelemetryStore(state => state.setCameraPosition);
  const roverPosition = useTelemetryStore(state => state.roverPosition);
  const spaceWeather = useTelemetryStore(state => state.spaceWeather);
  const cameraMode = useTelemetryStore(state => state.cameraMode);

  useFrame(() => {
    if (cameraRef.current) {
      setCameraPosition(cameraRef.current.object.position.toArray());

      const camera = cameraRef.current.object;
      const controls = cameraRef.current;

      // Space Weather Sensor Jitter
      if (spaceWeather.active) {
        const jitterIntensity = 0.005 * (spaceWeather.severity / 5);
        camera.position.x += (Math.random() - 0.5) * jitterIntensity;
        camera.position.y += (Math.random() - 0.5) * jitterIntensity;
        camera.position.z += (Math.random() - 0.5) * jitterIntensity;
      }

      // Third-Person Follow Camera / First-Person Camera logic for MANUAL_OVERRIDE
      if (currentPhase === 'MANUAL_OVERRIDE') {
        const camera = cameraRef.current.object;
        const controls = cameraRef.current;
        
        if (cameraMode === 'FIRST_PERSON') {
          // Snap camera to rover position (slightly elevated to simulate navcam height)
          const targetCamPos = new THREE.Vector3(
            roverPosition[0], 
            roverPosition[1] + 0.05, 
            roverPosition[2] + 0.05
          );
          
          // Look slightly ahead and down
          const forward = new THREE.Vector3(0, 0, 1).applyEuler(new THREE.Euler(0, 0, 0)); // Assuming rover moves mostly along Z
          // Actually, our rover position is on the sphere. We need the tangent.
          // Simplification: just look at the origin for a dramatic downwards view, 
          // or look slightly along the surface.
          const nPos = new THREE.Vector3(...roverPosition).normalize();
          const targetLookAt = new THREE.Vector3(
            roverPosition[0] - nPos.x * 0.1,
            roverPosition[1] - nPos.y * 0.1,
            roverPosition[2] - nPos.z * 0.1 + 0.5 // Push it along Z slightly
          );

          camera.position.lerp(targetCamPos, 0.2);
          controls.target.lerp(targetLookAt, 0.2);

        } else {
          // Third Person Orbit
          const offset = new THREE.Vector3(0, 0.05, -0.15); // Offset relative to rover
          
          const targetCamPos = new THREE.Vector3(
            roverPosition[0], 
            roverPosition[1] + 0.1, 
            roverPosition[2] + 0.15
          );

          const targetLookAt = new THREE.Vector3(...roverPosition);

          camera.position.lerp(targetCamPos, 0.05);
          controls.target.lerp(targetLookAt, 0.05);
        }
        
        controls.update();
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
  const latencyMode = useTelemetryStore(state => state.latencyMode);
  const roverControls = useRoverControls();
  const manualRoverPos = useRef(new THREE.Vector3(0, -1.48, 0.2));
  
  // Latency Simulator Buffer
  const commandQueue = useRef<{ time: number, state: any }[]>([]);
  const lastActiveControls = useRef({ forward: false, backward: false, left: false, right: false });

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
        
        let activeControls = { forward: false, backward: false, left: false, right: false };

        if (latencyMode) {
          commandQueue.current.push({
            time: Date.now() + 2600, // 2.6s Round Trip Time
            state: { ...roverControls }
          });
          
          const now = Date.now();
          while (commandQueue.current.length > 0 && commandQueue.current[0].time <= now) {
            lastActiveControls.current = commandQueue.current.shift()!.state;
          }
          activeControls = lastActiveControls.current;
        } else {
          activeControls = roverControls;
          // Clear queue if toggled off
          if (commandQueue.current.length > 0) commandQueue.current = [];
        }

        // Apply WASD controls
        const speed = 0.0005;
        if (activeControls.forward) manualRoverPos.current.z -= speed;
        if (activeControls.backward) manualRoverPos.current.z += speed;
        if (activeControls.left) manualRoverPos.current.x -= speed;
        if (activeControls.right) manualRoverPos.current.x += speed;

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
        <Sphere name="Moon" args={[1.5, 256, 256]} position={[0, 0, 0]} castShadow receiveShadow>
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

      {/* Terrain Deformation / Tire Tracks */}
      <TireTracksOverlay />

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
// Real-time Terrain Deformation (Tire Tracks)
// ----------------------------------------------------
function TireTracksOverlay() {
  const { roverPosition } = useTelemetryStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const lastPos = useRef(new THREE.Vector3());

  // Initialize Canvas
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // High res for sharp tracks
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    canvasRef.current = canvas;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16; // Better viewing at angles
    textureRef.current = texture;
  }, []);

  useFrame(() => {
    if (!canvasRef.current || !textureRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const currentPos = new THREE.Vector3(...roverPosition);
    
    // Only draw if we moved
    if (currentPos.distanceTo(lastPos.current) > 0.005) {
      lastPos.current.copy(currentPos);
      
      // Calculate spherical UV coordinates for the rover's position
      // Moon radius is 1.5
      const radius = 1.5;
      
      // Normalize position
      const nPos = currentPos.clone().normalize();
      
      // Standard spherical mapping
      const u = 0.5 + Math.atan2(nPos.z, nPos.x) / (2 * Math.PI);
      const v = 0.5 - Math.asin(nPos.y) / Math.PI;

      // Convert UV to Canvas Pixels
      const px = u * canvasRef.current.width;
      const py = (1 - v) * canvasRef.current.height; // Flip V for canvas

      // Draw Tire Track "Stamp"
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, 2 * Math.PI); // 2px radius stamp
      // Very dark, semi-transparent track color to blend with regolith
      ctx.fillStyle = 'rgba(10, 15, 25, 0.4)'; 
      ctx.fill();

      // Important: Tell Three.js the canvas has updated
      textureRef.current.needsUpdate = true;
    }
  });

  return (
    <Sphere args={[1.505, 128, 128]}>
      {/* 
        This sphere sits slightly above the main moon (1.505 vs 1.5).
        It renders the transparent canvas texture, placing tire tracks onto the terrain.
      */}
      <meshStandardMaterial 
        map={textureRef.current} 
        transparent 
        polygonOffset 
        polygonOffsetFactor={-1} 
        polygonOffsetUnits={-1}
        roughness={0.9} // Tracks are rough
      />
    </Sphere>
  );
}

// ----------------------------------------------------
// Dynamic Sun & Raycast Shadows (Survival Physics)
// ----------------------------------------------------
function DynamicSun() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { roverPosition, setInShadow, setBatteryLevel, batteryLevel, setTemperature, setMissionFailed, missionFailed } = useTelemetryStore();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  
  // Throttle physics updates to save performance
  const lastCheck = useRef(0);

  useFrame(({ scene, clock }) => {
    const time = clock.getElapsedTime();
    
    if (lightRef.current) {
      // Orbit the sun slowly around the moon
      // Using a highly elliptical/low angle orbit to simulate south pole long shadows
      const orbitSpeed = 0.05;
      const radius = 8;
      lightRef.current.position.set(
        Math.cos(time * orbitSpeed) * radius,
        1.5, // Low angle
        Math.sin(time * orbitSpeed) * radius
      );

      // Shadow physics check (Raycasting)
      if (time - lastCheck.current > 0.5) {
        lastCheck.current = time;

        const moon = scene.getObjectByName('Moon');
        if (moon) {
          const roverVec = new THREE.Vector3(...roverPosition);
          const lightVec = lightRef.current.position.clone();
          const dirToSun = new THREE.Vector3().subVectors(lightVec, roverVec).normalize();
          
          raycaster.set(roverVec, dirToSun);
          const intersects = raycaster.intersectObject(moon);

          // If the ray hits the moon before the sun, the rover is in shadow!
          const inShadow = intersects.length > 0 && intersects[0].distance < roverVec.distanceTo(lightVec);
          
          setInShadow(inShadow);
          
          if (inShadow) {
            setTemperature(-173);
            const newBattery = Math.max(0, batteryLevel - 2);
            setBatteryLevel(newBattery); // Drain battery
            if (newBattery === 0 && !missionFailed) {
              setMissionFailed(true);
            }
          } else {
            setTemperature(120);
            setBatteryLevel(Math.min(100, batteryLevel + 1)); // Recharge battery
          }
        }
      }
    }
  });

  return <directionalLight ref={lightRef} intensity={1.5} color="#ffcc88" castShadow shadow-mapSize={[2048, 2048]} />;
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
        
        {/* Dynamic Survival Sun */}
        <DynamicSun />
        
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
          <RoverSwarm />
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
