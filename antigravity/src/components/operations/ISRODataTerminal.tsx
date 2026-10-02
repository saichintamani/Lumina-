"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Download, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * ISRODataTerminal
 * ================
 * Simulates the live download and decoding of raw PDS4 data from ISRO's ISSDC
 * (Indian Space Science Data Centre) archive. Shows realistic terminal output
 * including HTTP headers, checksums, and data pipeline stages.
 */

interface TerminalLine {
  text: string;
  type: 'info' | 'success' | 'error' | 'data' | 'header' | 'progress';
  timestamp: string;
}

const DATA_PIPELINE_SCRIPT: Omit<TerminalLine, 'timestamp'>[] = [
  { text: '$ issdc-fetch --mission CH2 --instrument TMC2 --product L2', type: 'header' },
  { text: 'Connecting to pradan.issdc.gov.in:443 ...', type: 'info' },
  { text: 'TLS 1.3 handshake complete (ECDHE-RSA-AES256-GCM-SHA384)', type: 'info' },
  { text: 'HTTP/1.1 200 OK', type: 'success' },
  { text: 'Content-Type: application/x-pds4-archive', type: 'data' },
  { text: 'X-ISRO-Mission: Chandrayaan-2', type: 'data' },
  { text: 'X-ISRO-Instrument: TMC-2 (Terrain Mapping Camera)', type: 'data' },
  { text: 'X-ISRO-Product-Level: L2 (Radiometrically Corrected)', type: 'data' },
  { text: '', type: 'info' },
  { text: 'Downloading: ch2_tmc_ncm_20240815T042301_d32_v1.xml', type: 'progress' },
  { text: '  [████████████████████████████████████████] 100% 42.3 MB', type: 'progress' },
  { text: 'SHA-256: 8f14e45fce...a9b573d (VERIFIED ✓)', type: 'success' },
  { text: '', type: 'info' },
  { text: 'Downloading: ch2_tmc_ncm_20240815T042301_d32_v1.img', type: 'progress' },
  { text: '  [████████████████████████████████████████] 100% 1.2 GB', type: 'progress' },
  { text: 'SHA-256: 3c59dc048e...72b4e8c (VERIFIED ✓)', type: 'success' },
  { text: '', type: 'info' },
  { text: '$ pds4-decode --format VICAR --output ./processed/', type: 'header' },
  { text: 'Parsing PDS4 XML label...', type: 'info' },
  { text: '  Observation ID: CH2_TMC_NCC_20240815_0423_D32', type: 'data' },
  { text: '  Target: MOON (South Polar Region)', type: 'data' },
  { text: '  Center Lat: -85.42°  Center Lon: 30.18°', type: 'data' },
  { text: '  Resolution: 5m/pixel (TMC-2 Nadir)', type: 'data' },
  { text: '  Illumination: Sun Azimuth 142.3° Elevation 11.7°', type: 'data' },
  { text: '  Encoding: 12-bit unsigned integer, Band Interleaved', type: 'data' },
  { text: '', type: 'info' },
  { text: 'Decoding VICAR image cube (4096 x 4096 x 1 bands)...', type: 'info' },
  { text: '  Radiometric calibration applied (DN → Reflectance)', type: 'info' },
  { text: '  Orthorectification using LOLA DEM (GSFC/PDS)', type: 'info' },
  { text: '  Map projection: Polar Stereographic (EPSG:32761)', type: 'info' },
  { text: 'Output: ./processed/tmc2_faustini_ortho.tif ✓', type: 'success' },
  { text: '', type: 'info' },
  { text: '$ issdc-fetch --mission CH2 --instrument OHRC --product L2', type: 'header' },
  { text: 'Downloading: ch2_ohrc_ncc_20240815T042315_d32_v1.img', type: 'progress' },
  { text: '  [████████████████████████████████████████] 100% 3.8 GB', type: 'progress' },
  { text: 'SHA-256: 2e7d2c038...9f1a4b7 (VERIFIED ✓)', type: 'success' },
  { text: '  Resolution: 0.25m/pixel (OHRC Nadir)', type: 'data' },
  { text: '  Swath Width: 3 km', type: 'data' },
  { text: 'Output: ./processed/ohrc_faustini_hires.tif ✓', type: 'success' },
  { text: '', type: 'info' },
  { text: '$ loftr-match --pair tmc2_faustini_ortho.tif ohrc_faustini_hires.tif', type: 'header' },
  { text: 'Loading LoFTR (LoFTR-DS, outdoor) weights from kornia hub...', type: 'info' },
  { text: '  Model: LoFTR (Sun et al., CVPR 2021)', type: 'data' },
  { text: '  Backend: PyTorch 2.1 + CUDA 12.1', type: 'data' },
  { text: '  Device: NVIDIA A100 40GB (Colab Pro)', type: 'data' },
  { text: '', type: 'info' },
  { text: 'Extracting coarse correspondences...', type: 'info' },
  { text: '  Coarse matches: 2,847 keypoints', type: 'data' },
  { text: 'Refining with sub-pixel module...', type: 'info' },
  { text: '  Fine matches: 2,134 keypoints (confidence > 0.85)', type: 'data' },
  { text: '  Inlier ratio after RANSAC: 94.7%', type: 'success' },
  { text: '  Mean reprojection error: 0.42 px', type: 'success' },
  { text: '', type: 'info' },
  { text: 'Writing matches → ./processed/matches.json (2,134 correspondences)', type: 'success' },
  { text: '════════════════════════════════════════════════════════════════', type: 'info' },
  { text: '  PIPELINE COMPLETE: TMC×OHRC scale-invariant matching done.', type: 'success' },
  { text: '  Sun-angle normalized. Ready for 3D Digital Twin injection.', type: 'success' },
  { text: '════════════════════════════════════════════════════════════════', type: 'info' },
];

export default function ISRODataTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const startPipeline = () => {
    setLines([]);
    setCurrentIdx(0);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning || currentIdx >= DATA_PIPELINE_SCRIPT.length) {
      if (currentIdx >= DATA_PIPELINE_SCRIPT.length) setIsRunning(false);
      return;
    }

    const delay = DATA_PIPELINE_SCRIPT[currentIdx].type === 'progress' ? 400 :
                  DATA_PIPELINE_SCRIPT[currentIdx].type === 'header' ? 600 :
                  DATA_PIPELINE_SCRIPT[currentIdx].text === '' ? 100 : 150;

    const timer = setTimeout(() => {
      const now = new Date();
      const ts = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setLines(prev => [...prev, { 
        ...DATA_PIPELINE_SCRIPT[currentIdx], 
        timestamp: ts 
      }]);
      setCurrentIdx(prev => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isRunning, currentIdx]);

  // Auto-scroll
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const getLineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'header': return 'text-yellow-400 font-bold';
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-red-400';
      case 'data': return 'text-cyan-300';
      case 'progress': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-[#000a14] border border-slate-800 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a1628] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <Terminal size={12} className="text-slate-500 ml-2" />
          <span className="text-[10px] font-mono text-slate-400">isro-issdc-pipeline@lumina:~/data</span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <span className="text-[9px] font-mono text-emerald-400 animate-pulse">● LIVE</span>
          )}
          <button
            onClick={startPipeline}
            disabled={isRunning}
            className="flex items-center gap-1 px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800/50 border border-emerald-700/50 text-emerald-400 font-mono text-[9px] rounded transition-all disabled:opacity-40"
          >
            <Download size={10} />
            {isRunning ? 'RUNNING...' : 'RUN PIPELINE'}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={terminalRef}
        className="h-48 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed scrollbar-thin"
      >
        {lines.length === 0 && !isRunning && (
          <div className="flex flex-col items-center justify-center h-full text-slate-600">
            <Terminal size={24} className="mb-2 opacity-50" />
            <span className="text-[10px]">Click &quot;RUN PIPELINE&quot; to simulate ISRO PDS4 data ingestion</span>
            <span className="text-[8px] mt-1">TMC-2 → OHRC → LoFTR → Digital Twin</span>
          </div>
        )}
        {lines.map((line, i) => (
          <div key={i} className="flex gap-2">
            {line.text && (
              <span className="text-slate-600 select-none shrink-0">{line.timestamp}</span>
            )}
            <span className={getLineColor(line.type)}>
              {line.text || '\u00A0'}
            </span>
          </div>
        ))}
        {isRunning && (
          <span className="text-emerald-400 animate-pulse">▋</span>
        )}
      </div>
    </div>
  );
}
