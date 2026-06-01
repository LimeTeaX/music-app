import { getValidToken } from './spotify-auth'

const BASE = 'https://api.spotify.com/v1'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const token = await getValidToken()
  if (!token) return null
  try {
    const res = await fetch(`${BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    if (res.status === 204) return null
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('Spotify API error:', err)
      return null
    }
    return res.json()
  } catch (err) {
    console.error('Spotify fetch failed:', err)
    return null
  }
}

export interface SpotifyUser {
  id: string
  display_name: string
  email: string
  images: { url: string }[]
  followers: { total: number }
  product: string
  country: string
}

export interface SpotifyArtist {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
  followers: { total: number }
  popularity: number
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
}

export interface SpotifyPlayerState {
  is_playing: boolean
  progress_ms: number
  item: SpotifyTrack | null
  device?: { name: string }
}

// Get current playback
export async function getPlaybackState(): Promise<SpotifyPlayerState | null> {
  return fetchApi<SpotifyPlayerState>('/me/player')
}

// Start/Resume playback
export async function startPlayback(deviceId?: string) {
  const body = deviceId ? { device_ids: [deviceId] } : undefined
  return fetchApi('/me/player/play', { method: 'PUT', body: body ? JSON.stringify(body) : undefined })
}

// Pause playback
export async function pausePlayback() {
  return fetchApi('/me/player/pause', { method: 'PUT' })
}

// Next track
export async function nextTrack() {
  return fetchApi('/me/player/next', { method: 'POST' })
}

// Previous track
export async function previousTrack() {
  return fetchApi('/me/player/previous', { method: 'POST' })
}

// Seek to position
export async function seekToPosition(positionMs: number) {
  return fetchApi(`/me/player/seek?position_ms=${positionMs}`, { method: 'PUT' })
}

// Set volume
export async function setVolume(volumePercent: number) {
  return fetchApi(`/me/player/volume?volume_percent=${volumePercent}`, { method: 'PUT' })
}

// Shuffle
export async function setShuffle(state: boolean) {
  return fetchApi(`/me/player/shuffle?state=${state}`, { method: 'PUT' })
}

// Repeat mode
export async function setRepeat(state: 'off' | 'context' | 'track') {
  return fetchApi(`/me/player/repeat?state=${state}`, { method: 'PUT' })
}

// Get available devices
export async function getDevices(): Promise<{ devices: { id: string; name: string; is_active: boolean }[] } | null> {
  return fetchApi('/me/player/devices')
}

// Transfer playback to device
export async function transferPlayback(deviceId: string) {
  return fetchApi('/me/player', {
    method: 'PUT',
    body: JSON.stringify({ device_ids: [deviceId] }),
  })
}

export interface SpotifyRecentlyPlayed {
  track: SpotifyTrack
  played_at: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: { url: string }[]
  tracks: { total: number }
  public: boolean
  owner: { display_name: string }
}

// Get user profile
export async function getMe(): Promise<SpotifyUser | null> {
  return fetchApi<SpotifyUser>('/me')
}

// Get top artists
export async function getMyTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 20): Promise<{ items: SpotifyArtist[] } | null> {
  return fetchApi(`/me/top/artists?time_range=${timeRange}&limit=${limit}`)
}

// Get top tracks
export async function getMyTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term', limit = 20): Promise<{ items: SpotifyTrack[] } | null> {
  return fetchApi(`/me/top/tracks?time_range=${timeRange}&limit=${limit}`)
}

// Get recently played
export async function getRecentlyPlayed(limit = 20): Promise<{ items: SpotifyRecentlyPlayed[] } | null> {
  return fetchApi(`/me/player/recently-played?limit=${limit}`)
}

// Get playlists
export async function getMyPlaylists(limit = 20): Promise<{ items: SpotifyPlaylist[] } | null> {
  return fetchApi(`/me/playlists?limit=${limit}`)
}

// Get saved albums
export async function getSavedAlbums(limit = 20): Promise<{ items: { album: any }[] } | null> {
  return fetchApi(`/me/albums?limit=${limit}`)
}

// Get followed artists
export async function getFollowedArtists(limit = 20): Promise<{ artists: { items: SpotifyArtist[] } } | null> {
  return fetchApi(`/me/following?type=artist&limit=${limit}`)
}

// Start playback with a specific track URI
export async function startPlaybackWithContext(uri: string, deviceId?: string) {
  const body: any = { uris: [uri] }
  if (deviceId) body.device_ids = [deviceId]
  return fetchApi('/me/player/play', { method: 'PUT', body: JSON.stringify(body) })
}

// ── Artist ──

export interface SpotifyArtistFull {
  id: string
  name: string
  images: { url: string }[]
  genres: string[]
  followers: { total: number }
  popularity: number
  type: string
  external_urls: { spotify: string }
}

export async function getArtist(artistId: string): Promise<SpotifyArtistFull | null> {
  return fetchApi<SpotifyArtistFull>(`/artists/${artistId}`)
}

export async function searchArtist(query: string): Promise<SpotifyArtist[] | null> {
  const data = await fetchApi<{ artists: { items: SpotifyArtist[] } }>(`/search?q=${encodeURIComponent(query)}&type=artist&limit=10`)
  return data?.artists?.items ?? null
}

export async function getArtistTopTracks(artistId: string): Promise<SpotifyTrack[] | null> {
  const data = await fetchApi<{ tracks: SpotifyTrack[] }>(`/artists/${artistId}/top-tracks?market=from_token`)
  return data?.tracks ?? null
}

export async function getArtistAlbums(artistId: string, limit = 10): Promise<SpotifyAlbumSimplified[] | null> {
  const data = await fetchApi<{ items: SpotifyAlbumSimplified[] }>(`/artists/${artistId}/albums?include_groups=album,single&limit=${limit}`)
  return data?.items ?? null
}

export async function getRelatedArtists(artistId: string): Promise<SpotifyArtist[] | null> {
  const data = await fetchApi<{ artists: SpotifyArtist[] }>(`/artists/${artistId}/related-artists`)
  return data?.artists ?? null
}

// ── Album ──

export interface SpotifyAlbumSimplified {
  id: string
  name: string
  images: { url: string }[]
  artists: { name: string; id: string }[]
  release_date: string
  total_tracks: number
  album_type: string
}

export interface SpotifyAlbumFull {
  id: string
  name: string
  artists: { name: string; id: string }[]
  images: { url: string }[]
  release_date: string
  total_tracks: number
  genres: string[]
  label: string
  popularity: number
  tracks: { items: SpotifyTrack[] }
  external_urls: { spotify: string }
}

export async function getAlbum(albumId: string): Promise<SpotifyAlbumFull | null> {
  return fetchApi<SpotifyAlbumFull>(`/albums/${albumId}`)
}

export async function searchAlbum(query: string): Promise<SpotifyAlbumSimplified[] | null> {
  const data = await fetchApi<{ albums: { items: SpotifyAlbumSimplified[] } }>(`/search?q=${encodeURIComponent(query)}&type=album&limit=10`)
  return data?.albums?.items ?? null
}

// ── Search All ──

export interface SpotifySearchResults {
  tracks: SpotifyTrack[]
  artists: SpotifyArtist[]
  albums: SpotifyAlbumSimplified[]
}

export async function searchAll(query: string): Promise<SpotifySearchResults | null> {
  const data = await fetchApi<{
    tracks?: { items: SpotifyTrack[] }
    artists?: { items: SpotifyArtist[] }
    albums?: { items: SpotifyAlbumSimplified[] }
  }>(`/search?q=${encodeURIComponent(query)}&type=track,artist,album&limit=10`)
  if (!data) return null
  return {
    tracks: data.tracks?.items || [],
    artists: data.artists?.items || [],
    albums: data.albums?.items || [],
  }
}

// ── Browse ──

export interface SpotifyNewReleases {
  albums: { items: SpotifyAlbumSimplified[] }
}

export async function getNewReleases(limit = 10): Promise<SpotifyAlbumSimplified[] | null> {
  const data = await fetchApi<{ albums: { items: SpotifyAlbumSimplified[] } }>(`/browse/new-releases?limit=${limit}`)
  return data?.albums?.items ?? null
}

export async function getFeaturedPlaylists(limit = 10): Promise<SpotifyPlaylist[] | null> {
  const data = await fetchApi<{ playlists: { items: SpotifyPlaylist[] } }>(`/browse/featured-playlists?limit=${limit}`)
  return data?.playlists?.items ?? null
}

export async function getRecommendations(seedArtists: string[], limit = 10): Promise<SpotifyTrack[] | null> {
  const seeds = seedArtists.slice(0, 5).join(',')
  const data = await fetchApi<{ tracks: SpotifyTrack[] }>(`/recommendations?seed_artists=${encodeURIComponent(seeds)}&limit=${limit}`)
  return data?.tracks ?? null
}

// ── Search Track (legacy) ──

export async function searchTrack(query: string): Promise<SpotifyTrack[] | null> {
  const data = await fetchApi<{ tracks: { items: SpotifyTrack[] } }>(`/search?q=${encodeURIComponent(query)}&type=track&limit=20`)
  return data?.tracks?.items ?? null
}

export async function searchTrackExact(title: string, artist: string): Promise<SpotifyTrack[] | null> {
  const q = `track:"${title.replace(/"/g, '')}" artist:"${artist.replace(/"/g, '')}"`
  const data = await fetchApi<{ tracks: { items: SpotifyTrack[] } }>(`/search?q=${encodeURIComponent(q)}&type=track&limit=10`)
  return data?.tracks?.items ?? null
}
