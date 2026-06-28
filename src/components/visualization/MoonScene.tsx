"use client";

import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Line } from "@react-three/drei";
import { MotionValue } from "framer-motion";
import * as THREE from "three";

interface MoonSceneProps {
  scrollProgress: MotionValue<number>;
}

// ----------------------------------------------------
// Core Moon Component
// ----------------------------------------------------
function Moon({ scrollProgress }: { scrollProgress: MotionValue<number> }) {
  const moonRef = useRef<THREE.Mesh>(null);
  
  // High-res map
  const colorMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg');

  useFrame((state, delta) => {
    if (moonRef.current) {
      // Base rotation
      moonRef.current.rotation.y += delta * 0.05;
      
      // Narrative camera control based on scroll
      const progress = scrollProgress.get();
      
      // Phase 1: Arrival (Far out) -> Phase 2: Briefing (Close up) -> Phase 3: Problem (South Pole focus)
      let targetZ = 45;
      let targetY = 15;
      let targetX = 0;

      if (progress > 0.1 && progress <= 0.4) {
        // Zoom in to equatorial orbit
        targetZ = 25;
        targetY = 5;
      } else if (progress > 0.4) {
        // Dive to the South Pole (Faustini PSR)
        targetZ = 20;
        targetY = -18;
      }

      state.camera.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.02);
      state.camera.lookAt(0, progress > 0.4 ? -20 : 0, 0);
    }
  });

  return (
    <group>
      <mesh ref={moonRef}>
        <sphereGeometry args={[20, 128, 128]} />
        <meshStandardMaterial 
          map={colorMap} 
          bumpMap={colorMap}
          bumpScale={0.8}
          roughness={0.9}
        />
        {/* Faustini Target Marker */}
        <TargetRing />
      </mesh>
    </group>
  );
}

// ----------------------------------------------------
// Target Ring for Faustini
// ----------------------------------------------------
function TargetRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const lat = -85.46 * (Math.PI / 180);
  const lon = 30.12 * (Math.PI / 180);
  
  const pos = new THREE.Vector3().setFromSphericalCoords(20.1, Math.PI / 2 - lat, lon);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.3;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <mesh ref={ringRef} position={pos} lookAt={() => new THREE.Vector3(0,0,0).add(pos.clone().multiplyScalar(2))}>
      <ringGeometry args={[0.5, 0.8, 32]} />
      <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} transparent opacity={0.8} />
    </mesh>
  );
}

// ----------------------------------------------------
// Main Canvas Wrapper
// ----------------------------------------------------
export default function MoonScene({ scrollProgress }: MoonSceneProps) {
  return (
    <Canvas camera={{ position: [0, 20, 60], fov: 45 }}>
      <fog attach="fog" args={["#020617", 30, 90]} />
      
      <ambientLight intensity={0.05} />
      <directionalLight 
        position={[100, 5, 50]} 
        intensity={2.0} 
        color="#ffffff" 
      />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <Moon scrollProgress={scrollProgress} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        enableRotate={true}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
