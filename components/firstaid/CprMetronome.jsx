'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Square, Volume2, VolumeX } from 'lucide-react';

const BPM = 110;
const INTERVAL = 60000 / BPM;

export default function CprMetronome() {
  const [running, setRunning] = useState(false);
  const [sound, setSound] = useState(true);
  const [beat, setBeat] = useState(0);
  const [count, setCount] = useState(0);
  const audioRef = useRef(null);
  const soundRef = useRef(true);
  // eslint-disable-next-line react-hooks/refs
  soundRef.current = sound;

  function click() {
    const ctx = audioRef.current;
    if (!ctx || !soundRef.current) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      return;
    }
  }

  useEffect(() => {
    if (!running) return undefined;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(0);
    const tick = () => {
      setBeat((b) => b + 1);
      setCount((c) => c + 1);
      click();
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(25);
    };

    tick();
    const id = setInterval(tick, INTERVAL);
    return () => clearInterval(id);
  }, [running]);

  function toggle() {
    if (!running && !audioRef.current && typeof window !== 'undefined') {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioRef.current = new Ctx();
    }
    if (!running && audioRef.current && audioRef.current.state === 'suspended') audioRef.current.resume();
    setRunning(!running);
  }

  const inCycle = count === 0 ? 0 : ((count - 1) % 30) + 1;

  return (
    <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-center text-white">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Beat guide, {BPM} pushes a minute</p>

      <div className="relative mx-auto mt-5 flex h-40 w-40 items-center justify-center">
        {running && (
          <motion.span
            key={`ring-${beat}`}
            className="absolute inset-0 rounded-full border-2 border-rose-400"
            initial={{ scale: 0.7, opacity: 0.8 }}
            animate={{ scale: 1.25, opacity: 0 }}
            transition={{ duration: INTERVAL / 1000, ease: 'easeOut' }}
          />
        )}
        <motion.span
          key={`heart-${beat}`}
          initial={{ scale: running ? 0.82 : 1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex h-28 w-28 items-center justify-center rounded-full bg-rose-600 shadow-2xl shadow-rose-600/50"
        >
          <Heart size={48} fill="currentColor" />
        </motion.span>
      </div>

      <p className="mono mt-4 text-3xl font-semibold">{running ? inCycle : '0'}<span className="text-base text-slate-400"> / 30</span></p>
      <p className="mt-1 text-xs text-slate-400">
        {running ? 'Push on every beat. After 30, give 2 breaths if trained, or keep pushing.' : 'Press start, then push on every beat.'}
      </p>

      <div className="mt-5 flex items-center justify-center gap-3">
        <button
          onClick={toggle}
          className={`flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold ${running ? 'bg-white text-slate-900' : 'bg-rose-600 text-white'}`}
        >
          {running ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {running ? 'Stop' : 'Start the beat'}
        </button>
        <button
          onClick={() => setSound(!sound)}
          aria-label={sound ? 'Turn the sound off' : 'Turn the sound on'}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-slate-200 hover:bg-white/10"
        >
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </div>
  );
}