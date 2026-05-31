const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = `${window.location.origin}/callback`
const TOKEN_KEY = 'spotify_tokens'

interface SpotifyTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

function base64url(source: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(source)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain))
}

function generateVerifier(): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const random = new Uint8Array(64)
  crypto.getRandomValues(random)
  return Array.from(random).map(b => charset[b % charset.length]).join('')
}

export async function redirectToSpotify() {
  if (!CLIENT_ID) {
    console.error('VITE_SPOTIFY_CLIENT_ID not set')
    return
  }
  const verifier = generateVerifier()
  const challenge = base64url(await sha256(verifier))
  localStorage.setItem('spotify_verifier', verifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: challenge,
    scope: [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'app-remote-control',
      'playlist-read-private',
      'user-read-email',
      'user-read-private',
      'user-top-read',
      'user-read-recently-played',
      'playlist-read-collaborative',
      'user-library-read',
      'user-follow-read',
    ].join(' '),
  })
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

export async function handleCallback(code: string): Promise<boolean> {
  const verifier = localStorage.getItem('spotify_verifier')
  if (!verifier || !CLIENT_ID) return false

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: verifier,
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)

    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000,
    }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
    localStorage.removeItem('spotify_verifier')
    return true
  } catch (err) {
    console.error('Spotify auth failed:', err)
    return false
  }
}

async function refreshAccessToken(refreshToken: string): Promise<SpotifyTokens | null> {
  if (!CLIENT_ID) return null
  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    const data = await res.json()
    if (data.error) throw new Error(data.error)

    const tokens: SpotifyTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      expires_at: Date.now() + data.expires_in * 1000,
    }
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
    return tokens
  } catch (err) {
    console.error('Spotify token refresh failed:', err)
    return null
  }
}

export async function getValidToken(): Promise<string | null> {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  const tokens: SpotifyTokens = JSON.parse(raw)
  if (Date.now() < tokens.expires_at) return tokens.access_token
  const refreshed = await refreshAccessToken(tokens.refresh_token)
  return refreshed?.access_token || null
}

export function isSpotifyConnected(): boolean {
  return !!localStorage.getItem(TOKEN_KEY)
}

export function disconnectSpotify() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem('spotify_verifier')
}
