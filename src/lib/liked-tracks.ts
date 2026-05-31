const STORAGE_KEY = 'liked_tracks'

export interface LikedTrack {
  title: string
  artist: string
  album?: string
  addedAt: number
}

export function getLikedTracks(): LikedTrack[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function isTrackLiked(title: string, artist: string): boolean {
  return getLikedTracks().some(
    t => t.title.toLowerCase() === title.toLowerCase() && t.artist.toLowerCase() === artist.toLowerCase()
  )
}

export function toggleLike(title: string, artist: string, album?: string): boolean {
  const tracks = getLikedTracks()
  const idx = tracks.findIndex(
    t => t.title.toLowerCase() === title.toLowerCase() && t.artist.toLowerCase() === artist.toLowerCase()
  )
  if (idx >= 0) {
    tracks.splice(idx, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks))
    return false
  }
  tracks.unshift({ title, artist, album, addedAt: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tracks))
  return true
}

export function removeLike(title: string, artist: string) {
  toggleLike(title, artist)
}
