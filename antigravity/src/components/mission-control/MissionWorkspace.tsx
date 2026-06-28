"use client";

import React, { useEffect, useState } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CommandPalette from '@/components/operations/CommandPalette';
import TelemetryDashboard from '@/components/operations/TelemetryDashboard';
import DigitalTwin from '@/components/visualization/DigitalTwin';
import ReplayControls from '@/components/mission-control/ReplayControls';
import ExplanationCard from '@/components/intelligence/ExplanationCard';
import { useMissionMemory } from '@/lib/memory/missionMemory';
import { Command } from 'lucide-react';
import Link from 'next/link';

// Custom Resize Handle
const ResizeHandle = () => (
  <Separator className="w-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors cursor-col-resize flex flex-col justify-center items-center">
    <div className="w-0.5 h-8 bg-slate-700 rounded-full" />
  </Separator>
);

const HorizontalResizeHandle = () => (
  <Separator className="h-1.5 bg-slate-900 hover:bg-blue-500/50 transition-colors cursor-row-resize flex flex-row justify-center items-center">
    <div className="w-8 h-0.5 bg-slate-700 rounded-full" />
  </Separator>
);

export default function MissionWorkspace() {
  const { decisionHistory } = useMissionMemory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col overflow-hidden">
      
      {/* Top Navbar */}
      <header className="h-12 border-b border-slate-800 bg-[#060b19] flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/operations" className="text-slate-400 hover:text-white transition-colors">
            <Command size={18} />
          </Link>
          <span className="text-sm font-mono font-bold text-white tracking-widest">LUNAR DIGITAL TWIN // MISSION OPERATIONS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-500">Cmd+K for Command Palette</span>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </header>

      <CommandPalette />

      {/* Workspace Area */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          
          {/* Left Panel: 3D Twin & Timeline */}
          <Panel defaultSize={70} minSize={40}>
            <Group orientation="vertical">
              
              {/* Top: 3D Digital Twin */}
              <Panel defaultSize={80} minSize={50} className="relative bg-black">
                <DigitalTwin />
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                  <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded">CAM_SYS: ORBITAL_1</div>
                </div>
              </Panel>

              <HorizontalResizeHandle />

              {/* Bottom: Replay Controls & Timeline */}
              <Panel defaultSize={20} minSize={15} className="bg-[#060b19] p-4 overflow-y-auto">
                <ReplayControls />
              </Panel>

            </Group>
          </Panel>

          <ResizeHandle />

          {/* Right Panel: AI & Analytics */}
          <Panel defaultSize={30} minSize={20} className="bg-[#060b19] flex flex-col overflow-hidden border-l border-slate-800">
            <Group orientation="vertical">
              
              {/* Top Right: Telemetry Dashboard */}
              <Panel defaultSize={40} className="overflow-y-auto p-4 border-b border-slate-800">
                <h3 className="text-xs font-mono text-slate-500 mb-3">LIVE TELEMETRY</h3>
                <TelemetryDashboard />
              </Panel>

              <HorizontalResizeHandle />

              {/* Bottom Right: XAI Decisions */}
              <Panel defaultSize={60} className="overflow-y-auto p-4 bg-[#030712]">
                <h3 className="text-xs font-mono text-blue-500 mb-3 tracking-widest">EXPLAINABLE AI FEED</h3>
                <div className="flex flex-col gap-4">
                  {decisionHistory.map((decision) => (
                    <ExplanationCard key={decision.id} decision={decision} />
                  ))}
                  {decisionHistory.length === 0 && (
                    <div className="p-4 border border-dashed border-slate-800 text-center rounded">
                      <span className="text-slate-600 font-mono text-xs">Waiting for AI orchestrator decisions...</span>
                    </div>
                  )}
                </div>
              </Panel>

            </Group>
          </Panel>

        </Group>
      </div>

    </div>
  );
}
