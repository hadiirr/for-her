'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderStatusGlyph, Icons } from '@/lib/icons';

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
};
type Status = { text: string; emoji: string; mood: string; updatedAt: string };
type Config = {
  herName: string;
  countdownLabel: string;
  countdownTarget: string;
  showMusic: boolean;
  theme: 'blush' | 'lavender' | 'sage' | 'sunset';
};

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
  const target = new Date(targetIso).getTime();
  const diff = Math.max(0, target - now);
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function fmt(ms?: number) {
  if (!ms || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

const SYMBOLS = ['💕', '🩷', '💗', '💓', '💞', '🌸', '✨', '💝', '🫧', '💫'];
const FALLING_HEARTS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  symbol: SYMBOLS[i % SYMBOLS.length],
  left: `${5 + (i * 6) % 90}%`,
  delay: `${((i * 1.3) % 10).toFixed(1)}s`,
  duration: `${(8 + (i * 0.7) % 7).toFixed(1)}s`,
  size: 14 + (i * 3) % 14,
  opacity: (0.18 + (i * 0.04) % 0.22).toFixed(2),
  sway: i % 2 === 0 ? 'sway-left' : 'sway-right',
}));

export default function Home() {
  const [np, setNp] = useState<NowPlaying | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [note, setNote] = useState('');
  const [kissed, setKissed] = useState(false);
  const [liveProgress, setLiveProgress] = useState(0);
  const [lyrics, setLyrics] = useState<string[]>([]);
  const fetchedAtRef = React.useRef<number>(0);

  const target = config?.countdownTarget || new Date(Date.now() + 86400000 * 7).toISOString();
  const { days, hours, minutes, seconds } = useCountdown(target);

  useEffect(() => {
    const load = async () => {
      try {
        const [n, s, c, nt] = await Promise.all([
          fetch('/api/now-playing').then(r => r.json()),
          fetch('/api/status').then(r => r.json()),
          fetch('/api/config').then(r => r.json()),
          fetch('/api/notes?today=1').then(r => r.json()),
        ]);
        setNp(n); setStatus(s); setConfig(c); setNote(nt.note || '');
        fetchedAtRef.current = Date.now();
        setLiveProgress(n?.progressMs || 0);
        if (c?.theme) document.documentElement.setAttribute('data-theme', c.theme);
      } catch {}
    };
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!np?.isPlaying) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - fetchedAtRef.current;
      setLiveProgress((np.progressMs || 0) + elapsed);
    }, 1000);
    return () => clearInterval(tick);
  }, [np]);

  useEffect(() => {
    if (!np?.title || !np?.artist || !np?.isPlaying) { setLyrics([]); return; }
    setLyrics([]);
    fetch(`/api/lyrics?artist=${encodeURIComponent(np.artist)}&title=${encodeURIComponent(np.title)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.lines) setLyrics(d.lines); })
      .catch(() => {});
  }, [np?.title]);

  async function sendKiss(e: React.MouseEvent<HTMLButtonElement>) {
    setKissed(true);
    const r = e.currentTarget.getBoundingClientRect();
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="#e37a92"><path d="M12 21s-7-4.5-7-10a4.5 4.5 0 0 1 8.5-2A4.5 4.5 0 0 1 19 11c0 5.5-7 10-7 10z"/></svg>';
      el.style.cssText = `position:fixed; left:${r.left + r.width/2 + (Math.random()*40-20)}px; top:${r.top}px; pointer-events:none; opacity:0; transition:all 1.6s ease-out; z-index:50;`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.opacity = '1';
        el.style.transform = `translateY(-100px) scale(${1 + Math.random()*0.5})`;
        setTimeout(() => { el.style.opacity = '0'; }, 1100);
      });
      setTimeout(() => el.remove(), 1800);
    }
    fetch('/api/kiss', { method: 'POST' });
    setTimeout(() => setKissed(false), 2000);
  }

  const dateStr = new Date(target).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="blob blob-1" />
      <div className="blob blob-2" />

      {/* falling hearts */}
      {FALLING_HEARTS.map(h => (
        <div
          key={h.id}
          className={`falling-heart ${h.sway}`}
          style={{ left: h.left, animationDelay: h.delay, animationDuration: h.duration, opacity: Number(h.opacity), fontSize: h.size }}
        >
          {h.symbol}
        </div>
      ))}

      <div className="max-w-xl mx-auto p-6 relative z-10">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center pt-8 pb-4">
          <div className="inline-flex items-center gap-2 text-blush-400 mb-3">
            <span className="w-8 h-px bg-blush-300" />
            <Sparkle />
            <span className="font-serif italic text-base">for {config?.herName || 'my love'}</span>
            <Sparkle />
            <span className="w-8 h-px bg-blush-300" />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl text-blush-500 leading-none">
            a little <em className="italic text-blush-400 font-normal">window</em>
          </h1>
          <p className="text-xs text-blush-400/70 tracking-[0.14em] mt-3 lowercase">into what i&apos;m doing, right now</p>
        </motion.header>

        {/* STATUS */}
        <Card delay={0.1} title="right now" pill={status?.updatedAt && fresh(status.updatedAt) ? <LivePill text="online" /> : undefined}>
          <div className="flex items-center gap-4">
            <IconTile>
              <span className="text-blush-500">{renderStatusGlyph(status?.emoji, 32)}</span>
            </IconTile>
            <div className="min-w-0">
              <p className="font-serif text-2xl text-blush-500 leading-tight truncate">{status?.text || 'thinking of you'}</p>
              {status?.mood && <p className="text-sm text-ink/60 mt-0.5">feelin <em className="italic text-blush-400">{status.mood}</em></p>}
              {status?.updatedAt && <p className="text-[11px] text-ink/40 mt-1">updated {timeAgo(status.updatedAt)}</p>}
            </div>
          </div>
        </Card>

        {/* NOW PLAYING */}
        {(config?.showMusic ?? true) && (
          <Card delay={0.2} title={np?.isPlaying ? 'now playing' : 'last played'} pill={np?.isPlaying ? <LivePill text="spotify · live" /> : undefined}>
            <AnimatePresence mode="wait">
              <motion.div key={np?.title || 'none'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-4">
                  {np?.albumImageUrl ? (
                    <img src={np.albumImageUrl} alt={np.album} className="w-[76px] h-[76px] rounded-2xl shadow-md object-cover" />
                  ) : (
                    <IconTile size={76}><Vinyl /></IconTile>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-xl text-blush-500 truncate">{np?.title || 'silent at the moment'}</p>
                    <p className="text-sm text-ink/60 truncate">{np?.artist || 'press play in your heart'}</p>
                  </div>
                </div>
                {np?.isPlaying && np.durationMs && (
                  <div className="mt-4">
                    <div className="h-1.5 bg-blush-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blush-400 to-blush-500 rounded-full"
                        style={{ width: `${Math.min(100, (liveProgress / np.durationMs) * 100)}%`, transition: 'width 1s linear' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-ink/40 mt-1.5 tabular-nums">
                      <span>{fmt(liveProgress)}</span><span>{fmt(np.durationMs)}</span>
                    </div>
                    {lyrics.length > 0 && (() => {
                      const msPerLine = np.durationMs / lyrics.length;
                      const cur = Math.min(Math.floor(liveProgress / msPerLine), lyrics.length - 1);
                      return (
                        <div className="mt-3 text-center space-y-1 px-1">
                          {cur > 0 && <p className="text-[11px] text-ink/30 truncate">{lyrics[cur - 1]}</p>}
                          <p className="text-sm font-medium text-blush-500 truncate">{lyrics[cur]}</p>
                          {cur < lyrics.length - 1 && <p className="text-[11px] text-ink/30 truncate">{lyrics[cur + 1]}</p>}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        )}

        {/* COUNTDOWN */}
        <Card delay={0.3} title={`until ${config?.countdownLabel || 'our next date'}`} pill={
          <span className="inline-flex items-center gap-1.5 text-[11px] text-blush-500 bg-white/40 border border-blush-200 px-2.5 py-0.5 rounded-full">
            <CalendarIcon /> {dateStr}
          </span>
        }>
          <div className="grid grid-cols-4 gap-2">
            {[{v:days,l:'days'},{v:hours,l:'hrs'},{v:minutes,l:'min'},{v:seconds,l:'sec'}].map(x => (
              <div key={x.l} className="text-center bg-white/50 border border-white/70 rounded-xl py-3">
                <p className="font-serif text-3xl md:text-4xl text-blush-500 tabular-nums leading-none">{String(x.v).padStart(2, '0')}</p>
                <p className="text-[10px] uppercase tracking-widest text-ink/45 mt-1.5">{x.l}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* LOVE NOTE */}
        <Card delay={0.4} title="a note for today" center>
          <QuoteMark />
          <p className="font-serif italic text-xl md:text-2xl text-blush-500 leading-relaxed mt-1">{note || 'thinking of you, always.'}</p>
        </Card>

        {/* WATCH TOGETHER */}
        <Card delay={0.45} title="we should watch">
          <div className="flex items-center gap-4">
            <IconTile>
              <span className="text-3xl">📺</span>
            </IconTile>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-xl text-blush-500">The Office</p>
              <p className="text-xs text-ink/55 mt-0.5">michael scott chaos + you = perfect night</p>
            </div>
            <span className="text-[11px] text-blush-400 bg-blush-50 border border-blush-200 px-2.5 py-1 rounded-full whitespace-nowrap">just saying 🤍</span>
          </div>
        </Card>

        {/* SEND A KISS */}
        <Card delay={0.5}>
          <div className="flex items-center gap-4">
            <IconTile><HeartFilled /></IconTile>
            <div className="flex-1">
              <p className="font-serif text-xl text-blush-500">send a kiss</p>
              <p className="text-xs text-ink/55">{kissed ? 'kiss sent! 💌' : 'tap to let me know you\'re here'}</p>
            </div>
            <button onClick={sendKiss}
              className="rounded-full px-5 py-2.5 bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 text-white text-sm font-medium shadow-lg shadow-blush-300/40 transition flex items-center gap-2">
              <HeartFilled size={14} /> send
            </button>
          </div>
        </Card>

        <footer className="text-center pt-3 pb-6">
          <p className="text-[11px] text-ink/40 font-serif italic">made with <HeartFilled size={11} className="inline -mt-0.5 text-blush-400" /> · refreshes every 20s</p>
        </footer>
      </div>
    </main>
  );
}

/* ---------- helpers ---------- */

function Card({ title, pill, children, delay = 0, center = false }: { title?: string; pill?: React.ReactNode; children: React.ReactNode; delay?: number; center?: boolean }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay }}
      className={'glass rounded-3xl p-5 mb-4 ' + (center ? 'text-center' : '')}
    >
      {(title || pill) && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-blush-400 font-medium">{title}</p>
          {pill}
        </div>
      )}
      {children}
    </motion.section>
  );
}

function IconTile({ children, size = 64 }: { children: React.ReactNode; size?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-2xl bg-gradient-to-br from-blush-100 to-blush-200 border border-white/70 flex items-center justify-center shadow-md flex-shrink-0 animate-float"
    >
      {children}
    </div>
  );
}

function LivePill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-blush-500 bg-blush-100 border border-blush-200 px-2.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-blush-400 animate-pulse-soft" />
      {text}
    </span>
  );
}

function Sparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 6h12M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

function QuoteMark() {
  return (
    <svg className="mx-auto text-blush-200" width="28" height="22" viewBox="0 0 28 22" fill="currentColor" aria-hidden="true">
      <path d="M0 22V12C0 5.4 4.5 0.8 11 0v4C7.5 4.6 5 7.4 5 11h6v11H0zm17 0V12c0-6.6 4.5-11.2 11-12v4c-3.5.6-6 3.4-6 7h6v11H17z"/>
    </svg>
  );
}

function HeartFilled({ size = 30, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className || 'text-blush-500'} aria-hidden="true">
      <path d="M12 21s-7-4.5-7-10a4.5 4.5 0 0 1 8.5-2A4.5 4.5 0 0 1 19 11c0 5.5-7 10-7 10z" />
    </svg>
  );
}

function Vinyl() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#4a2a36"/>
      <circle cx="24" cy="24" r="17" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".7"/>
      <circle cx="24" cy="24" r="13" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth=".7"/>
      <circle cx="24" cy="24" r="9" fill="#e37a92"/>
      <circle cx="24" cy="24" r="2.2" fill="#4a2a36"/>
    </svg>
  );
}

function fresh(iso: string) { return Date.now() - new Date(iso).getTime() < 1000 * 60 * 60 * 24; }

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
