'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LocateFixed, Loader2, Trash2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { BD_CENTER, BD_ZOOM, TILE_URL, TILE_ATTRIBUTION, insideBangladesh, pinIcon } from '../../lib/geo';

const round = (n) => Math.round(n * 100000) / 100000;

export default function LocationPicker({ value, onChange, height = 320 }) {
  const holder = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const libRef = useRef(null);
  const valueRef = useRef(value);
  const changeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    changeRef.current = onChange;
  });

  function syncMarker() {
    const L = libRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    const v = valueRef.current;
    if (!v) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (markerRef.current) {
      markerRef.current.setLatLng([v.lat, v.lng]);
      return;
    }

    const marker = L.marker([v.lat, v.lng], { draggable: true, icon: pinIcon(L, '#4F46E5') }).addTo(map);
    marker.on('dragend', () => {
      const p = marker.getLatLng();
      changeRef.current({ lat: round(p.lat), lng: round(p.lng) });
    });
    markerRef.current = marker;
  }

  useEffect(() => {
    valueRef.current = value;
    syncMarker();
    const map = mapRef.current;
    if (value && map && !map.getBounds().contains([value.lat, value.lng])) {
      map.setView([value.lat, value.lng], Math.max(map.getZoom(), 15));
    }
  }, [value]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !holder.current || mapRef.current) return;

      libRef.current = L;
      const map = L.map(holder.current).setView(BD_CENTER, BD_ZOOM);
      L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION }).addTo(map);
      map.on('click', (e) => changeRef.current({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) }));
      mapRef.current = map;

      syncMarker();
      const v = valueRef.current;
      if (v) map.setView([v.lat, v.lng], 15);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
    };
  }, []);

  function locate() {
    if (!navigator.geolocation) {
      toast.error('Your browser cannot find your location. Tap on the map instead.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const p = { lat: round(pos.coords.latitude), lng: round(pos.coords.longitude) };
        if (!insideBangladesh(p.lat, p.lng)) {
          toast.error('Your location is outside Bangladesh. Tap on the map to choose the place.');
          return;
        }
        changeRef.current(p);
        if (mapRef.current) mapRef.current.setView([p.lat, p.lng], 16);
      },
      (err) => {
        setLocating(false);
        toast.error(
          err.code === 1
            ? 'Location permission was denied. You can tap on the map instead.'
            : 'Could not find your location. Tap on the map instead.'
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {locating ? <Loader2 size={16} className="animate-spin" /> : <LocateFixed size={16} />}
          {locating ? 'Finding you...' : 'Use my current location'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="flex items-center gap-1.5 rounded-full border border-slate-300/70 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <Trash2 size={14} /> Remove pin
          </button>
        )}
      </div>

      <div className="relative isolate overflow-hidden rounded-2xl border border-slate-200" style={{ height }}>
        <div ref={holder} className="h-full w-full" />
      </div>

      <p className="mt-2 text-xs text-slate-600">
        {value
          ? `Pin at ${value.lat}, ${value.lng}. Drag the pin to adjust it.`
          : 'Tap the map to drop a pin, or use your current location.'}
      </p>
    </div>
  );
}