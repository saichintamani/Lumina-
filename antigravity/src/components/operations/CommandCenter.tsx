"use client";

import React from 'react';
import { useMissionMemory } from '@/lib/memory/missionMemory';
import { Terminal, Activity, Database, Cpu } from 'lucide-react';

export default function CommandCenter() {
  const { logs, activeAgents, currentTask } = useMissionMemory();

  return (
    <div className="grid grid-cols-3 gap-6 h-96 w-full">
      
      {/* Active Services Panel */}
      <div className="col-span-1 glass-panel p-5 flex flex-col gap-4 overflow-hidden">
        <h3 className="text-sm font-mono text-slate-400 flex items-center gap-2">
          <Activity size={16} className="text-green-500 animate-pulse" /> 
          ACTIVE ORCHESTRATION
        </h3>
        
        <div className="bg-slate-900/50 rounded border border-slate-800 p-4">
          <span className="text-xs font-mono text-slate-500 mb-1 block">CURRENT TASK</span>
          <span className="text-lg font-mono text-blue-400 font-bold">{currentTask}</span>
        </div>

        <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-2">
          <span className="text-xs font-mono text-slate-500 mb-1">RUNNING AGENTS</span>
          {activeAgents.length === 0 ? (
            <span className="text-sm font-mono text-slate-600">No agents active.</span>
          ) : (
            activeAgents.map(agent => (
              <div key={agent} className="flex items-center gap-3 bg-slate-800/50 rounded p-2 border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-mono text-slate-300">{agent}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Terminal Logs Panel */}
      <div className="col-span-2 glass-panel p-0 flex flex-col overflow-hidden border-l-4 border-l-slate-700">
        <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-mono text-slate-400 flex items-center gap-2">
            <Terminal size={16} /> SYSTEM LOGS
          </h3>
          <div className="flex gap-4">
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1"><Cpu size={12}/> MEM: 2.4GB</span>
            <span className="text-xs font-mono text-slate-500 flex items-center gap-1"><Database size={12}/> DB: CONNECTED</span>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs flex flex-col gap-2 bg-[#0a0f1c]">
          {logs.length === 0 ? (
            <span className="text-slate-600">Waiting for system initialization...</span>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="text-slate-500 shrink-0 w-32">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className="text-blue-400 shrink-0 w-24">[{log.agent}]</span>
                <span className={`
                  ${log.level === 'error' ? 'text-red-400' : ''}
                  ${log.level === 'warn' ? 'text-yellow-400' : ''}
                  ${log.level === 'success' ? 'text-green-400' : ''}
                  ${log.level === 'info' ? 'text-slate-300' : ''}
                `}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
