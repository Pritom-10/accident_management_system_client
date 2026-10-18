'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { BD_CENTER, BD_ZOOM, TILE_URL, TILE_ATTRIBUTION, pinIcon, statusColor } from '../../lib/geo';

function popupNode(m) {
  const box = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = m.title || '';
  box.appendChild(title);

  if (m.subtitle) {
    const line = document.createElement('div');
    line.textContent = m.subtitle;
    line.style.cssText = 'margin-top:2px;font-size:12px;color:#475569';
    box.appendChild(line);
  }

  if (m.href) {
    const link = document.createElement('a');
    link.href = m.href;
    link.textContent = 'Open details';
    link.style.cssText = 'display:inline-block;margin-top:6px;font-size:12px;font-weight:600;color:#4F46E5';
    box.appendChild(link);
  }

  return box;
}

export default function MapView({ markers = [], height = 420, emptyText = 'No cases with a location yet.' }) {
  const holder = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const libRef = useRef(null);
  const markersRef = useRef(markers);

  function draw() {
    const L = libRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const points = [];

    markersRef.current.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: pinIcon(L, statusColor[m.status] || '#4F46E5') });
      marker.bindPopup(popupNode(m));
      marker.addTo(layer);
      points.push([m.lat, m.lng]);
    });

    if (points.length === 1) map.setView(points[0], 15);
    else if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 14 });
  }

  useEffect(() => {
    markersRef.current = markers;
    draw();
  }, [markers]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !holder.current || mapRef.current) return;

      libRef.current = L;
      const map = L.map(holder.current, { scrollWheelZoom: false }).setView(BD_CENTER, BD_ZOOM);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      map.on('click', () => map.scrollWheelZoom.enable());
      map.on('mouseout', () => map.scrollWheelZoom.disable());

      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      draw();
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      layerRef.current = null;
    };
  }, []);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-white/50 shadow-md shadow-slate-900/5" style={{ height }}>
      <div ref={holder} className="h-full w-full" />
      {markers.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-600 shadow">{emptyText}</span>
        </div>
      )}
    </div>
  );
}