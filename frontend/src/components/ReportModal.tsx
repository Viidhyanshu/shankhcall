'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { storeActions } from '@/lib/store';
import { Locate, Image as ImageIcon, Video, Trash2, X } from 'lucide-react';

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

  // Helper to compress uploaded images to stay well within Firestore's 1MB document size limit
  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  // Handle Media Upload
  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setError('');
    const files = Array.from(e.target.files);
    const validMedia: MediaFile[] = [...mediaFiles];

    for (const file of files) {
      // Allow raw selection up to 10MB since we compress it anyway
      if (file.size > 10 * 1024 * 1024) {
        setError(`File ${file.name} exceeds limit of 10MB.`);
        continue;
      }

      try {
        let data = await fileToDataURL(file);
        const type = file.type.startsWith('image') ? ('image' as const) : ('video' as const);
        
        if (type === 'image') {
          // Compress the base64 string instantly to ~50-100KB!
          data = await compressImage(data);
        }
        
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

  const isForest = mode === 'forest';
  
  const theme = {
    border: isForest ? 'border-emerald-500/20' : 'border-cyan-500/20',
    shadow: isForest 
      ? 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)]' 
      : 'shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)]',
    radialBg: isForest 
      ? 'bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.05),transparent)]' 
      : 'bg-[radial-gradient(circle_at_top_right,rgba(0,194,255,0.05),transparent)]',
    dotBg: isForest ? 'bg-emerald-500' : 'bg-cyan-500',
    dotShadow: isForest ? 'shadow-[0_0_10px_#10b981]' : 'shadow-[0_0_10px_#06b6d4]',
    inputFocus: isForest 
      ? 'hover:border-emerald-500/30 focus:border-emerald-500 focus:ring-emerald-500/10' 
      : 'hover:border-cyan-500/30 focus:border-cyan-500 focus:ring-cyan-500/10',
    locateBtn: isForest
      ? 'hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-450 hover:text-emerald-300'
      : 'hover:bg-cyan-500/10 hover:border-cyan-500/30 text-cyan-450 hover:text-cyan-300',
    uploadBorder: isForest ? 'hover:border-emerald-500/20' : 'hover:border-cyan-500/20',
    uploadIcon: isForest ? 'group-hover:text-emerald-400 group-hover:border-emerald-500/20' : 'group-hover:text-cyan-400 group-hover:border-cyan-500/20',
    consentCard: isForest ? 'bg-emerald-955/5 border-l-2 border-emerald-500/30' : 'bg-cyan-955/5 border-l-2 border-cyan-500/30',
    submitBtn: isForest
      ? 'from-emerald-500 to-teal-650 hover:from-emerald-450 hover:to-teal-550 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]'
      : 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-2xl max-h-[90vh] rounded-2xl glass-panel border ${theme.border} bg-[#080d19]/95 text-slate-100 flex flex-col p-6 ${theme.shadow} relative`}>
        
        {/* Decorative corner light overlay */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${theme.radialBg} pointer-events-none`}></div>

        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800/60 mb-6 select-none">
          <div className="flex items-center gap-2.5">
            <div className={`h-2 w-2 rounded-full ${theme.dotBg} ${theme.dotShadow} animate-pulse`}></div>
            <h2 className="text-sm font-extrabold tracking-[0.08em] text-slate-200 uppercase">
              {t('newReport')}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-slate-800/80 text-slate-400 hover:text-slate-100 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-1 flex-grow overflow-y-auto pr-1">
          {error && (
            <div className="p-3 bg-red-950/20 border border-red-500/25 text-red-400 rounded-xl text-xs font-mono">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-4">
              
              {/* Event Type */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                  {t('eventType')}
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={`w-full bg-slate-950/40 border border-slate-800/80 ${theme.inputFocus} rounded-xl p-3 text-slate-200 outline-none transition-all text-xs cursor-pointer shadow-inner`}
                  required
                >
                  {categories.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                  {t('description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('descPlaceholder')}
                  className={`w-full bg-slate-950/40 border border-slate-800/80 ${theme.inputFocus} rounded-xl p-3 text-slate-200 outline-none transition-all resize-none placeholder-slate-600 text-xs leading-relaxed`}
                  required
                />
              </div>

              {/* When & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                    {t('when')}
                  </label>
                  <input
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className={`w-full bg-slate-950/40 border border-slate-800/80 ${theme.inputFocus} rounded-xl p-2.5 text-slate-200 outline-none transition-all text-xs`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                    {t('language')}
                  </label>
                  <select
                    value={reportLang}
                    onChange={(e) => setReportLang(e.target.value as SupportedLanguages)}
                    className={`w-full bg-slate-950/40 border border-slate-800/80 ${theme.inputFocus} rounded-xl p-3 text-slate-200 outline-none transition-all text-xs cursor-pointer`}
                  >
                    <option value="en" className="bg-slate-950 text-slate-200">English</option>
                    <option value="hi" className="bg-slate-950 text-slate-200">हिन्दी</option>
                    <option value="bn" className="bg-slate-950 text-slate-200">বাংলা</option>
                    <option value="mr" className="bg-slate-950 text-slate-200">मराठी</option>
                    <option value="te" className="bg-slate-950 text-slate-200">తెలుగు</option>
                    <option value="ta" className="bg-slate-950 text-slate-200">தமிழ்</option>
                    <option value="kn" className="bg-slate-950 text-slate-200">ಕನ್ನಡ</option>
                    <option value="as" className="bg-slate-950 text-slate-200">অসমীয়া</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="space-y-4">
              
              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                  {t('locationLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Latitude"
                    className={`w-full bg-slate-950/40 border border-slate-800/80 ${theme.inputFocus} rounded-xl p-3 text-slate-200 outline-none transition-all text-xs`}
                    required
                  />
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Longitude"
                    className={`w-full bg-slate-950/40 border border-slate-800/80 ${theme.inputFocus} rounded-xl p-3 text-slate-200 outline-none transition-all text-xs`}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className={`p-3 bg-slate-950/80 border border-slate-800/80 ${theme.locateBtn} rounded-xl disabled:opacity-50 transition-all flex items-center justify-center aspect-square cursor-pointer shrink-0`}
                    title="Get Current Location"
                  >
                    <Locate size={15} className={isLocating ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Media Upload */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                  {t('media')}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border border-dashed border-slate-800 ${theme.uploadBorder} bg-slate-950/25 hover:bg-slate-950/40 rounded-xl p-4.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 group select-none animate-fade-in`}
                >
                  <div className={`h-8.5 w-8.5 rounded-full bg-slate-900/60 border border-slate-800/80 flex items-center justify-center text-slate-400 ${theme.uploadIcon} group-hover:scale-105 transition-all`}>
                    <ImageIcon size={15} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium tracking-wide">Click to select files (Max 4, limit 3.5MB each)</div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleMediaChange}
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                  />
                </div>

                {/* Previews */}
                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3 animate-fade-in">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-800/80 bg-[#090e18] flex items-center justify-center group shadow-md">
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

              {/* Consent Card */}
              <div>
                <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-2 select-none">
                  {t('consent')}
                </label>
                <div className={`p-3 rounded-r-xl rounded-l-md text-[11px] leading-relaxed text-slate-400 font-sans shadow-inner ${theme.consentCard}`}>
                  By submitting, you confirm media is yours or permitted and does not include personal data without consent.
                </div>
              </div>

            </div>

          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800/60 mt-6 select-none">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              {t('cancel').toUpperCase()}
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl bg-gradient-to-r ${theme.submitBtn} text-white text-xs font-bold transition-all cursor-pointer`}
            >
              {t('submit').toUpperCase()}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
