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

  // Survival Mode (Thermal & Shadows)
  inShadow: boolean;
  setInShadow: (val: boolean) => void;
  batteryLevel: number;
  setBatteryLevel: (val: number) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  missionFailed: boolean;
  setMissionFailed: (val: boolean) => void;

  // First-Person Camera
  cameraMode: 'ORBIT' | 'FIRST_PERSON';
  toggleCameraMode: () => void;

  // Latency Simulator
  latencyMode: boolean;
  toggleLatencyMode: () => void;
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

  inShadow: false,
  setInShadow: (val) => set({ inShadow: val }),
  batteryLevel: 100,
  setBatteryLevel: (val) => set({ batteryLevel: Math.max(0, Math.min(100, val)) }),
  temperature: 120, // default sunlight temp
  setTemperature: (val) => set({ temperature: val }),
  missionFailed: false,
  setMissionFailed: (val) => set({ missionFailed: val }),

  cameraMode: 'ORBIT',
  toggleCameraMode: () => set((state) => ({ cameraMode: state.cameraMode === 'ORBIT' ? 'FIRST_PERSON' : 'ORBIT' })),

  latencyMode: false,
  toggleLatencyMode: () => set((state) => ({ latencyMode: !state.latencyMode })),
}));
