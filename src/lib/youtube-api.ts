const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const BASE_URL = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
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

function scoreResult(item: any, query: string, titleWords: string[], versionWords: string[]): number {
  const title = item.snippet.title.toLowerCase()
  const channel = item.snippet.channelTitle?.toLowerCase() || ''
  let score = 0
  // Words from query
  for (const word of titleWords) {
    if (title.includes(word)) score += 2
    if (channel.includes(word)) score += 1
  }
  // Heavy bonus for version keywords (slowed, speed, remix, etc)
  for (const vw of versionWords) {
    if (title.includes(vw)) score += 5
  }
  // Bonus if parenthetical version info appears in title
  const parenMatch = query.match(/\(([^)]+)\)/i)
  if (parenMatch && title.includes(parenMatch[1].toLowerCase())) score += 8
  return score
}

export async function searchVideo(query: string, duration?: string): Promise<YouTubeVideo | null> {
  if (!API_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY not set')
    return null
  }
  try {
    const durParam = duration ? `&videoDuration=${duration}` : ''
    const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video${durParam}&maxResults=5`
    const res = await fetch(searchUrl)
    const data = await res.json()
    if (data.error) {
      console.error('YouTube API error:', data.error)
      return null
    }
    const items = data.items || []
    if (items.length === 0) return null

    const qLower = query.toLowerCase()
    const titleWords = qLower.split(/\s+/).filter(w => w.length > 2)
    const versionWords = qLower.match(/\(([^)]+)\)/)?.[1]?.toLowerCase().split(/\s+/).filter(w => w.length > 1) || []
    const best = items.reduce((best: any, item: any) => {
      const s = scoreResult(item, qLower, titleWords, versionWords)
      return s > best.score ? { item, score: s } : best
    }, { item: items[0], score: -1 })

    return {
      id: best.item.id.videoId,
      title: best.item.snippet.title,
      thumbnail: best.item.snippet.thumbnails?.default?.url || '',
      duration: '',
    }
  } catch (err) {
    console.error('YouTube search failed:', err)
    return null
  }
}

export async function searchVideoBest(query: string): Promise<YouTubeVideo | null> {
  // Extract version word: from parentheses (Slowed) or explicit keywords at end
  const parenVersion = query.match(/\(([^)]+)\)/)?.[1]?.trim()
  const extraVersion = parenVersion || ''

  // Build targeted queries: try version keyword explicitly first
  const qs: string[] = []
  if (extraVersion) {
    const base = query.replace(/\([^)]+\)/g, '').trim()
    qs.push(`${base} ${extraVersion}`)
  }
  qs.push(query, `${query} audio`, `${query} official audio`, `${query} official music video`)

  // Prioritaskan medium (4-20 min) = full lagu, hindari cuplikan
  for (const q of qs) {
    const result = await searchVideo(q, 'medium')
    if (result) return result
  }
  // Fallback short (<4 min) = lagu yang memang pendek
  for (const q of qs) {
    const result = await searchVideo(q, 'short')
    if (result) return result
  }
  // Last resort tanpa filter (bisa dapet cuplikan)
  for (const q of qs) {
    const result = await searchVideo(q)
    if (result) return result
  }
  return null
}

export function getPlayerState(): number {
  if (!playerReady) return -1
  return playerInstance.getPlayerState()
}

// Global event untuk play track dari komponen lain
export function requestPlayTrack(title: string, artist: string, uri?: string) {
  window.dispatchEvent(new CustomEvent('play-track', {
    detail: { title, artist, uri }
  }))
}
