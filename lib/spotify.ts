// Spotify helper — uses a long-lived refresh token to fetch the currently playing track.
// See README for how to get your refresh token.

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing';
const RECENTLY_PLAYED_ENDPOINT =
  'https://api.spotify.com/v1/me/player/recently-played?limit=1';

async function getAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!;
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to refresh Spotify token');
  return (await res.json()).access_token as string;
}

export async function getNowPlaying() {
  try {
    const token = await getAccessToken();
    const res = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.status === 204 || res.status > 400) {
      return await getRecentlyPlayed(token);
    }
    const song = await res.json();
    if (!song.item) return await getRecentlyPlayed(token);

    return {
      isPlaying: !!song.is_playing,
      title: song.item.name,
      artist: song.item.artists.map((a: any) => a.name).join(', '),
      album: song.item.album.name,
      albumImageUrl: song.item.album.images[0]?.url,
      songUrl: song.item.external_urls.spotify,
      progressMs: song.progress_ms,
      durationMs: song.item.duration_ms,
    };
  } catch {
    return { isPlaying: false };
  }
}

async function getRecentlyPlayed(token: string) {
  const res = await fetch(RECENTLY_PLAYED_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return { isPlaying: false };
  const data = await res.json();
  const item = data.items?.[0]?.track;
  if (!item) return { isPlaying: false };
  return {
    isPlaying: false,
    title: item.name,
    artist: item.artists.map((a: any) => a.name).join(', '),
    album: item.album.name,
    albumImageUrl: item.album.images[0]?.url,
    songUrl: item.external_urls.spotify,
  };
}
