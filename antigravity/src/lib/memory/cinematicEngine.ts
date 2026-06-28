import { create } from 'zustand';

export type MissionPhase = 
  | 'INITIALIZING'
  | 'ORBITAL_INSERTION'
  | 'RADAR_ACQUISITION'
  | 'TERRAIN_GENERATION'
  | 'AI_REASONING'
  | 'LANDING_SIMULATION'
  | 'TRAVERSE_PLANNING'
  | 'MISSION_SUCCESS'
  | 'MANUAL_OVERRIDE';

export interface CameraState {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

interface CinematicState {
  currentPhase: MissionPhase;
  playbackSpeed: number;
  isPaused: boolean;
  timeOfDay: number; // 0 to 24 hours simulating lunar day
  
  // Controls
  setPhase: (phase: MissionPhase) => void;
  togglePause: () => void;
  setSpeed: (speed: number) => void;
  setTimeOfDay: (time: number) => void;
  
  // Cinematic Engine Triggers
  nextPhase: () => void;
  jumpToPhase: (phase: MissionPhase) => void;
}

const PHASE_ORDER: MissionPhase[] = [
  'INITIALIZING',
  'ORBITAL_INSERTION',
  'RADAR_ACQUISITION',
  'TERRAIN_GENERATION',
  'AI_REASONING',
  'LANDING_SIMULATION',
  'TRAVERSE_PLANNING',
  'MISSION_SUCCESS',
  'MANUAL_OVERRIDE'
];

export const useCinematicEngine = create<CinematicState>((set) => ({
  currentPhase: 'INITIALIZING',
  playbackSpeed: 1.0,
  isPaused: false,
  timeOfDay: 12.0, // High noon at Faustini
  
  setPhase: (phase) => set({ currentPhase: phase }),
  
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  setSpeed: (speed) => set({ playbackSpeed: speed }),
  
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  
  nextPhase: () => set((state) => {
    const currentIndex = PHASE_ORDER.indexOf(state.currentPhase);
    if (currentIndex < PHASE_ORDER.length - 1) {
      return { currentPhase: PHASE_ORDER[currentIndex + 1] };
    }
    return state;
  }),
  
  jumpToPhase: (phase) => set({ currentPhase: phase })
}));
