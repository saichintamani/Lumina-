"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, useTexture, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// ----------------------------------------------------
// Custom GLSL Volumetric X-Ray Shader
// ----------------------------------------------------
const HolographicMaterial = shaderMaterial(
  {
    uTime: 0,
    uTexture: new THREE.Texture(),
    uColor1: new THREE.Color('#00ffff'), // Cyan (Water Ice)
    uColor2: new THREE.Color('#ff00ff'), // Magenta (Titanium/Iron)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    uniform float uTime;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    uniform sampler2D uTexture;
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;

    void main() {
      // Sample displacement map (grayscale)
      vec4 texColor = texture2D(uTexture, vUv);
      float depth = texColor.r; // 0 to 1 based on crater depth/height

      // Fresnel Effect (Edge Glow)
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = dot(viewDir, normal);
      fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
      fresnel = pow(fresnel, 3.0);

      // Color mapping based on depth (heightmap)
      // Low areas (craters) get cyan (ice), high areas get magenta (iron)
      vec3 finalColor = mix(uColor1, uColor2, depth);
      
      // Add pulsing scanline effect
      float scanline = sin(vUv.y * 100.0 - uTime * 2.0) * 0.1 + 0.9;
      
      // Combine
      float alpha = (fresnel * 0.8 + 0.2) * scanline;
      
      // Highlight craters more
      if (depth < 0.2) {
        finalColor += uColor1 * 2.0;
        alpha += 0.5;
      }

      gl_FragColor = vec4(finalColor * alpha, alpha * 0.8);
    }
  `
);

extend({ HolographicMaterial });

// Removed problematic typescript declaration

function HolographicMoon() {
  const moonGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<any>(null);
  
  // Use the same displacement map
  const texture = useTexture('/moon_color.jpg');

  useFrame(({ clock }) => {
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y += 0.002; 
    }
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
    }
  });

  return (
    <group ref={moonGroupRef} rotation={[0.027, 0, 0]}>
      {/* Inner Solid Core (Dark) */}
      <Sphere args={[1.48, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial color="#020617" />
      </Sphere>

      {/* Holographic Shell */}
      <Sphere args={[1.5, 128, 128]} position={[0, 0, 0]}>
        {/* @ts-ignore - Dynamically extended element */}
        <holographicMaterial 
          ref={materialRef} 
          uTexture={texture}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Sphere>
    </group>
  );
}

import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';

function ScientificCameraController() {
  const cameraRef = useRef<any>(null);
  const spaceWeather = useTelemetryStore(state => state.spaceWeather);

  useFrame(() => {
    if (cameraRef.current && spaceWeather.active) {
      const camera = cameraRef.current.object;
      const jitterIntensity = 0.005 * (spaceWeather.severity / 5);
      camera.position.x += (Math.random() - 0.5) * jitterIntensity;
      camera.position.y += (Math.random() - 0.5) * jitterIntensity;
      camera.position.z += (Math.random() - 0.5) * jitterIntensity;
    }
  });

  return (
    <OrbitControls ref={cameraRef} enableZoom={true} enablePan={true} autoRotate={false} maxDistance={10} minDistance={2} />
  );
}

export default function ScientificDigitalTwin() {
  return (
    <div className="w-full h-full bg-[#000510] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <color attach="background" args={['#000510']} />
        
        {/* Abstract Data Particles / Stars */}
        <Stars radius={50} depth={20} count={1000} factor={2} saturation={1} fade speed={0.5} />
        
        <React.Suspense fallback={null}>
          <HolographicMoon />
        </React.Suspense>
        
        <ScientificCameraController />
      </Canvas>
      
      {/* HUD Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,1)'
      }} />
    </div>
  );
}
