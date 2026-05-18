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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-sky-500/20 bg-slate-900/90 text-slate-100 flex flex-col p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold glow-text font-sans flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {t('newReport')}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-4 flex-grow">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  {t('eventType')}
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-400 rounded-lg p-2.5 text-slate-200 outline-none transition-colors"
                  required
                >
                  {categories.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('descPlaceholder')}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-400 rounded-lg p-2.5 text-slate-200 outline-none transition-colors resize-none placeholder-slate-600 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                    {t('when')}
                  </label>
                  <input
                    type="datetime-local"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-400 rounded-lg p-2.5 text-slate-200 outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                    {t('language')}
                  </label>
                  <select
                    value={reportLang}
                    onChange={(e) => setReportLang(e.target.value as SupportedLanguages)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-400 rounded-lg p-2.5 text-slate-200 outline-none transition-colors text-sm"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  {t('locationLabel')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Lat"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-400 rounded-lg p-2.5 text-slate-200 outline-none transition-colors text-sm"
                    required
                  />
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Lng"
                    className="w-full bg-slate-950 border border-slate-800 hover:border-sky-500/30 focus:border-sky-400 rounded-lg p-2.5 text-slate-200 outline-none transition-colors text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="p-2.5 bg-slate-950 hover:bg-sky-500/10 border border-slate-800 hover:border-sky-500/30 rounded-lg text-sky-400 hover:text-sky-300 disabled:opacity-50 transition-all flex items-center justify-center aspect-square"
                    title="Get Current Location"
                  >
                    <Locate size={18} className={isLocating ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  {t('media')}
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-sky-500/30 bg-slate-950/40 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="h-10 w-10 rounded-full bg-sky-500/5 group-hover:bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/10 group-hover:border-sky-500/20 transition-all">
                    <ImageIcon size={20} />
                  </div>
                  <div className="text-xs text-slate-400 font-medium">Click to select files (Max 4, limit 3.5MB each)</div>
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
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {mediaFiles.map((m, idx) => (
                      <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 group">
                        {m.type === 'image' ? (
                          <img src={m.data} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-slate-950 flex items-center justify-center">
                            <Video size={18} className="text-slate-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          className="absolute inset-0 bg-red-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-all rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
                  {t('consent')}
                </label>
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg text-[11px] leading-relaxed text-slate-400">
                  By submitting, you confirm media is yours or permitted and does not include personal data without consent.
                </div>
              </div>

            </div>

          </div>

          {/* Footer Controls */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-sm transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-450 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-sky-500/20 glow-btn cursor-pointer"
            >
              {t('submit')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
