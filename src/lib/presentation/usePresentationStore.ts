import { create } from 'zustand';

export type PresentationSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

export const PRESENTATION_SLIDES: PresentationSlide[] = [
  {
    id: 'intro',
    title: '1. Mission Introduction',
    subtitle: 'Antigravity v3 Lunar Digital Twin',
    description: 'Welcome to the Mission Operations Center. This platform provides real-time telemetry, orbital tracking, and 3D visualization for deep-space missions.',
  },
  {
    id: 'problem',
    title: '2. Problem Statement',
    subtitle: 'Surviving the Lunar South Pole',
    description: 'Operating in shadowed polar craters introduces massive risks: extreme thermal variance, unpredictable terrain, and communication latency.',
  },
  {
    id: 'science',
    title: '3. Scientific Workflow',
    subtitle: 'Multi-spectral Analysis',
    description: 'Data gathered by orbital and surface assets must be fused together. Here we transition to the Science Lab to analyze Regolith Ice Concentrations.',
  },
  {
    id: 'exploration',
    title: '4. Interactive Exploration',
    subtitle: 'NavCam & Latency Simulator',
    description: 'Experience surface operations firsthand. Machine Learning CV scans for hazards, while a 2.6s signal latency mimics Earth-Moon physics.',
  },
  {
    id: 'ai',
    title: '5. AI Reasoning',
    subtitle: 'Explainable Mission Intelligence',
    description: 'The AI Orchestrator acts as an autonomous co-pilot, constantly verifying telemetry and explaining its decisions transparently to operators.',
  },
  {
    id: 'scenario',
    title: '6. Scenario Comparison',
    subtitle: 'Adaptive Contingency Planning',
    description: 'When anomalies strike (e.g., Solar Flares), the platform allows rapid branching and evaluation of multiple mitigation strategies.',
  },
  {
    id: 'planning',
    title: '7. Mission Planning',
    subtitle: 'Multi-Agent Swarm Operations',
    description: 'Instead of risking a single billion-dollar asset, we deploy a swarm of 50 autonomous micro-rovers to map the crater floor in parallel.',
  },
  {
    id: 'results',
    title: '8. Results',
    subtitle: 'Data Ingestion & Visualization',
    description: 'All telemetry and scientific findings are consolidated into real-time interactive charts, ensuring mission scientists have actionable intelligence.',
  },
  {
    id: 'summary',
    title: '9. Summary',
    subtitle: 'Production-Ready Architecture',
    description: 'Antigravity v3 is a fully responsive, highly optimized, and accessible platform built for the next generation of space exploration.',
  }
];

interface PresentationState {
  isActive: boolean;
  currentSlideIndex: number;
  togglePresentationMode: () => void;
  nextSlide: () => void;
  prevSlide: () => void;
  jumpToSlide: (index: number) => void;
}

export const usePresentationStore = create<PresentationState>((set) => ({
  isActive: false,
  currentSlideIndex: 0,
  
  togglePresentationMode: () => set((state) => ({ 
    isActive: !state.isActive,
    currentSlideIndex: 0 
  })),

  nextSlide: () => set((state) => ({
    currentSlideIndex: Math.min(state.currentSlideIndex + 1, PRESENTATION_SLIDES.length - 1)
  })),

  prevSlide: () => set((state) => ({
    currentSlideIndex: Math.max(state.currentSlideIndex - 1, 0)
  })),

  jumpToSlide: (index) => set({
    currentSlideIndex: Math.max(0, Math.min(index, PRESENTATION_SLIDES.length - 1))
  })
}));
