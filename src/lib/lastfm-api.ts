const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const USERNAME = import.meta.env.VITE_LASTFM_USERNAME
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

// Generic fetch untuk Last.fm API
async function lastFmFetch<T>(params: Record<string, string>): Promise<T> {
  const urlParams = new URLSearchParams({
    ...params,
    api_key: API_KEY,
    format: 'json',
  })
  
  const response = await fetch(`${BASE_URL}?${urlParams.toString()}`)
  const data = await response.json()

  // Last.fm returns error as JSON with status 200
  if (data.error) {
    throw new Error(`Last.fm error ${data.error}: ${data.message}`)
  }

  if (!response.ok) {
    throw new Error(`Last.fm HTTP error: ${response.status}`)
  }

  return data
}

// Types
export interface LastFmTrack {
  name: string
  artist: { name: string; url: string }
  album: { name: string; '#text': string }
  image: { size: string; '#text': string }[]
  playcount: string
  url: string
  date?: { '#text': string }
}

export interface LastFmArtist {
  name: string
  playcount: string
  listeners: string
  url: string
  image: { size: string; '#text': string }[]
}

export interface LastFmAlbum {
  name: string
  artist: { name: string; url: string }
  playcount: string
  image: { size: string; '#text': string }[]
  url: string
}

export interface LastFmSimilarArtist {
  name: string
  url: string
  image: { size: string; '#text': string }[]
}

// API Methods
export const lastFmApi = {
  // Get top artists (periode: overall | 7day | 1month | 3month | 6month | 12month)
  getTopArtists: (period: string = '6month', limit: number = 10) =>
    lastFmFetch<{ topartists: { artist: LastFmArtist[] } }>({
      method: 'user.gettopartists',
      user: USERNAME,
      period,
      limit: limit.toString(),
    }),

  // Get top tracks
  getTopTracks: (period: string = '6month', limit: number = 10) =>
    lastFmFetch<{ toptracks: { track: LastFmTrack[] } }>({
      method: 'user.gettoptracks',
      user: USERNAME,
      period,
      limit: limit.toString(),
    }),

  // Get recent tracks
  getRecentTracks: (limit: number = 20) =>
    lastFmFetch<{ recenttracks: { track: LastFmTrack[] } }>({
      method: 'user.getrecenttracks',
      user: USERNAME,
      limit: limit.toString(),
    }),

  // Get now playing (track dengan attribute nowplaying="true")
  getNowPlaying: async () => {
    const data = await lastFmFetch<{ recenttracks: { track: any[] } }>({
      method: 'user.getrecenttracks',
      user: USERNAME,
      limit: '1',
    })
    const nowPlayingTrack = data.recenttracks?.track?.find(
      (track: any) => track['@attr']?.nowplaying === 'true'
    )
    return nowPlayingTrack || null
  },

  // Get user info
  getUserInfo: () =>
    lastFmFetch<{ user: { name: string; playcount: string; artist_count: string } }>({
      method: 'user.getinfo',
      user: USERNAME,
    }),

  // Search artist
  searchArtist: (query: string) =>
    lastFmFetch<any>({
      method: 'artist.search',
      artist: query,
      limit: '10',
    }),

  // Search track
  searchTrack: (query: string) =>
    lastFmFetch<any>({
      method: 'track.search',
      track: query,
      limit: '10',
    }),

  // Search album
  searchAlbum: (query: string) =>
    lastFmFetch<any>({
      method: 'album.search',
      album: query,
      limit: '10',
    }),

  // Get top albums
  getTopAlbums: (period: string = '6month', limit: number = 10) =>
    lastFmFetch<{ topalbums: { album: LastFmAlbum[]; '@attr': { total: string } } }>({
      method: 'user.gettopalbums',
      user: USERNAME,
      period,
      limit: limit.toString(),
    }),

  // Get weekly track chart
  getWeeklyTrackChart: () =>
    lastFmFetch<{ weeklytrackchart: { track: any[] } }>({
      method: 'user.getweeklytrackchart',
      user: USERNAME,
    }),

  // Get similar artists
  getSimilarArtists: (artist: string) =>
    lastFmFetch<{ similarartists: { artist: LastFmSimilarArtist[] } }>({
      method: 'artist.getsimilar',
      artist: artist,
      limit: '10',
    }),

  // Get artist's top albums
  getArtistTopAlbums: (artist: string, limit: number = 10) =>
    lastFmFetch<{ topalbums: { album: LastFmAlbum[] } }>({
      method: 'artist.gettopalbums',
      artist,
      limit: limit.toString(),
    }),

  // Get artist's top tracks
  getArtistTopTracks: (artist: string, limit: number = 10) =>
    lastFmFetch<{ toptracks: { track: LastFmTrack[] } }>({
      method: 'artist.gettoptracks',
      artist,
      limit: limit.toString(),
    }),

  // Get album info (termasuk tracks, tags, wiki)
  getAlbumInfo: (artist: string, album: string) =>
    lastFmFetch<any>({
      method: 'album.getinfo',
      artist,
      album,
    }),

  // Get artist info (termasuk tags/genres)
  getArtistInfo: (artist: string) =>
    lastFmFetch<any>({
      method: 'artist.getinfo',
      artist: artist,
    }),
}