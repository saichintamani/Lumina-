import { create } from 'zustand';

interface VisualLayers {
  showTerrain: boolean;
  showElevation: boolean;
  showSlopeHeatmap: boolean;
  showIllumination: boolean;
  showMissionRoute: boolean;
  showPerformanceStats: boolean;

  toggleLayer: (layer: keyof Omit<VisualLayers, 'toggleLayer'>) => void;
}

export const useVisualLayers = create<VisualLayers>((set) => ({
  showTerrain: true,
  showElevation: false,
  showSlopeHeatmap: false,
  showIllumination: true,
  showMissionRoute: false,
  showPerformanceStats: false,

  toggleLayer: (layer) => set((state) => ({ [layer]: !state[layer as keyof VisualLayers] }))
}));
