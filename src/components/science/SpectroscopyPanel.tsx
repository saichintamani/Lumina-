import React, { useEffect, useState } from 'react';
import { Activity, Database, Radar } from 'lucide-react';

export default function SpectroscopyPanel() {
  const [data, setData] = useState({ fe: 45, ti: 22, h2o: 12, th: 5 });

  // Simulate scanning changes
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        fe: Math.min(100, Math.max(0, prev.fe + (Math.random() - 0.5) * 5)),
        ti: Math.min(100, Math.max(0, prev.ti + (Math.random() - 0.5) * 3)),
        h2o: Math.min(100, Math.max(0, prev.h2o + (Math.random() - 0.5) * 8)),
        th: Math.min(100, Math.max(0, prev.th + (Math.random() - 0.5) * 1)),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#040b16] border border-cyan-900/50 p-4 rounded-lg shadow-[0_0_15px_rgba(0,255,255,0.1)] flex flex-col gap-4">
      <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm border-b border-cyan-900/50 pb-2">
        <Radar size={16} className="animate-spin-slow" />
        <span>MULTISPECTRAL SCANNER</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Iron Oxide */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-pink-400">IRON OXIDE (FeO)</span>
            <span className="text-pink-300">{data.fe.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 shadow-[0_0_8px_#ec4899]" style={{ width: `${data.fe}%` }} />
          </div>
        </div>

        {/* Titanium Dioxide */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-purple-400">TITANIUM (TiO2)</span>
            <span className="text-purple-300">{data.ti.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7]" style={{ width: `${data.ti}%` }} />
          </div>
        </div>

        {/* Water Ice */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-cyan-400">WATER ICE (H2O)</span>
            <span className="text-cyan-300">{data.h2o.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" style={{ width: `${data.h2o}%` }} />
          </div>
        </div>

        {/* Thorium */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-yellow-400">THORIUM (Th)</span>
            <span className="text-yellow-300">{data.th.toFixed(2)} ppm</span>
          </div>
          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 shadow-[0_0_8px_#eab308]" style={{ width: `${data.th}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-cyan-900/50 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1"><Activity size={10} className="text-green-500" /> SENSOR ACTIVE</span>
        <span className="flex items-center gap-1"><Database size={10} /> DATALINK ESTABLISHED</span>
      </div>
    </div>
  );
}
