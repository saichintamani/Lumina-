# Antigravity v3 Lunar Digital Twin - Architecture Guide

## Overview

The Antigravity Lunar Digital Twin is a Next.js (React) application designed for real-time visualization and management of lunar surface operations. It leverages `react-three-fiber` for performant 3D WebGL rendering, `zustand` for decoupled state management, and `react-resizable-panels` for a modular workspace interface.

## Core Design Principles

1. **State as the Source of Truth**: All simulation logic resides in global Zustand stores (`useTelemetryStore`, `useMissionMemory`). Components only subscribe to the state they need, avoiding prop drilling and preventing unnecessary re-renders.
2. **Decoupled 3D Rendering**: The `DigitalTwin` component and its Three.js children (Rover, Environment, Physics Engine) react independently to the global state. This allows the 3D scene to run efficiently at 60 FPS without being blocked by UI thread operations.
3. **Immersive UI**: The interface uses a strictly enforced design language (cyan/slate color palette, Fira Code monospace, glassmorphism overlays) to mimic a high-fidelity mission control environment.

## Directory Structure

```
src/
├── app/                  # Next.js App Router (Layouts and Pages)
├── components/           # React UI Components
│   ├── intelligence/     # AI Orchestrator and Explainable AI feeds
│   ├── mission-control/  # Main Dashboard components (Replay, Data Grids)
│   ├── operations/       # Command Palette and Telemetry Dashboard
│   ├── presentation/     # Demonstration Mode and Guided Tours
│   ├── science/          # Spectroscopy and Lab-specific panels
│   ├── visualization/    # 3D WebGL scenes (DigitalTwin, RoverSwarm)
│   └── workspaces/       # Top-level workspace layout containers
├── lib/                  # Application Logic and State
│   ├── audio/            # WebAudio API sound effects
│   ├── intelligence/     # AI response generation and logic
│   ├── memory/           # Zustand stores (Telemetry, Scenarios, Cinematic)
│   ├── physics/          # Custom physics engines (Boids/Swarm algorithm)
│   └── presentation/     # Presentation state
```

## State Management (Zustand)

The application utilizes specialized global stores:

- **`useTelemetryStore`**: The heartbeat of the app. Manages rover position, battery levels, solar array efficiency, and active environmental anomalies (like Solar Flares).
- **`useMissionMemory`**: Acts as a time-series database. It records snapshots of the telemetry at regular intervals, allowing the user to scrub backward/forward in time using the Mission Timeline Replay feature.
- **`useCinematicEngine`**: Orchestrates camera movements and phase transitions (e.g., smoothly interpolating from an Orbital view to a First-Person NavCam view).
- **`usePresentationStore`**: Controls the high-level narrative state during Demonstration Mode.

## The 3D Engine

We use `@react-three/fiber` as the declarative bridge to Three.js. 

Key patterns:
- **`useFrame`**: Used extensively within `DigitalTwin.tsx` and `RoverSwarm.tsx` for per-frame physics calculations (e.g., updating rover position based on current velocity, running the Boids algorithm for the micro-rover swarm).
- **InstancedMesh**: Used in `RoverSwarm.tsx` to render 50 micro-rovers with a single draw call, ensuring maximum performance.
- **Render Targets**: Used in `TireTracksOverlay.tsx` to dynamically paint rover tracks onto a persistent canvas that wraps the lunar surface texture.

## Performance Considerations

- **Code Splitting**: Heavy 3D components (`DigitalTwin`, `ScientificDigitalTwin`) are dynamically imported via `next/dynamic` (`ssr: false`) to prevent blocking the initial page load.
- **Error Boundaries**: `ErrorBoundary.tsx` wraps fragile WebGL components to ensure the UI remains functional even if a WebGL context is lost or a shader crashes.
