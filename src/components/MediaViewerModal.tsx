'use client';

import React from 'react';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { HazardReport } from '@/lib/store';
import { X, Calendar, Globe, User, MessageSquare } from 'lucide-react';

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

  // Sentiment metrics
  const sentimentVal = report.sentiment || 0;
  const sentimentCls = sentimentVal > 0.2 ? 'ok' : sentimentVal < -0.2 ? 'danger' : 'warn';
  const sentimentText = sentimentVal > 0.2 ? 'positive' : sentimentVal < -0.2 ? 'negative' : 'neutral';

  const hasMedia = Array.isArray(report.media) && report.media.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl glass-panel border border-sky-500/20 bg-slate-900/90 text-slate-100 flex flex-col p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div className="border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-lg font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping"></span>
            {report.type} REPORT DETAILS
          </h2>
        </div>

        {/* Content Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[250px] overflow-y-auto max-h-[70vh]">
          
          {/* Left panel: Media or details */}
          <div className={`${hasMedia ? 'md:col-span-7' : 'md:col-span-12'} flex flex-col justify-center items-center bg-slate-950/40 border border-slate-850 rounded-xl p-4 min-h-[240px]`}>
            {hasMedia ? (
              <div className="grid grid-cols-2 gap-3 w-full">
                {report.media.map((m, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                    {m.type === 'image' ? (
                      <img 
                        src={m.data} 
                        alt={m.name} 
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
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
              <div className="w-full space-y-4 text-left p-2">
                <div className="flex items-start gap-3">
                  <MessageSquare className="text-sky-400 h-5 w-5 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('description')}</h4>
                    <p className="text-sm text-slate-100 mt-1 leading-relaxed whitespace-pre-wrap">{report.desc}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Meta Board (only visible if media is present, or integrated if no media) */}
          <div className={`${hasMedia ? 'md:col-span-5' : 'md:col-span-12'} space-y-4 flex flex-col justify-between`}>
            
            {/* If media is present, we show the description here */}
            {hasMedia && (
              <div className="p-3 bg-slate-950/30 rounded-xl border border-slate-850">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t('description')}</h4>
                <p className="text-xs text-slate-200 leading-relaxed max-h-[120px] overflow-y-auto">{report.desc}</p>
              </div>
            )}

            {/* Info Table */}
            <div className="space-y-3 p-3 bg-slate-950/40 rounded-xl border border-slate-850 text-xs">
              <div className="flex items-center gap-2 text-slate-300 py-1.5 border-b border-slate-850">
                <Calendar size={14} className="text-sky-400" />
                <span className="text-slate-400 font-medium">Logged:</span>
                <span className="ml-auto font-semibold">{dateStr}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 py-1.5 border-b border-slate-850">
                <User size={14} className="text-sky-400" />
                <span className="text-slate-400 font-medium">Source Type:</span>
                <span className="ml-auto capitalize font-semibold">{report.src}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 py-1.5 border-b border-slate-850">
                <Globe size={14} className="text-sky-400" />
                <span className="text-slate-400 font-medium">Coordinates:</span>
                <span className="ml-auto font-mono text-cyan-400">{report.lat.toFixed(4)}, {report.lng.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 py-1.5 border-b border-slate-850">
                <span className="text-slate-400 font-medium font-sans">Verification:</span>
                <span className="ml-auto">
                  <span className={`chip ${report.verified ? 'ok' : 'warn'}`}>
                    {report.verified ? 'verified' : 'unverified'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-300 py-1.5">
                <span className="text-slate-400 font-medium">NLP Sentiment:</span>
                <span className="ml-auto">
                  <span className={`chip ${sentimentCls}`}>
                    {sentimentText} ({sentimentVal.toFixed(2)})
                  </span>
                </span>
              </div>
            </div>

            {/* Sync Status Banner */}
            <div className="p-2.5 bg-slate-950/20 rounded-lg text-[10px] text-slate-500 border border-slate-900/50 flex justify-between items-center mt-2">
              <span>Report ID: <span className="font-mono">{report.id}</span></span>
              <span>Lang: <span className="uppercase font-semibold text-slate-400">{report.lang}</span></span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
