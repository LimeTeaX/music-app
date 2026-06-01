import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart } from 'lucide-react'
import { isSpotifyConnected } from '../../services/spotify-auth'
import * as spotifyApi from '../../services/spotify-api'
import { isTrackLiked, toggleLike } from '../../lib/liked-tracks'
import { formatDuration } from '../../lib/utils'

interface TrackInfo {
  title: string
  artist: string
  album?: string
  uri?: string
}

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [externalTrack, setExternalTrack] = useState<TrackInfo | null>(null)
  const connected = isSpotifyConnected()

  const currentTrack = externalTrack
  const hasTrack = currentTrack !== null
  const liked = hasTrack ? isTrackLiked(currentTrack.title, currentTrack.artist) : false
  const prevTrackKeyRef = useRef('')
  const currentTrackKey = hasTrack ? `${currentTrack.title} - ${currentTrack.artist}` : ''
  const isSeeking = useRef(false)

  // Poll Spotify playback state
  useEffect(() => {
    if (!connected) return
    const interval = setInterval(async () => {
      if (isSeeking.current) return
      const ps = await spotifyApi.getPlaybackState()
      if (ps) {
        setCurrentTime(ps.progress_ms / 1000)
        if (ps.item) setDuration(ps.item.duration_ms / 1000)
        setIsPlaying(ps.is_playing)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [connected])

  // Listen for external play-track events
  useEffect(() => {
    const handler = (e: Event) => {
      const { title, artist, uri } = (e as CustomEvent).detail
      setExternalTrack({ title, artist, uri: uri || undefined })
    }
    window.addEventListener('play-track', handler)
    return () => window.removeEventListener('play-track', handler)
  }, [])

  // Play track when track key changes
  useEffect(() => {
    if (!hasTrack || !connected) return
    if (currentTrackKey === prevTrackKeyRef.current) return
    prevTrackKeyRef.current = currentTrackKey

    const deviceId = localStorage.getItem('spotify_device_id') || undefined

    if (currentTrack.uri) {
      spotifyApi.startPlaybackWithContext(currentTrack.uri, deviceId)
    } else {
      // Fallback: search by name
      spotifyApi.searchTrack(`${currentTrack.title} ${currentTrack.artist}`).then((tracks) => {
        if (tracks && tracks.length > 0) {
          spotifyApi.startPlaybackWithContext(`spotify:track:${tracks[0].id}`, deviceId)
        }
      })
    }
  }, [currentTrackKey, connected, hasTrack])

  const handlePlayPause = useCallback(() => {
    if (!hasTrack || !connected) return
    if (isPlaying) spotifyApi.pausePlayback()
    else spotifyApi.startPlayback(localStorage.getItem('spotify_device_id') || undefined)
  }, [hasTrack, connected, isPlaying])

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      spotifyApi.setVolume(volume)
    } else {
      setIsMuted(true)
      spotifyApi.setVolume(0)
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!connected) {
    return (
      <div className="h-[90px] border-t border-border bg-bg-base flex-shrink-0 flex items-center justify-center">
        <p className="text-sm text-text-subdued">Connect Spotify to play music</p>
      </div>
    )
  }

  return (
    <div className="h-[90px] border-t border-border bg-bg-base flex-shrink-0">
      <div className="h-full flex items-center justify-between px-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
          <div className="w-14 h-14 bg-bg-surface-elevated rounded-md flex items-center justify-center shadow-medium flex-shrink-0 overflow-hidden">
            {isPlaying ? (
              <div className="flex gap-0.5 items-end h-6">
                <div className="w-1 bg-accent rounded-full animate-pulse h-4" />
                <div className="w-1 bg-accent rounded-full animate-pulse h-6" style={{ animationDelay: '0.15s' }} />
                <div className="w-1 bg-accent rounded-full animate-pulse h-3" style={{ animationDelay: '0.3s' }} />
              </div>
            ) : (
              <svg className="h-6 w-6 text-text-subdued" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9 18V6l10 6-10 6z"/></svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {hasTrack ? (
              <>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                  <button onClick={() => toggleLike(currentTrack.title, currentTrack.artist, currentTrack.album)} className="flex-shrink-0">
                    <Heart className={`h-4 w-4 ${liked ? 'text-accent fill-accent' : 'text-text-subdued'}`} />
                  </button>
                </div>
                <p className="text-xs text-text-subdued truncate flex items-center gap-1.5">
                  {currentTrack.artist}
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent leading-none">Spotify</span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-text-subdued">No track playing</p>
                <p className="text-xs text-text-muted">Search and click a track to play</p>
              </>
            )}
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-4">
            <button className="text-text-subdued hover:text-white transition-colors disabled:opacity-30" disabled={!hasTrack}>
              <Shuffle className="h-4 w-4" />
            </button>
            <button className="text-text-subdued hover:text-white transition-colors disabled:opacity-30" disabled={!hasTrack}>
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={handlePlayPause}
              disabled={!connected || !hasTrack}
              className="w-8 h-8 rounded-full bg-white hover:scale-105 flex items-center justify-center transition-all shadow-heavy disabled:opacity-40 disabled:hover:scale-100"
            >
              {isPlaying ? <Pause className="h-4 w-4 text-black" /> : <Play className="h-4 w-4 text-black ml-0.5" />}
            </button>
            <button className="text-text-subdued hover:text-white transition-colors disabled:opacity-30" disabled={!hasTrack}>
              <SkipForward className="h-5 w-5" />
            </button>
            <button className="text-text-subdued hover:text-white transition-colors disabled:opacity-30" disabled={!hasTrack}>
              <Repeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full min-w-[400px]">
            <span className="text-xs text-text-subdued w-10 text-right">{formatDuration(currentTime)}</span>
            <div className="flex-1 h-5 flex items-center group relative">
              <div className="absolute inset-x-0 h-1 bg-bg-surface-elevated rounded-full pointer-events-none">
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 1}
                step="0.5"
                value={currentTime}
                onMouseDown={() => { isSeeking.current = true }}
                onMouseUp={(e) => {
                  const target = Number((e.target as HTMLInputElement).value)
                  isSeeking.current = false
                  spotifyApi.seekToPosition(Math.round(target * 1000))
                }}
                onTouchStart={() => { isSeeking.current = true }}
                onTouchEnd={(e) => {
                  const target = Number((e.target as HTMLInputElement).value)
                  isSeeking.current = false
                  spotifyApi.seekToPosition(Math.round(target * 1000))
                }}
                onChange={(e) => setCurrentTime(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <span className="text-xs text-text-subdued w-10">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 w-[30%] min-w-[120px] justify-end">
          <button onClick={handleToggleMute} className="hover:text-white transition-colors">
            {isMuted || volume === 0
              ? <VolumeX className="h-5 w-5 text-text-subdued" />
              : <Volume2 className="h-5 w-5 text-text-subdued" />
            }
          </button>
          <div className="relative w-24 h-5 flex items-center group">
            <div className="absolute inset-x-0 h-1 bg-bg-surface-elevated rounded-full pointer-events-none">
              <div className="h-full bg-white rounded-full group-hover:bg-accent transition-colors" style={{ width: `${isMuted ? 0 : volume}%` }} />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                setVolumeState(v)
                spotifyApi.setVolume(v)
                if (isMuted) setIsMuted(false)
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
