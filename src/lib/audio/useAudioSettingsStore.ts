import { create } from 'zustand';

interface AudioSettingsState {
  isVoiceEnabled: boolean;
  toggleVoice: () => void;
}

export const useAudioSettingsStore = create<AudioSettingsState>((set) => ({
  isVoiceEnabled: true,
  toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled }))
}));
