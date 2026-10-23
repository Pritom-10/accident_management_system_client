import { useCallback, useEffect, useState } from 'react';
import { insideBangladesh } from './geo';

export function useLocate({ auto = true } = {}) {
  const [state, setState] = useState('idle');
  const [pos, setPos] = useState(null);

  const locate = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState('unavailable');
      return;
    }

    setState('locating');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const lat = Math.round(p.coords.latitude * 100000) / 100000;
        const lng = Math.round(p.coords.longitude * 100000) / 100000;
        if (!insideBangladesh(lat, lng)) {
          setState('outside');
          return;
        }
        setPos({ lat, lng, accuracy: Math.round(p.coords.accuracy) });
        setState('found');
      },
      (err) => setState(err.code === 1 ? 'denied' : 'unavailable'),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (auto) locate();
  }, [auto, locate]);

  return { state, pos, setPos, locate };
}