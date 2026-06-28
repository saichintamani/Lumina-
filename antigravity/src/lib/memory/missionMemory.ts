import { create } from 'zustand';

// ----------------------------------------------------
// Type Definitions for Memory Layers
// ----------------------------------------------------
export interface LogEntry {
  timestamp: string;
  agent: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'success';
}

export interface DecisionRecord {
  id: string;
  what: string;
  why: string;
  evidence: string[];
  confidence: number;
  assumptions: string[];
  limitations: string[];
}

interface MissionState {
  // 1. Session Memory
  currentTask: string;
  activeAgents: string[];
  workflowProgress: number;
  logs: LogEntry[];

  // 2. Project Memory
  missionConfig: {
    targetId: string;
    targetName: string;
    coordinates: { lat: number; lon: number };
    maxRiskTolerance: number;
  };

  // 3. Knowledge Memory
  ingestedDocuments: { id: string; title: string; type: string; status: string }[];
  
  // 4. Decision Memory
  decisionHistory: DecisionRecord[];

  // 5. Simulation Memory
  simulationResults: { runId: string; metrics: Record<string, number> }[];

  // Actions
  setTask: (task: string) => void;
  addLog: (log: Omit<LogEntry, 'timestamp'>) => void;
  recordDecision: (decision: Omit<DecisionRecord, 'id'>) => void;
  ingestDocument: (doc: Omit<MissionState['ingestedDocuments'][0], 'id'>) => void;
  updateWorkflowProgress: (progress: number) => void;
}

// ----------------------------------------------------
// Zustand Store Implementation
// ----------------------------------------------------
export const useMissionMemory = create<MissionState>((set) => ({
  // Initial Session State
  currentTask: 'IDLE',
  activeAgents: [],
  workflowProgress: 0,
  logs: [],

  // Initial Project State
  missionConfig: {
    targetId: 'FAUSTINI-F2',
    targetName: 'Faustini Crater (PSR)',
    coordinates: { lat: -85.46, lon: 30.12 },
    maxRiskTolerance: 0.15,
  },

  // Initial Knowledge & Decision State
  ingestedDocuments: [],
  decisionHistory: [],
  simulationResults: [],

  // Mutators
  setTask: (task) => set({ currentTask: task }),
  
  addLog: (log) => set((state) => ({
    logs: [{ ...log, timestamp: new Date().toISOString() }, ...state.logs].slice(0, 50)
  })),

  recordDecision: (decision) => set((state) => ({
    decisionHistory: [
      { ...decision, id: `DEC-${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
      ...state.decisionHistory
    ]
  })),

  ingestDocument: (doc) => set((state) => ({
    ingestedDocuments: [
      { ...doc, id: `DOC-${Date.now()}` },
      ...state.ingestedDocuments
    ]
  })),

  updateWorkflowProgress: (progress) => set({ workflowProgress: progress }),
}));
