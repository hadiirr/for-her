import { NextResponse } from 'next/server';
import { getConfig, setConfig } from '@/lib/store';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(await getConfig(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const cleaned: any = {};
  if (typeof body.herName === 'string') cleaned.herName = body.herName.slice(0, 40);
  if (typeof body.countdownLabel === 'string') cleaned.countdownLabel = body.countdownLabel.slice(0, 60);
  if (typeof body.countdownTarget === 'string') cleaned.countdownTarget = body.countdownTarget;
  if (typeof body.togetherSince === 'string') cleaned.togetherSince = body.togetherSince.slice(0, 30);
  if (typeof body.watchTitle === 'string') cleaned.watchTitle = body.watchTitle.slice(0, 60);
  if (typeof body.watchNote === 'string') cleaned.watchNote = body.watchNote.slice(0, 120);
  if (typeof body.secretMessage === 'string') cleaned.secretMessage = body.secretMessage.slice(0, 300);
  if (typeof body.showMusic === 'boolean') cleaned.showMusic = body.showMusic;
  if (['blush','lavender','sage','sunset'].includes(body.theme)) cleaned.theme = body.theme;
  return NextResponse.json(await setConfig(cleaned));
}
