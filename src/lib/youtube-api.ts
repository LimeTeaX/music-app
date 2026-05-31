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

export async function searchVideo(query: string, duration?: string): Promise<YouTubeVideo | null> {
  if (!API_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY not set')
    return null
  }
  try {
    const durParam = duration ? `&videoDuration=${duration}` : ''
    const searchUrl = `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&key=${API_KEY}&type=video${durParam}&maxResults=3`
    const res = await fetch(searchUrl)
    const data = await res.json()
    if (data.error) {
      console.error('YouTube API error:', data.error)
      return null
    }
    // Ambil 3 hasil, cari durasi via videoDetails, pilih yg paling cocok
    const items = data.items || []
    if (items.length === 0) return null

    // Video pertama sudah cukup, ambil ID-nya
    const item = items[0]
    return {
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.default?.url || '',
      duration: '',
    }
  } catch (err) {
    console.error('YouTube search failed:', err)
    return null
  }
}

export async function searchVideoBest(query: string): Promise<YouTubeVideo | null> {
  // Coba medium (4-20 min) dulu, lalu short (<4 min)
  const searches = [
    `${query} official audio`,
    `${query} official music video`,
    `${query} audio`,
  ]
  // Medium first
  for (const q of searches) {
    const result = await searchVideo(q, 'medium')
    if (result) return result
  }
  // Fallback to short for songs under 4 min
  for (const q of searches) {
    const result = await searchVideo(q, 'short')
    if (result) return result
  }
  return null
}

export function getPlayerState(): number {
  if (!playerReady) return -1
  return playerInstance.getPlayerState()
}

// Global event untuk play track dari komponen lain
export function requestPlayTrack(title: string, artist: string, query?: string) {
  window.dispatchEvent(new CustomEvent('play-track', {
    detail: { title, artist, query: query || `${title} ${artist} audio` }
  }))
}
