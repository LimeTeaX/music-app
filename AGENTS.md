# Music Dashboard — Project Context

## Tech Stack
- React + TypeScript (Vite 8, strict mode)
- Tailwind CSS v4 (CSS-based config via `@theme`, NOT tailwind.config.js)
- Last.fm API (artist/album metadata, scrobbling stats)
- YouTube Data API v3 (search, quota 10k units/day, ~100 searches)
- YouTube IFrame API (playback, hidden player)

## Data Sources
- **Search**: YouTube Data API (cached 10 min, region=ID)
- **Playback**: YouTube IFrame (play by exact videoId — no name matching)
- **Artist/Album/Tags/Bio**: Last.fm
- **Stats/Library**: Last.fm
- **Liked Songs**: localStorage
- **Thumbnails**: `https://i.ytimg.com/vi/{id}/mqdefault.jpg` (free, no API)

## Key Architecture
- `youtube-api.ts` — IFrame player + YouTube Data API search (with cache)
- `lastfm-api.ts` — 13 Last.fm API methods
- `liked-tracks.ts` — localStorage-based liked songs
- `Player.tsx` — YouTube only, play by videoId, progress polling 500ms
- `useLastFmData.ts` — Fetch 5 Last.fm endpoints with polling

## Critical Config (`.env`)
```
VITE_LASTFM_API_KEY=your_key
VITE_LASTFM_USERNAME=your_username
VITE_YOUTUBE_API_KEY=your_key
```

## Pages
| Route | File | Data Source |
|-------|------|-------------|
| `/`, `/dashboard` | Home | Last.fm |
| `/discover` | Discover | Last.fm |
| `/search` | Search | YouTube API |
| `/stats` | Stats | Last.fm |
| `/artist/:id` | Artist | Last.fm + YouTube play |
| `/album/:artist/:album` | Album | Last.fm + YouTube play |
| `/library` | Library hub | Static |
| `/library/artists` | LibraryArtists | Last.fm |
| `/library/albums` | LibraryAlbums | Last.fm |
| `/library/liked` | LibraryLiked | localStorage |
| `/settings` | Settings | YouTube/Last.fm status |
| `/login` | Login | Last.fm username input |

## History
- **Spotify removed** (June 2026): No more spotify-auth, spotify-api, spotify-player, Callback, Profile. YouTube-only playback.
- **Invidious attempted & reverted**: All public instances had API disabled. Back to YouTube Data API with aggressive cache (10 min TTL, 100 searches/day enough for personal use).
- **TopGenres**: Reduced from 30 → 8 artist calls to avoid Last.fm rate limiting.

## Git
- Branch: `main`
- Remote: `https://github.com/LimeTeaX/music-app.git`

## Deploy
- **Vercel** — env vars: `VITE_LASTFM_API_KEY`, `VITE_LASTFM_USERNAME`, `VITE_YOUTUBE_API_KEY`
- **vercel.json** — SPA routing rewrites
- **YouTube Data API quota** — 10k units/day (100 searches). Enable billing for 1M+ units.

## Sessions
- Chat history tidak tersimpan antar sesi opencode.
- Jangan ubah kode tanpa perintah eksplisit.