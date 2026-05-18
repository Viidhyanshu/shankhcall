'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.heat';
import { HazardReport } from '@/lib/store';

// Fix for default Leaflet icon paths in react environments
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LeafletMapProps {
  mode: 'forest' | 'ocean';
  reports: HazardReport[];
  center?: [number, number];
  zoom?: number;
  onReportClick?: (report: HazardReport) => void;
}

const iconByType: Record<string, string> = {
  // Forest
  Tree: 'fa-tree',
  Fire: 'fa-fire',
  Hunting: 'fa-hat-cowboy',
  Poaching: 'fa-paw',
  Logging: 'fa-industry',
  Wind: 'fa-wind',
  // Ocean
  tide: 'fa-water',
  flood: 'fa-house-flood-water',
  damage: 'fa-road-circle-exclamation',
  tsunami: 'fa-wave-square',
  swell: 'fa-water',
  waves: 'fa-water',
  Other: 'fa-circle'
};

export default function LeafletMap({ mode, reports, center, zoom = 5, onReportClick }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const clusterLayerInstance = useRef<any>(null);
  const heatLayerInstance = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Default focus: India
    const initialCenter = center || [15.9129, 79.74];
    const initialZoom = zoom;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(initialCenter, initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Initialize Layers
    const clusterLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 40
    });
    map.addLayer(clusterLayer);

    const heatLayer = L.heatLayer([], {
      radius: 25,
      blur: 15,
      maxZoom: 17
    }).addTo(map);

    mapInstance.current = map;
    clusterLayerInstance.current = clusterLayer;
    heatLayerInstance.current = heatLayer;

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        clusterLayerInstance.current = null;
        heatLayerInstance.current = null;
      }
    };
  }, []);

  // Update Map Center and Zoom
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setView(center, zoom);
    }
  }, [center, zoom]);

  // Update Markers and Heatmap
  useEffect(() => {
    if (!mapInstance.current || !clusterLayerInstance.current || !heatLayerInstance.current) return;

    const map = mapInstance.current;
    const clusterLayer = clusterLayerInstance.current;
    const heatLayer = heatLayerInstance.current;

    clusterLayer.clearLayers();
    const heatPoints: Array<[number, number, number]> = [];

    reports.forEach(r => {
      const typeIcon = iconByType[r.type] || iconByType['Other'];
      const isForest = ['Tree', 'Fire', 'Hunting', 'Poaching', 'Logging', 'Wind'].includes(r.type);
      const iconColor = isForest ? '#10b981' : '#0ea5e9'; // Green for Forest, Blue for Ocean

      // Create Custom Circle DivIcon
      const iconHtml = `<div style="display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:${iconColor};border:2px solid #0f172a;color:white;box-shadow:0 0 10px ${iconColor}88"><i class="fa-solid ${typeIcon}"></i></div>`;
      
      const icon = L.divIcon({
        html: iconHtml,
        className: 'custom-map-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([r.lat, r.lng], { icon });

      // Sentiment markup
      const sentimentVal = r.sentiment || 0;
      const sentimentCls = sentimentVal > 0.2 ? 'ok' : sentimentVal < -0.2 ? 'danger' : 'warn';
      const sentimentText = sentimentVal > 0.2 ? 'positive' : sentimentVal < -0.2 ? 'negative' : 'neutral';
      const sentimentChip = `<span class="chip ${sentimentCls}">${sentimentText} (${sentimentVal.toFixed(1)})</span>`;
      
      // Verified markup
      const verifiedChip = r.verified ? '<span class="chip ok">verified</span>' : '<span class="chip warn">unverified</span>';

      // Media thumbnail inside popup
      let mediaHtml = '';
      if (Array.isArray(r.media) && r.media.length > 0) {
        const item = r.media[0];
        if (item.type === 'image') {
          mediaHtml = `<div style="margin-top:8px;"><img src="${item.data}" style="width:180px;height:120px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.1)"></div>`;
        } else if (item.type === 'video') {
          mediaHtml = `<div style="margin-top:8px;"><video src="${item.data}" style="width:180px;height:120px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,0.1)" muted></video></div>`;
        }
      }

      const popupHtml = `
        <div style="min-width:200px; padding: 4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <b style="font-size:13px; text-transform:uppercase; color:#38bdf8;">${r.type}</b>
            ${verifiedChip}
          </div>
          <small style="color:var(--muted); font-size:10px; display:block; margin-bottom:6px;">${new Date(r.ts).toLocaleString()}</small>
          <div style="font-size:12px; margin-bottom:8px; line-height:1.4; color:#e2e8f0;">${r.desc}</div>
          ${mediaHtml}
          <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.1); padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; color:#94a3b8;">Source: <b>${r.src}</b></span>
            ${sentimentChip}
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      
      // Click listeners to open dynamic media modals
      if (onReportClick) {
        marker.on('click', () => {
          onReportClick(r);
        });
      }

      clusterLayer.addLayer(marker);

      // Populate Heatpoints
      heatPoints.push([r.lat, r.lng, 0.6]);
    });

    heatLayer.setLatLngs(heatPoints);
  }, [reports, mode, onReportClick]);

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full absolute inset-0 z-0"
        style={{ minHeight: '100%', width: '100%' }}
      />
    </div>
  );
}
