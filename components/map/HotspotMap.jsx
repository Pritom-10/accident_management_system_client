'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { BD_CENTER, BD_ZOOM, TILE_URL, TILE_ATTRIBUTION } from '../../lib/geo';
import { heatColor } from '../../lib/hotspots';
import { formatDateTime } from '../../lib/newsOptions';

function popupNode(cell) {
  const box = document.createElement('div');

  const title = document.createElement('strong');
  title.textContent = `${cell.count} ${cell.count === 1 ? 'case' : 'cases'} in this area`;
  box.appendChild(title);

  const place = [cell.area, cell.district].filter(Boolean).join(', ');
  if (place) {
    const line = document.createElement('div');
    line.textContent = place;
    line.style.cssText = 'margin-top:2px;font-size:12px;color:#475569';
    box.appendChild(line);
  }

  if (cell.latest) {
    const latest = document.createElement('div');
    latest.textContent = `Latest: ${formatDateTime(cell.latest)}`;
    latest.style.cssText = 'margin-top:2px;font-size:12px;color:#475569';
    box.appendChild(latest);
  }

  if (cell.district) {
    const link = document.createElement('a');
    link.href = `/accidents?district=${encodeURIComponent(cell.district)}`;
    link.textContent = `See cases in ${cell.district}`;
    link.style.cssText = 'display:inline-block;margin-top:6px;font-size:12px;font-weight:600;color:#4F46E5';
    box.appendChild(link);
  }

  return box;
}

export default function HotspotMap({
  cells = [],
  mode = 'blackspot',
  maxCount = 1,
  focus = null,
  height = 460,
  emptyText = 'No cases match these filters.',
}) {
  const holder = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const libRef = useRef(null);
  const latest = useRef({ cells, mode, maxCount });

  function draw() {
    const L = libRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    const { cells: list, mode: currentMode, maxCount: max } = latest.current;
    layer.clearLayers();
    const points = [];

    list.forEach((cell) => {
      const style =
        currentMode === 'heat'
          ? {
              stroke: false,
              fillColor: heatColor(cell.count / Math.max(max, 1)),
              fillOpacity: 0.55,
              radius: 800,
            }
          : {
              color: '#B91C1C',
              weight: 2,
              fillColor: '#DC2626',
              fillOpacity: 0.35,
              radius: Math.min(1500, 350 + cell.count * 120),
            };

      const circle = L.circle([cell.lat, cell.lng], style);
      circle.bindPopup(popupNode(cell));
      circle.addTo(layer);
      points.push([cell.lat, cell.lng]);
    });

    if (points.length === 1) map.setView(points[0], 14);
    else if (points.length > 1) map.fitBounds(points, { padding: [50, 50], maxZoom: 14 });
  }

  useEffect(() => {
    latest.current = { cells, mode, maxCount };
    draw();
  }, [cells, mode, maxCount]);

  useEffect(() => {
    if (focus && mapRef.current) mapRef.current.setView([focus.lat, focus.lng], 15);
  }, [focus]);

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
    <div
      className={`relative isolate overflow-hidden rounded-2xl border border-white/50 shadow-md shadow-slate-900/5 ${
        mode === 'heat' ? 'heat-blur' : ''
      }`}
      style={{ height }}
    >
      <div ref={holder} className="h-full w-full" />
      {cells.length === 0 && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center">
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm text-slate-600 shadow">{emptyText}</span>
        </div>
      )}
    </div>
  );
}