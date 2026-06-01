# Music Dashboard — Dokumentasi Lengkap

## Tech Stack
- **Frontend**: React + TypeScript (Vite 8, strict mode)
- **Styling**: Tailwind CSS v4 (`@theme` CSS config, BUKAN tailwind.config.js)
- **Data Sources**:
  - Last.fm API (artis, album, tags, bio, scrobbling stats)
  - YouTube Data API v3 (search, quota 10k units/day)
  - YouTube IFrame API (playback — hidden player, play by exact videoId)

---

## Project Timeline & Perubahan

### 1. Tata Letak (Layout)
**Masalah**: Konten halaman penuh sesak, padding dan margin tidak konsisten.
**Root Cause**: CSS Cascade Layers di Tailwind v4 — kode CSS tanpa `@layer` override utility classes.
**Fix**: Semua custom CSS dipindah ke `@layer base` atau `@layer utilities` di `src/index.css`.

### 2. Data Last.fm
**File**: `src/lib/lastfm-api.ts`
- 13 method: `getUserInfo`, `getRecentTracks`, `getTopArtists`, `getTopTracks`, `getTopAlbums`, `getAlbumInfo`, `getArtistInfo`, `getArtistTopAlbums`, `getArtistTopTracks`, `getSimilarArtists`, `getWeeklyTrackChart`, `searchAlbum`, `searchTrack`

### 3. YouTube Playback (Primary)
**File**: `src/lib/youtube-api.ts`
- YouTube IFrame API tersembunyi (0x0 px)
- **Play by videoId langsung** — sudah punya ID dari search, tidak perlu name-based search
- Play/pause/seek/volume/mute
- Progress polling `getCurrentTime()` / `getDuration()` tiap 500ms
- `requestPlayTrack(title, artist, videoId, thumbnail)` → dispatch `CustomEvent('play-track')`
- `requestPlayTrackByName(title, artist)` → search YouTube dulu baru play

### 4. YouTube Search
**File**: `src/lib/youtube-api.ts` → `searchVideos()`, `searchVideo()`, `searchVideoBest()`
- YouTube Data API v3 dengan **cache 10 menit** (in-memory Map)
- `regionCode=ID` untuk hasil relevan Indonesia
- Quota: 100 search/hari (cukup untuk personal dengan cache)
- Thumbnail dari `https://i.ytimg.com/vi/{id}/mqdefault.jpg` (gratis, tanpa API)

### 5. Halaman Search (`/search`)
**File**: `src/pages/Search.tsx`
- Search via YouTube Data API
- Hasil video dengan thumbnail, title (auto-cleaned dari suffix "Official Audio" dll), channel name
- Click → play langsung dengan videoId (exact match)
- Debounce 400ms

### 6. Halaman Artist (`/artist/:id`)
**File**: `src/pages/Artist.tsx`
- Header: gambar Last.fm, nama, listeners, scrobbles, tags, bio
- Top tracks list → click → `requestPlayTrackByName()` (search YouTube + play)
- Albums grid → click → navigate ke `/album/:artist/:name`
- Similar artists grid → click → navigate

### 7. Halaman Album (`/album/:artist/:album`)
**File**: `src/pages/Album.tsx`
- Cover image Last.fm, metadata, tags, wiki
- Track list → click → `requestPlayTrackByName()`

### 8. Halaman Library
- **Library hub** (`/library`) — 3 card navigasi ke sub-pages
- **Library Artists** (`/library/artists`) — Last.fm top artists grid
- **Library Albums** (`/library/albums`) — Last.fm top albums grid
- **Library Liked** (`/library/liked`) — localStorage liked songs

### 9. Halaman Stats (`/stats`)
**File**: `src/pages/Stats.tsx`
- Summary cards (tracks, artists, albums count)
- Weekly activity bar chart (dari Last.fm recent tracks dates)
- Top artists list + top albums list
- TopGenres + ListeningHeatmap components
- **Last.fm only** (dual-mode Spotify dihapus)

### 10. TopGenres
**File**: `src/components/TopGenres.tsx`
- Dulu: loop 30 artists → 30x `getArtistInfo()` (sering rate limited)
- Sekarang: loop 8 artists saja, error state jika gagal

### 11. ListeningHeatmap
**File**: `src/components/ListeningHeatmap.tsx`
- Fetch 200 recent tracks → plot jam dengar per-hari
- Cancel-safe + error state

### 12. Player Component
**File**: `src/components/layout/Player.tsx`
- **YouTube only** — Spotify dihapus total
- Play by exact videoId
- Volume persist di localStorage (`yt_volume`)
- Like/unlike jantung
- Thumbnail cover art dari parameter event
- Badge "YouTube"

### 13. Liked Songs
**File**: `src/lib/liked-tracks.ts`
- localStorage key `liked_tracks`
- `getLikedTracks()`, `isTrackLiked()`, `toggleLike()`
- Player heart icon → toggle
- Library Liked → list dengan unlike button

### 14. Halaman Settings
**File**: `src/pages/Settings.tsx`
- YouTube status card (selalu connected selama API key terisi)
- Last.fm status card (menampilkan username)

### 15. Env Configuration
**File**: `.env` (gitignored)
```env
VITE_LASTFM_API_KEY=your_key
VITE_LASTFM_USERNAME=your_username
VITE_YOUTUBE_API_KEY=your_key
```

### 16. Routing
**File**: `src/App.tsx`
- `/login` — tanpa sidebar/player
- `/*` — semua halaman dengan Sidebar + Player
- Route order: `/` → Home, `/discover`, `/search`, `/stats`, `/artist/:id`, `/album/:artist/:album`, `/library`, `/library/artists`, `/library/albums`, `/library/liked`, `/settings`

### 17. Bug 61:19 (YouTube Duration)
**Root Cause**: Parameter `videoDuration=long` di YouTube search — hanya video >20 menit.
**Fix**: Prioritaskan `medium` (4-20 menit) dulu, fallback `short`, then any.

### 18. Volume Slider
**Perbaikan**: `<input type="range">` di atas visual fill bar — realtime saat dragging.

---

## Spotify Removal (June 2026)
**Dihapus total** dari codebase:
- `src/services/spotify-auth.ts` — PKCE flow, token refresh
- `src/services/spotify-api.ts` — REST API wrapper
- `src/lib/spotify-player.ts` — Web Playback SDK
- `src/pages/Callback.tsx` — OAuth callback handler
- `src/pages/Profile.tsx` — Profile page (Spotify only)
- Dual-mode Player → YouTube only
- Stats/Library dual-mode → Last.fm only

**Alasan**: Spotify 403 error (no Premium) + Google Cloud $300 credit expired.

## Invidious Attempt (Reverted)
- Semua public Invidious instance telah menonaktifkan API publik
- Back to YouTube Data API dengan cache agresif (10 menit TTL)

---

## Git History

```bash
b4e2c44 Initial commit: Music Dashboard with Spotify + Last.fm + YouTube
...
b7c9957 replace Spotify with YouTube + Last.fm
954bbce switch from YouTube Data API to Invidious (no quota)
57788a7 revert Invidious -> back to YouTube Data API + cache
177baeb fix TopGenres & Heatmap: reduce API calls, add error handling
```

- **Branch**: `main`
- **Remote**: `https://github.com/LimeTeaX/music-app.git`
- **Deploy**: Vercel (isi env vars di Vercel Dashboard)

## Deployment Notes

### Vercel SPA Routing
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### YouTube Data API Quota
- **Default**: 10.000 units/hari (~100 search)
- **Biaya**: search = 100 units, read = 1 unit
- **Solusi**: cache in-memory 10 menit untuk hasil search
- **Better**: enable billing di Google Cloud → +$300 credit, 1M+ units/hari

### Env Variables (Vercel)
- `VITE_LASTFM_API_KEY`
- `VITE_LASTFM_USERNAME`
- `VITE_YOUTUBE_API_KEY`

---

## File Structure

```
├── vercel.json                      # SPA routing rewrites
src/
├── App.tsx                           # Router
├── index.css                         # Tailwind v4 + custom theme
├── main.tsx                          # Entry point
├── vite-env.d.ts                     # Env type definitions
├── hooks/
│   └── useLastFmData.ts              # Fetch 5 Last.fm endpoints + polling
├── lib/
│   ├── lastfm-api.ts                 # 13 Last.fm API methods
│   ├── youtube-api.ts                # YouTube IFrame player + Data API search
│   ├── liked-tracks.ts               # localStorage liked songs
│   └── utils.ts                      # formatDuration, cn, formatPlayCount
├── components/
│   ├── layout/
│   │   ├── Player.tsx                # YouTube-only player
│   │   └── Sidebar.tsx               # Navigation
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── Discover.tsx
│   │   ├── ContinueListening.tsx
│   │   ├── RecentlyPlayed.tsx
│   │   └── RecentActivity.tsx
│   ├── ui/
│   │   ├── AnimatedBackground.tsx
│   │   ├── Button.tsx
│   │   ├── GlassCard.tsx
│   │   ├── GradientText.tsx
│   │   └── LoadingSpinner.tsx
│   ├── TopGenres.tsx
│   ├── ListeningHeatmap.tsx
│   └── SearchBar.tsx
└── pages/
    ├── Home.tsx                      # Dashboard utama
    ├── Discover.tsx                  # Discovery
    ├── Search.tsx                    # YouTube search
    ├── Stats.tsx                     # Last.fm stats
    ├── Artist.tsx                    # Last.fm + YouTube play
    ├── Album.tsx                     # Last.fm + YouTube play
    ├── Library.tsx                   # Hub library
    ├── LibraryArtists.tsx            # Top artists
    ├── LibraryAlbums.tsx             # Top albums
    ├── LibraryLiked.tsx              # Liked songs
    ├── Settings.tsx                  # YouTube/Last.fm status
    └── Login.tsx                     # Last.fm username
```
