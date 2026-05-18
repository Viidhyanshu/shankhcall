'use client';

import React from 'react';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { HazardReport } from '@/lib/store';
import { X, Calendar, Globe, User, MessageSquare, ShieldAlert, Cpu, Radio, ShieldCheck, Compass, Eye, Terminal } from 'lucide-react';

interface MediaViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HazardReport | null;
  lang: SupportedLanguages;
}

export default function MediaViewerModal({ isOpen, onClose, report, lang }: MediaViewerModalProps) {
  if (!isOpen || !report) return null;

  const t = (key: any) => getTranslation(key, lang);
  const dateStr = new Date(report.ts).toLocaleString();



  const hasMedia = Array.isArray(report.media) && report.media.length > 0;

  // Determine Danger Level Threat
  const isCritical = ['tsunami', 'Fire'].includes(report.type);
  const isWarning = ['flood', 'damage', 'Poaching', 'Logging'].includes(report.type);
  
  const threatLevel = isCritical 
    ? 'LEVEL 1 // CRITICAL THREAT' 
    : isWarning 
      ? 'LEVEL 2 // SECURE WARNING' 
      : 'LEVEL 3 // ADVISORY FEED';
      
  const threatColor = isCritical 
    ? 'text-red-500 border-red-500/30 bg-red-950/20 shadow-lg shadow-red-500/5' 
    : isWarning 
      ? 'text-amber-500 border-amber-500/30 bg-amber-950/20 shadow-lg shadow-amber-500/5' 
      : 'text-sky-500 border-sky-500/30 bg-sky-950/20';

  // HUD corner bracket components
  const cornerBrackets = (
    <>
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400/70"></span>
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400/70"></span>
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400/70"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400/70"></span>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-4xl rounded-2xl glass-panel border border-cyan-500/25 bg-[#080d19]/95 text-slate-100 flex flex-col p-6 shadow-2xl relative select-none">
        
        {/* Radar scanning decorative layout under overlay */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.06),transparent)] pointer-events-none"></div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all z-10 border border-slate-800 hover:border-slate-700 bg-slate-900/60"
        >
          <X size={15} />
        </button>

        {/* Top Control Header */}
        <div className="border-b border-slate-800 pb-3.5 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Cpu size={13} className="text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-md font-extrabold tracking-[0.08em] text-cyan-400 uppercase flex items-center gap-2">
                {report.type} DETECTOR STATUS // ONLINE
              </h2>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">TACTICAL CONSOLE INCIDENT MONITOR</span>
            </div>
          </div>

          {/* Incident Threat Level */}
          <div className={`px-3 py-1 rounded border text-[10px] font-mono font-bold tracking-wider ${threatColor}`}>
            ● {threatLevel}
          </div>
        </div>

        {/* Tactical Console Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[300px] overflow-y-auto max-h-[70vh] pr-1">
          
          {/* Left panel: Telemetry Metadata (col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-between gap-4">
            
            {/* System Diagnostic Module */}
            <div className="space-y-3 p-4 bg-[#0a1226]/80 rounded-xl border border-slate-800/80">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-2.5">
                <Compass size={11} className="text-cyan-400" />
                TELEMETRY DIAGNOSTICS
              </h3>

              {/* Log Time */}
              <div className="flex flex-col gap-0.5 py-1 border-b border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">TIMESTAMP LOG</span>
                <span className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1">
                  <Calendar size={11} className="text-slate-500" />
                  {dateStr}
                </span>
              </div>

              {/* Source Type */}
              <div className="flex flex-col gap-0.5 py-1 border-b border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">SENSOR SOURCE</span>
                <span className="text-xs font-semibold text-slate-200 font-mono flex items-center gap-1">
                  <User size={11} className="text-slate-500" />
                  {report.src.toUpperCase()} SOURCE INTEL
                </span>
              </div>

              {/* Coordinates */}
              <div className="flex flex-col gap-0.5 py-1 border-b border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">GEO-COORDINATES</span>
                <span className="text-xs font-semibold text-cyan-400 font-mono flex items-center gap-1">
                  <Globe size={11} className="text-cyan-500" />
                  {report.lat.toFixed(6)}° N, {report.lng.toFixed(6)}° E
                </span>
              </div>

              {/* Verification Status */}
              <div className="flex items-center justify-between py-1 border-b border-slate-900/60">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">THREAT LOCK</span>
                <span className="flex items-center gap-1.5">
                  {report.verified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      <ShieldCheck size={11} />
                      VERIFIED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/20 border border-amber-500/20 px-2 py-0.5 rounded font-mono animate-pulse">
                      <ShieldAlert size={11} />
                      UNVERIFIED
                    </span>
                  )}
                </span>
              </div>

              {/* Report ID */}
              <div className="flex items-center justify-between py-1 text-[9px] font-mono text-slate-500">
                <span>SYSTEM ID:</span>
                <span className="text-slate-400 font-bold">{report.id.toUpperCase()}</span>
              </div>
            </div>

            {/* Tactical Comms Waveform Widget */}
            <div className="p-4 bg-[#0a1226]/80 rounded-xl border border-slate-800/80 space-y-2.5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
                <Radio size={11} className="text-cyan-400 animate-pulse" />
                TACTICAL SIGNAL MONITOR
              </h3>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>FREQUENCY: <span className="text-cyan-400 font-bold">868.5 MHz</span></span>
                <span className="text-emerald-400 font-bold animate-pulse">● SECURE LOCK</span>
              </div>

              {/* High-tech pulsing wave animation */}
              <div className="h-10 w-full bg-slate-950 rounded border border-slate-900/60 flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,194,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px]"></div>
                <div className="flex items-center gap-1.5 px-3 z-10 w-full justify-between select-none">
                  <div className="h-4 w-1 bg-cyan-500/70 rounded animate-[pulse_1s_infinite_100ms]"></div>
                  <div className="h-6 w-1 bg-cyan-400/80 rounded animate-[pulse_1.2s_infinite_300ms]"></div>
                  <div className="h-8 w-1 bg-cyan-400 rounded animate-[pulse_0.8s_infinite_0ms]"></div>
                  <div className="h-5 w-1 bg-cyan-500 rounded animate-[pulse_1.1s_infinite_400ms]"></div>
                  <div className="h-7 w-1 bg-cyan-400 rounded animate-[pulse_0.9s_infinite_200ms]"></div>
                  <div className="h-4 w-1 bg-cyan-500/70 rounded animate-[pulse_1.4s_infinite_500ms]"></div>
                  <div className="h-6 w-1 bg-cyan-400/80 rounded animate-[pulse_1s_infinite_150ms]"></div>
                  <div className="h-8 w-1 bg-cyan-400 rounded animate-[pulse_0.7s_infinite_50ms]"></div>
                  <div className="h-5 w-1 bg-cyan-500 rounded animate-[pulse_1.3s_infinite_350ms]"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Right panel: Visual Intelligence Feed + Briefing Log (col-span-7) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Visual Intel Monitor */}
            <div className="relative bg-slate-950/60 border border-slate-850 rounded-xl p-3 flex flex-col min-h-[220px]">
              
              {/* CAM / RADAR Feed label */}
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-900/60 select-none">
                <span className="text-[9px] font-bold text-cyan-400 font-mono tracking-widest flex items-center gap-1">
                  <Eye size={10} className="text-cyan-400 animate-pulse" />
                  {hasMedia ? 'CAM 01 // VISUAL INTEL FEED' : 'RADAR SYSTEM // ACQUISITION SEARCH'}
                </span>
                
                {hasMedia && (
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-[8px] text-red-500 font-mono font-bold">● REC</span>
                  </div>
                )}
              </div>

              <div className="flex-grow w-full flex items-center justify-center relative">
                {hasMedia ? (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {report.media.map((m, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-850 bg-[#090e18] flex items-center justify-center group">
                        
                        {/* Custom brackets around image */}
                        {cornerBrackets}

                        {m.type === 'image' ? (
                          <img 
                            src={m.data} 
                            alt={m.name} 
                            className="w-full h-full object-contain cursor-pointer hover:scale-[1.03] transition-transform duration-300"
                            onClick={() => window.open(m.data, '_blank')}
                          />
                        ) : (
                          <video 
                            src={m.data} 
                            controls 
                            className="w-full h-full object-contain rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Dynamic radar grid background for reports without visual media */
                  <div className="w-full h-full min-h-[170px] flex flex-col items-center justify-center relative overflow-hidden bg-slate-950/70 rounded-lg border border-slate-900 p-6 select-none">
                    
                    {/* Corner Cyber HUD Brackets */}
                    {cornerBrackets}

                    {/* Grid overlay lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,194,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.03)_1px,transparent_1px)] bg-[size:14px_14px]"></div>
                    
                    {/* Radar swept light sweep line */}
                    <div className="absolute w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_55%,rgba(0,194,255,0.1))] rounded-full animate-[spin_5s_linear_infinite] pointer-events-none origin-center"></div>
                    
                    {/* Telemetry coordinate ring */}
                    <div className="absolute h-24 w-24 rounded-full border border-cyan-500/10 flex items-center justify-center animate-pulse">
                      <div className="h-12 w-12 rounded-full border border-cyan-500/5"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center justify-center text-center gap-2">
                      <Radio size={24} className="text-cyan-400/80 animate-pulse" />
                      <span className="text-[10px] text-cyan-400/90 font-mono tracking-[0.25em] uppercase font-bold">RADAR LINK SECURED</span>
                      <span className="text-[9px] text-slate-500 font-mono tracking-wider">COORDS LOCK: {report.lat.toFixed(4)}N / {report.lng.toFixed(4)}E</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Operational Briefing Analysis Log */}
            <div className="relative p-4 bg-[#0a1226]/80 rounded-xl border border-slate-800/80 flex-grow flex flex-col justify-between">
              
              {/* Corner Cyber HUD Brackets */}
              {cornerBrackets}

              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-2.5">
                  <Terminal size={11} className="text-cyan-400" />
                  INCIDENT BRIEFING LOG
                </h4>
                <div className="text-xs text-emerald-400 font-mono leading-relaxed max-h-[140px] overflow-y-auto bg-slate-950/40 p-2.5 rounded border border-slate-900/60 font-semibold">
                  <span className="text-slate-600 block mb-1">SYSTEM ANALYST REPORT LOG:</span>
                  {report.desc}
                </div>
              </div>

              {/* Bottom Console System Data details */}
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 pt-3 border-t border-slate-900 mt-2">
                <span>INCIDENT CLASSIFIER: <span className="text-slate-400 font-bold uppercase">{report.type}</span></span>
                <span>COMMS LANG: <span className="uppercase text-slate-400 font-bold">{report.lang}</span></span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
