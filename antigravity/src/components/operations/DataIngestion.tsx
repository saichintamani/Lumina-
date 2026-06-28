"use client";

import React, { useState } from 'react';
import { UploadCloud, FileText, FileImage, Database, ArrowRight } from 'lucide-react';
import { useMissionMemory } from '@/lib/memory/missionMemory';

export default function DataIngestion() {
  const [isUploading, setIsUploading] = useState(false);
  const { ingestDocument, addLog, setTask } = useMissionMemory();

  const handleSimulateUpload = (type: string, name: string) => {
    setIsUploading(true);
    setTask('DATA_INGESTION');
    addLog({ agent: 'SysAdmin', message: `Initiating upload: ${name} [${type}]`, level: 'info' });

    setTimeout(() => {
      ingestDocument({ title: name, type, status: 'PROCESSED' });
      addLog({ agent: 'KnowledgeEngine', message: `Successfully extracted metadata from ${name}`, level: 'success' });
      setIsUploading(false);
      setTask('IDLE');
    }, 1500);
  };

  return (
    <div className="glass-panel p-6 w-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold font-mono text-white mb-1 flex items-center gap-2">
            <Database size={20} className="text-blue-400" />
            DATA INGESTION PORTAL
          </h3>
          <p className="text-sm text-slate-400">RAG Knowledge Base & Mission Telemetry</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        
        {/* GeoTIFF Upload */}
        <button 
          onClick={() => handleSimulateUpload('GeoTIFF', 'Faustini_LROC_DEM.tif')}
          disabled={isUploading}
          className="flex flex-col items-center justify-center gap-3 p-6 border border-dashed border-slate-600 rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-blue-400">
            <FileImage size={24} />
          </div>
          <div className="text-center">
            <span className="block text-sm font-mono text-white mb-1">Terrain Model</span>
            <span className="block text-xs font-mono text-slate-500">.TIF / .IMG</span>
          </div>
        </button>

        {/* PDF Upload */}
        <button 
          onClick={() => handleSimulateUpload('PDF', 'ISRO_Chandrayaan2_DFSAR_Specs.pdf')}
          disabled={isUploading}
          className="flex flex-col items-center justify-center gap-3 p-6 border border-dashed border-slate-600 rounded-lg hover:border-green-500 hover:bg-green-500/5 transition-all disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-green-400">
            <FileText size={24} />
          </div>
          <div className="text-center">
            <span className="block text-sm font-mono text-white mb-1">Mission Report</span>
            <span className="block text-xs font-mono text-slate-500">.PDF (RAG Target)</span>
          </div>
        </button>

        {/* CSV Upload */}
        <button 
          onClick={() => handleSimulateUpload('CSV', 'DFSAR_Polarimetric_Telemetry.csv')}
          disabled={isUploading}
          className="flex flex-col items-center justify-center gap-3 p-6 border border-dashed border-slate-600 rounded-lg hover:border-amber-500 hover:bg-amber-500/5 transition-all disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
            <Database size={24} />
          </div>
          <div className="text-center">
            <span className="block text-sm font-mono text-white mb-1">Radar Telemetry</span>
            <span className="block text-xs font-mono text-slate-500">.CSV / .JSON</span>
          </div>
        </button>

      </div>
    </div>
  );
}
