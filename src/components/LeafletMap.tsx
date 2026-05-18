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

const gradientByDisaster: Record<string, { bg: string; glow: string }> = {
  // Forest
  Tree: { bg: 'linear-gradient(135deg, #10b981, #047857)', glow: 'rgba(16, 185, 129, 0.6)' },
  Fire: { bg: 'linear-gradient(135deg, #ef4444, #f97316)', glow: 'rgba(239, 68, 68, 0.6)' },
  Hunting: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245, 158, 11, 0.6)' },
  Poaching: { bg: 'linear-gradient(135deg, #ec4899, #be185d)', glow: 'rgba(236, 72, 153, 0.6)' },
  Logging: { bg: 'linear-gradient(135deg, #b45309, #78350f)', glow: 'rgba(180, 83, 9, 0.6)' },
  Wind: { bg: 'linear-gradient(135deg, #06b6d4, #0891b2)', glow: 'rgba(6, 182, 212, 0.6)' },
  // Ocean
  tide: { bg: 'linear-gradient(135deg, #3b82f6, #06b6d4)', glow: 'rgba(59, 130, 246, 0.6)' },
  flood: { bg: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)', glow: 'rgba(29, 78, 216, 0.6)' },
  damage: { bg: 'linear-gradient(135deg, #eab308, #ca8a04)', glow: 'rgba(234, 179, 8, 0.6)' },
  tsunami: { bg: 'linear-gradient(135deg, #dc2626, #991b1b)', glow: 'rgba(220, 38, 38, 0.6)' },
  swell: { bg: 'linear-gradient(135deg, #14b8a6, #0f766e)', glow: 'rgba(20, 184, 166, 0.6)' },
  waves: { bg: 'linear-gradient(135deg, #0ea5e9, #2563eb)', glow: 'rgba(14, 165, 233, 0.6)' },
  Other: { bg: 'linear-gradient(135deg, #64748b, #475569)', glow: 'rgba(100, 116, 139, 0.6)' }
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

    // Function to check if light theme is active
    const isLightMode = () => document.documentElement.classList.contains('light');

    // Create premium high-definition vector basemaps (CartoDB Voyager for light / Dark Matter for dark)
    const tileLayerInstance = L.tileLayer(
      isLightMode()
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      {
        maxZoom: 20,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
      }
    ).addTo(map);

    // Watch for live dark/light mode toggles to dynamically hot-swap HD tile layers
    const observer = new MutationObserver(() => {
      const currentUrl = isLightMode()
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      tileLayerInstance.setUrl(currentUrl);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

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
      observer.disconnect();
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
      const themeGrad = gradientByDisaster[r.type] || gradientByDisaster['Other'];

      // Create Custom Circle DivIcon with Gradient Background and Custom Glowing Drop Shadow
      const iconHtml = `<div style="display:grid;place-items:center;width:28px;height:28px;border-radius:50%;background:${themeGrad.bg};border:2px solid #0f172a;color:white;box-shadow:0 0 12px ${themeGrad.glow}"><i class="fa-solid ${typeIcon}"></i></div>`;
      
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
