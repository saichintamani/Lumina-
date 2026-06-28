import React from 'react';
import { ShieldCheck, Target, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { DecisionRecord } from '@/lib/memory/missionMemory';

export default function ExplanationCard({ decision }: { decision: DecisionRecord }) {
  return (
    <div className="glass-panel p-5 w-full flex flex-col gap-4 border-l-4 border-l-blue-500">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold font-mono text-white mb-1 flex items-center gap-2">
            <Target size={20} className="text-blue-400" />
            {decision.what}
          </h3>
          <p className="text-sm text-slate-300">{decision.why}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex gap-2 text-xs font-mono">
            <span className="text-slate-500">CONFIDENCE:</span>
            <span className={decision.confidence > 0.9 ? 'text-green-400' : 'text-amber-400'}>
              {(decision.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-slate-800" />

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Evidence */}
        <div>
          <h4 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1">
            <ShieldCheck size={14} /> SUPPORTING EVIDENCE
          </h4>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {decision.evidence.map((ev, i) => <li key={i}>{ev}</li>)}
          </ul>
        </div>

        {/* Assumptions */}
        <div>
          <h4 className="text-xs font-mono text-slate-400 mb-2 flex items-center gap-1">
            <Info size={14} /> ASSUMPTIONS MADE
          </h4>
          <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
            {decision.assumptions.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>

        {/* Limitations */}
        <div className="col-span-2">
          <h4 className="text-xs font-mono text-amber-500/80 mb-2 flex items-center gap-1">
            <AlertTriangle size={14} /> LIMITATIONS & RISKS
          </h4>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded p-3 text-sm text-amber-200/90">
            <ul className="list-disc list-inside space-y-1">
              {decision.limitations.map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
