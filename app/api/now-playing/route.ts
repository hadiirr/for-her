import { NextResponse } from 'next/server';
import { getNowPlaying } from '@/lib/spotify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const data = await getNowPlaying();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
