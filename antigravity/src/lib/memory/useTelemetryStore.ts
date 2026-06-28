import { create } from 'zustand';

export interface TelemetryState {
  // Camera Position (used by Mini-Map)
  cameraPosition: [number, number, number];
  setCameraPosition: (pos: [number, number, number]) => void;

  // Rover Position (used for Manual Override Third-Person Camera)
  roverPosition: [number, number, number];
  setRoverPosition: (pos: [number, number, number]) => void;

  // Space Weather
  spaceWeather: { active: boolean; severity: number };
  triggerSolarFlare: () => void;
  resolveSolarFlare: () => void;

  // Swarm Intelligence
  swarmActive: boolean;
  toggleSwarm: () => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  cameraPosition: [0, 0, 10],
  setCameraPosition: (pos) => set({ cameraPosition: pos }),
  roverPosition: [0, -1.48, 0.2],
  setRoverPosition: (pos) => set({ roverPosition: pos }),
  
  spaceWeather: { active: false, severity: 0 },
  triggerSolarFlare: () => set({ spaceWeather: { active: true, severity: Math.random() * 5 + 5 } }),
  resolveSolarFlare: () => set({ spaceWeather: { active: false, severity: 0 } }),

  swarmActive: false,
  toggleSwarm: () => set((state) => ({ swarmActive: !state.swarmActive })),
}));
