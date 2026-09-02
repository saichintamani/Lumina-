# Development Guide

Welcome to the Antigravity v3 development team. This guide outlines the standards and workflows for extending the Lunar Digital Twin.

## Local Development Workflow

1. **Install Dependencies**: `npm install`
2. **Start Dev Server**: `npm run dev`
3. **Format Code**: `npm run lint` (Prettier and ESLint are configured to enforce our design rules).

## Extending the Platform

### 1. Adding a New 3D Visualizer (Three.js)

If you are adding a new visual layer (e.g., a subsurface radar visualization):
- Place the component in `src/components/visualization/`.
- Use `@react-three/fiber` for all declarative 3D construction.
- Do **not** manage local React state (`useState`) for physics calculations inside `useFrame`. Instead, read directly from a `useRef` or a Zustand store to avoid dropping frames.
- Ensure the component is lazy-loaded in its parent workspace using `next/dynamic` to prevent bloating the initial JavaScript payload.

### 2. Extending the AI Orchestrator

The AI Orchestrator (`src/components/intelligence/AIOrchestrator.tsx`) provides real-time, explainable intelligence.
To add new AI logic:
- Add a new "rule" to the `MissionIntelligence` simulation logic (or integrate a real LLM API in `src/lib/intelligence/`).
- The UI listens for events emitted to the `AIExplanationPane`. Structure your new output to include a "Confidence" score, "Supporting Evidence" bullet points, and "Assumptions Made".

### 3. Adding a New Presentation Slide

To update the Demonstration Mode for a client presentation:
1. Open `src/lib/presentation/usePresentationStore.ts`.
2. Add a new slide to the `PRESENTATION_SLIDES` array with an `id`, `title`, `subtitle`, and `description`.
3. Open `src/components/presentation/DemonstrationMode.tsx`.
4. In the `useEffect` switch statement, add a case for your new `id` and trigger the desired camera angles and telemetry states via `useCinematicEngine` and `useTelemetryStore`.

## Design Standards

We strictly enforce the "Presentation Excellence" visual aesthetic:
- **Colors**: Rely on Tailwind's Slate (for backgrounds) and Cyan (for high-contrast futuristic accents). Avoid generic reds/blues unless indicating a critical hazard.
- **Typography**: Use Fira Code (or equivalent monospace) for all telemetry data, tags, and system logs. Use Fira Sans for readable body text and descriptions.
- **Micro-Interactions**: All buttons must have a `:hover` state and a `:focus-visible` state (defined in `globals.css` as a cyan focus ring) for accessibility.
