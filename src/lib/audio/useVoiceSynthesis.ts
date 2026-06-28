"use client";

import { useEffect, useRef, useState } from 'react';
import { useAudioSettingsStore } from './useAudioSettingsStore';

export function useVoiceSynthesis() {
  const { isVoiceEnabled } = useAudioSettingsStore();
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = synthRef.current?.getVoices();
        if (voices && voices.length > 0) {
          // Look for an English voice, preferably Google UK English Male or similar robotic/authoritative voice
          let selectedVoice = voices.find(v => v.name.includes('Google UK English Male')) ||
                              voices.find(v => v.name.includes('Microsoft David')) ||
                              voices.find(v => v.name.includes('Samantha') || v.name.includes('Daniel')) ||
                              voices.find(v => v.lang.startsWith('en-'));
          
          if (selectedVoice) {
            voiceRef.current = selectedVoice;
            setVoicesLoaded(true);
          }
        }
      };

      loadVoices();
      
      // Chrome requires this event to load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speak = (text: string) => {
    if (!isVoiceEnabled || !synthRef.current || !voicesLoaded) return;

    // Cancel any ongoing speech so it doesn't queue up too much
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceRef.current) {
      utterance.voice = voiceRef.current;
    }
    
    // Robotic / Aerospace aesthetic
    utterance.pitch = 0.9;
    utterance.rate = 1.05; 
    utterance.volume = 0.8;

    synthRef.current.speak(utterance);
  };

  return { speak, voicesLoaded };
}
