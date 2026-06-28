"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import MoonScene from "@/components/visualization/MoonScene";
import TelemetryDashboard from "@/components/visualization/TelemetryDashboard";
import Link from "next/link";
import { Navigation, Activity } from 'lucide-react';

export default function Home() {
  const { scrollYProgress } = useScroll();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Opacity controls for different narrative sections
  const arrivalOpacity = useTransform(scrollYProgress, [0, 0.1, 0.2], [1, 1, 0]);
  const briefingOpacity = useTransform(scrollYProgress, [0.15, 0.3, 0.4], [0, 1, 0]);
  const problemOpacity = useTransform(scrollYProgress, [0.35, 0.5, 0.6], [0, 1, 0]);
  const dashboardOpacity = useTransform(scrollYProgress, [0.8, 0.9, 1], [0, 1, 1]);

  if (!isMounted) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <main className="relative w-full h-[500vh] bg-[#020617]">
      {/* Fixed 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MoonScene scrollProgress={scrollYProgress} />
      </div>

      {/* Narrative Scroll Foreground */}
      <div className="relative z-10 w-full">
        
        {/* Section 1: Arrival */}
        <motion.section 
          style={{ opacity: arrivalOpacity }}
          className="h-screen w-full flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <h1 className="text-7xl font-bold font-mono tracking-tighter mb-4 text-white drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              ANTIGRAVITY <span className="text-green-500">v3</span>
            </h1>
            <p className="text-xl text-slate-300 font-sans tracking-widest uppercase">
              Lunar Mission Intelligence Platform
            </p>
          </div>
          <div className="absolute bottom-20 flex flex-col items-center animate-bounce opacity-70">
            <span className="text-sm font-mono text-slate-400 mb-2">INITIATE SEQUENCE</span>
            <div className="w-px h-16 bg-gradient-to-b from-blue-500 to-transparent" />
          </div>
        </motion.section>

        {/* Section 2: Mission Briefing */}
        <motion.section 
          style={{ opacity: briefingOpacity }}
          className="h-screen w-full flex items-center justify-start px-24 pointer-events-none"
        >
          <div className="glass-panel p-10 max-w-xl pointer-events-auto">
            <h2 className="text-3xl font-mono text-blue-400 mb-6 flex items-center gap-4">
              <span className="w-8 h-px bg-blue-400" />
              01 / MISSION BRIEFING
            </h2>
            <h3 className="text-5xl font-bold text-white mb-6 leading-tight">
              Target:<br />Faustini Crater
            </h3>
            <p className="text-lg text-slate-300 leading-relaxed font-sans mb-8">
              The discovery of water-ice in the lunar South Polar Region is a high-priority exploration objective. Observations from Chandrayaan-2 have opened new avenues to probe the subsurface using high-resolution radar datasets.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 border border-blue-500/30 rounded bg-blue-500/10 text-blue-400 font-mono text-sm">
                LAT: -85.46° S
              </div>
              <div className="px-4 py-2 border border-blue-500/30 rounded bg-blue-500/10 text-blue-400 font-mono text-sm">
                LON: 30.12° E
              </div>
            </div>
          </div>
        </motion.section>

        {/* Section 3: Scientific Problem */}
        <motion.section 
          style={{ opacity: problemOpacity }}
          className="h-screen w-full flex items-center justify-end px-24 pointer-events-none"
        >
          <div className="glass-panel p-10 max-w-xl pointer-events-auto border-l-4 border-l-green-500">
            <h2 className="text-3xl font-mono text-green-400 mb-6 flex items-center gap-4 flex-row-reverse">
              <span className="w-8 h-px bg-green-400" />
              02 / SCIENTIFIC PROBLEM
            </h2>
            <h3 className="text-5xl font-bold text-white mb-6 leading-tight text-right">
              Doubly Shadowed Regions
            </h3>
            <p className="text-lg text-slate-300 leading-relaxed font-sans text-right">
              Identifying subsurface ice unambiguously and translating these detections into actionable exploration strategies (landing and rover traversal) remains a key challenge due to extreme terrain hazards and solar power constraints.
            </p>
          </div>
        </motion.section>

        {/* Padding for Animation */}
        <div className="h-screen" />

        {/* Section 5: Mission Dashboard */}
        <motion.section 
          style={{ opacity: dashboardOpacity }}
          className="min-h-screen w-full flex flex-col p-12 pointer-events-none"
        >
          <header className="flex justify-between items-end mb-12 pointer-events-auto">
            <div>
              <h1 className="text-4xl font-mono font-bold text-white mb-2">MISSION OPERATIONS</h1>
              <p className="text-blue-400 font-mono">LIVE TELEMETRY FEED</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 font-mono text-sm">SYSTEM NOMINAL</span>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-8 w-full pointer-events-auto">
            <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <h3 className="text-sm font-mono text-slate-400 relative z-10 flex items-center gap-2">
                <Navigation size={14} className="text-blue-400" />
                MISSION CONTROL
              </h3>
              <div className="text-3xl font-mono font-bold text-white relative z-10">OPERATIONS</div>
              <p className="text-xs text-slate-300 font-mono mt-auto relative z-10 mb-4">
                Access the main dashboard to oversee lunar rover telemetry, AI planning, and orbital mechanics.
              </p>
              <Link 
                href="/mission-control" 
                className="relative z-10 mt-auto w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono text-sm text-center rounded transition-colors"
              >
                ENTER DASHBOARD
              </Link>
            </div>
            
            <div className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <h3 className="text-sm font-mono text-slate-400 relative z-10 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" />
                SCIENCE WORKSPACE
              </h3>
              <div className="text-3xl font-mono font-bold text-white relative z-10">SPECTROSCOPY</div>
              <p className="text-xs text-slate-300 font-mono mt-auto relative z-10 mb-4">
                Analyze sub-surface mineralogy using the high-fidelity volumetric X-Ray sensor simulation.
              </p>
              <Link 
                href="/science" 
                className="relative z-10 mt-auto w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm text-center rounded transition-colors"
              >
                OPEN WORKSPACE
              </Link>
            </div>
          </div>
          
          <div className="w-full h-64 mt-8 pointer-events-auto">
            <TelemetryDashboard />
          </div>
        </motion.section>
      </div>
    </main>
  );
}
