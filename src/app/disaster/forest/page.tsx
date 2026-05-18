'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { useDisasterStore, storeActions, HazardReport } from '@/lib/store';
import { classifyText, scoreSentiment } from '@/lib/nlp';
import { 
  Activity, Plus, Globe, User, Search, 
  RefreshCw, Wifi, WifiOff, Filter, AlertCircle, ArrowLeft 
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

// Dynamic Import LeafletMap to avoid Next.js Hydration Compilation errors
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0d1222]/80 flex flex-col items-center justify-center text-sky-400 gap-3 border border-sky-500/10 rounded-xl">
      <RefreshCw className="animate-spin h-8 w-8" />
      <span className="text-xs uppercase tracking-widest font-mono">Compiling Client Map...</span>
    </div>
  )
});

// Lazy Modals
const ReportModal = dynamic(() => import('@/components/ReportModal'), { ssr: false });
const MediaViewerModal = dynamic(() => import('@/components/MediaViewerModal'), { ssr: false });

const cityCoords: Record<string, [number, number]> = {
  jimcorbett: [29.5300, 78.7747],
  kaziranga: [26.5775, 93.1711],
  westernghats: [12.2958, 76.6394],
  gir: [21.1240, 70.8242],
  shimla: [31.1048, 77.1734],
  sunderbans: [21.9497, 89.1833]
};

export default function ForestDashboard() {
  const router = useRouter();
  const { reports } = useDisasterStore();

  // Local UI States
  const [lang, setLang] = useState<SupportedLanguages>('en');
  const [role, setRole] = useState<'citizen' | 'official' | 'analyst'>('citizen');
  const [isOnline, setIsOnline] = useState(true);

  // Filters State
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.9129, 79.74]);
  const [mapZoom, setMapZoom] = useState(5);

  // Applied Filters State
  const [appliedType, setAppliedType] = useState('all');
  const [appliedSource, setAppliedSource] = useState('all');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');

  // Modals Trigger State
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);



  const t = (key: any) => getTranslation(key, lang);

  // Check online status in browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      storeActions.syncPending();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync listener
    const handleSyncedEvent = () => {
      alert(t('successSync'));
    };
    window.addEventListener('store-offline-synced', handleSyncedEvent);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('store-offline-synced', handleSyncedEvent);
    };
  }, [lang]);

  // Official Secret Verification: Press "V" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'v' && role === 'official') {
        storeActions.verifyLatest();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [role]);

  // Handle Search Nominatim Panning
  const handleSearchExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryClean = searchQuery.toLowerCase().replace(/\s+/g, '');
    
    // Look up cityCoords
    const matchedCity = Object.keys(cityCoords).find(city => queryClean.includes(city));
    if (matchedCity) {
      setMapCenter(cityCoords[matchedCity]);
      setMapZoom(11);
    }
  };

  // Apply filters trigger
  const handleApplyFilters = () => {
    setAppliedType(filterType);
    setAppliedSource(filterSource);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  // Reset filters trigger
  const handleResetFilters = () => {
    setFilterType('all');
    setFilterSource('all');
    setFromDate('');
    setToDate('');
    setAppliedType('all');
    setAppliedSource('all');
    setAppliedFrom('');
    setAppliedTo('');
    setMapCenter([15.9129, 79.74]);
    setMapZoom(5);
  };

  // Filtering reports logic
  const filteredReports = reports.filter(r => {
    // Mode is Forest, so only load forest related items
    const isForestItem = ['Tree', 'Fire', 'Hunting', 'Poaching', 'Logging', 'Wind', 'Other'].includes(r.type);
    if (!isForestItem) return false;

    // Type filter
    if (appliedType !== 'all' && r.type !== appliedType) return false;

    // Source filter
    if (appliedSource !== 'all') {
      if (appliedSource === 'verified' && !r.verified) return false;
      if (appliedSource !== 'verified' && r.src !== appliedSource) return false;
    }

    // Time ranges
    const ts = r.ts;
    if (appliedFrom) {
      const fromVal = new Date(appliedFrom).getTime();
      if (ts < fromVal) return false;
    }
    if (appliedTo) {
      const toVal = new Date(appliedTo).getTime() + 86400000; // end of day
      if (ts > toVal) return false;
    }

    return true;
  });

  // Sorted reports for Unified Feed list
  const sortedReports = [...filteredReports].sort((a, b) => b.ts - a.ts);



  const handleOpenMedia = (report: HazardReport) => {
    setSelectedReport(report);
    setIsMediaOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">
      
      {/* Header element */}
      <header className="px-6 py-4 bg-slate-950/70 backdrop-blur-md border-b border-slate-900 flex flex-col md:flex-row items-center gap-4 z-20 shrink-0">
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => router.push('/select')}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/15 border border-emerald-400/20">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider font-sans uppercase glow-text">शंखcall</h1>
            <p className="text-[10px] text-slate-500 font-light tracking-wide uppercase">{t('tagline')}</p>
          </div>
        </div>

        <div className="md:ml-auto flex flex-wrap items-center gap-3 shrink-0">
          
          {/* Back button */}
          <button
            onClick={() => router.push('/select')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            Selector
          </button>

          {/* Role selector Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <User size={14} className="text-emerald-400" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-transparent border-none outline-none text-slate-200 cursor-pointer font-medium"
            >
              <option value="citizen">{t('roleCitizen')}</option>
              <option value="official">{t('roleOfficial')}</option>
              <option value="analyst">{t('roleAnalyst')}</option>
            </select>
          </div>

          {/* Language selector Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <Globe size={14} className="text-emerald-400" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguages)}
              className="bg-transparent border-none outline-none text-slate-200 cursor-pointer font-medium"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Add report button */}
          {(role === 'citizen' || role === 'official') && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-450 hover:to-teal-500 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-lg shadow-emerald-500/15 cursor-pointer glow-btn"
            >
              <Plus size={14} />
              {t('report')}
            </button>
          )}

        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden relative z-10 w-full h-[calc(100vh-76px)]">
        
        {/* LEFT SIDEBAR: FILTERS */}
        <aside className="w-full lg:w-3/12 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto lg:h-full border-r border-slate-950 bg-slate-950/20">
          
          {/* Filters Card */}
          <div className="glass-panel p-4 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2 mb-1">
              <Filter size={14} />
              {t('filters')}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('eventType')}</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none transition-all cursor-pointer"
                >
                  <option value="all">{t('all')}</option>
                  <option value="Tree">Unusual Cutting of Trees</option>
                  <option value="Fire">Fire in Forest</option>
                  <option value="Hunting">Hunting</option>
                  <option value="Poaching">Poaching</option>
                  <option value="Logging">Illegal Logging</option>
                  <option value="Wind">Tree Blow Down</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('source')}</label>
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none transition-all cursor-pointer"
                >
                  <option value="all">{t('all')}</option>
                  <option value="citizen">Citizen</option>
                  <option value="social">Social</option>
                  <option value="verified">Verified</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('from')}</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('to')}</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none transition-all"
                  />
                </div>
              </div>

              <form onSubmit={handleSearchExecute} className="relative pt-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('location')}</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-slate-800 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-300 outline-none transition-all placeholder-slate-700"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-350 cursor-pointer"
                  >
                    <Search size={14} />
                  </button>
                </div>
              </form>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleApplyFilters}
                className="flex-grow py-2 rounded-lg bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
              >
                {t('apply')}
              </button>
              <button
                onClick={handleResetFilters}
                className="flex-grow py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer"
              >
                {t('reset')}
              </button>
            </div>
          </div>

          {/* Hotspots Card */}
          <div className="glass-panel p-4 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2 mb-1">
              <Globe size={14} />
              {t('hotspots')}
            </h3>
            <div className="flex flex-col gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50"></span>
                <span>{t('legendDensity')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
                <span>{t('legendSpikes')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400 shadow-sm shadow-red-400/50"></span>
                <span>{t('legendVerified')}</span>
              </div>
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500 pt-2 border-t border-slate-900">
              {t('hotspotsNote')}
            </p>
          </div>

          {/* About Card */}
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-2 mb-1">
              {t('about')}
            </h3>
            <p className="text-[10px] leading-relaxed text-slate-400">
              {t('aboutText')}
            </p>
            <div className="text-[9px] font-bold text-slate-600 pt-1">
              Built with ♡ Team CodeXPreadtors (Wisdom Weave)
            </div>
          </div>

        </aside>

        {/* MIDDLE: INTERACTIVE MAP */}
        <main className="flex-grow p-4 min-h-[300px] h-full lg:h-full relative select-none">
          <LeafletMap 
            mode="forest" 
            reports={filteredReports} 
            center={mapCenter}
            zoom={mapZoom}
            onReportClick={handleOpenMedia}
          />
        </main>

        {/* RIGHT SIDEBAR: UNIFIED FEED & NLP MONITOR */}
        <section className="w-full lg:w-4/12 p-4 shrink-0 flex flex-col gap-4 overflow-y-auto lg:h-full border-l border-slate-950 bg-slate-950/20">
          
          {/* Unified Feed Card */}
          <div className="glass-panel p-4 rounded-xl flex-grow flex flex-col min-h-[280px]">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-2 mb-3 shrink-0">
              {t('unifiedFeed')}
            </h3>

            {/* List */}
            <div className="flex-grow overflow-y-auto max-h-[320px] lg:max-h-none space-y-3 pr-1">
              {sortedReports.length > 0 ? (
                sortedReports.map(r => {
                  const verifiedCls = r.verified ? 'ok' : 'warn';
                  const sentimentCls = r.sentiment > 0.2 ? 'ok' : r.sentiment < -0.2 ? 'danger' : 'warn';

                  return (
                    <div 
                      key={r.id} 
                      onClick={() => handleOpenMedia(r)}
                      className="p-3 bg-slate-950/40 hover:bg-slate-950/70 border border-slate-900/60 hover:border-slate-800 rounded-xl cursor-pointer transition-all flex flex-col gap-2 group"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <strong className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors uppercase">
                          {r.type}
                        </strong>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(r.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                        {r.desc}
                      </p>

                      {/* Display media tag indicator */}
                      {Array.isArray(r.media) && r.media.length > 0 && (
                        <div className="flex gap-1.5 mt-0.5">
                          {r.media.slice(0, 3).map((m, mIdx) => (
                            <span key={mIdx} className="text-[9px] font-semibold text-sky-400/80 bg-sky-500/5 border border-sky-500/10 px-1.5 py-0.5 rounded uppercase">
                              {m.type}
                            </span>
                          ))}
                          <span className="text-[9px] text-slate-500 flex items-center font-medium pl-1">
                            {r.media.length} Attachment(s)
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 mt-1 border-t border-slate-900/50 pt-2 text-[10px] text-slate-500">
                        <span className="capitalize font-semibold">{r.src}</span>
                        <span>•</span>
                        <span className={`chip ${verifiedCls}`}>{r.verified ? 'verified' : 'unverified'}</span>
                        <span className={`chip ${sentimentCls}`}>sentiment {r.sentiment.toFixed(1)}</span>
                        
                        {/* Language Tag */}
                        <span className="ml-auto font-mono text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-850 uppercase text-slate-400 font-semibold">{r.lang}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 flex flex-col justify-center items-center text-slate-500 gap-2 shrink-0">
                  <AlertCircle size={24} className="text-slate-600" />
                  <div className="text-xs">{t('noItems')}</div>
                </div>
              )}
            </div>
          </div>



        </section>

      </div>

      {/* REPORT SUBMISSION FORM MODAL */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        mode="forest"
        lang={lang}
      />

      {/* MEDIA AND FULL LOG DETAILS VIEWER MODAL */}
      <MediaViewerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        report={selectedReport}
        lang={lang}
      />

    </div>
  );
}
