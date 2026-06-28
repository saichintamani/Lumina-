"use client";

import React from 'react';
import { useMissionMemory } from '@/lib/memory/missionMemory';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, ArrowRight } from 'lucide-react';

const WORKFLOW_STEPS = [
  "Mission Selected",
  "Data Imported",
  "Calibration",
  "Feature Extraction",
  "Risk Analysis",
  "Mission Planning",
  "Report Generation"
];

export default function WorkflowEngine() {
  const { workflowProgress } = useMissionMemory();

  return (
    <div className="glass-panel p-6 w-full flex flex-col gap-6">
      <h3 className="text-xl font-bold font-mono text-white mb-2">SCIENTIFIC WORKFLOW</h3>
      
      <div className="flex items-center justify-between w-full relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
        
        {/* Progress Line */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-blue-500 -translate-y-1/2 z-0 shadow-[0_0_10px_#3b82f6]"
          initial={{ width: '0%' }}
          animate={{ width: `${(workflowProgress / (WORKFLOW_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        {/* Steps */}
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = index < workflowProgress;
          const isActive = index === workflowProgress;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                  ${isCompleted ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 
                    isActive ? 'bg-green-500/20 border-green-500 text-green-400 animate-pulse' : 
                    'bg-slate-900 border-slate-700 text-slate-600'}
                `}
              >
                {isCompleted ? <CheckCircle2 size={20} /> : 
                 isActive ? <Loader2 size={20} className="animate-spin" /> : 
                 <Circle size={20} />}
              </div>
              
              <div className="absolute top-14 w-32 text-center">
                <span className={`text-xs font-mono transition-colors duration-300
                  ${isCompleted ? 'text-slate-300' : 
                    isActive ? 'text-green-400 font-bold' : 
                    'text-slate-600'}
                `}>
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Spacer for the absolute positioned text labels */}
      <div className="h-10" />
    </div>
  );
}
