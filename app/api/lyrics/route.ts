import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Spotify titles/artists are messier than what lyrics.ovh expects, so we try
// progressively cleaned variants until one matches.
function primaryArtist(artist: string) {
  return artist.split(/,|&|\bfeat\.?\b|\bft\.?\b|\bwith\b/i)[0].trim();
}

function cleanTitle(title: string) {
  return title
    .replace(/\s*[([][^)\]]*(feat\.?|ft\.?|with|remaster|live|version|edit|mix|deluxe|mono|stereo|bonus)[^)\]]*[)\]]/gi, '')
    .replace(/\s+-\s+.*$/, '') // "Song - Remastered 2011", "Song - Radio Edit"
    .trim();
}

async function lookup(artist: string, title: string): Promise<string[] | null> {
  try {
    const res = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error || !data.lyrics) return null;
    const lines = String(data.lyrics)
      .split('\n')
      .map((l: string) => l.replace(/\r/g, '').trim())
      // lyrics.ovh sometimes prefixes a "Paroles de la chanson … par …" header
      .filter((l: string, i: number) => l.length > 0 && !(i === 0 && /^paroles de la chanson/i.test(l)));
    return lines.length > 0 ? lines : null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const artist = req.nextUrl.searchParams.get('artist') || '';
  const title  = req.nextUrl.searchParams.get('title')  || '';
  if (!artist || !title) return NextResponse.json({ error: 'missing params' }, { status: 400 });

  const a1 = primaryArtist(artist);
  const t1 = cleanTitle(title);
  const candidates: [string, string][] = [];
  for (const c of [[a1, title], [a1, t1], [artist, title], [artist, t1]] as [string, string][]) {
    if (c[0] && c[1] && !candidates.some(x => x[0] === c[0] && x[1] === c[1])) candidates.push(c);
  }

  for (const [a, t] of candidates) {
    const lines = await lookup(a, t);
    if (lines) return NextResponse.json({ lines });
  }
  return NextResponse.json({ error: 'not found' }, { status: 404 });
}
