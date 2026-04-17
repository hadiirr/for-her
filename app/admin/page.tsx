'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Icons, ICON_LIST, IconKey, renderStatusGlyph } from '@/lib/icons';

type Status = { text: string; emoji: string; mood: string; updatedAt: string };
type Config = {
  herName: string;
  countdownLabel: string;
  countdownTarget: string;
  showMusic: boolean;
  theme: 'blush' | 'lavender' | 'sage' | 'sunset';
};
type LogEntry = { at: string; kind: string; summary: string };

const STATUS_PRESETS: { icon: IconKey; text: string; mood: string }[] = [
  { icon: 'laptop',  text: 'deep in code', mood: 'focused' },
  { icon: 'coffee',  text: 'coffee and slow morning', mood: 'cozy' },
  { icon: 'gym',     text: 'at the gym', mood: 'hyped' },
  { icon: 'cooking', text: 'cooking dinner', mood: 'happy' },
  { icon: 'book',    text: 'reading', mood: 'quiet' },
  { icon: 'walk',    text: 'out for a walk', mood: 'clearheaded' },
  { icon: 'sleep',   text: 'winding down', mood: 'sleepy' },
  { icon: 'flower',  text: 'thinking of you', mood: 'in love' },
  { icon: 'game',    text: 'gaming', mood: 'playful' },
  { icon: 'car',     text: 'on the road', mood: 'wandering' },
  { icon: 'film',    text: 'watching a movie', mood: 'chill' },
  { icon: 'heart',   text: 'missing you', mood: 'tender' },
];

type Tab = 'status' | 'notes' | 'settings' | 'log';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('status');
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<any>(null);

  // load saved secret
  useEffect(() => {
    const s = typeof window !== 'undefined' ? localStorage.getItem('admin_secret') || '' : '';
    setSecret(s);
    if (s) verify(s);
  }, []);

  function flash(msg: string) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }

  async function verify(s: string) {
    // try a known admin-only endpoint
    const r = await fetch('/api/log', { headers: { 'x-admin-secret': s } });
    if (r.ok) {
      setAuthed(true);
      localStorage.setItem('admin_secret', s);
    } else {
      setAuthed(false);
      flash('wrong secret');
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass w-full max-w-sm rounded-3xl p-8 space-y-5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blush-100 text-blush-500 mb-3">
              <Icons.heart size={28} />
            </div>
            <h1 className="font-serif text-3xl text-blush-500">admin</h1>
            <p className="text-sm text-blush-400/80 mt-1">enter your secret to continue</p>
          </div>
          <input
            type="password"
            autoFocus
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && verify(secret)}
            placeholder="admin secret"
            className="w-full rounded-xl px-4 py-3 bg-white/70 border border-blush-200 outline-none focus:border-blush-400"
          />
          <button
            onClick={() => verify(secret)}
            className="w-full rounded-xl py-3 bg-blush-400 hover:bg-blush-500 text-white font-medium transition shadow-md"
          >
            unlock
          </button>
          {toast && <p className="text-center text-sm text-blush-500">{toast}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <Header onLock={() => { localStorage.removeItem('admin_secret'); setAuthed(false); }} />
        <Tabs tab={tab} setTab={setTab} />

        <div className="grid md:grid-cols-[1fr_360px] gap-4 mt-4">
          <div>
            {tab === 'status'   && <StatusTab secret={secret} flash={flash} />}
            {tab === 'notes'    && <NotesTab secret={secret} flash={flash} />}
            {tab === 'settings' && <SettingsTab secret={secret} flash={flash} />}
            {tab === 'log'      && <LogTab secret={secret} />}
          </div>
          <aside className="hidden md:block">
            <PreviewPanel />
          </aside>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass rounded-full px-5 py-2 text-sm text-blush-500 shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </main>
  );
}

/* ---------- header + tabs ---------- */

function Header({ onLock }: { onLock: () => void }) {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blush-100 text-blush-500 flex items-center justify-center">
          <Icons.heart size={22} />
        </div>
        <div>
          <h1 className="font-serif text-2xl text-blush-500 leading-none">admin</h1>
          <p className="text-xs text-blush-400/70 mt-0.5">manage what she sees</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <a href="/" target="_blank" className="text-sm text-blush-500 hover:text-blush-600 px-3 py-1.5 rounded-full hover:bg-white/60 transition">
          view live ↗
        </a>
        <button onClick={onLock} className="text-sm text-blush-400 hover:text-blush-500 px-3 py-1.5 rounded-full hover:bg-white/60 transition">
          lock
        </button>
      </div>
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; Icon: any }[] = [
    { id: 'status',   label: 'status',   Icon: Icons.heart },
    { id: 'notes',    label: 'notes',    Icon: Icons.book },
    { id: 'settings', label: 'settings', Icon: Icons.flower },
    { id: 'log',      label: 'activity', Icon: Icons.walk },
  ];
  return (
    <div className="glass rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={
            'flex-1 min-w-[100px] px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition ' +
            (tab === t.id
              ? 'bg-white text-blush-500 shadow-sm'
              : 'text-blush-400 hover:text-blush-500')
          }
        >
          <t.Icon size={16} /> {t.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- STATUS TAB ---------- */

function StatusTab({ secret, flash }: { secret: string; flash: (m: string) => void }) {
  const [current, setCurrent] = useState<Status | null>(null);
  const [emoji, setEmoji] = useState<string>('icon:flower');
  const [text, setText] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then((s) => {
      setCurrent(s);
      setEmoji(s.emoji); setText(s.text); setMood(s.mood);
    });
  }, []);

  async function save() {
    setSaving(true);
    const r = await fetch('/api/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ emoji, text, mood }),
    });
    setSaving(false);
    if (r.ok) {
      const s = await r.json();
      setCurrent(s);
      flash('status updated ✓');
    } else flash('failed');
  }

  return (
    <div className="space-y-4">
      <Card title="current">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blush-100 to-blush-200 text-blush-500 flex items-center justify-center">
            {renderStatusGlyph(current?.emoji, 32)}
          </div>
          <div>
            <p className="font-serif text-2xl text-blush-500">{current?.text || '—'}</p>
            <p className="text-sm text-blush-400/80 italic">feeling {current?.mood || '—'}</p>
            <p className="text-xs text-blush-400/60 mt-1">
              {current?.updatedAt ? new Date(current.updatedAt).toLocaleString() : ''}
            </p>
          </div>
        </div>
      </Card>

      <Card title="quick presets">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {STATUS_PRESETS.map((p) => {
            const I = Icons[p.icon];
            return (
              <button
                key={p.text}
                onClick={() => { setEmoji(`icon:${p.icon}`); setText(p.text); setMood(p.mood); }}
                className="group rounded-xl bg-white/60 hover:bg-white border border-white/80 p-3 text-left transition"
              >
                <div className="text-blush-500 mb-1.5"><I size={24} /></div>
                <p className="text-xs text-blush-500 leading-tight">{p.text}</p>
                <p className="text-[10px] text-blush-400/70 italic">{p.mood}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="custom">
        <div className="space-y-3">
          <div>
            <Label>icon</Label>
            <div className="flex gap-2 flex-wrap">
              {ICON_LIST.map(({ key }) => {
                const I = Icons[key];
                const selected = emoji === `icon:${key}`;
                return (
                  <button key={key}
                    onClick={() => setEmoji(`icon:${key}`)}
                    className={'w-11 h-11 rounded-xl flex items-center justify-center border transition ' +
                      (selected ? 'bg-blush-400 text-white border-blush-400 shadow' : 'bg-white/60 text-blush-500 border-white/80 hover:bg-white')}
                  >
                    <I size={20} />
                  </button>
                );
              })}
              <input
                value={emoji.startsWith('icon:') ? '' : emoji}
                onChange={(e) => setEmoji(e.target.value || 'icon:flower')}
                placeholder="or emoji"
                className="w-20 rounded-xl px-2 bg-white/60 border border-white/80 text-center text-xl"
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <Label>what are you doing?</Label>
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={120}
              className="w-full rounded-xl px-3 py-2.5 bg-white/70 border border-blush-200 focus:border-blush-400 outline-none"
              placeholder="e.g. building this site for you" />
            <p className="text-[10px] text-blush-400/60 mt-1 text-right">{text.length}/120</p>
          </div>

          <div>
            <Label>mood</Label>
            <input value={mood} onChange={(e) => setMood(e.target.value)} maxLength={40}
              className="w-full rounded-xl px-3 py-2.5 bg-white/70 border border-blush-200 focus:border-blush-400 outline-none"
              placeholder="e.g. focused, cozy, tender" />
          </div>

          <button onClick={save} disabled={saving || !text}
            className="w-full rounded-xl py-3 bg-gradient-to-r from-blush-400 to-blush-500 hover:from-blush-500 hover:to-blush-600 disabled:opacity-40 text-white font-medium transition shadow-md">
            {saving ? 'saving…' : 'update status'}
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ---------- NOTES TAB ---------- */

function NotesTab({ secret, flash }: { secret: string; flash: (m: string) => void }) {
  const [notes, setNotes] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/notes', { headers: { 'x-admin-secret': secret } })
      .then(r => r.json()).then(d => setNotes(d.notes || []));
  }, [secret]);

  const todayIdx = useMemo(() => {
    if (!notes.length) return -1;
    const d = new Date();
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % notes.length;
  }, [notes]);

  async function persist(next: string[]) {
    setSaving(true);
    const r = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ notes: next }),
    });
    setSaving(false);
    if (r.ok) { setNotes((await r.json()).notes); flash('notes saved ✓'); }
    else flash('failed');
  }

  function add() {
    if (!draft.trim()) return;
    persist([draft.trim(), ...notes]);
    setDraft('');
  }
  function update(i: number, value: string) {
    const next = [...notes]; next[i] = value; setNotes(next);
  }
  function remove(i: number) {
    if (!confirm('delete this note?')) return;
    persist(notes.filter((_, j) => j !== i));
  }
  function move(i: number, dir: -1 | 1) {
    const next = [...notes];
    const target = i + dir;
    if (target < 0 || target >= next.length) return;
    [next[i], next[target]] = [next[target], next[i]];
    persist(next);
  }

  return (
    <div className="space-y-4">
      <Card title="add a new note">
        <div className="space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="something sweet…" rows={2} maxLength={240}
            className="w-full rounded-xl px-3 py-2.5 bg-white/70 border border-blush-200 focus:border-blush-400 outline-none resize-none" />
          <div className="flex justify-between items-center">
            <p className="text-[11px] text-blush-400/70">notes rotate one per day. {notes.length} total.</p>
            <button onClick={add} disabled={!draft.trim()}
              className="rounded-xl px-4 py-2 bg-blush-400 hover:bg-blush-500 disabled:opacity-40 text-white text-sm font-medium transition">
              add
            </button>
          </div>
        </div>
      </Card>

      <Card title={`all notes (${notes.length})`}>
        {notes.length === 0 && <p className="text-sm text-blush-400/70 italic">no notes yet — add one above.</p>}
        <div className="space-y-2">
          {notes.map((n, i) => (
            <div key={i} className={
              'rounded-xl p-3 border transition ' +
              (i === todayIdx ? 'bg-blush-100/80 border-blush-300' : 'bg-white/60 border-white/80')
            }>
              <div className="flex items-start gap-2">
                {i === todayIdx && <span className="text-[10px] uppercase tracking-widest text-blush-500 mt-1">today</span>}
                <textarea value={n} onChange={(e) => update(i, e.target.value)}
                  onBlur={(e) => e.target.value !== notes[i] || persist([...notes])}
                  rows={2}
                  className="flex-1 bg-transparent outline-none resize-none text-sm text-blush-500 font-serif italic" />
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(i, -1)} className="text-blush-400/70 hover:text-blush-500 text-xs">↑</button>
                  <button onClick={() => move(i, +1)} className="text-blush-400/70 hover:text-blush-500 text-xs">↓</button>
                  <button onClick={() => remove(i)} className="text-blush-400/70 hover:text-red-500 text-xs">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {notes.length > 0 && (
          <button onClick={() => persist(notes)} disabled={saving}
            className="mt-3 w-full rounded-xl py-2.5 bg-white/70 hover:bg-white border border-blush-200 text-sm text-blush-500 transition">
            {saving ? 'saving…' : 'save edits'}
          </button>
        )}
      </Card>
    </div>
  );
}

/* ---------- SETTINGS TAB ---------- */

function SettingsTab({ secret, flash }: { secret: string; flash: (m: string) => void }) {
  const [c, setC] = useState<Config | null>(null);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then((cfg) => {
      setC(cfg);
      if (cfg?.theme) document.documentElement.setAttribute('data-theme', cfg.theme);
    });
  }, []);

  async function save() {
    if (!c) return;
    const r = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify(c),
    });
    if (r.ok) { const updated = await r.json(); setC(updated); document.documentElement.setAttribute('data-theme', updated.theme); flash('settings saved ✓'); } else flash('failed');
  }

  if (!c) return <Card title="settings"><p className="text-sm text-blush-400">loading…</p></Card>;

  const localValue = c.countdownTarget ? c.countdownTarget.slice(0, 16) : '';

  return (
    <div className="space-y-4">
      <Card title="who's it for">
        <Label>her name</Label>
        <input value={c.herName} onChange={(e) => setC({ ...c, herName: e.target.value })}
          className="w-full rounded-xl px-3 py-2.5 bg-white/70 border border-blush-200 outline-none focus:border-blush-400" />
      </Card>

      <Card title="countdown">
        <Label>label</Label>
        <input value={c.countdownLabel} onChange={(e) => setC({ ...c, countdownLabel: e.target.value })}
          className="w-full rounded-xl px-3 py-2.5 bg-white/70 border border-blush-200 outline-none focus:border-blush-400 mb-3" />
        <Label>date & time</Label>
        <input type="datetime-local" value={localValue}
          onChange={(e) => setC({ ...c, countdownTarget: e.target.value })}
          className="w-full rounded-xl px-3 py-2.5 bg-white/70 border border-blush-200 outline-none focus:border-blush-400" />
      </Card>

      <Card title="modules">
        <Toggle
          label="show now-playing card"
          desc="needs Spotify env vars set"
          checked={c.showMusic}
          onChange={(v) => setC({ ...c, showMusic: v })}
        />
      </Card>

      <Card title="theme">
        <div className="grid grid-cols-4 gap-2">
          {(['blush','lavender','sage','sunset'] as const).map(t => (
            <button key={t}
              onClick={() => setC({ ...c, theme: t })}
              className={'rounded-xl py-3 text-xs capitalize border transition ' +
                (c.theme === t ? 'border-blush-400 bg-white shadow-sm text-blush-500' : 'border-white/80 bg-white/50 text-blush-400 hover:bg-white')}>
              <div className={'w-full h-6 rounded-md mb-1.5 ' + ({
                blush:    'bg-gradient-to-r from-pink-200 to-pink-300',
                lavender: 'bg-gradient-to-r from-purple-200 to-purple-300',
                sage:     'bg-gradient-to-r from-green-200 to-green-300',
                sunset:   'bg-gradient-to-r from-orange-200 to-pink-300',
              })[t]} />
              {t}
            </button>
          ))}
        </div>
      </Card>

      <button onClick={save}
        className="w-full rounded-xl py-3 bg-gradient-to-r from-blush-400 to-blush-500 text-white font-medium shadow-md">
        save settings
      </button>
    </div>
  );
}

/* ---------- LOG TAB ---------- */

function LogTab({ secret }: { secret: string }) {
  const [log, setLog] = useState<LogEntry[]>([]);
  const [kisses, setKisses] = useState<{ total: number; recent: number }>({ total: 0, recent: 0 });

  useEffect(() => {
    fetch('/api/log', { headers: { 'x-admin-secret': secret } })
      .then(r => r.json()).then(d => setLog(d.log || []));
    fetch('/api/kiss').then(r => r.json()).then(setKisses);
  }, [secret]);

  return (
    <div className="space-y-4">
      <Card title="kisses">
        <div className="flex items-center gap-6">
          <div>
            <p className="font-serif text-4xl text-blush-500">{kisses.total}</p>
            <p className="text-xs text-blush-400/70 uppercase tracking-widest">all time</p>
          </div>
          <div>
            <p className="font-serif text-4xl text-blush-500">{kisses.recent}</p>
            <p className="text-xs text-blush-400/70 uppercase tracking-widest">last hour</p>
          </div>
        </div>
      </Card>

      <Card title="activity">
        {log.length === 0 && <p className="text-sm text-blush-400/70 italic">no activity yet.</p>}
        <ul className="space-y-2">
          {log.map((e, i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-white/50 px-3 py-2 border border-white/70">
              <span className={
                'text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ' +
                (e.kind === 'kiss' ? 'bg-blush-200 text-blush-600' :
                 e.kind === 'status' ? 'bg-blush-100 text-blush-500' :
                 e.kind === 'note' ? 'bg-cream text-blush-500 border border-blush-200' :
                 'bg-white text-blush-400 border border-blush-200')
              }>{e.kind}</span>
              <span className="text-sm text-blush-500 flex-1 truncate">{e.summary}</span>
              <span className="text-xs text-blush-400/60 whitespace-nowrap">
                {timeAgo(e.at)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- LIVE PREVIEW PANEL ---------- */

function PreviewPanel() {
  return (
    <div className="sticky top-4">
      <p className="text-[10px] uppercase tracking-widest text-blush-400/70 mb-2 text-center">live preview</p>
      <div className="rounded-3xl overflow-hidden border border-white/80 shadow-xl bg-white/40">
        <iframe src="/" className="w-full h-[640px] block" />
      </div>
      <p className="text-[10px] text-center text-blush-400/60 mt-2">refreshes when she loads the page</p>
    </div>
  );
}

/* ---------- shared bits ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-blush-400 mb-3 font-medium">{title}</p>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] uppercase tracking-widest text-blush-400/80 mb-1.5">{children}</p>;
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
      <div>
        <p className="text-sm text-blush-500">{label}</p>
        {desc && <p className="text-xs text-blush-400/70">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={'relative w-11 h-6 rounded-full transition ' + (checked ? 'bg-blush-400' : 'bg-blush-200')}>
        <span className={'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition ' + (checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
