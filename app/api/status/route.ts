import { NextResponse } from 'next/server';
import { getStatus, setStatus } from '@/lib/store';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getStatus(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const next = {
    text: String(body.text || '').slice(0, 120),
    emoji: String(body.emoji || 'icon:flower').slice(0, 32),
    mood: String(body.mood || '').slice(0, 40),
    updatedAt: new Date().toISOString(),
  };
  await setStatus(next);
  return NextResponse.json(next);
}
