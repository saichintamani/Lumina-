<div align="center">
  <img src="public/lumina_logo.png" alt="Lumina Logo" width="300" />

  # **LUMINA: LUNAR DIGITAL TWIN**

  <p align="center">
    <strong>A Production-Ready Space Mission Intelligence Platform</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" />
    <img src="https://img.shields.io/badge/Zustand-F15C3D?style=for-the-badge&logo=redux&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  </p>

</div>

---

## 🌌 Mission Brief

Operating on the Lunar South Pole (Faustini Crater) introduces monumental engineering challenges: extreme thermal variance, unpredictable regolith terrain, and Earth-Moon communication latency. **Lumina** is built to synthesize these complex variables into an immersive, explainable, and interactive Mission Control dashboard. 

Instead of risking a single billion-dollar asset, Lumina simulates a multi-agent autonomous swarm of micro-rovers, mapping the lunar surface in parallel, orchestrated by an explainable AI system.

---

## 🏗️ The Architecture (Theoretical Deep Dive)

Lumina's underlying architecture is designed for immense scale and 60 FPS performance within the browser.

### 1. The Boids Swarm Physics Engine
The heart of the micro-rover simulation relies on the **Boids Algorithm**, an artificial life simulation that dictates three emergent behaviors:
- **Separation**: Rovers steer to avoid crowding local flockmates (preventing collisions).
- **Alignment**: Rovers steer towards the average heading of local flockmates (coordinated traversal).
- **Cohesion**: Rovers steer to move towards the average position of local flockmates (staying together in the crater).
This physics engine updates the 3D transforms of an `InstancedMesh` via a `useFrame` loop, pushing rendering performance to the absolute limit.

### 2. Decoupled Rendering State (Zustand)
To ensure the React component tree does not bottleneck the WebGL context, all physical simulation state is entirely decoupled from the React render lifecycle. 
- Using `useTelemetryStore`, the telemetry data (Battery, Thermal Variance, Solar Array Efficiency) acts as a high-speed data stream.
- The 3D models read directly from this store via transient subscriptions, ensuring `DigitalTwin` does not trigger expensive DOM recalculations.

### 3. AI Intelligence Orchestrator
The platform isn't just a viewer—it thinks. The `AIOrchestrator` continuously samples the telemetry store. When a state variable breaches safety thresholds (e.g., a massive Coronal Mass Ejection causing thermal spikes), the AI injects a real-time Explanation Card into the UI, providing the user with *Assumptions*, *Supporting Evidence*, and a *Confidence Score*.

---

## 🚀 Key Features & Segments

- **Interactive 3D Simulation**: A high-fidelity WebGL digital twin powered by `react-three-fiber`. View the lunar surface in orbital mode or dive into the First-Person NavCam.
- **Machine Learning CV HUD**: Drop down into the rover's First-Person view. Real-time simulated bounding boxes scan the regolith for "Slopes > 15 Degrees" and "Thermal Variance" anomalies.
- **Earth-Moon Latency Simulator**: Accurately simulates the 2.6-second round-trip delay between Earth and the Moon. Commands you issue are buffered in the UI before execution on the 3D surface.
- **Demonstration Mode**: A built-in Presentation overlay that guides users through a 9-stage interactive tour of the platform's capabilities with a single click.

---

## ⚙️ How to Execute (Local Usage)

To step into Mission Control locally, you need Node.js (v18+) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/lumina.git
   cd lumina
   ```
2. **Install the dependencies:**
   ```bash
   npm install
   ```
3. **Ignite the development server:**
   ```bash
   npm run dev
   ```
4. **Access the Twin**: Open `http://localhost:3000/mission-control` in your browser.

> **Pro Tip**: Once loaded, press `Cmd+K` (or `Ctrl+K`) to open the Command Palette. This acts as your terminal for triggering Solar Flares, deploying the Rover Swarm, or toggling the Latency Simulator.

---
<div align="center">
  <i>"Ad astra per aspera"</i><br/>
  <b>Built for Presentation Excellence & Production Readiness.</b>
</div>
