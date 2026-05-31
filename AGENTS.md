# Music Dashboard — Project Context

## Tech Stack
- React + TypeScript (Vite 8, strict mode)
- Tailwind CSS v4 (CSS-based config via `@theme`, NOT tailwind.config.js)
- Last.fm API (scrobbling data, artist/album info, search)
- YouTube IFrame API (playback fallback)
- Spotify Web API (PKCE auth, playback, user data)

## Data Sources (Dual-Mode)
- **Spotify connected**: Profile, Stats, Library artists/albums → Spotify API
- **Spotify disconnected**: Falls back to Last.fm data (user has 0 scrobbles)
- **Artist/Album info, tags, search**: Always Last.fm (Spotify doesn't have these)
- **Playback**: Spotify priority, YouTube fallback

## Key Architecture
- `spotify-auth.ts` — PKCE flow, token refresh, `getValidToken()`
- `spotify-api.ts` — REST API wrapper (`/me`, `/me/top/*`, playback control)
- `spotify-player.ts` — Web Playback SDK manager
- `youtube-api.ts` — IFrame player + search (with `videoDuration` = medium/short)
- `liked-tracks.ts` — localStorage-based liked songs

## Critical Config
- `.env` is gitignored — must be set manually or via Vercel env vars
- Spotify Dashboard redirect URI must match deployed URL exactly
- YouTube API key is set in .env (works locally)
- Session data (spotify tokens, liked tracks) stored in localStorage

## Pages
| Route | File | Data Source |
|-------|------|-------------|
| `/` | Home | Last.fm (hero, discover, recent) |
| `/dashboard` | Home (same) | — |
| `/discover` | Discover | Last.fm |
| `/search` | Search | Last.fm (artists/albums/tracks) |
| `/stats` | Stats | Spotify or Last.fm |
| `/artist/:id` | Artist | Last.fm |
| `/album/:artist/:album` | Album | Last.fm |
| `/library` | Library hub | Static |
| `/library/artists` | LibraryArtists | Spotify or Last.fm |
| `/library/albums` | LibraryAlbums | Spotify or Last.fm |
| `/library/liked` | LibraryLiked | localStorage |
| `/profile` | Profile | Spotify only |
| `/settings` | Settings | Spotify connect/disconnect |
| `/login` | Login | UI only |
| `/callback` | Callback | Spotify OAuth callback |

## Git
- Branch: `main`
- Remote: `https://github.com/LimeTeaX/music-app.git`

## Deploy
- **Vercel** — env vars di Vercel Dashboard: `VITE_LASTFM_API_KEY`, `VITE_LASTFM_USERNAME`, `VITE_YOUTUBE_API_KEY`, `VITE_SPOTIFY_CLIENT_ID`
- **vercel.json** — required for SPA routing (`rewrites` → `index.html`)
- **Spotify Dashboard** → Redirect URI = `https://[domain]/callback` (wajib `/callback`)
- **Refresh 404 fix**: vercel.json rewrite all routes to index.html

## Sessions
- Chat history tidak tersimpan antar sesi opencode. Baca AGENTS.md + DOCUMENTATION.md untuk konteks lengkap.
- Jangan ubah kode tanpa perintah eksplisit.
