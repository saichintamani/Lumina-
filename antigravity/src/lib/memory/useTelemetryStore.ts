import { create } from 'zustand';

interface TelemetryState {
  cameraPosition: [number, number, number];
  setCameraPosition: (pos: [number, number, number]) => void;
}

export const useTelemetryStore = create<TelemetryState>((set) => ({
  cameraPosition: [0, 0, 10],
  setCameraPosition: (pos) => set({ cameraPosition: pos })
}));
