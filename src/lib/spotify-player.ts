import { getValidToken } from '../services/spotify-auth'
import * as spotifyApi from '../services/spotify-api'

let playerInstance: any = null
let playerConnected = false
let onStateChange: ((state: any) => void) | null = null

export function setSpotifyStateHandler(cb: (state: any) => void) {
  onStateChange = cb
}

export function isSpotifyPlayerReady(): boolean {
  return playerConnected
}

export function getSpotifyPlayer(): any {
  return playerInstance
}

export function spotifySetVolume(vol: number) {
  if (playerInstance) playerInstance.setVolume(vol / 100)
}

export function spotifySeek(ms: number) {
  spotifyApi.seekToPosition(ms)
}

export async function initSpotifyPlayer(): Promise<boolean> {
  const token = await getValidToken()
  if (!token) return false

  return new Promise((resolve) => {
    if ((window as any).Spotify) {
      setupPlayer(token, resolve)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    ;(window as any).onSpotifyWebPlaybackSDKReady = () => {
      setupPlayer(token, resolve)
    }

    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

function setupPlayer(token: string, resolve: (v: boolean) => void) {
  const player = new (window as any).Spotify.Player({
    name: 'Music Dashboard',
    getOAuthToken: (cb: (t: string) => void) => { cb(token) },
    volume: 0.5,
  })

  player.addListener('ready', ({ device_id }: { device_id: string }) => {
    console.log('Spotify player ready:', device_id)
    playerConnected = true
    localStorage.setItem('spotify_device_id', device_id)
    resolve(true)
  })

  player.addListener('not_ready', () => {
    playerConnected = false
    resolve(false)
  })

  player.addListener('player_state_changed', (state: any) => {
    onStateChange?.(state)
  })

  player.addListener('initialization_error', (e: any) => {
    console.error('Spotify init error:', e.message)
    resolve(false)
  })

  player.addListener('authentication_error', (e: any) => {
    console.error('Spotify auth error:', e.message)
    resolve(false)
  })

  player.connect()
  playerInstance = player
}
