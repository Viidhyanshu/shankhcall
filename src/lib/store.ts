import { useState, useEffect } from 'react';
import { scoreSentiment } from './nlp';
import { addReportAction, verifyReportAction, getReports } from '@/app/actions';

export interface HazardMedia {
  type: 'image' | 'video';
  data: string; // Base64 DataURL or URL
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
  loading: boolean;
}

// In-memory state for active React session (backed by Neon PostgreSQL server)
let globalState: StoreState = {
  reports: [],
  loading: true
};

const listeners = new Set<(state: StoreState) => void>();

function notify() {
  listeners.forEach(l => l({ ...globalState }));
}

// Fetch and sync latest reports from Neon PostgreSQL server
export async function syncFromNeon() {
  try {
    const dbReports = await getReports();
    if (dbReports && dbReports.length > 0) {
      const fetchedReports: HazardReport[] = dbReports.map((r: any) => ({
        id: r.id,
        lat: Number(r.lat),
        lng: Number(r.lng),
        type: String(r.type),
        desc: String(r.description),
        src: (r.src as any) || 'citizen',
        verified: Boolean(r.verified),
        ts: Number(r.ts),
        lang: String(r.lang || 'en'),
        sentiment: Number(r.sentiment || 0),
        media: (r.media as HazardMedia[]) || []
      }));

      globalState.reports = fetchedReports.sort((a, b) => b.ts - a.ts);
      globalState.loading = false;
      notify();
    } else {
      // If server database is empty, seed initial reports to Neon
      await seedMockData();
      globalState.loading = false;
      notify();
    }
  } catch (error) {
    console.error("Neon database sync failed:", error);
    globalState.loading = false;
    notify();
  }
}

// Seed mock data directly to Neon PostgreSQL server
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

    addReportAction({
      id,
      lat: s.lat,
      lng: s.lng,
      type: s.type,
      description: s.desc,
      src: s.src,
      verified: s.verified,
      ts: rep.ts,
      lang: s.lang,
      sentiment: rep.sentiment,
      media: []
    }).catch(e => console.warn("Failed seeding report to Neon DB:", id, e));
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

    addReportAction({
      id,
      lat: s.lat,
      lng: s.lng,
      type: s.type,
      description: s.desc,
      src: s.src,
      verified: s.verified,
      ts: rep.ts,
      lang: s.lang,
      sentiment: rep.sentiment,
      media: []
    }).catch(e => console.warn("Failed seeding report to Neon DB:", id, e));
  }

  globalState.reports = seededReports.sort((a, b) => b.ts - a.ts);
  notify();
}

// Initial server sync & periodic polling
if (typeof window !== 'undefined') {
  syncFromNeon();

  // Periodic poll from Neon server every 10 seconds
  setInterval(() => {
    syncFromNeon();
  }, 10000);
}

// React custom hook to subscribe to store updates
export function useDisasterStore() {
  const [state, setState] = useState<StoreState>({ reports: globalState.reports, loading: globalState.loading });

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

// Core Operations directly on Neon PostgreSQL Server
export const storeActions = {
  // Add a new report to Neon PostgreSQL server
  addReport: async (report: Omit<HazardReport, 'sentiment'>) => {
    const reportWithSentiment: HazardReport = {
      ...report,
      sentiment: scoreSentiment(report.desc)
    };

    // Optimistic UI update
    if (!globalState.reports.some(r => r.id === report.id)) {
      globalState.reports.unshift(reportWithSentiment);
      notify();
    }

    try {
      const result = await addReportAction({
        id: report.id,
        lat: report.lat,
        lng: report.lng,
        type: report.type,
        description: report.desc,
        src: report.src,
        verified: report.verified,
        ts: report.ts,
        lang: report.lang,
        sentiment: reportWithSentiment.sentiment,
        media: report.media
      });

      if (!result.success) {
        throw new Error(result.error);
      }
      console.log("Report saved to Neon server successfully!");
    } catch (e) {
      console.error("Failed to write report to Neon server:", e);
    }
  },

  // Verify a report on Neon PostgreSQL server
  verifyReport: async (id: string) => {
    const report = globalState.reports.find(r => r.id === id);
    if (report) {
      report.verified = true;
      notify();
    }

    try {
      await verifyReportAction(id);
    } catch (e) {
      console.error("Failed to update verification on Neon server:", e);
    }
  },

  // Verify latest report on Neon PostgreSQL server
  verifyLatest: async () => {
    if (globalState.reports.length > 0) {
      const latest = globalState.reports[0];
      latest.verified = true;
      notify();

      try {
        await verifyReportAction(latest.id);
      } catch (e) {
        console.error("Failed to update latest verification on Neon server:", e);
      }
    }
  },

  // Manually trigger server synchronization
  sync: async () => {
    await syncFromNeon();
  },

  // Sync pending or refresh from server
  syncPending: async () => {
    await syncFromNeon();
  }
};
