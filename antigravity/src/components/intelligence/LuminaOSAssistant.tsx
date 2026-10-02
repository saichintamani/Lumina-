"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Terminal, Volume2 } from 'lucide-react';
import { useTelemetryStore } from '@/lib/memory/useTelemetryStore';
import { useAudioSettingsStore } from '@/lib/audio/useAudioSettingsStore';

export default function LuminaOSAssistant() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<{ role: 'user' | 'lumina', text: string }[]>([
    { role: 'lumina', text: 'Lumina OS Voice Assistant Online. How can I assist the mission?' }
  ]);
  const { setCameraPosition, triggerSolarFlare, toggleLatencyMode, setMissionFailed } = useTelemetryStore();
  const { isVoiceEnabled } = useAudioSettingsStore();
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const speak = (text: string) => {
    if (isVoiceEnabled && 'speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text);
      msg.voice = window.speechSynthesis.getVoices().find(v => v.name.includes('Google') || v.name.includes('Female')) || null;
      msg.pitch = 1.1;
      msg.rate = 1.05;
      window.speechSynthesis.speak(msg);
    }
  };

  const processCommand = (cmd: string) => {
    const text = cmd.toLowerCase();
    let response = "Command not recognized. Try 'plot route to shackleton', 'scan for titanium', or 'simulate solar flare'.";

    if (text.includes('shackleton') || text.includes('plot route')) {
      response = "Plotting A-star route to Shackleton crater PSR. Avoiding steep slopes greater than 15 degrees.";
      setCameraPosition([0, -1.495, 0.2]); // Move cam near Shackleton
    } else if (text.includes('titanium') || text.includes('scan')) {
      response = "Deploying DFSAR L-band scan. High concentrations of Titanium Dioxide detected at current coordinates.";
    } else if (text.includes('solar flare') || text.includes('storm')) {
      response = "Warning. Solar flare detected. Radiation levels rising. Recommend seeking immediate shadow coverage.";
      triggerSolarFlare();
    } else if (text.includes('latency') || text.includes('delay')) {
      response = "Activating Earth-Moon 2.6 second latency simulation. Manual driving is now significantly impaired.";
      toggleLatencyMode();
    } else if (text.includes('fail') || text.includes('die')) {
      response = "Critical failure initiated. Abandoning mission protocols.";
      setMissionFailed(true);
    }

    setHistory(prev => [...prev, { role: 'user', text: cmd }, { role: 'lumina', text: response }]);
    speak(response);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput('');
  };

  // Mock microphone toggle
  const toggleMic = () => {
    if (!isListening) {
      setIsListening(true);
      // Auto-simulate someone speaking after 2 seconds
      setTimeout(() => {
        setIsListening(false);
        processCommand("Plot route to Shackleton Crater");
      }, 2000);
    }
  };

  return (
    <div className="bg-[#030712]/90 border border-blue-900/50 rounded-lg overflow-hidden flex flex-col h-[200px] shadow-[0_0_20px_rgba(0,100,255,0.05)]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-blue-950/30 border-b border-blue-900/50">
        <div className="flex items-center gap-2">
          <Volume2 size={12} className="text-blue-400" />
          <span className="text-[10px] font-mono font-bold text-blue-400">LUMINA OS AI COMMAND</span>
        </div>
        {isListening && <span className="text-[9px] font-mono text-red-400 animate-pulse">● LISTENING</span>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-[10px]">
        {history.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded p-2 ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                : 'bg-blue-900/30 text-blue-300 border border-blue-800/50 shadow-[0_0_10px_rgba(0,100,255,0.1)]'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-2 bg-slate-900/50 border-t border-slate-800 flex gap-2">
        <button 
          type="button"
          onClick={toggleMic}
          className={`p-1.5 rounded transition-colors ${isListening ? 'bg-red-900/50 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
        >
          <Mic size={14} />
        </button>
        <div className="flex-1 relative">
          <Terminal size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type command or click mic..."
            className="w-full bg-black/50 border border-slate-700 rounded pl-7 pr-2 py-1.5 text-[10px] font-mono text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </form>
    </div>
  );
}
