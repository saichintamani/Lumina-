"use client";

import { useEffect, useRef } from 'react';
import { useCinematicEngine } from '@/lib/memory/cinematicEngine';
import { useMissionMemory } from '@/lib/memory/missionMemory';
import { useVoiceSynthesis } from '@/lib/audio/useVoiceSynthesis';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';

export default function AIOrchestrator() {
  const { currentPhase } = useCinematicEngine();
  const { recordDecision } = useMissionMemory();
  const { speak } = useVoiceSynthesis();
  const spaceWeather = useTelemetryStore(state => state.spaceWeather);
  const missionFailed = useTelemetryStore(state => state.missionFailed);
  
  const lastPhase = useRef(currentPhase);
  const lastWeatherActive = useRef(spaceWeather.active);
  const lastMissionFailed = useRef(missionFailed);

  useEffect(() => {
    if (currentPhase === lastPhase.current) return;
    lastPhase.current = currentPhase;

    // Simulate AI thinking time
    const timer = setTimeout(() => {
      switch (currentPhase) {
        case 'RADAR_ACQUISITION':
          recordDecision({
            what: 'Initiated Synthetic Aperture Radar (SAR) Sweep',
            why: 'High-resolution surface scattering data is required to penetrate the permanently shadowed region (PSR).',
            evidence: ['Visual spectrum cameras are ineffective in PSRs.', 'Historical data suggests ice deposits in high-scattering zones.'],
            confidence: 0.96,
            assumptions: ['SAR antenna is deployed correctly.'],
            limitations: ['Sweep consumes 15% of available power budget.']
          });
          speak("Mission Update: Initiated Synthetic Aperture Radar Sweep");
          break;
        case 'TERRAIN_GENERATION':
          recordDecision({
            what: 'Generating High-Fidelity 3D Terrain Mesh',
            why: 'Mission planning requires a localized Digital Elevation Model (DEM) with 1-meter resolution.',
            evidence: ['LOLA data interpolation completed.', 'SAR point cloud merged with elevation map.'],
            confidence: 0.88,
            assumptions: ['No significant terrain changes since last LRO pass.'],
            limitations: ['Mesh generation is computationally expensive, lowering UI frame rate temporarily.']
          });
          speak("Mission Update: Generating High-Fidelity 3D Terrain Mesh");
          break;
        case 'TRAVERSE_PLANNING':
          recordDecision({
            what: 'Calculated Optimal A* Traverse Route',
            why: 'Rover must reach waypoint Alpha while avoiding slopes > 15 degrees and maintaining solar contact.',
            evidence: ['Slope hazard map generated.', 'Solar illumination vectors computed for next 72 hours.'],
            confidence: 0.94,
            assumptions: ['Rover traction model is accurate.'],
            limitations: ['Path does not account for sub-meter rocks or loose regolith.']
          });
          speak("Mission Update: Calculated Optimal Traverse Route. Autonomous execution ready.");
          break;
        case 'MISSION_SUCCESS':
          recordDecision({
            what: 'Transitioned to Autonomous Surface Execution',
            why: 'All planning phases completed successfully. Handing over control to local rover autonomy.',
            evidence: ['Traverse plan validated by Earth ground control.', 'Battery levels nominal.'],
            confidence: 0.99,
            assumptions: ['Communications link will remain stable.'],
            limitations: ['Earth-Moon latency prevents real-time manual override.']
          });
          speak("Mission Success. Transitioned to Autonomous Surface Execution.");
          break;
        case 'MANUAL_OVERRIDE':
          recordDecision({
            what: 'Engaged Manual Teleoperation Override',
            why: 'Human operator requested direct kinetic control of the Pragyan rover.',
            evidence: ['Override command received from Mission Control.', 'Subsystems nominal for manual operation.'],
            confidence: 1.0,
            assumptions: ['Operator assumes full responsibility for hazard avoidance.'],
            limitations: ['Earth-Moon 1.3 second light delay is bypassed for simulation purposes.']
          });
          speak("Warning. Autonomy disabled. Manual override engaged. You have the conn.");
          break;
      }
    }, 2000); // 2 second thinking delay

    return () => clearTimeout(timer);
  }, [currentPhase, recordDecision, speak]);

  useEffect(() => {
    if (spaceWeather.active && !lastWeatherActive.current) {
      // Just triggered
      recordDecision({
        what: 'Emergency SAFE Mode Activated',
        why: 'Class-X Solar Flare detected. High-energy protons threatening avionics.',
        evidence: ['Radiation sensors saturated.', 'Telemetry packet loss > 40%.'],
        confidence: 0.99,
        assumptions: ['Shielding is sufficient to protect core CPU.'],
        limitations: ['All science operations suspended until particle flux decreases.']
      });
      speak("Warning. Extreme solar radiation detected. Hardening systems. Engaging SAFE mode.");
    }
    lastWeatherActive.current = spaceWeather.active;
  }, [spaceWeather.active, recordDecision, speak]);

  useEffect(() => {
    if (missionFailed && !lastMissionFailed.current) {
      recordDecision({
        what: 'CRITICAL FAILURE: BATTERY DEPLETED',
        why: 'Rover navigated into permanent shadow. Thermal systems failed.',
        evidence: ['Battery at 0%', 'Hull temperature below -170C.'],
        confidence: 1.0,
        assumptions: ['Mission cannot be recovered without solar recharge.'],
        limitations: ['Hardware is permanently frozen.']
      });
      speak("Critical error. Thermal systems offline. Rover battery depleted. Mission Failed.");
    }
    lastMissionFailed.current = missionFailed;
  }, [missionFailed, recordDecision, speak]);

  return null; // Headless component
}
