import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { SwarmEngine } from '@/lib/physics/boidsEngine';

export default function RoverSwarm() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const { roverPosition, swarmActive } = useTelemetryStore();
  
  const BOID_COUNT = 50;

  // Initialize physics engine only once
  const swarm = useMemo(() => {
    // Spawn them around the main rover's starting position
    const startPos = new THREE.Vector3(...roverPosition);
    return new SwarmEngine(BOID_COUNT, startPos);
  }, []); // Empty deps so it persists across renders

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!swarmActive || !meshRef.current) return;

    // Update physics
    swarm.update(delta);

    // Update instances
    for (let i = 0; i < BOID_COUNT; i++) {
      const boid = swarm.boids[i];
      
      dummy.position.copy(boid.position);
      
      // Orient the drone to face its velocity
      if (boid.velocity.lengthSq() > 0.001) {
        // Create a target position slightly ahead of the boid
        const target = boid.position.clone().add(boid.velocity);
        dummy.lookAt(target);
      }
      
      // Update the instance matrix
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!swarmActive) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, BOID_COUNT]}>
      {/* Sleek triangular drone shape */}
      <coneGeometry args={[0.02, 0.08, 3]} />
      {/* Glowing material */}
      <meshStandardMaterial 
        color="#00ffff" 
        emissive="#00ffff" 
        emissiveIntensity={2} 
        toneMapped={false}
      />
    </instancedMesh>
  );
}
