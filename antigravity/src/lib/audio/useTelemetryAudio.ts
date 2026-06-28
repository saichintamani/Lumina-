"use client";

import { useEffect, useRef, useState } from 'react';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15; // Low volume by default
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  playBeep(freq = 800, type: OscillatorType = 'sine', duration = 0.1) {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playSweep() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.6);
  }

  playDataLink() {
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    // Rapid data blips
    for(let i=0; i<5; i++) {
      setTimeout(() => {
        this.playBeep(1200 + Math.random() * 800, 'square', 0.05);
      }, i * 80);
    }
  }
}

const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;

export function useTelemetryAudio() {
  const { currentPhase } = useCinematicEngine();
  const lastPhase = useRef(currentPhase);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleInteract = () => {
      if (!isInitialized && audioManager) {
        audioManager.init();
        setIsInitialized(true);
      }
    };
    window.addEventListener('click', handleInteract, { once: true });
    return () => window.removeEventListener('click', handleInteract);
  }, [isInitialized]);

  useEffect(() => {
    if (currentPhase === lastPhase.current) return;
    lastPhase.current = currentPhase;

    if (!audioManager) return;
    
    switch (currentPhase) {
      case 'RADAR_ACQUISITION':
        audioManager.playSweep();
        break;
      case 'TERRAIN_GENERATION':
        audioManager.playDataLink();
        break;
      case 'MISSION_SUCCESS':
        setTimeout(() => audioManager.playBeep(440, 'sine', 0.5), 0);
        setTimeout(() => audioManager.playBeep(660, 'sine', 0.5), 200);
        setTimeout(() => audioManager.playBeep(880, 'sine', 1.0), 400);
        break;
      default:
        audioManager.playBeep(600, 'sine', 0.1);
    }
  }, [currentPhase]);

  return { playBeep: audioManager?.playBeep.bind(audioManager) };
}
