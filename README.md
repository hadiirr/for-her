# for-her

A soft, romantic personal status page with a full admin dashboard. Shows your girlfriend:

- what you're **doing right now** (live status with custom SVG icons + mood)
- what you're **listening to** (live from Spotify with a progress bar)
- a **daily love note** (rotates from a list you manage)
- a **countdown** to your next date (configurable label & date)
- a **send-a-kiss** button that pings the server with floating hearts

You manage all of it from `/admin` — a four-tab dashboard with a live preview of her page.

Built with Next.js 14 (App Router), Tailwind, and Framer Motion. Deploys to Vercel in ~5 minutes.

---

## Quick start

```bash
cd for-her
npm install
cp .env.example .env.local
# at minimum, set ADMIN_SECRET
npm run dev
```

- Public page: http://localhost:3000
- Admin: http://localhost:3000/admin

---

## The admin dashboard

Visit `/admin`, enter your `ADMIN_SECRET` once (it's saved per-device in localStorage), and you get four tabs:

### 🩷 status
- **12 quick-tap presets** — coding, coffee, gym, cooking, reading, walking, sleeping, gaming, driving, watching, missing-you, thinking-of-you
- **Custom builder** — pick from the 12 SVG icons or type a single emoji, write a status line (≤120 chars) and a mood word
- Live "current" card at top showing exactly what she sees

### 📖 notes
- Add unlimited daily love notes (rotates one per day, deterministic by day-of-year so today's note matches across devices)
- The note showing **today** is highlighted in pink
- Reorder with ↑/↓ buttons, edit inline, delete with ✕
- Notes are stored as a list and changes persist immediately

### 🌸 settings
- Her name (header text)
- Countdown label + date/time picker
- Toggle the now-playing card on/off (useful if Spotify isn't set up)
- Theme picker (blush, lavender, sage, sunset — currently scaffolded; ships with blush)

### 🚶 activity
- Total kisses sent (all-time + last hour)
- Recent activity log: every status change, note edit, settings save, and kiss

### Live preview
On wide screens an iframe of `/` is pinned to the right side so you can see your edits land in real time.

### Pro tip
On your phone, visit `/admin` in Safari/Chrome → Share → **Add to Home Screen**. Now updating your status takes one tap from your home screen.

---

## Setting up Spotify (now-playing)

You need three values in `.env.local`: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`.

1. Create an app at the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard). Copy Client ID & Secret.
2. Add `http://localhost:3000/callback` as a Redirect URI in app settings.
3. Get a refresh token. Open this in your browser (replace `YOUR_CLIENT_ID`):
   ```
   https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=user-read-currently-playing%20user-read-recently-played
   ```
   Authorize → you'll be redirected to `localhost:3000/callback?code=XXXX`. Copy the code.
4. Exchange it:
   ```bash
   curl -X POST https://accounts.spotify.com/api/token \
     -u "CLIENT_ID:CLIENT_SECRET" \
     -d grant_type=authorization_code \
     -d code=XXXX \
     -d redirect_uri=http://localhost:3000/callback
   ```
   The JSON has `refresh_token`. Paste it into `.env.local`. (Refresh tokens don't expire.)

---

## Storage

| Where        | What it uses                                     |
| ------------ | ------------------------------------------------ |
| Local dev    | `.data.json` in the project root                 |
| Production   | Vercel KV (Upstash Redis) if env vars are set    |
| Fallback     | In-memory (resets on cold start — dev only)      |

To enable persistent storage on Vercel:
1. Project → **Storage** → **Create** → **KV**
2. Connect it to the project (sets `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically)
3. Redeploy. The store auto-detects.

---

## API reference

| Endpoint            | Method | Auth        | What it does                          |
| ------------------- | ------ | ----------- | ------------------------------------- |
| `/api/status`       | GET    | public      | Current status                        |
| `/api/status`       | POST   | admin       | Update status                         |
| `/api/now-playing`  | GET    | public      | Current Spotify track                 |
| `/api/notes?today=1`| GET    | public      | Today's love note only                |
| `/api/notes`        | GET    | admin       | Full notes array                      |
| `/api/notes`        | POST   | admin       | Replace notes array                   |
| `/api/config`       | GET    | public      | Public config (name, countdown, etc.) |
| `/api/config`       | POST   | admin       | Update config                         |
| `/api/log`          | GET    | admin       | Activity log                          |
| `/api/kiss`         | POST   | public      | Record a kiss                         |
| `/api/kiss`         | GET    | public      | Kiss totals                           |

Admin auth = `x-admin-secret` header matching `process.env.ADMIN_SECRET`.

You can update status from anywhere with a simple curl, an iOS Shortcut, or a Raycast snippet:
```bash
curl -X POST https://yoursite.com/api/status \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"emoji":"icon:gym","text":"at the gym","mood":"hyped"}'
```

---

## Deploy to Vercel

1. Push the folder to a GitHub repo
2. Import into Vercel
3. Add every variable from `.env.example` to **Project Settings → Environment Variables**
4. Deploy

Send her the URL. 💌
