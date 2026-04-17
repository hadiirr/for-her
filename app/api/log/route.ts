import { NextResponse } from 'next/server';
import { getLog } from '@/lib/store';
import { isAuthed } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ log: await getLog() });
}
