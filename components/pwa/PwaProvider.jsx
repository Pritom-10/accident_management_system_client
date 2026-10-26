'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registerSW } from '../../lib/sw';

const PwaContext = createContext({
  online: true,
  standalone: false,
  ios: false,
  canInstall: false,
  installed: false,
  install: async () => 'unavailable',
});

export const usePwa = () => useContext(PwaContext);

export function PwaProvider({ children }) {
  const [deferred, setDeferred] = useState(null);
  const [standalone, setStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    registerSW();

    const media = window.matchMedia('(display-mode: standalone)');
    const readMode = () => setStandalone(media.matches || window.navigator.standalone === true);
    readMode();
    media.addEventListener('change', readMode);

    const ua = navigator.userAgent || '';
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIos(/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    const beforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const afterInstall = () => {
      setDeferred(null);
      setInstalled(true);
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', afterInstall);

    return () => {
      media.removeEventListener('change', readMode);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', afterInstall);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return 'unavailable';
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    setDeferred(null);
    return outcome;
  }, [deferred]);

  const value = useMemo(
    () => ({ online, standalone, ios, installed, canInstall: Boolean(deferred), install }),
    [online, standalone, ios, installed, deferred, install]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}