import { create } from 'zustand';

// ----------------------------------------------------
// Type Definitions
// ----------------------------------------------------
export interface DataVersion {
  id: string;
  source: string;
  timestamp: string;
  processingHistory: string[];
  confidence: number;
  validationStatus: 'VALIDATED' | 'PENDING' | 'REJECTED';
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  terrainAssumptions: string;
  constraints: string[];
  dataVersions: Record<string, DataVersion>;
  isLocked: boolean; // Preserves reproducibility
}

interface ScenarioState {
  scenarios: ScenarioConfig[];
  activeScenarioId: string;

  // Actions
  setActiveScenario: (id: string) => void;
  createScenario: (scenario: Partial<ScenarioConfig>) => void;
  updateScenarioDataVersion: (scenarioId: string, dataKey: string, version: DataVersion) => void;
  lockScenario: (id: string) => void;
}

// ----------------------------------------------------
// Zustand Store Implementation
// ----------------------------------------------------
export const useScenarioManager = create<ScenarioState>((set) => ({
  activeScenarioId: 'SCENARIO-A',
  scenarios: [
    {
      id: 'SCENARIO-A',
      name: 'Nominal Mission',
      description: 'Primary landing target at Faustini Crater with nominal terrain assumptions.',
      terrainAssumptions: 'Standard DEM, average rock abundance (10%).',
      constraints: ['Max slope < 15deg', 'Continuous illumination > 72hrs'],
      dataVersions: {
        'DEM_LRO_01': {
          id: 'v1.0',
          source: 'LRO LOLA',
          timestamp: new Date().toISOString(),
          processingHistory: ['Raw Download', 'Noise Filtered', 'Interpolated to 5m/px'],
          confidence: 0.95,
          validationStatus: 'VALIDATED'
        }
      },
      isLocked: false
    },
    {
      id: 'SCENARIO-B',
      name: 'Alternative Landing Region',
      description: 'Secondary target on ridge with higher illumination but steeper approach.',
      terrainAssumptions: 'High-resolution DEM, high rock abundance (25%).',
      constraints: ['Max slope < 20deg', 'Continuous illumination > 120hrs'],
      dataVersions: {
        'DEM_LRO_01': {
          id: 'v1.1-enhanced',
          source: 'LRO LOLA + SHAD',
          timestamp: new Date().toISOString(),
          processingHistory: ['Raw Download', 'Photoclinometry enhanced'],
          confidence: 0.85,
          validationStatus: 'PENDING'
        }
      },
      isLocked: false
    }
  ],

  setActiveScenario: (id) => set({ activeScenarioId: id }),

  createScenario: (partial) => set((state) => ({
    scenarios: [
      ...state.scenarios,
      {
        id: `SCENARIO-${Date.now()}`,
        name: partial.name || 'New Scenario',
        description: partial.description || '',
        terrainAssumptions: partial.terrainAssumptions || '',
        constraints: partial.constraints || [],
        dataVersions: partial.dataVersions || {},
        isLocked: false
      }
    ]
  })),

  updateScenarioDataVersion: (scenarioId, dataKey, version) => set((state) => ({
    scenarios: state.scenarios.map(s => {
      if (s.id !== scenarioId) return s;
      if (s.isLocked) return s; // Never overwrite locked scenarios
      return {
        ...s,
        dataVersions: {
          ...s.dataVersions,
          [dataKey]: version
        }
      };
    })
  })),

  lockScenario: (id) => set((state) => ({
    scenarios: state.scenarios.map(s => s.id === id ? { ...s, isLocked: true } : s)
  }))
}));
