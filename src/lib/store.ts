import { useState, useEffect } from 'react';
import { scoreSentiment } from './nlp';
import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore';

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

const LOCAL_STORAGE_KEY = 'oceanwatch_store_v3';

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

// Save complete state locally for instant offline/error resilience
export function saveStore() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      reports: globalState.reports,
      pending: globalState.pending
    }));
  } catch (e) {
    console.warn('Saving local store failed', e);
  }
}

// Load state from local storage at startup
export function loadStore() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      globalState.reports = (obj.reports || []).map((r: any) => ({
        ...r,
        sentiment: scoreSentiment(r.desc)
      }));
      globalState.pending = (obj.pending || []).map((r: any) => ({
        ...r,
        sentiment: scoreSentiment(r.desc)
      }));
    }
  } catch (e) {
    console.warn('Loading local store failed', e);
  }
}

// Seed mock data to Firestore (and locally)
export async function seedMockData() {
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

  let idx = 0;
  
  // Update local state first so we have immediate data
  const seededReports: HazardReport[] = [];

  for (const s of forestSamples) {
    const id = `seed-f-${idx++}`;
    const rep: HazardReport = {
      id,
      ...s,
      ts: now - 1000 * 60 * 60 * (1.5 * idx),
      media: [],
      sentiment: scoreSentiment(s.desc)
    };
    seededReports.push(rep);
    
    // Write to Firestore in background
    setDoc(doc(db, "reports", id), {
      lat: s.lat,
      lng: s.lng,
      type: s.type,
      desc: s.desc,
      src: s.src,
      verified: s.verified,
      ts: rep.ts,
      lang: s.lang,
      media: []
    }).catch(e => console.warn("Failed seeding document to Firestore:", id, e));
  }

  for (const s of oceanSamples) {
    const id = `seed-o-${idx++}`;
    const rep: HazardReport = {
      id,
      ...s,
      ts: now - 1000 * 60 * 60 * (1.2 * idx),
      media: [],
      sentiment: scoreSentiment(s.desc)
    };
    seededReports.push(rep);

    // Write to Firestore in background
    setDoc(doc(db, "reports", id), {
      lat: s.lat,
      lng: s.lng,
      type: s.type,
      desc: s.desc,
      src: s.src,
      verified: s.verified,
      ts: rep.ts,
      lang: s.lang,
      media: []
    }).catch(e => console.warn("Failed seeding document to Firestore:", id, e));
  }

  globalState.reports = seededReports.sort((a, b) => b.ts - a.ts);
  saveStore();
  notify();
}

// Initial Local Storage Load
if (typeof window !== 'undefined') {
  loadStore();
  if (globalState.reports.length === 0) {
    // Seed locally first if we have nothing in Local Storage
    seedMockData();
  }

  // Subscribe to Firestore for live external updates
  const reportsQuery = query(collection(db, "reports"), orderBy("ts", "desc"));
  onSnapshot(reportsQuery, async (snapshot) => {
    if (snapshot.empty) {
      console.log("Firestore collection is empty, local seed remains in place.");
      return;
    }

    const fetchedReports: HazardReport[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      fetchedReports.push({
        id: doc.id,
        lat: Number(data.lat),
        lng: Number(data.lng),
        type: String(data.type),
        desc: String(data.desc),
        src: data.src,
        verified: Boolean(data.verified),
        ts: Number(data.ts),
        lang: String(data.lang || 'en'),
        sentiment: scoreSentiment(String(data.desc)),
        media: data.media || []
      });
    });

    // Merge: Keep local unsynced reports on top, then place Firestore reports
    const localOnly = globalState.reports.filter(
      local => !fetchedReports.some(remote => remote.id === local.id)
    );

    globalState.reports = [...localOnly, ...fetchedReports].sort((a, b) => b.ts - a.ts);
    saveStore();
    notify();
  }, (error) => {
    console.error("Firestore real-time subscription blocked or failed:", error);
  });
}

// React custom hook to subscribe to store updates
export function useDisasterStore() {
  const [state, setState] = useState<StoreState>({ reports: [], pending: [] });

  useEffect(() => {
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
  addReport: async (report: Omit<HazardReport, 'sentiment'>) => {
    const reportWithSentiment: HazardReport = {
      ...report,
      sentiment: scoreSentiment(report.desc)
    };

    // 1. Instant local visual update & Local Storage save
    if (!globalState.reports.some(r => r.id === report.id)) {
      globalState.reports.unshift(reportWithSentiment);
      saveStore();
      notify();
    }

    // 2. Perform background write to Firestore
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (isOnline) {
      try {
        await setDoc(doc(db, "reports", report.id), {
          lat: report.lat,
          lng: report.lng,
          type: report.type,
          desc: report.desc,
          src: report.src,
          verified: report.verified,
          ts: report.ts,
          lang: report.lang,
          media: report.media
        });
        console.log("Successfully synchronized new report to Firestore!");
      } catch (e) {
        console.warn("Failed background upload to Firestore. Saving to offline sync queue.", e);
        if (!globalState.pending.some(p => p.id === report.id)) {
          globalState.pending.push(reportWithSentiment);
          saveStore();
        }
      }
    } else {
      if (!globalState.pending.some(p => p.id === report.id)) {
        globalState.pending.push(reportWithSentiment);
        saveStore();
      }
    }
  },

  verifyReport: async (id: string) => {
    // 1. Instant local verification state update
    const report = globalState.reports.find(r => r.id === id);
    if (report) {
      report.verified = true;
      saveStore();
      notify();
    }

    // 2. Sync state update to Firestore in background
    try {
      await updateDoc(doc(db, "reports", id), {
        verified: true
      });
    } catch (e) {
      console.warn("Could not sync verification to Firestore:", e);
    }
  },

  verifyLatest: async () => {
    if (globalState.reports.length > 0) {
      const latest = globalState.reports[0];
      
      // Update local state first
      latest.verified = true;
      saveStore();
      notify();

      // Sync Firestore
      try {
        await updateDoc(doc(db, "reports", latest.id), {
          verified: true
        });
      } catch (e) {
        console.warn("Could not sync latest verification to Firestore:", e);
      }
    }
  },

  syncPending: async () => {
    if (globalState.pending.length > 0) {
      try {
        for (const report of globalState.pending) {
          await setDoc(doc(db, "reports", report.id), {
            lat: report.lat,
            lng: report.lng,
            type: report.type,
            desc: report.desc,
            src: report.src,
            verified: report.verified,
            ts: report.ts,
            lang: report.lang,
            media: report.media
          });
        }
        globalState.pending = [];
        saveStore();
        notify();
        return true;
      } catch (e) {
        console.warn("Failed syncing offline queue:", e);
      }
    }
    return false;
  },

  addBulkReports: async (reports: HazardReport[]) => {
    // Save locally
    globalState.reports.push(...reports);
    saveStore();
    notify();

    // Push to Firestore in background
    try {
      for (const report of reports) {
        setDoc(doc(db, "reports", report.id), {
          lat: report.lat,
          lng: report.lng,
          type: report.type,
          desc: report.desc,
          src: report.src,
          verified: report.verified,
          ts: report.ts,
          lang: report.lang,
          media: report.media
        }).catch(e => console.warn("Failed background bulk item save:", report.id, e));
      }
    } catch (e) {
      console.warn("Failed bulk Firestore save:", e);
    }
  }
};

// Wire online listener in browser environment
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    storeActions.syncPending().then(synced => {
      if (synced) {
        console.info('Pending offline reports synchronized.');
        window.dispatchEvent(new Event('store-offline-synced'));
      }
    });
  });
}
