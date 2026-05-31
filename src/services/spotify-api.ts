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

// Search for a track
export async function searchTrack(query: string): Promise<SpotifyTrack[] | null> {
  const data = await fetchApi<{ tracks: { items: SpotifyTrack[] } }>(`/search?q=${encodeURIComponent(query)}&type=track&limit=5`)
  return data?.tracks?.items ?? null
}

// Start playback with a specific track URI
export async function startPlaybackWithContext(uri: string, deviceId?: string) {
  const body: any = { uris: [uri] }
  if (deviceId) body.device_ids = [deviceId]
  return fetchApi('/me/player/play', { method: 'PUT', body: JSON.stringify(body) })
}
