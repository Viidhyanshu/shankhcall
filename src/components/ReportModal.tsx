'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { storeActions } from '@/lib/store';
import { Locate, Image as ImageIcon, Video, Trash2, X, Cpu, Terminal, ShieldAlert } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'forest' | 'ocean';
  lang: SupportedLanguages;
}

interface MediaFile {
  type: 'image' | 'video';
  data: string;
  name: string;
}

export default function ReportModal({ isOpen, onClose, mode, lang }: ReportModalProps) {
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [reportLang, setReportLang] = useState(lang);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [error, setError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default timestamp and language on mount or open
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // Format to YYYY-MM-DDTHH:MM
      const offsetMs = now.getTimezoneOffset() * 60 * 1000;
      const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
      setTimestamp(localISOTime);
      setReportLang(lang);
      
      // Default event type
      setEventType(mode === 'forest' ? 'Tree' : 'tide');
      
      // Clear previous inputs
      setDescription('');
      setLat('');
      setLng('');
      setMediaFiles([]);
      setError('');
    }
  }, [isOpen, mode, lang]);

  if (!isOpen) return null;

  const t = (key: any) => getTranslation(key, lang);

  // Categories
  const forestOptions = [
    { value: 'Tree', label: 'Unusual Cutting of Trees' },
    { value: 'Fire', label: 'Fire in Forest' },
    { value: 'Hunting', label: 'Hunting' },
    { value: 'Poaching', label: 'Poaching' },
    { value: 'Logging', label: 'Illegal Logging' },
    { value: 'Wind', label: 'Tree Blow Down' }
  ];

  const oceanOptions = [
    { value: 'tide', label: 'Unusual Tide' },
    { value: 'flood', label: 'Flooding' },
    { value: 'damage', label: 'Coastal Damage' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'swell', label: 'Thundering Swell' },
    { value: 'waves', label: 'High Waves' }
  ];

  const categories = mode === 'forest' ? forestOptions : oceanOptions;

  // Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError(t('geolocationUnsupported'));
      return;
    }

    setIsLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (err) => {
        setError(`${t('geolocationDenied')} ${err.message}`);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Convert File to Base64
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle Media Upload
  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setError('');
    const files = Array.from(e.target.files);
    const validMedia: MediaFile[] = [...mediaFiles];

    for (const file of files) {
      if (file.size > 3.5 * 1024 * 1024) {
        setError(`File ${file.name} exceeds size limit of 3.5MB.`);
        continue;
      }

      try {
        const data = await fileToDataURL(file);
        const type = file.type.startsWith('image') ? ('image' as const) : ('video' as const);
        validMedia.push({ type, data, name: file.name });
      } catch (err) {
        console.error('File read error', err);
      }
    }

    setMediaFiles(validMedia.slice(0, 4)); // Cap at 4 files
  };

  const removeMedia = (idx: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== idx));
  };

  // Handle Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setError(t('provideLocation'));
      return;
    }

    if (!description.trim()) {
      setError('Please provide a valid description.');
      return;
    }

    const reportData = {
      id: 'rep-' + Date.now(),
      lat: parsedLat,
      lng: parsedLng,
      type: eventType,
      desc: description.trim(),
      src: 'citizen' as const,
      verified: false,
      ts: timestamp ? new Date(timestamp).getTime() : Date.now(),
      lang: reportLang,
      media: mediaFiles
    };

    storeActions.addReport(reportData);
    onClose();
  };

  // HUD corner bracket components
  const cornerBrackets = (
    <>
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400/50"></span>
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400/50"></span>
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400/50"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400/50"></span>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl glass-panel border border-cyan-500/25 bg-[#080d19]/95 text-slate-100 flex flex-col p-6 shadow-2xl relative select-none">
        
        {/* Radar scanning decorative layout */}
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
                {t('newReport')}
              </h2>
              <span className="text-[9px] text-slate-500 font-mono tracking-wider">NEW REPORT ENTRY // SECURE TELEMETRY LINK</span>
            </div>
          </div>

          <div className="px-3 py-1 rounded border border-cyan-500/25 bg-cyan-950/20 text-cyan-500 text-[10px] font-mono font-bold tracking-wider">
            ● COMMS LOCK: ACTIVE
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-1 flex-grow overflow-y-auto pr-1 max-h-[70vh]">
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 rounded-lg text-xs font-mono flex items-center gap-2">
              <ShieldAlert size={14} className="shrink-0 animate-bounce" />
              <span>LOG FAILURE: {error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column - Diagnostic Briefings */}
            <div className="space-y-4">
              
              {/* Event Type */}
              <div className="relative group">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  EVENT TYPE CLASSIFICATION
                </label>
                <div className="relative">
                  {cornerBrackets}
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-slate-200 outline-none transition-all text-xs font-mono cursor-pointer"
                    required
                  >
                    {categories.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description Briefing */}
              <div className="relative group">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  OPERATIONAL DESCRIPTION BRIEFING
                </label>
                <div className="relative">
                  {cornerBrackets}
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder={t('descPlaceholder')}
                    className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-slate-200 outline-none transition-all resize-none placeholder-slate-600 text-xs font-mono leading-relaxed"
                    required
                  />
                </div>
              </div>

              {/* Date & Lang */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative group">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    TIMESTAMP INGESTION
                  </label>
                  <div className="relative">
                    {cornerBrackets}
                    <input
                      type="datetime-local"
                      value={timestamp}
                      onChange={(e) => setTimestamp(e.target.value)}
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg p-2 text-slate-200 outline-none transition-all text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                    COMMUNICATION LANGUAGE
                  </label>
                  <div className="relative">
                    {cornerBrackets}
                    <select
                      value={reportLang}
                      onChange={(e) => setReportLang(e.target.value as SupportedLanguages)}
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-slate-200 outline-none transition-all text-xs font-mono cursor-pointer"
                    >
                      <option value="en" className="bg-slate-950 text-slate-200">English</option>
                      <option value="hi" className="bg-slate-950 text-slate-200">हिन्दी</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Coordinates & Ingested Media */}
            <div className="space-y-4">
              
              {/* Coordinates Target */}
              <div className="relative group">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  GEO-TARGET COORDINATES
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    {cornerBrackets}
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      placeholder="Latitude"
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-cyan-400 outline-none transition-all text-xs font-mono"
                      required
                    />
                  </div>
                  <div className="relative flex-grow">
                    {cornerBrackets}
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      placeholder="Longitude"
                      className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-lg p-2.5 text-cyan-400 outline-none transition-all text-xs font-mono"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="p-2.5 bg-[#0a1226]/80 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 rounded-lg text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center aspect-square shadow-lg shadow-cyan-500/5 cursor-pointer shrink-0"
                    title="Acquire Telemetry Coordinates"
                  >
                    <Locate size={15} className={isLocating ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Media Ingestion Dropzone */}
              <div className="relative group">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  TACTICAL MEDIA INGESTION
                </label>
                <div className="relative">
                  {cornerBrackets}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-800 hover:border-cyan-500/25 bg-slate-950/50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group select-none"
                  >
                    <div className="h-8 w-8 rounded-full bg-cyan-500/5 group-hover:bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/10 group-hover:border-cyan-500/20 transition-all">
                      <ImageIcon size={15} />
                    </div>
                    <div className="text-[9px] text-slate-400 font-bold font-mono tracking-wide">Click to select files (Max 4, limit 3.5MB each)</div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleMediaChange}
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Micro Widescreen Previews */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-850 bg-[#090e18] flex items-center justify-center group">
                        {cornerBrackets}
                        {m.type === 'image' ? (
                          <img src={m.data} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                            <Video size={16} className="text-slate-400 animate-pulse" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute inset-0 bg-red-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-all rounded-lg cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consent compliance */}
              <div className="relative group">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">
                  LEGAL COMPLIANCE DECLARATION
                </label>
                <div className="relative p-3 bg-amber-950/10 border border-amber-500/20 rounded-lg text-[9px] leading-relaxed text-amber-400/90 font-mono">
                  {cornerBrackets}
                  By submitting, you confirm media is yours or permitted and does not include personal data without consent.
                </div>
              </div>

            </div>

          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-100 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              {t('cancel').toUpperCase()}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5"
            >
              <Terminal size={12} />
              {t('submit').toUpperCase()} // SECURE SYNC
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
