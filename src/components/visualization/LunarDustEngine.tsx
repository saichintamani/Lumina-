import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { useRoverControls } from '@/lib/controls/useRoverControls';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';

const PARTICLE_COUNT = 500;
const LUNAR_GRAVITY = 1.62; // m/s^2

export default function LunarDustEngine() {
  const { currentPhase } = useCinematicEngine();
  const roverControls = useRoverControls();
  
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Particle state arrays
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      life: 0,
      active: false,
    }));
  }, []);

  useFrame((_, delta) => {
    if (currentPhase !== 'MANUAL_OVERRIDE') {
      // Hide all particles if not in manual override
      if (meshRef.current) {
        meshRef.current.count = 0;
      }
      return;
    }

    const isMoving = roverControls.forward || roverControls.backward || roverControls.left || roverControls.right;
    const roverPosArr = useTelemetryStore.getState().roverPosition;
    const roverPos = new THREE.Vector3(...roverPosArr);
    
    // The surface normal at the rover's position (pulls toward center 0,0,0)
    const surfaceNormal = roverPos.clone().normalize();
    const gravityVector = surfaceNormal.clone().multiplyScalar(-LUNAR_GRAVITY * 0.05); // Scaled for visual effect

    // Spawn new particles if moving
    if (isMoving) {
      // Spawn a few particles per frame
      for (let i = 0; i < 3; i++) {
        const deadParticle = particles.find(p => !p.active);
        if (deadParticle) {
          deadParticle.active = true;
          deadParticle.life = 1.5 + Math.random() * 0.5; // 1.5 to 2 seconds of life
          
          // Spawn slightly randomly around the rover base
          const offset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
          );
          deadParticle.position.copy(roverPos).add(offset);
          
          // Velocity: kick up away from the surface normal, plus some random scatter
          const kickVelocity = surfaceNormal.clone().multiplyScalar(0.05 + Math.random() * 0.05);
          const scatterVelocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
          );
          deadParticle.velocity.copy(kickVelocity).add(scatterVelocity);
        }
      }
    }

    // Update and render particles
    let activeCount = 0;
    
    if (meshRef.current) {
      particles.forEach((p, i) => {
        if (p.active) {
          p.life -= delta;
          
          if (p.life <= 0) {
            p.active = false;
            // Move dead particles far away
            dummy.position.set(9999, 9999, 9999);
            dummy.scale.set(0, 0, 0);
          } else {
            // Apply physics: V = V0 + A*t (Gravity pulls towards center)
            p.velocity.add(gravityVector.clone().multiplyScalar(delta));
            p.position.add(p.velocity.clone().multiplyScalar(delta));

            // Collision with surface: if distance to center < 1.48, it hit the ground
            if (p.position.length() < 1.48) {
              p.active = false;
              dummy.position.set(9999, 9999, 9999);
              dummy.scale.set(0, 0, 0);
            } else {
              // Render active particle
              dummy.position.copy(p.position);
              
              // Scale down as it dies
              const scale = p.life * 0.005;
              dummy.scale.set(scale, scale, scale);
              activeCount++;
            }
          }
          
          dummy.updateMatrix();
          meshRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
      // We keep count at PARTICLE_COUNT but effectively hide dead ones by scaling to 0
      meshRef.current.count = PARTICLE_COUNT;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#a3a3a3" transparent opacity={0.6} />
    </instancedMesh>
  );
}
