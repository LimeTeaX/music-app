export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  author?: string
}

const INV_INSTANCES = [
  'https://invidious.snopyta.org',
  'https://yewtu.be',
  'https://invidious.privacydev.net',
]

function ytThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
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

async function invFetch(path: string): Promise<any> {
  // Use Vite proxy in dev, fallback instances for production
  try {
    const res = await fetch(`/inv${path}`, { signal: AbortSignal.timeout(5000) })
    if (res.ok) return await res.json()
  } catch {}

  for (const base of INV_INSTANCES) {
    try {
      const res = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) return await res.json()
    } catch {
      continue
    }
  }
  throw new Error('All Invidious instances failed')
}

const searchSingleCache = new Map<string, { result: YouTubeVideo | null; ts: number }>()
const CACHE_TTL = 5 * 60 * 1000

export async function searchVideo(query: string, duration?: string): Promise<YouTubeVideo | null> {
  const cacheKey = `${query}::${duration || 'any'}`
  const cached = searchSingleCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.result
  }

  try {
    let durParam = ''
    if (duration === 'medium') durParam = '&duration=medium'
    else if (duration === 'short') durParam = '&duration=short'
    else if (duration === 'long') durParam = '&duration=long'

    const data = await invFetch(`/api/v1/search?q=${encodeURIComponent(query)}&type=video&sort=relevance&region=ID${durParam}`)
    const items = Array.isArray(data) ? data.filter((i: any) => i.type === 'video') : []
    if (items.length === 0) return null

    const result: YouTubeVideo = {
      id: items[0].videoId,
      title: items[0].title,
      thumbnail: ytThumb(items[0].videoId),
      duration: String(items[0].lengthSeconds || ''),
      author: items[0].author || '',
    }
    searchSingleCache.set(cacheKey, { result, ts: Date.now() })
    return result
  } catch (err) {
    console.error('Invidious searchVideo failed:', err)
    return null
  }
}

export async function searchVideoBest(query: string): Promise<YouTubeVideo | null> {
  const parenVersion = query.match(/\(([^)]+)\)/)?.[1]?.trim()
  const extraVersion = parenVersion || ''

  const qs: string[] = []
  if (extraVersion) {
    const base = query.replace(/\([^)]+\)/g, '').trim()
    qs.push(`${base} ${extraVersion}`)
  }
  qs.push(query, `${query} audio`, `${query} official audio`, `${query} official music video`)

  for (const q of qs) {
    const result = await searchVideo(q, 'medium')
    if (result) return result
  }
  for (const q of qs) {
    const result = await searchVideo(q, 'short')
    if (result) return result
  }
  for (const q of qs) {
    const result = await searchVideo(q)
    if (result) return result
  }
  return null
}

const searchCache = new Map<string, { results: YouTubeVideo[]; ts: number }>()

export async function searchVideos(query: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  const cacheKey = `${query}::${maxResults}`
  const cached = searchCache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.results
  }

  try {
    const data = await invFetch(`/api/v1/search?q=${encodeURIComponent(query)}&type=video&sort=relevance&region=ID`)
    const results = (Array.isArray(data) ? data : [])
      .filter((i: any) => i.type === 'video')
      .slice(0, maxResults)
      .map((i: any) => ({
        id: i.videoId,
        title: i.title,
        thumbnail: ytThumb(i.videoId),
        duration: String(i.lengthSeconds || ''),
        author: i.author || '',
      }))
    searchCache.set(cacheKey, { results, ts: Date.now() })
    return results
  } catch (err) {
    console.error('Invidious searchVideos failed:', err)
    return []
  }
}

export function getPlayerState(): number {
  if (!playerReady) return -1
  return playerInstance.getPlayerState()
}

// Global event untuk play track dari komponen lain
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
