import { useState, useEffect } from 'react'
import { redirectToSpotify, isSpotifyConnected, disconnectSpotify, getValidToken } from '../services/spotify-auth'
import { Music, CheckCircle, XCircle, Link2, Link2Off } from 'lucide-react'

export function Settings() {
  const [connected, setConnected] = useState(isSpotifyConnected)

  useEffect(() => {
    const check = async () => {
      const token = await getValidToken()
      setConnected(!!token)
    }
    check()
    const interval = setInterval(check, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleConnect = async () => {
    await redirectToSpotify()
  }

  const handleDisconnect = () => {
    disconnectSpotify()
    setConnected(false)
    window.dispatchEvent(new Event('spotify-connection-changed'))
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-sm text-text-subdued">Manage your connections</p>
      </div>

      {/* Spotify Card */}
      <div className="bg-bg-surface rounded-md p-6 shadow-medium">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-bg-base rounded-md flex items-center justify-center flex-shrink-0">
            <Music className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">Spotify</h2>
              {connected ? (
                <span className="flex items-center gap-1 text-xs text-accent">
                  <CheckCircle className="h-3 w-3" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-text-subdued">
                  <XCircle className="h-3 w-3" /> Not connected
                </span>
              )}
            </div>
            <p className="text-sm text-text-subdued mb-4">
              Connect Spotify to play music directly in the dashboard
            </p>
            {connected ? (
              <div className="flex gap-3">
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-4 py-2 bg-bg-button hover:bg-bg-button-hover text-white text-sm rounded-md transition-colors"
                >
                  <Link2Off className="h-4 w-4" /> Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-black text-sm font-bold rounded-md transition-colors"
              >
                <Link2 className="h-4 w-4" /> Connect Spotify
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Last.fm Card */}
      <div className="bg-bg-surface rounded-md p-6 shadow-medium">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-bg-base rounded-md flex items-center justify-center flex-shrink-0">
            <Music className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">Last.fm</h2>
              <span className="flex items-center gap-1 text-xs text-accent">
                <CheckCircle className="h-3 w-3" /> Connected
              </span>
            </div>
            <p className="text-sm text-text-subdued">
              Scrobbling data from {import.meta.env.VITE_LASTFM_USERNAME || 'your account'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}