import { useState, useEffect } from 'react';
import { scoreSentiment } from './nlp';

export interface HazardMedia {
  type: 'image' | 'video';
  data: string; // Base64 DataURL
  name: string;
}

export interface HazardReport {
  id: string;
  lat: number;
  lng: number;
  type: string;
  desc: string;
  src: 'citizen' | 'social' | 'official';
  verified: boolean;
  ts: number;
  lang: string;
  sentiment: number;
  media: HazardMedia[];
}

export interface StoreState {
  reports: HazardReport[];
  pending: HazardReport[];
}

const LOCAL_STORAGE_KEY = 'oceanwatch_store';

// Private in-memory state
let globalState: StoreState = {
  reports: [],
  pending: []
};

// Subscriptions
const listeners = new Set<(state: StoreState) => void>();

function notify() {
  listeners.forEach(l => l({ ...globalState }));
}

// Save state to LocalStorage
export function saveStore() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(globalState));
  } catch (e) {
    console.warn('Saving store failed', e);
  }
}

// Load state from LocalStorage
export function loadStore() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      globalState.reports = obj.reports || [];
      globalState.pending = obj.pending || [];
    }
  } catch (e) {
    console.warn('Loading store failed', e);
  }
}

// Seed mock data if empty
export function seedMockData() {
  if (globalState.reports.length > 0) return;
  
  const now = Date.now();
  const forestSamples = [
    { lat: 29.53, lng: 78.7747, type: 'Tree', desc: 'Unusual tree cutting reported near reserve area', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 21.5937, lng: 86.3487, type: 'Fire', desc: 'Forest fire spreading near hill region', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 22.3345, lng: 80.6115, type: 'Hunting', desc: 'Hunting spotted in restricted area', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 26.5775, lng: 93.1711, type: 'Poaching', desc: 'Poaching activity suspected by patrol team', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 12.2958, lng: 76.6394, type: 'Logging', desc: 'Illegal logging trucks seen at night', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 21.1240, lng: 70.8242, type: 'Wind', desc: 'Several trees blown down after storm', src: 'citizen' as const, verified: false, lang: 'en' }
  ];

  const oceanSamples = [
    { lat: 13.0827, lng: 80.2707, type: 'swell', desc: 'Strong swell surges hitting Marina Beach', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 17.6868, lng: 83.2185, type: 'waves', desc: 'High waves near RK Beach; fishermen advised caution', src: 'official' as const, verified: true, lang: 'en' },
    { lat: 19.0760, lng: 72.8777, type: 'flood', desc: 'लोकल बाढ़ की सूचना, कोलाबा साइड', src: 'citizen' as const, verified: false, lang: 'hi' },
    { lat: 20.2961, lng: 85.8245, type: 'tide', desc: 'Unusual high tide reported by lighthouse team', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 25.2961, lng: 55.8245, type: 'flood', desc: 'Unusual high tide reported by NGO team', src: 'citizen' as const, verified: false, lang: 'en' },
    { lat: 21.1458, lng: 79.0882, type: 'damage', desc: 'Sea wall damage spotted after storm surge', src: 'citizen' as const, verified: false, lang: 'en' }
  ];

  // Merge seed items with timestamps
  let idx = 0;
  forestSamples.forEach(s => {
    globalState.reports.push({
      id: `seed-f-${idx++}`,
      ...s,
      ts: now - 1000 * 60 * 60 * (1.5 * idx),
      media: [],
      sentiment: scoreSentiment(s.desc)
    });
  });

  oceanSamples.forEach(s => {
    globalState.reports.push({
      id: `seed-o-${idx++}`,
      ...s,
      ts: now - 1000 * 60 * 60 * (1.2 * idx),
      media: [],
      sentiment: scoreSentiment(s.desc)
    });
  });

  saveStore();
}

// React custom hook to subscribe to store updates
export function useDisasterStore() {
  const [state, setState] = useState<StoreState>({ reports: [], pending: [] });

  useEffect(() => {
    // Initial load
    if (globalState.reports.length === 0) {
      loadStore();
      seedMockData();
    }

    setState({ ...globalState });

    const listener = (updated: StoreState) => {
      setState(updated);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
}

// Core Operations
export const storeActions = {
  addReport: (report: Omit<HazardReport, 'sentiment'>) => {
    const reportWithSentiment: HazardReport = {
      ...report,
      sentiment: scoreSentiment(report.desc)
    };

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (isOnline) {
      globalState.reports.push(reportWithSentiment);
    } else {
      globalState.pending.push(reportWithSentiment);
    }

    saveStore();
    notify();
  },

  verifyReport: (id: string) => {
    const report = globalState.reports.find(r => r.id === id);
    if (report) {
      report.verified = true;
      saveStore();
      notify();
    }
  },

  verifyLatest: () => {
    if (globalState.reports.length > 0) {
      globalState.reports[globalState.reports.length - 1].verified = true;
      saveStore();
      notify();
    }
  },

  syncPending: () => {
    if (globalState.pending.length > 0) {
      globalState.reports.push(...globalState.pending);
      globalState.pending = [];
      saveStore();
      notify();
      return true;
    }
    return false;
  },

  addBulkReports: (reports: HazardReport[]) => {
    globalState.reports.push(...reports);
    saveStore();
    notify();
  }
};

// Wire online listener in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const synced = storeActions.syncPending();
    if (synced) {
      console.info('Pending offline reports synchronized.');
      // Dispatch a custom event to notify components if they want to trigger toasts
      window.dispatchEvent(new Event('store-offline-synced'));
    }
  });
}
