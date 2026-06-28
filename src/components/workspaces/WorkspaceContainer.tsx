"use client";

import React, { useState } from 'react';
import MissionWorkspace from '@/components/mission-control/MissionWorkspace';
import ScientificAnalysisWorkspace from '@/components/workspaces/ScientificAnalysisWorkspace';
import ResearchWorkspace from '@/components/workspaces/ResearchWorkspace';
import AIOrchestrator from '@/components/intelligence/AIOrchestrator';
import DemonstrationMode from '@/components/presentation/DemonstrationMode';
import { LayoutDashboard, Microscope, BookOpen, Settings } from 'lucide-react';

type WorkspaceType = 'MISSION' | 'SCIENCE' | 'RESEARCH';

export default function WorkspaceContainer() {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('MISSION');

  return (
    <div className="w-screen h-screen bg-black flex overflow-hidden font-sans">
      <DemonstrationMode />
      <AIOrchestrator />
      
      {/* Sidebar Navigation */}
      <div className="w-16 bg-[#030712] border-r border-slate-800 flex flex-col items-center py-6 gap-8 z-50">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold font-mono text-white mb-4">
          A
        </div>

        <nav className="flex flex-col gap-6 w-full items-center flex-1">
          <button 
            onClick={() => setActiveWorkspace('MISSION')}
            className={`p-3 rounded-xl transition-all ${activeWorkspace === 'MISSION' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            title="Mission Operations"
          >
            <LayoutDashboard size={20} />
          </button>

          <button 
            onClick={() => setActiveWorkspace('SCIENCE')}
            className={`p-3 rounded-xl transition-all ${activeWorkspace === 'SCIENCE' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            title="Scientific Analysis"
          >
            <Microscope size={20} />
          </button>

          <button 
            onClick={() => setActiveWorkspace('RESEARCH')}
            className={`p-3 rounded-xl transition-all ${activeWorkspace === 'RESEARCH' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
            title="Research & Knowledge"
          >
            <BookOpen size={20} />
          </button>
        </nav>

        <button className="p-3 text-slate-500 hover:text-slate-300 transition-colors">
          <Settings size={20} />
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 h-full relative overflow-hidden">
        {/* We keep MissionWorkspace mounted but hidden so WebGL doesn't unmount and lose context */}
        <div className={`absolute inset-0 ${activeWorkspace === 'MISSION' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <MissionWorkspace />
        </div>
        
        {activeWorkspace === 'SCIENCE' && (
          <div className="absolute inset-0 z-10">
            <ScientificAnalysisWorkspace />
          </div>
        )}

        {activeWorkspace === 'RESEARCH' && (
          <div className="absolute inset-0 z-10">
            <ResearchWorkspace />
          </div>
        )}
      </div>

    </div>
  );
}
