import { NextResponse } from 'next/server';
import { getNotes, setNotes, todaysNote } from '@/lib/store';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const notes = await getNotes();
  if (url.searchParams.get('today') === '1') {
    return NextResponse.json({ note: todaysNote(notes) }, { headers: { 'Cache-Control': 'no-store' } });
  }
  if (!isAuthed(req)) {
    // public can only see today's; full list is admin-only
    return NextResponse.json({ note: todaysNote(notes) });
  }
  return NextResponse.json({ notes });
}

export async function POST(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const notes = Array.isArray(body.notes) ? body.notes : [];
  return NextResponse.json({ notes: await setNotes(notes) });
}
