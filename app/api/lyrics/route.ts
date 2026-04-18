import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get('artist') || '';
  const title  = req.nextUrl.searchParams.get('title')  || '';
  if (!artist || !title) return NextResponse.json({ error: 'missing params' }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
    const data = await res.json();
    if (data.error || !data.lyrics) return NextResponse.json({ error: 'not found' }, { status: 404 });

    // clean up lyrics: remove blank lines, trim
    const lines = data.lyrics
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    return NextResponse.json({ lines });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
