import * as THREE from 'three';

export class Boid {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  maxSpeed: number;
  maxForce: number;

  constructor(x: number, y: number, z: number) {
    this.position = new THREE.Vector3(x, y, z);
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1
    );
    this.acceleration = new THREE.Vector3();
    this.maxSpeed = 0.5;
    this.maxForce = 0.05;
  }

  applyForce(force: THREE.Vector3) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.clampLength(0, this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0); // Reset acceleration each frame
  }
}

export class SwarmEngine {
  boids: Boid[] = [];
  perceptionRadius: number = 0.8;
  moonRadius: number = 2.05; // Slightly above the surface

  constructor(count: number, spawnPoint: THREE.Vector3) {
    for (let i = 0; i < count; i++) {
      // Spawn near the rover
      this.boids.push(
        new Boid(
          spawnPoint.x + (Math.random() - 0.5) * 0.5,
          spawnPoint.y + (Math.random() - 0.5) * 0.5,
          spawnPoint.z + (Math.random() - 0.5) * 0.5
        )
      );
    }
  }

  update(dt: number) {
    for (let i = 0; i < this.boids.length; i++) {
      const boid = this.boids[i];
      
      const separation = new THREE.Vector3();
      const alignment = new THREE.Vector3();
      const cohesion = new THREE.Vector3();
      let total = 0;

      for (let j = 0; j < this.boids.length; j++) {
        if (i !== j) {
          const other = this.boids[j];
          const d = boid.position.distanceTo(other.position);
          
          if (d < this.perceptionRadius) {
            // Separation
            const diff = new THREE.Vector3().subVectors(boid.position, other.position);
            diff.divideScalar(d * d); // Weight by distance
            separation.add(diff);
            
            // Alignment
            alignment.add(other.velocity);
            
            // Cohesion
            cohesion.add(other.position);
            
            total++;
          }
        }
      }

      if (total > 0) {
        separation.divideScalar(total);
        separation.setLength(boid.maxSpeed);
        separation.sub(boid.velocity);
        separation.clampLength(0, boid.maxForce);

        alignment.divideScalar(total);
        alignment.setLength(boid.maxSpeed);
        alignment.sub(boid.velocity);
        alignment.clampLength(0, boid.maxForce);

        cohesion.divideScalar(total);
        cohesion.sub(boid.position);
        cohesion.setLength(boid.maxSpeed);
        cohesion.sub(boid.velocity);
        cohesion.clampLength(0, boid.maxForce);
      }

      // Weights for Boids rules
      separation.multiplyScalar(1.5);
      alignment.multiplyScalar(1.0);
      cohesion.multiplyScalar(1.0);

      boid.applyForce(separation);
      boid.applyForce(alignment);
      boid.applyForce(cohesion);

      // Terrain Constraint: Keep on the moon sphere
      const distFromCenter = boid.position.length();
      if (distFromCenter < this.moonRadius) {
        // Push outward
        const outward = boid.position.clone().normalize().multiplyScalar(boid.maxSpeed);
        const steer = outward.sub(boid.velocity);
        steer.clampLength(0, boid.maxForce * 2); // Stronger force to avoid ground clipping
        boid.applyForce(steer);
      } else if (distFromCenter > this.moonRadius + 0.5) {
        // Pull inward if flying too high
        const inward = boid.position.clone().normalize().multiplyScalar(-boid.maxSpeed);
        const steer = inward.sub(boid.velocity);
        steer.clampLength(0, boid.maxForce);
        boid.applyForce(steer);
      }

      // Optional: Add a slight wander force for exploration
      const wander = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      boid.applyForce(wander);

      // Apply physics based on delta time
      // boid.velocity.multiplyScalar(dt * 60); // Simplify by assuming ~60fps
      boid.update();
      
      // Force position to strictly adhere to sphere surface if it clips
      if (boid.position.length() < this.moonRadius) {
        boid.position.setLength(this.moonRadius);
      }
    }
  }
}
