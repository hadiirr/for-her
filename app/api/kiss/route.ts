import { NextResponse } from 'next/server';
import { recordKiss, getKisses } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Anyone with the URL can send a kiss (it's the public page button).
// Returns the new total count.
export async function POST() {
  const total = await recordKiss();
  return NextResponse.json({ total });
}

export async function GET() {
  const kisses = await getKisses();
  // Only return last hour for the public ticker; full list isn't needed
  const since = Date.now() - 60 * 60 * 1000;
  const recent = kisses.filter(k => new Date(k.at).getTime() > since);
  return NextResponse.json({ total: kisses.length, recent: recent.length });
}
