export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  author?: string
}

let playerInstance: any = null
let playerReady = false
let playerQueue: string | null = null
let onStateChangeCallback: ((state: number) => void) | null = null

export function setOnStateChange(cb: (state: number) => void) {
  onStateChangeCallback = cb
}

function loadIFrameAPI(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).YT?.Player) { resolve(); return }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    const firstScript = document.getElementsByTagName('script')[0]
    firstScript?.parentNode?.insertBefore(tag, firstScript)
    ;(window as any).onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

export async function initPlayer(elementId: string = 'youtube-player'): Promise<void> {
  await loadIFrameAPI()
  playerInstance = new (window as any).YT.Player(elementId, {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      modestbranding: 1,
    },
    events: {
      onReady: () => {
        playerReady = true
        if (playerQueue) {
          playerInstance.loadVideoById(playerQueue)
          playerQueue = null
        }
      },
      onStateChange: (e: any) => {
        onStateChangeCallback?.(e.data)
      },
    },
  })
}

export function playVideo(videoId: string) {
  if (playerReady) {
    playerInstance.loadVideoById(videoId)
  } else {
    playerQueue = videoId
  }
}

export function pauseVideo() {
  if (playerReady) playerInstance.pauseVideo()
}

export function resumeVideo() {
  if (playerReady) playerInstance.playVideo()
}

export function getCurrentTime(): number {
  if (!playerReady) return 0
  return playerInstance.getCurrentTime()
}

export function getDuration(): number {
  if (!playerReady) return 0
  return playerInstance.getDuration()
}

export function seekTo(seconds: number) {
  if (playerReady) playerInstance.seekTo(seconds, true)
}

export function setVolume(volume: number) {
  if (playerReady) playerInstance.setVolume(volume)
}

export function mute() {
  if (playerReady) playerInstance.mute()
}

export function unMute() {
  if (playerReady) playerInstance.unMute()
}

function ytThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
}

// ── YouTube Data API search (with cache) ──

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE = 'https://www.googleapis.com/youtube/v3'

const searchCache = new Map<string, { data: any; ts: number }>()
const CACHE_TTL = 10 * 60 * 1000

function cachedFetch(key: string): any {
  const c = searchCache.get(key)
  if (c && Date.now() - c.ts < CACHE_TTL) return c.data
  return null
}

function setCache(key: string, data: any) {
  searchCache.set(key, { data, ts: Date.now() })
}

export async function searchVideo(query: string, duration?: string): Promise<YouTubeVideo | null> {
  const cacheKey = `single::${query}::${duration || 'any'}`
  const cached = cachedFetch(cacheKey)
  if (cached) return cached

  if (!API_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY not set')
    return null
  }

  try {
    const dur = duration ? `&videoDuration=${duration}` : ''
    const url = `${BASE}/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video${dur}&maxResults=3&regionCode=ID`
    const res = await fetch(url)
    const data = await res.json()
    if (data.error) {
      console.error('YouTube API error:', data.error)
      return null
    }
    const items: any[] = data.items || []
    if (items.length === 0) return null

    const best = items.find((i: any) => i.id?.videoId) || items[0]
    const result: YouTubeVideo | null = best.id?.videoId ? {
      id: best.id.videoId,
      title: best.snippet.title,
      thumbnail: ytThumb(best.id.videoId),
      duration: '',
    } : null

    setCache(cacheKey, result)
    return result
  } catch (err) {
    console.error('YouTube searchVideo failed:', err)
    return null
  }
}

export async function searchVideoBest(query: string): Promise<YouTubeVideo | null> {
  const parenVersion = query.match(/\(([^)]+)\)/)?.[1]?.trim()
  const qs: string[] = []
  if (parenVersion) {
    const base = query.replace(/\([^)]+\)/g, '').trim()
    qs.push(`${base} ${parenVersion}`)
  }
  qs.push(query, `${query} audio`, `${query} official audio`, `${query} official music video`)

  for (const q of qs) {
    const r = await searchVideo(q, 'medium')
    if (r) return r
  }
  for (const q of qs) {
    const r = await searchVideo(q, 'short')
    if (r) return r
  }
  for (const q of qs) {
    const r = await searchVideo(q)
    if (r) return r
  }
  return null
}

export async function searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  const cacheKey = `list::${query}::${maxResults}`
  const cached = cachedFetch(cacheKey)
  if (cached) return cached

  if (!API_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY not set')
    return []
  }

  try {
    const url = `${BASE}/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video&maxResults=${maxResults}&regionCode=ID`
    const res = await fetch(url)
    const data = await res.json()
    if (data.error) {
      console.error('YouTube API error:', data.error)
      return []
    }
    const results = (data.items || [])
      .filter((i: any) => i.id?.videoId)
      .map((i: any) => ({
        id: i.id.videoId,
        title: i.snippet.title,
        thumbnail: ytThumb(i.id.videoId),
        duration: '',
        author: i.snippet.channelTitle || '',
      }))
    setCache(cacheKey, results)
    return results
  } catch (err) {
    console.error('YouTube searchVideos failed:', err)
    return []
  }
}

export function getPlayerState(): number {
  if (!playerReady) return -1
  return playerInstance.getPlayerState()
}

// Global event for play-track
export function requestPlayTrack(title: string, artist: string, videoId?: string, thumbnail?: string) {
  window.dispatchEvent(new CustomEvent('play-track', {
    detail: { title, artist, videoId, thumbnail }
  }))
}

// Search YouTube by name then play
export async function requestPlayTrackByName(title: string, artist: string) {
  const query = `${title} ${artist}`.trim()
  const result = await searchVideoBest(query)
  if (result) {
    requestPlayTrack(title, artist, result.id, result.thumbnail)
  }
}
