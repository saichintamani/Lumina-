import React from 'react';
import MissionWorkspace from '@/components/mission-control/MissionWorkspace';

export const metadata = {
  title: 'Mission Control | Lunar Digital Twin',
  description: 'Immersive Mission Operations Center for Antigravity v3',
};

export default function MissionControlRoute() {
  return <MissionWorkspace />;
}
