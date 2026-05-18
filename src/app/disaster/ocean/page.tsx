'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { useDisasterStore, storeActions, HazardReport } from '@/lib/store';
import { classifyText, scoreSentiment } from '@/lib/nlp';
import { 
  Activity, Plus, Globe, User, Search, 
  RefreshCw, Wifi, WifiOff, Filter, AlertCircle, ArrowLeft, BarChart3,
  Menu, ChevronDown, Waves
} from 'lucide-react';
import Chart from 'chart.js/auto';
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
  chennai: [13.0827, 80.2707],
  visakhapatnam: [17.6868, 83.2185],
  mumbai: [19.0760, 72.8777],
  goa: [15.2993, 74.1240],
  kolkata: [22.5726, 88.3639],
  puri: [19.7983, 85.8249]
};

export default function OceanDashboard() {
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



  // Canvas refs for Charts
  const trendCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sentimentCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartInstance = useRef<Chart | null>(null);
  const sentimentChartInstance = useRef<Chart | null>(null);

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

  // Handle Search nominatim coordinates
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
    // Mode is Ocean, so check ocean related items
    const isOceanItem = ['tide', 'flood', 'damage', 'tsunami', 'swell', 'waves', 'Other'].includes(r.type);
    if (!isOceanItem) return false;

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

  // Compile and update analytical Charts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ----------------------------------------------------
    // CHART 1: TREND LINE CHART (last 12 hours)
    // ----------------------------------------------------
    if (trendCanvasRef.current) {
      const ctx = trendCanvasRef.current.getContext('2d');
      if (ctx) {
        // Destroy old trend chart if exists
        if (trendChartInstance.current) {
          trendChartInstance.current.destroy();
        }

        // Calculate hours buckets
        const now = Date.now();
        const counts = Array(12).fill(0);
        const labels = Array(12).fill('');

        for (let i = 11; i >= 0; i--) {
          const hourMs = 60 * 60 * 1000;
          const bucketStart = now - (i + 1) * hourMs;
          const bucketEnd = now - i * hourMs;

          // Count reports in this bucket
          filteredReports.forEach(r => {
            if (r.ts >= bucketStart && r.ts < bucketEnd) {
              counts[11 - i]++;
            }
          });

          labels[11 - i] = i === 0 ? 'Now' : `${i}h ago`;
        }

        // Create glowing neon blue gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        gradient.addColorStop(0, 'rgba(0, 194, 255, 0.45)');
        gradient.addColorStop(1, 'rgba(0, 194, 255, 0.00)');

        trendChartInstance.current = new Chart(trendCanvasRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Reports count',
              data: counts,
              borderColor: '#00c2ff',
              borderWidth: 2,
              pointBackgroundColor: '#00c2ff',
              pointHoverBackgroundColor: '#ffffff',
              pointRadius: 3.5,
              tension: 0.35,
              fill: true,
              backgroundColor: gradient,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: 'rgba(0, 194, 255, 0.3)',
                borderWidth: 1,
                titleColor: '#00c2ff',
                bodyColor: '#f8fafc',
                bodyFont: { family: 'inherit' },
                titleFont: { family: 'inherit', weight: 'bold' }
              }
            },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.03)' },
                ticks: { color: '#64748b', font: { size: 9 } }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.03)' },
                ticks: { color: '#64748b', font: { size: 9 }, stepSize: 1 },
                beginAtZero: true
              }
            }
          }
        });
      }
    }

    // ----------------------------------------------------
    // CHART 2: SENTIMENT DOUGHNUT CHART
    // ----------------------------------------------------
    if (sentimentCanvasRef.current) {
      if (sentimentChartInstance.current) {
        sentimentChartInstance.current.destroy();
      }

      let positive = 0;
      let neutral = 0;
      let negative = 0;

      filteredReports.forEach(r => {
        const s = r.sentiment || 0;
        if (s > 0.2) positive++;
        else if (s < -0.2) negative++;
        else neutral++;
      });

      // Avoid rendering empty blank chart
      const hasData = positive > 0 || neutral > 0 || negative > 0;
      const dataValues = hasData ? [positive, neutral, negative] : [1, 1, 1];
      const dataColors = hasData 
        ? ['rgba(16, 185, 129, 0.85)', 'rgba(245, 158, 11, 0.85)', 'rgba(239, 68, 68, 0.85)']
        : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.03)'];

      sentimentChartInstance.current = new Chart(sentimentCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: dataValues,
            backgroundColor: dataColors,
            borderColor: '#0f172a',
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              titleColor: '#e2e8f0',
              bodyColor: '#f8fafc',
              bodyFont: { family: 'inherit' }
            }
          }
        }
      });
    }

    // Cleanup on update/unmount
    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
        trendChartInstance.current = null;
      }
      if (sentimentChartInstance.current) {
        sentimentChartInstance.current.destroy();
        sentimentChartInstance.current = null;
      }
    };
  }, [filteredReports]);

  return (
    <div className="relative min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans overflow-hidden">
      
      {/* Header element */}
      <header className="px-6 py-3 bg-[#0d111a]/85 backdrop-blur-md border-b border-slate-900/60 flex items-center justify-between gap-4 z-20 shrink-0 select-none">
        
        {/* Left Section: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/select')}>
            <div>
              <h1 className="text-lg font-bold tracking-wider font-sans uppercase text-slate-100 flex items-center gap-1.5">
                <span>शंखCALL</span>
              </h1>
              <p className="text-[9px] text-slate-500 font-light tracking-wide uppercase">Optimized for Disaster Monitoring & Social Intelligence</p>
            </div>
          </div>
        </div>

        {/* Right Section: Selectors and Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Back to Selector button */}
          <button
            onClick={() => router.push('/select')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111625] hover:bg-[#151c2f] border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            <ArrowLeft size={13} />
            Selector
          </button>

          {/* Role selector Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111625] border border-slate-800 text-xs font-semibold text-slate-350">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="bg-transparent border-none outline-none text-slate-200 cursor-pointer font-semibold pr-1"
            >
              <option value="citizen">{t('roleCitizen')}</option>
              <option value="official">{t('roleOfficial')}</option>
              <option value="analyst">{t('roleAnalyst')}</option>
            </select>
            <ChevronDown size={11} className="text-slate-500" />
          </div>

          {/* Language selector Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111625] border border-slate-800 text-xs font-semibold text-slate-350">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguages)}
              className="bg-transparent border-none outline-none text-slate-200 cursor-pointer font-semibold pr-1"
            >
              <option value="en">Language</option>
              <option value="hi">Language (HI)</option>
            </select>
            <ChevronDown size={11} className="text-slate-500" />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

        </div>
      </header>

      {/* Main Workspace: Fullscreen Map with Floating Overlays */}
      <div className="flex-grow w-full h-[calc(100vh-62px)] relative overflow-hidden">
        
        {/* Fullscreen Map Background */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <LeafletMap 
            mode="ocean" 
            reports={filteredReports} 
            center={mapCenter}
            zoom={mapZoom}
            onReportClick={handleOpenMedia}
          />
        </div>

        {/* INTERACTIVE FLOATING OVERLAYS CONTAINER (Pointer events none so map is draggable underneath) */}
        <div className="absolute inset-0 z-10 pointer-events-none p-4 flex flex-col justify-between">
          
          {/* Top Floating Row: Filters Card (Left) and Unified Feed Card (Right) */}
          <div className="flex justify-between items-start w-full h-full max-h-[calc(100vh-250px)]">
            
            {/* LEFT FLOATING COLUMN: FILTERS & HOTSPOTS & ADD REPORT */}
            <div className="w-[310px] flex flex-col gap-3.5 pointer-events-auto max-h-full overflow-y-auto pr-1">
              
              {/* Filters Card */}
              <div className="glass-panel p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2 mb-1.5">
                  <Filter size={13} />
                  FILTERS & HOTSPOTS
                  <ChevronDown size={13} className="ml-auto text-slate-500" />
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">EVENT TYPE</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-[#111625] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="all">{t('all')}</option>
                      <option value="tide">Unusual Tide</option>
                      <option value="flood">Flooding</option>
                      <option value="damage">Coastal Damage</option>
                      <option value="tsunami">Tsunami</option>
                      <option value="swell">Thundering Swell</option>
                      <option value="waves">High Waves</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">SOURCE</label>
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="w-full bg-[#111625] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="all">{t('all')}</option>
                      <option value="citizen">Citizen</option>
                      <option value="social">Social</option>
                      <option value="verified">Verified</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">FROM</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="w-full bg-[#111625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">TO</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="w-full bg-[#111625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">LOCATION</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Chennai, Asean, Visakhapatnam..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111625] border border-slate-800 focus:border-slate-700 rounded-lg pl-3 pr-9 py-1.5 text-xs text-slate-200 outline-none transition-all placeholder-slate-700 font-semibold"
                      />
                      <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-grow py-2 rounded-lg bg-sky-600/95 hover:bg-sky-500 border border-sky-600 text-white text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    APPLY
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="flex-grow py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                  >
                    RESET
                  </button>
                </div>
              </div>

              {/* Large ADD REPORT Floating Button */}
              {(role === 'citizen' || role === 'official') && (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-blue-500 hover:from-sky-450 hover:to-blue-600 text-white font-bold tracking-widest text-sm shadow-xl shadow-sky-500/25 transition-all cursor-pointer border border-sky-400/20 uppercase"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  ADD REPORT
                </button>
              )}

            </div>

            {/* RIGHT FLOATING COLUMN: TALL UNIFIED FEED */}
            <div className="w-[350px] h-full pointer-events-auto flex flex-col max-h-full">
              <div className="glass-panel p-4 rounded-2xl flex flex-col h-full overflow-hidden">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900/60 pb-2.5 mb-3 shrink-0">
                  UNIFIED FEED
                </h3>

                {/* Scrollable list */}
                <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                  {sortedReports.length > 0 ? (
                    sortedReports.map(r => {
                      const verifiedCls = r.verified ? 'ok' : 'warn';
                      
                      // Sentiment Styling
                      const sentimentCls = r.sentiment > 0.2 ? 'ok' : r.sentiment < -0.2 ? 'danger' : 'warn';

                      // Icon determination
                      const getDisasterIcon = (type: string) => {
                        const lower = type.toLowerCase();
                        if (lower.includes('tsunami')) {
                          return (
                            <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                              <Waves size={18} />
                            </div>
                          );
                        }
                        if (lower.includes('waves') || lower.includes('swell')) {
                          return (
                            <div className="h-9 w-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                              <Waves size={18} />
                            </div>
                          );
                        }
                        return (
                          <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <Waves size={18} />
                          </div>
                        );
                      };

                      return (
                        <div 
                          key={r.id} 
                          onClick={() => handleOpenMedia(r)}
                          className="p-3 bg-slate-950/45 hover:bg-slate-950/70 border border-slate-900/50 hover:border-slate-800 rounded-xl cursor-pointer transition-all flex flex-col gap-2 group"
                        >
                          <div className="flex gap-3">
                            {getDisasterIcon(r.type)}
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start gap-1">
                                <strong className="text-xs font-bold text-slate-100 group-hover:text-sky-400 transition-colors uppercase tracking-wide truncate">
                                  {r.type}
                                </strong>
                                <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                  {new Date(r.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                                Lt: {r.lat?.toFixed(3)}, {r.lng?.toFixed(3)}
                              </p>

                              <p className="text-[11px] text-slate-450 leading-normal line-clamp-2 mt-1">
                                {r.desc}
                              </p>

                              {/* Media tag indicator */}
                              {Array.isArray(r.media) && r.media.length > 0 && (
                                <div className="flex gap-1.5 mt-1.5">
                                  <span className="text-[8px] font-semibold text-sky-400/80 bg-sky-500/5 border border-sky-500/10 px-1.5 py-0.5 rounded uppercase">
                                    ATTACHMENT
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-1.5 mt-2.5 border-t border-slate-900/40 pt-2 text-[9px] text-slate-500">
                                <span className="capitalize">{r.src}</span>
                                <span>•</span>
                                <span className={`chip ${verifiedCls} scale-85 origin-left`}>
                                  {r.verified ? 'VERIFIED' : 'UNVERIFIED'}
                                </span>
                                
                                {(!r.verified && role === 'official') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      storeActions.verifyReport(r.id);
                                    }}
                                    className="px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/25 text-[8px] font-bold tracking-wider hover:bg-sky-500 hover:text-white cursor-pointer uppercase transition-all ml-1 shrink-0"
                                  >
                                    VERIFY
                                  </button>
                                )}

                                {/* Language Chip */}
                                <span className="ml-auto font-mono text-[8px] bg-slate-900 px-1.5 py-0.2 rounded border border-slate-850 uppercase text-slate-450 font-semibold">
                                  {r.lang}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 flex flex-col justify-center items-center text-slate-600 gap-2 shrink-0">
                      <AlertCircle size={20} className="text-slate-700" />
                      <div className="text-[11px] uppercase tracking-wider">{t('noItems')}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Floating Row: Small Side-by-Side Charts (Center) */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-auto z-10">
            <div className="flex gap-4 select-none">
              
              {/* Chart 1: Trend line */}
              <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1.5 w-[330px] h-[170px]">
                <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900/60 pb-1 shrink-0">
                  <BarChart3 size={11} />
                  TREND: REPORTS PER HOUR
                </h4>
                <div className="flex-grow w-full relative h-[115px]">
                  <canvas ref={trendCanvasRef} />
                </div>
              </div>

              {/* Chart 2: Sentiment analysis doughnut */}
              <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1.5 w-[330px] h-[170px]">
                <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900/60 pb-1 shrink-0">
                  <Activity size={11} />
                  SENTIMENT BREAKDOWN
                </h4>
                <div className="flex-grow w-full relative h-[115px] flex items-center justify-between">
                  <div className="w-[50%] h-full flex items-center justify-center">
                    <canvas ref={sentimentCanvasRef} />
                  </div>
                  <div className="w-[45%] flex flex-col gap-1.5 text-[9px] text-slate-400 font-semibold pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
                      <span>Positive</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#f59e0b]"></span>
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#ef4444]"></span>
                      <span>Negative</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* REPORT SUBMISSION FORM MODAL */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        mode="ocean"
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

