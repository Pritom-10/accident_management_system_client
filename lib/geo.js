export const BD_CENTER = [23.685, 90.3563];
export const BD_ZOOM = 7;
export const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

export const statusColor = {
  rescue_in_progress: '#E11D48',
  cleared: '#059669',
};

export function insideBangladesh(lat, lng) {
  return lat >= 20.5 && lat <= 26.7 && lng >= 88 && lng <= 92.8;
}

export function pinIcon(L, color) {
  return L.divIcon({
    className: 'ResQ-pin',
    html: `<span style="display:block;width:22px;height:22px;border-radius:9999px;background:${color};border:3px solid #ffffff;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

export function osmLink(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}