"use client";

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { Html } from '@react-three/drei';

/**
 * SwarmCommLinks
 * ==============
 * Renders dynamic laser communication links between rover swarm drones.
 * Links are drawn only between drones within communication range.
 * A pulsing animation simulates data transfer packets.
 * The mesh network health is computed and displayed as a floating HUD.
 */

interface DroneLink {
  from: THREE.Vector3;
  to: THREE.Vector3;
  strength: number; // 0..1 based on distance
}

export default function SwarmCommLinks({ swarmRef }: { swarmRef: React.RefObject<THREE.InstancedMesh | null> }) {
  const { swarmActive } = useTelemetryStore();
  const linesRef = useRef<THREE.Group>(null);
  const COMM_RANGE = 0.8; // Max link distance
  const BOID_COUNT = 50;
  
  // Reusable matrix and vector
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempVec = useMemo(() => new THREE.Vector3(), []);

  // Line material - shared across all links
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color('#00ffcc'),
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  useFrame(({ clock }) => {
    if (!swarmActive || !swarmRef?.current || !linesRef.current) return;

    const mesh = swarmRef.current;
    const group = linesRef.current;
    const time = clock.getElapsedTime();

    // Clear previous frame's links
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
      }
      group.remove(child);
    }

    // Extract positions from instanced mesh
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      mesh.getMatrixAt(i, tempMatrix);
      tempVec.setFromMatrixPosition(tempMatrix);
      positions.push(tempVec.clone());
    }

    // Build communication links between nearby drones
    let activeLinks = 0;
    const maxLinksPerFrame = 80; // Performance cap

    for (let i = 0; i < positions.length && activeLinks < maxLinksPerFrame; i++) {
      for (let j = i + 1; j < positions.length && activeLinks < maxLinksPerFrame; j++) {
        const dist = positions[i].distanceTo(positions[j]);
        
        if (dist < COMM_RANGE) {
          const strength = 1 - (dist / COMM_RANGE);
          
          // Pulsing opacity based on time for "data packet" effect
          const pulse = (Math.sin(time * 4 + i * 0.5 + j * 0.3) + 1) / 2;
          const finalOpacity = strength * 0.15 * (0.5 + pulse * 0.5);

          const geometry = new THREE.BufferGeometry().setFromPoints([
            positions[i],
            positions[j]
          ]);

          const mat = lineMaterial.clone();
          mat.opacity = finalOpacity;

          // Color gradient based on signal strength
          if (strength > 0.7) {
            mat.color = new THREE.Color('#00ffcc'); // Strong = cyan
          } else if (strength > 0.4) {
            mat.color = new THREE.Color('#ffcc00'); // Medium = yellow
          } else {
            mat.color = new THREE.Color('#ff4444'); // Weak = red
          }

          const line = new THREE.Line(geometry, mat);
          group.add(line);
          activeLinks++;
        }
      }
    }
  });

  if (!swarmActive) return null;

  return <group ref={linesRef} />;
}
