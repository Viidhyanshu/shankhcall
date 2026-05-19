'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SupportedLanguages, getTranslation } from '@/lib/i18n';
import { useDisasterStore, storeActions, HazardReport } from '@/lib/store';
import { classifyText, scoreSentiment } from '@/lib/nlp';
import { 
  Activity, Plus, Minus, Globe, User, Search, 
  RefreshCw, Filter, AlertCircle, ArrowLeft, BarChart3,
  Menu, ChevronDown, Flame, TreePine
} from 'lucide-react';
import Chart from 'chart.js/auto';
import ThemeToggle from '@/components/ThemeToggle';

// Dynamic Import LeafletMap to avoid Next.js Hydration Compilation errors
const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0d1222]/80 flex flex-col items-center justify-center text-emerald-400 gap-3 border border-emerald-500/10 rounded-xl">
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
  const [role, setRole] = useState<'citizen' | 'official'>('citizen');
  const [isOnline, setIsOnline] = useState(true);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);
  const [isFeedExpanded, setIsFeedExpanded] = useState(true);

  // Filters State
  const [filterType, setFilterType] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState<[number, number]>([15.9129, 79.74]);
  const [mapZoom, setMapZoom] = useState(5);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setIsLight(document.documentElement.classList.contains('light'));

    const observer = new MutationObserver(() => {
      setIsLight(document.documentElement.classList.contains('light'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

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
    // Mode is Forest, so check forest related items
    const isForestItem = ['Tree', 'Fire', 'Hunting', 'Poaching', 'Logging', 'Wind', 'Other'].includes(r.type);
    if (!isForestItem) return false;

    // Type filter
    if (appliedType !== 'all' && r.type !== appliedType) return false;

    // Source filter
    if (appliedSource !== 'all') {
      if (appliedSource === 'verified' && !r.verified) return false;
      if (appliedSource === 'citizen' && r.src !== 'citizen' && r.src !== 'social') return false;
      if (appliedSource !== 'verified' && appliedSource !== 'citizen' && r.src !== appliedSource) return false;
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

  // Real-time sentiment metrics calculation
  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  filteredReports.forEach(r => {
    const s = r.sentiment || 0;
    if (s > 0.2) positiveCount++;
    else if (s < -0.2) negativeCount++;
    else neutralCount++;
  });

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

        // Create glowing neon emerald gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 150);
        if (isLight) {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
        } else {
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0.00)');
        }

        trendChartInstance.current = new Chart(trendCanvasRef.current, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Reports count',
              data: counts,
              borderColor: isLight ? '#059669' : '#10b981',
              borderWidth: 2,
              pointBackgroundColor: isLight ? '#059669' : '#10b981',
              pointHoverBackgroundColor: isLight ? '#0f172a' : '#ffffff',
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
                backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                borderColor: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(16, 185, 129, 0.3)',
                borderWidth: 1,
                titleColor: isLight ? '#059669' : '#10b981',
                bodyColor: isLight ? '#1e293b' : '#f8fafc',
                bodyFont: { family: 'inherit' },
                titleFont: { family: 'inherit', weight: 'bold' }
              }
            },
            scales: {
              x: {
                grid: { color: isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.03)' },
                ticks: { color: isLight ? '#475569' : '#64748b', font: { size: 9 } }
              },
              y: {
                grid: { color: isLight ? 'rgba(15, 23, 42, 0.04)' : 'rgba(255, 255, 255, 0.03)' },
                ticks: { color: isLight ? '#475569' : '#64748b', font: { size: 9 }, stepSize: 1 },
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
        : isLight
          ? ['rgba(15, 23, 42, 0.05)', 'rgba(15, 23, 42, 0.03)', 'rgba(15, 23, 42, 0.02)']
          : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.03)'];

      sentimentChartInstance.current = new Chart(sentimentCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: ['Positive', 'Neutral', 'Negative'],
          datasets: [{
            data: dataValues,
            backgroundColor: dataColors,
            borderColor: isLight ? '#ffffff' : '#0f172a',
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
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.9)',
              borderColor: isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              titleColor: isLight ? '#1e293b' : '#e2e8f0',
              bodyColor: isLight ? '#475569' : '#f8fafc',
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
  }, [filteredReports, isLight]);

  return (
    <div className="forest-theme relative h-screen w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans overflow-hidden">
      
      {/* Header element */}
      <header className="px-4 md:px-6 py-3 bg-transparent flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 z-20 shrink-0 select-none">
        
        <div className="w-full md:w-auto flex items-center justify-between">
          {/* Left Section: Logo */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => router.push('/select')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-650 flex items-center justify-center shadow-lg shadow-emerald-500/15 border border-emerald-400/20 shrink-0">
              <i className="fa-solid fa-cloud-showers-water text-white text-base"></i>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wider font-sans uppercase text-slate-100 flex items-center gap-1.5">
                <span>शंखCALL</span>
              </h1>
               <p className="text-[9px] text-slate-500 font-light tracking-wide uppercase">Optimized for Disaster Monitoring & Social Intelligence</p>
            </div>
          </div>
          
          {/* Mobile Hamburger Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Right Section: Selectors and Toggle */}
        <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 shrink-0 w-full md:w-auto`}>
          
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
              className="appearance-none bg-transparent border-none outline-none text-slate-200 cursor-pointer font-semibold pr-1"
            >
              <option value="citizen">{t('roleCitizen')}</option>
              <option value="official">{t('roleOfficial')}</option>
            </select>
            <ChevronDown size={11} className="text-slate-500" />
          </div>

          {/* Language selector Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111625] border border-slate-800 text-xs font-semibold text-slate-350">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLanguages)}
              className="appearance-none bg-transparent border-none outline-none text-slate-200 cursor-pointer font-semibold pr-1"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
              <option value="te">తెలుగు</option>
              <option value="ta">தமிழ்</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="as">অสมীया</option>
            </select>
            <ChevronDown size={11} className="text-slate-500" />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center rounded-lg bg-[#111625] border border-slate-800 p-0.5 overflow-hidden">
            <button
              onClick={() => {
                if (mapZoom > 2) setMapZoom(prev => prev - 1);
              }}
              title="Zoom Out"
              className="p-1.5 px-2 text-slate-400 hover:text-white hover:bg-[#1c243a] rounded transition-all cursor-pointer flex items-center justify-center"
            >
              <Minus size={12} />
            </button>
            <span className="w-px h-3.5 bg-slate-800 shrink-0"></span>
            <button
              onClick={() => {
                if (mapZoom < 18) setMapZoom(prev => prev + 1);
              }}
              title="Zoom In"
              className="p-1.5 px-2 text-slate-400 hover:text-white hover:bg-[#1c243a] rounded transition-all cursor-pointer flex items-center justify-center"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

        </div>
      </header>

      {/* Main Workspace: Fullscreen Map with Floating Overlays */}
      <div className="flex-grow w-full relative overflow-y-auto lg:overflow-hidden h-0 flex flex-col lg:block">
        
        {/* Fullscreen Map Background */}
        <div className="relative lg:absolute lg:inset-0 z-0 w-full h-[400px] lg:h-full shrink-0 px-4 md:px-6 py-2 lg:p-0">
          <div className="w-full h-full rounded-2xl lg:rounded-none overflow-hidden shadow-lg lg:shadow-none border border-slate-800/50 lg:border-none">
            <LeafletMap 
              mode="forest" 
              reports={filteredReports} 
              center={mapCenter}
              zoom={mapZoom}
              onReportClick={handleOpenMedia}
              onViewportChange={(c, z) => {
                setMapCenter(c);
                setMapZoom(z);
              }}
            />
          </div>
        </div>

        {/* INTERACTIVE FLOATING OVERLAYS CONTAINER (Pointer events none so map is draggable underneath) */}
        <div className="relative lg:absolute lg:inset-0 z-10 lg:pointer-events-none p-4 flex flex-col lg:justify-between gap-4 lg:gap-0">
          
          {/* Top Floating Row: Filters Card (Left) and Unified Feed Card (Right) */}
          <div className="flex flex-col lg:flex-row lg:justify-between items-start w-full lg:h-full lg:max-h-[calc(100vh-250px)] gap-4 lg:gap-0">
            
            {/* LEFT FLOATING COLUMN: FILTERS & HOTSPOTS & ADD REPORT */}
            <div className="w-full lg:w-[310px] flex flex-col gap-3.5 pointer-events-auto lg:max-h-full overflow-y-visible lg:overflow-y-auto lg:pr-1 shrink-0">
              
              {/* Filters Card */}
              <div className="glass-panel p-4 rounded-xl space-y-4">
                <h3 
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                  className="text-xs font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900 pb-2 mb-1.5 cursor-pointer select-none"
                >
                  <Filter size={13} />
                  {t('filters')} & {t('hotspots')}
                  <ChevronDown size={13} className={`ml-auto text-slate-500 transition-transform duration-200 ${isFiltersExpanded ? '' : '-rotate-90'}`} />
                </h3>

                {isFiltersExpanded && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('eventType')}</label>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="w-full bg-[#111625] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-semibold"
                        >
                          <option value="all">{t('all')}</option>
                          <option value="Tree">{t('tree')}</option>
                          <option value="Fire">{t('fire')}</option>
                          <option value="Hunting">{t('hunting')}</option>
                          <option value="Poaching">{t('poaching')}</option>
                          <option value="Logging">{t('logging')}</option>
                          <option value="Wind">{t('wind')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('source')}</label>
                        <select
                          value={filterSource}
                          onChange={(e) => setFilterSource(e.target.value)}
                          className="w-full bg-[#111625] border border-slate-800 hover:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all cursor-pointer font-semibold"
                        >
                          <option value="all">{t('all')}</option>
                          <option value="citizen">{t('roleCitizen')}</option>
                          <option value="verified">{t('verified')}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('from')}</label>
                          <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full bg-[#111625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('to')}</label>
                          <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-full bg-[#111625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('location')}</label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
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
                        className="flex-grow py-2 rounded-lg bg-emerald-600/95 hover:bg-emerald-500 border border-emerald-600 text-white text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                      >
                        {t('apply')}
                      </button>
                      <button
                        onClick={handleResetFilters}
                        className="flex-grow py-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                      >
                        {t('reset')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Large ADD REPORT Floating Button */}
              {(role === 'citizen' || role === 'official') && (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="w-full flex items-center justify-center gap-3 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-600 text-white font-bold tracking-widest text-sm shadow-xl shadow-emerald-500/25 transition-all cursor-pointer border border-emerald-400/20 uppercase"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  {t('report')}
                </button>
              )}

            </div>

            {/* RIGHT FLOATING COLUMN: TALL UNIFIED FEED */}
            <div className={`w-full lg:w-[350px] ${isFeedExpanded ? 'lg:h-full lg:max-h-full' : 'lg:h-auto'} pointer-events-auto flex flex-col shrink-0 transition-all duration-300`}>
              <div className="glass-panel p-4 rounded-2xl flex flex-col h-full overflow-hidden">
                <h3 
                  onClick={() => setIsFeedExpanded(!isFeedExpanded)}
                  className="text-xs font-bold text-slate-200 uppercase tracking-widest border-b border-slate-900/60 pb-2.5 mb-3 shrink-0 cursor-pointer select-none flex items-center justify-between"
                >
                  <span>{t('unifiedFeed')}</span>
                  <ChevronDown size={13} className={`text-slate-500 transition-transform duration-200 ${isFeedExpanded ? '' : '-rotate-90'}`} />
                </h3>

                {isFeedExpanded && (
                  /* Scrollable list */
                  <div className="flex-grow overflow-y-auto space-y-3 pr-1 animate-fade-in">
                    {sortedReports.length > 0 ? (
                      sortedReports.map(r => {
                        const verifiedCls = r.verified ? 'ok' : 'warn';
                        
                        // Sentiment Styling
                        const sentimentCls = r.sentiment > 0.2 ? 'ok' : r.sentiment < -0.2 ? 'danger' : 'warn';

                        // Icon determination
                        const getDisasterIcon = (type: string) => {
                          const lower = type.toLowerCase();
                          if (lower.includes('fire')) {
                            return (
                              <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                                <Flame size={18} />
                              </div>
                            );
                          }
                          if (lower.includes('tree') || lower.includes('forest') || lower.includes('logging')) {
                            return (
                              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                <TreePine size={18} />
                              </div>
                            );
                          }
                          return (
                            <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                              <TreePine size={18} />
                            </div>
                          );
                        };

                        return (
                          <div 
                            key={r.id} 
                            onClick={() => {
                              setMapCenter([r.lat, r.lng]);
                              setMapZoom(13);
                              handleOpenMedia(r);
                            }}
                            className="p-3 bg-[#0a0e1a]/80 hover:bg-slate-900/50 border border-slate-900/60 rounded-xl cursor-pointer transition-all hover:scale-[1.01] hover:border-slate-800"
                          >
                            <div className="flex gap-3">
                              {getDisasterIcon(r.type)}
                              
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <span className="text-[10px] font-bold text-slate-300 uppercase truncate">
                                    {t(r.type.toLowerCase() as any) || r.type}
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-mono shrink-0">
                                    {new Date(r.ts).toLocaleTimeString(lang === 'en' ? 'en-US' : 'hi-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                
                                <p className="text-[11px] text-slate-400 leading-normal mt-1 break-words font-sans">
                                  {r.desc}
                                </p>

                                {/* Media tag indicator */}
                                {Array.isArray(r.media) && r.media.length > 0 && (
                                  <div className="flex gap-1.5 mt-1.5">
                                    <span className="text-[8px] font-semibold text-sky-400/80 bg-sky-500/5 border border-sky-500/10 px-1.5 py-0.5 rounded uppercase">
                                      {t('attachment')}
                                    </span>
                                  </div>
                                )}

                                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 border-t border-slate-900/40 pt-2 text-[9px] text-slate-550 font-semibold uppercase">
                                  <span className="capitalize">
                                    {t(r.src === 'citizen' ? 'roleCitizen' : r.src === 'social' ? 'social' : 'verified')}
                                  </span>
                                  <span>•</span>
                                  <span className={`chip ${verifiedCls}`}>
                                    {r.verified ? t('verified') : t('unverified')}
                                  </span>
                                  <span>•</span>
                                  <span className={`chip ${sentimentCls}`}>
                                    {r.sentiment > 0.2 ? t('positive') : r.sentiment < -0.2 ? t('negative') : t('neutral')}
                                  </span>
                                  
                                  {(!r.verified && role === 'official') && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        storeActions.verifyReport(r.id);
                                      }}
                                      className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[8px] font-bold tracking-wider hover:bg-emerald-500 hover:text-white cursor-pointer uppercase transition-all ml-1 shrink-0"
                                    >
                                      VERIFY
                                    </button>
                                  )}
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
                )}
              </div>
            </div>

          </div>

          {/* Bottom Floating Row: Small Side-by-Side Charts (Center) */}
          <div className="relative mt-4 lg:mt-0 lg:absolute lg:bottom-12 lg:left-1/2 lg:-translate-x-1/2 pointer-events-auto z-10 flex flex-col lg:flex-row justify-center w-full lg:w-auto items-center lg:items-end">
            <div className="flex flex-col lg:flex-row gap-4 select-none w-full md:w-auto items-center">
              
              {/* Chart 1: Trend line */}
              <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1.5 w-full md:w-[330px] h-[170px]">
                <h4 className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900/60 pb-1 shrink-0">
                  <BarChart3 size={11} />
                  {t('trendChartTitle')}
                </h4>
                <div className="flex-grow w-full relative h-[115px]">
                  <canvas ref={trendCanvasRef} />
                </div>
              </div>

              {/* Chart 2: Sentiment analysis doughnut */}
              <div className="glass-panel p-3 rounded-2xl flex flex-col gap-1.5 w-full md:w-[330px] h-[170px]">
                <h4 className="text-[10px] font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-900/60 pb-1 shrink-0">
                  <Activity size={11} />
                  {t('sentimentChartTitle')}
                </h4>
                <div className="flex-grow w-full relative h-[115px] flex items-center justify-between">
                  <div className="w-[50%] h-full flex items-center justify-center">
                    <canvas ref={sentimentCanvasRef} />
                  </div>
                  <div className="w-[45%] flex flex-col gap-1.5 text-[9px] text-slate-400 font-semibold pr-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#10b981]"></span>
                        <span>{t('positive')}</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold">{positiveCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#f59e0b]"></span>
                        <span>{t('neutral')}</span>
                      </div>
                      <span className="text-amber-400 font-mono font-bold">{neutralCount}</span>
                    </div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#ef4444]"></span>
                        <span>{t('negative')}</span>
                      </div>
                      <span className="text-red-400 font-mono font-bold">{negativeCount}</span>
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
