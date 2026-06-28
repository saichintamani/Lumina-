"use client";

import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Microscope, Command } from 'lucide-react';
import AIExplanationPane from '@/components/intelligence/AIExplanationPane';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import SpectroscopyPanel from '@/components/science/SpectroscopyPanel';
import CommandPalette from '@/components/operations/CommandPalette';
import GlitchOverlay from '@/components/effects/GlitchOverlay';
import { useTelemetryAudio } from '@/lib/audio/useTelemetryAudio';

const ScientificDigitalTwin = dynamic(() => import('@/components/visualization/ScientificDigitalTwin'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#000510]">
      <div className="animate-pulse text-cyan-500 font-mono text-sm">[ LOADING VOLUMETRIC SCANS... ]</div>
    </div>
  )
});

const ResizeHandle = () => (
  <Separator className="w-1.5 bg-[#001122] hover:bg-cyan-500/50 transition-colors cursor-col-resize flex flex-col justify-center items-center">
    <div className="w-0.5 h-8 bg-cyan-900 rounded-full" />
  </Separator>
);

export default function ScienceWorkspace() {
  useTelemetryAudio();

  return (
    <div className="h-screen w-full bg-[#000510] flex flex-col overflow-hidden text-cyan-500">
      <GlitchOverlay />
      
      {/* Top Navbar */}
      <header className="h-12 border-b border-cyan-900/50 bg-[#000814] flex items-center justify-between px-4 shrink-0 shadow-[0_0_20px_rgba(0,255,255,0.05)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-cyan-600 hover:text-cyan-400 transition-colors mr-2" title="Return to Landing Page">
              <Microscope size={18} />
            </Link>
            <span className="text-sm font-mono font-bold text-cyan-400 tracking-widest">LUNAR LAB // SCIENTIFIC ANALYSIS</span>
          </div>
          
          {/* Workspace Tabs */}
          <div className="flex gap-1 bg-[#001122] p-1 rounded">
            <Link href="/mission-control" className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white transition-colors rounded">
              [ MISSION OPS ]
            </Link>
            <div className="px-3 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-900 rounded font-bold shadow-[0_0_10px_rgba(0,255,255,0.1)]">
              [ SCIENCE LAB ]
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-cyan-700">Cmd+K for Command Palette</span>
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_#0ff]" />
        </div>
      </header>

      <CommandPalette />

      {/* Workspace Area */}
      <div className="flex-1 overflow-hidden">
        <Group orientation="horizontal">
          
          {/* Lunar Surface Render */}
          <Panel defaultSize={55} minSize={40} className="relative bg-black rounded-lg overflow-hidden border border-slate-800">
            <ErrorBoundary>
              <ScientificDigitalTwin />
            </ErrorBoundary>
            
            <div className="absolute top-4 left-4 pointer-events-none">
              <div className="text-xs font-mono text-cyan-400 bg-[#001122]/80 border border-cyan-900/50 px-3 py-1.5 rounded backdrop-blur shadow-[0_0_15px_rgba(0,255,255,0.15)]">
                SENSOR_MODE: VOLUMETRIC_XRAY
              </div>
            </div>
          </Panel>

          <ResizeHandle />

          {/* Right Panel: Analytics HUD */}
          <Panel defaultSize={25} minSize={20} className="bg-[#000814] flex flex-col p-4 overflow-y-auto gap-4">
            <h3 className="text-xs font-mono text-cyan-600 tracking-widest border-b border-cyan-900/50 pb-2">TELEMETRY STREAMS</h3>
            
            <SpectroscopyPanel />

            <div className="bg-[#001122] border border-cyan-900/30 p-4 rounded-lg mt-4">
              <h4 className="text-xs font-mono text-magenta-400 text-pink-400 mb-2">ANOMALY DETECTED</h4>
              <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
                High concentration of Titanium Dioxide (TiO2) mapped at 85.4°S, 30.1°E. 
                Possible subsurface structural formation. Recommend deploying SAR sweep for higher resolution.
              </p>
            </div>
          </Panel>

        </Group>
      </div>

    </div>
  );
}
