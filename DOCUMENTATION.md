# Music Dashboard — Dokumentasi Lengkap

## Tech Stack
- **Frontend**: React + TypeScript (Vite 8, strict mode)
- **Styling**: Tailwind CSS v4 (`@theme` CSS config, BUKAN tailwind.config.js)
- **Data Sources**:
  - Last.fm API (artis, album, info, search, scrobbling)
  - Spotify Web API (profile, stats, playback, library)
  - YouTube IFrame API (playback fallback)

---

## Project Timeline & Perubahan

### 1. Tata Letak (Layout)
**Masalah**: Konten halaman penuh sesak, padding dan margin tidak konsisten.
**Root Cause**: CSS Cascade Layers di Tailwind v4 — kode CSS tanpa `@layer` (seperti `* { margin: 0; padding: 0 }`, `h1/h2/h3` element selectors) override utility classes Tailwind karena unlayered CSS outranks layered CSS.
**Fix**: Semua custom CSS dipindah ke `@layer base` atau `@layer utilities` di `src/index.css`.

### 2. Data Last.fm
**Sebelum**: Semua data hardcoded (album palsu, weekly activity array, timestamps palsu).
**Sesudah**: Semua data dari Last.fm API via `src/lib/lastfm-api.ts` (13 method: `getUserInfo`, `getRecentTracks`, `getTopArtists`, `getTopTracks`, `getTopAlbums`, `getAlbumInfo`, `getArtistInfo`, `getArtistTopAlbums`, `getArtistTopTracks`, `getSimilarArtists`, `getWeeklyTrackChart`, `searchAlbum`, `searchTrack`).
**Catatan**: Akun Last.fm (LimeTeaX) memiliki 0 scrobbles — sebagian section menampilkan data kosong/fallback.

### 3. Halaman Artist (`/artist/:id`)
- Header: gambar, nama, play count, tags, bio
- Top tracks list
- Albums grid
- Similar artists grid

### 4. Halaman Album (`/album/:artist/:album`)
- Cover image, artist link, metadata
- Genre tags, bio
- Track list dengan play-on-click
- Route menggunakan 2 parameter URL (Last.fm `album.getinfo` butuh artist + album)

### 5. Halaman Search (`/search`)
- Global search dengan 3 parallel API calls (`artist.search` + `album.search` + `track.search`) via `Promise.all`
- Tabbed results (All / Artists / Albums / Tracks)
- Follow/unfollow artist via localStorage (`followed_artists`)

### 6. Halaman Library
- **Library hub** (`/library`) — navigasi ke sub-pages
- **Library Artists** (`/library/artists`) — grid top artists (Spotify/Last.fm)
- **Library Albums** (`/library/albums`) — grid albums (Spotify saved / Last.fm top)
- **Library Liked** (`/library/liked`) — liked songs dari localStorage

### 7. Halaman Stats (`/stats`)
- Summary cards (tracks, artists, albums, genres)
- Weekly activity bar chart (dari Last.fm recent tracks dates)
- Top 10 artists + albums
- TopGenres + ListeningHeatmap components
- Dual-mode: Spotify stats jika connected, Last.fm fallback

### 8. Halaman Profile (`/profile`)
- Sebelum: placeholder "Coming Soon"
- Sesudah: foto, nama, followers, top artists, top tracks, recently played, playlists
- **Spotify only** — menampilkan prompt "Connect Spotify" jika tidak terautentikasi

### 9. YouTube Playback
**File**: `src/lib/youtube-api.ts`
- Hidden IFrame player (0x0 px)
- Auto-search + play pada track click
- Play/pause/seek/volume/mute synced to YouTube API
- Progress polling (`getCurrentTime()` / `getDuration()`)
- `requestPlayTrack(title, artist)` → dispatch `CustomEvent('play-track')` untuk cross-component play

### 10. Bug 61:19 (YouTube Duration)
**Masalah**: Semua lagu menampilkan durasi 61:19 (1 jam lebih).
**Root Cause**: Parameter `videoDuration=long` di YouTube search — hanya mengembalikan video >20 menit (full album/mix).
**Fix**: Diubah strategi search:
- `searchVideo(query, 'medium')` dulu (4-20 menit)
- Fallback `searchVideo(query, 'short')` (<4 menit)

### 11. Volume Slider
**Sebelum**: Div-based dengan `onClick` — visual hanya berubah setelah mouse dilepas.
**Sesudah**: `<input type="range">` di atas visual fill bar — realtime saat dragging.

### 12. Liked Songs
**File**: `src/lib/liked-tracks.ts`
- Disimpan di localStorage key `liked_tracks`
- `getLikedTracks()`, `isTrackLiked()`, `toggleLike()`
- Player heart icon → toggle like/unlike dengan state persisten per-track
- Library Liked → baca dari localStorage, ada tombol unlike

### 13. Spotify Integration

#### 13a. Auth (PKCE Flow)
**File**: `src/services/spotify-auth.ts`
- Code Verifier + SHA-256 Code Challenge
- `redirectToSpotify()` → redirect ke Spotify OAuth
- `handleCallback(code)` → exchange code untuk tokens
- `getValidToken()` → auto-refresh jika expired
- `isSpotifyConnected()` / `disconnectSpotify()`
- Tokens disimpan di localStorage key `spotify_tokens`
- **Scopes**: user-read-playback-state, user-modify-playback-state, user-read-currently-playing, streaming, app-remote-control, playlist-read-private, user-read-email, user-read-private, user-top-read, user-read-recently-played, playlist-read-collaborative, user-library-read, user-follow-read

#### 13b. REST API
**File**: `src/services/spotify-api.ts`
- Playback control: start, pause, next, previous, seek, volume, shuffle, repeat
- Device management: getDevices, transferPlayback
- User data: getMe (profile), getMyTopArtists, getMyTopTracks
- Recently played: getRecentlyPlayed
- Library: getSavedAlbums, getFollowedArtists
- Search: searchTrack
- All functions return `null` jika token tidak valid atau API error

#### 13c. Web Playback SDK
**File**: `src/lib/spotify-player.ts`
- Load SDK script dari `https://sdk.scdn.co/spotify-player.js`
- `initSpotifyPlayer()` → create `Spotify.Player` instance
- Events: ready (device_id), not_ready, player_state_changed, initialization_error, authentication_error
- Export: `isSpotifyPlayerReady()`, `spotifySetVolume()`, `spotifySeek()`

#### 13d. Dual-Mode Player
**File**: `src/components/layout/Player.tsx`
- Spotify priority jika authenticate + SDK ready
- YouTube fallback jika tidak
- Priority + fallback logic:
  1. Coba `searchTrack()` Spotify
  2. Jika results ada → `startPlaybackWithContext()`
  3. Jika results kosong → fallback YouTube
- Progress polling: Spotify (SDK events + REST API interval 1s), YouTube (polling 500ms)
- Indicators: badge "Spotify" pada track info jika mode Spotify aktif

### 14. Halaman Settings
- Card Spotify: status connected/not connected + tombol Connect/Disconnect
- Dispatch event `spotify-connection-changed` saat disconnect → Player re-init
- Card Last.fm: menampilkan username terkoneksi

### 15. Callback Page
**File**: `src/pages/Callback.tsx`
- Handle `?code=` dari Spotify OAuth
- Panggil `handleCallback(code)` untuk exchange
- Redirect ke `/` jika sukses, `/settings` jika gagal

### 16. Env Configuration
**File**: `.env` (gitignored)
```env
VITE_LASTFM_API_KEY=your_key
VITE_LASTFM_USERNAME=your_username
VITE_YOUTUBE_API_KEY=your_key
VITE_SPOTIFY_CLIENT_ID=your_client_id
```

### 17. Routing
**File**: `src/App.tsx`
- Top-level: `/login`, `/callback` (tanpa sidebar/player)
- Layout routes: semua di bawah `/*` dengan Sidebar + Player
- Route order:
  - `/` → Home (alias `/dashboard`)
  - `/discover`, `/search`, `/stats`
  - `/artist/:id`
  - `/album/:artist/:album`
  - `/library`, `/library/artists`, `/library/albums`, `/library/liked`
  - `/profile`, `/settings`

### 18. Data Source Arsitektur
- **Spotify connected**: Profile, Stats, Library (artists/albums) → Spotify API
- **Spotify disconnected**: Fallback ke Last.fm
- **Artist/Album info, tags, search**: Selalu Last.fm (Spotify tidak punya endpoint ini)
- **Playback**: Spotify priority, YouTube fallback
- **Liked**: localStorage (independen dari Spotify/Last.fm)

---

## Git History

```bash
b4e2c44 Initial commit: Music Dashboard with Spotify + Last.fm + YouTube
ba33f39 Add AGENTS.md with project context
```

- **Branch**: `main`
- **Remote**: `https://github.com/LimeTeaX/music-app.git`
- **Deploy**: Vercel (isi env vars di Vercel dashboard)
- **Spotify Dashboard**: Redirect URI = `https://[domain]/callback`

---

## File Structure

```
src/
├── App.tsx                           # Router
├── index.css                         # Tailwind v4 + custom theme
├── main.tsx                          # Entry point
├── vite-env.d.ts                     # Env type definitions
├── hooks/
│   └── useLastFmData.ts              # Fetch 5 Last.fm endpoints + polling
├── lib/
│   ├── lastfm-api.ts                 # 13 Last.fm API methods
│   ├── youtube-api.ts                # YouTube IFrame player + search
│   ├── spotify-player.ts             # Spotify Web Playback SDK
│   ├── liked-tracks.ts               # localStorage liked songs
│   └── utils.ts                      # formatDuration, cn, formatPlayCount
├── services/
│   ├── spotify-auth.ts               # PKCE auth flow
│   └── spotify-api.ts                # Spotify REST API wrapper
├── components/
│   ├── layout/
│   │   ├── Player.tsx                # Dual-mode player (Spotify/YouTube)
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
    ├── Discover.tsx                  # Discovery / explore
    ├── Search.tsx                    # Global search (artists/albums/tracks)
    ├── Stats.tsx                     # Statistics (Spotify/Last.fm dual-mode)
    ├── Artist.tsx                    # Detail artist
    ├── Album.tsx                     # Detail album
    ├── Library.tsx                   # Hub library
    ├── LibraryArtists.tsx            # Top artists
    ├── LibraryAlbums.tsx             # Top / saved albums
    ├── LibraryLiked.tsx              # Liked songs
    ├── Profile.tsx                   # User profile (Spotify)
    ├── Settings.tsx                  # Spotify connect/disconnect
    ├── Login.tsx                     # Halaman login
    └── Callback.tsx                  # Spotify OAuth callback
```
