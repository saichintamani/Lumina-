"use client";

import React, { useEffect, useState } from 'react';
import CommandCenter from '@/components/operations/CommandCenter';
import WorkflowEngine from '@/components/operations/WorkflowEngine';
import DataIngestion from '@/components/operations/DataIngestion';
import ExplanationCard from '@/components/intelligence/ExplanationCard';
import { useMissionMemory } from '@/lib/memory/missionMemory';
import { Network } from 'lucide-react';
import Link from 'next/link';

export default function OperationsPage() {
  const { decisionHistory, recordDecision, updateWorkflowProgress } = useMissionMemory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate an initial AI decision to populate the XAI panel
    if (decisionHistory.length === 0) {
      recordDecision({
        what: "Selected Faustini Crater (F2) for Landing",
        why: "Highest probability of subsurface ice within operational constraints.",
        evidence: [
          "L-band CPR > 0.8 indicating high volume scattering",
          "m-chi DOP < 0.4 confirming non-dihedral dominant returns",
          "Max slope < 5 degrees in target corridor"
        ],
        confidence: 0.965,
        assumptions: ["Regolith dielectric constant matches Apollo 17 PSR estimates"],
        limitations: ["Thermal survivability margin drops below 10% on Day 14"]
      });
      updateWorkflowProgress(3);
    }
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="min-h-screen bg-[#020617] p-8">
      
      {/* Header */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <Link href="/" className="text-blue-500 font-mono text-sm hover:underline mb-2 inline-block">← Back to Mission Documentary</Link>
          <h1 className="text-4xl font-mono font-bold text-white flex items-center gap-4">
            <Network className="text-blue-500" size={32} />
            INTELLIGENCE OPERATIONS
          </h1>
          <p className="text-slate-400 font-mono mt-2">Mission Intelligence Layer / RAG Orchestrator</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-blue-500 font-mono text-sm">ORCHESTRATOR ONLINE</span>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (8 cols): Data & Workflows */}
        <div className="col-span-8 flex flex-col gap-6">
          <CommandCenter />
          <WorkflowEngine />
          <DataIngestion />
        </div>

        {/* Right Column (4 cols): Explainable AI & Knowledge Engine */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-5 sticky top-8">
            <h3 className="text-lg font-bold font-mono text-white mb-4">EXPLAINABLE AI (XAI)</h3>
            <p className="text-sm text-slate-400 font-mono mb-4">
              Transparent reasoning for autonomous decisions.
            </p>
            
            <div className="flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-2">
              {decisionHistory.map((decision) => (
                <ExplanationCard key={decision.id} decision={decision} />
              ))}
              
              {decisionHistory.length === 0 && (
                <span className="text-slate-600 font-mono text-sm">No decisions logged in current session.</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
