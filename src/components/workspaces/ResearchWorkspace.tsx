"use client";

import React, { useState } from 'react';
import { BookOpen, Link as LinkIcon, Plus, Save } from 'lucide-react';
import { useMissionMemory } from '@/lib/memory/missionMemory';

export default function ResearchWorkspace() {
  const { decisionHistory, ingestedDocuments } = useMissionMemory();
  const [notes, setNotes] = useState<string>('');

  return (
    <div className="flex flex-col h-full bg-[#020617] text-white p-6 gap-6">
      
      <div className="flex justify-between items-end border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-mono tracking-widest text-blue-500">RESEARCH KNOWLEDGE BASE</h2>
          <p className="text-sm text-slate-400 font-mono mt-1">Collaborative Evidence & Design Decisions</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded flex items-center gap-2 transition-colors">
          <Save size={14} /> SAVE RESEARCH SNAPSHOT
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left: Scratchpad & Notes */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2">
            <BookOpen size={16} /> COLLABORATIVE NOTES
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document scientific findings, cross-reference evidence, or log assumptions here..."
            className="flex-1 bg-[#060b19] border border-slate-800 rounded p-4 font-mono text-sm text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Right: Linked Evidence & Decisions */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <h3 className="text-sm font-bold font-mono text-slate-300 flex items-center gap-2">
            <LinkIcon size={16} /> LINKED MISSION DECISIONS
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {decisionHistory.map(decision => (
              <div key={decision.id} className="p-4 rounded border border-slate-800 bg-[#060b19] flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-mono text-blue-400">{decision.id}</span>
                  <span className="text-xs font-mono text-slate-500">{(decision.confidence * 100).toFixed(1)}% CONFIDENCE</span>
                </div>
                <h4 className="font-bold text-sm text-slate-200">{decision.what}</h4>
                <p className="text-xs text-slate-400">{decision.why}</p>
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">CITED EVIDENCE:</span>
                  <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                    {decision.evidence.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            {decisionHistory.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-800 rounded">
                No decisions recorded in current session.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
