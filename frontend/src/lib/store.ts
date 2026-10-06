import { useState, useEffect } from 'react';
import { scoreSentiment } from './nlp';
import { addReportApi, verifyReportApi, getReportsApi } from './api';

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

// In-memory state for active React session (backed by Neon Express Backend)
let globalState: StoreState = {
  reports: [],
  loading: true
};

const listeners = new Set<(state: StoreState) => void>();

function notify() {
  listeners.forEach(l => l({ ...globalState }));
}

// Fetch and sync latest reports from Backend API
export async function syncFromNeon() {
  try {
    const dbReports = await getReportsApi();
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
      globalState.loading = false;
      notify();
    }
  } catch (error) {
    console.error("Backend reports sync failed:", error);
    globalState.loading = false;
    notify();
  }
}

// Initial server sync & periodic polling
if (typeof window !== 'undefined') {
  syncFromNeon();

  // Periodic poll from backend every 10 seconds
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

// Core Operations directly on Backend Server
export const storeActions = {
  // Add a new report to Backend API
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
      const result = await addReportApi({
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
      console.log("Report saved to backend server successfully!");
    } catch (e) {
      console.error("Failed to write report to backend server:", e);
    }
  },

  // Verify a report on Backend API
  verifyReport: async (id: string) => {
    const report = globalState.reports.find(r => r.id === id);
    if (report) {
      report.verified = true;
      notify();
    }

    try {
      await verifyReportApi(id);
    } catch (e) {
      console.error("Failed to update verification on backend server:", e);
    }
  },

  // Verify latest report on Backend API
  verifyLatest: async () => {
    if (globalState.reports.length > 0) {
      const latest = globalState.reports[0];
      latest.verified = true;
      notify();

      try {
        await verifyReportApi(latest.id);
      } catch (e) {
        console.error("Failed to update latest verification on backend server:", e);
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
