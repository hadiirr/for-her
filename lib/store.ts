// Unified data store. Keys: status, config, notes, log, kisses
// Strategy:
//   - production: Vercel KV / Upstash Redis (auto-detected via env vars)
//   - dev / fallback: JSON file in project root (.data.json)
// All read/write goes through this module so the API routes stay simple.

import fs from 'fs';
import path from 'path';

export type Status = {
  text: string;
  emoji: string; // emoji OR icon key (e.g. "icon:laptop")
  mood: string;
  updatedAt: string;
};

export type Config = {
  herName: string;
  countdownLabel: string;
  countdownTarget: string; // ISO datetime
  showMusic: boolean;
  theme: 'blush' | 'lavender' | 'sage' | 'sunset';
};

export type LogEntry = {
  at: string;
  kind: 'status' | 'note' | 'config' | 'kiss';
  summary: string;
};

export type DataShape = {
  status: Status;
  config: Config;
  notes: string[];
  log: LogEntry[];
  kisses: { at: string }[];
};

const DEFAULT: DataShape = {
  status: {
    text: 'thinking of you',
    emoji: 'icon:flower',
    mood: 'soft',
    updatedAt: new Date(0).toISOString(),
  },
  config: {
    herName: 'my love',
    countdownLabel: 'our next date',
    countdownTarget: new Date(Date.now() + 7 * 86400000).toISOString(),
    showMusic: true,
    theme: 'blush',
  },
  notes: [
    'you are my favorite part of every day.',
    'i thought of you three times before coffee.',
    "the world is softer because you're in it.",
    'i love the way you laugh at your own jokes.',
    'thank you for being patient with me when i\'m quiet.',
    'missing you is a full time job and i am employee of the month.',
  ],
  log: [],
  kisses: [],
};

const LOCAL_FILE = path.join(process.cwd(), '.data.json');
let memory: DataShape | null = null;

const useKV = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function kv(command: (string | number)[]) {
  const res = await fetch(process.env.KV_REST_API_URL!, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });
  return res.json();
}

async function loadAll(): Promise<DataShape> {
  if (useKV) {
    try {
      const r = await kv(['GET', 'data']);
      if (r.result) return { ...DEFAULT, ...JSON.parse(r.result) };
    } catch {}
    return DEFAULT;
  }
  if (memory) return memory;
  try {
    if (fs.existsSync(LOCAL_FILE)) {
      memory = { ...DEFAULT, ...JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8')) };
      return memory!;
    }
  } catch {}
  memory = JSON.parse(JSON.stringify(DEFAULT));
  return memory!;
}

async function saveAll(d: DataShape) {
  // cap log at 50 entries to avoid bloat
  d.log = d.log.slice(0, 50);
  d.kisses = d.kisses.slice(0, 100);
  if (useKV) {
    try { await kv(['SET', 'data', JSON.stringify(d)]); } catch {}
    return;
  }
  memory = d;
  try { fs.writeFileSync(LOCAL_FILE, JSON.stringify(d, null, 2)); } catch {}
}

// ---- public API ----

export async function getAll() { return loadAll(); }

export async function getStatus() { return (await loadAll()).status; }
export async function setStatus(s: Status) {
  const d = await loadAll();
  d.status = s;
  d.log = [{ at: s.updatedAt, kind: 'status', summary: `${s.emoji} ${s.text}` }, ...d.log];
  await saveAll(d);
}

export async function getConfig() { return (await loadAll()).config; }
export async function setConfig(c: Partial<Config>) {
  const d = await loadAll();
  d.config = { ...d.config, ...c };
  d.log = [{ at: new Date().toISOString(), kind: 'config', summary: 'updated settings' }, ...d.log];
  await saveAll(d);
  return d.config;
}

export async function getNotes() { return (await loadAll()).notes; }
export async function setNotes(notes: string[]) {
  const d = await loadAll();
  d.notes = notes.map(n => String(n).slice(0, 240)).filter(Boolean).slice(0, 200);
  d.log = [{ at: new Date().toISOString(), kind: 'note', summary: `notes: ${d.notes.length}` }, ...d.log];
  await saveAll(d);
  return d.notes;
}

export async function getLog() { return (await loadAll()).log; }

export async function recordKiss() {
  const d = await loadAll();
  const at = new Date().toISOString();
  d.kisses = [{ at }, ...d.kisses];
  d.log = [{ at, kind: 'kiss', summary: 'a kiss was sent' }, ...d.log];
  await saveAll(d);
  return d.kisses.length;
}

export async function getKisses() { return (await loadAll()).kisses; }

// pick today's note (deterministic per day)
export function todaysNote(notes: string[]) {
  if (!notes.length) return '';
  const d = new Date();
  const dayOfYear = Math.floor(
    (d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return notes[dayOfYear % notes.length];
}
