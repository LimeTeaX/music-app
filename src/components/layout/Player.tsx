import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Mic2, Heart } from 'lucide-react'
import { useLastFmData } from '../../hooks/useLastFmData'
import { initPlayer, playVideo, pauseVideo, resumeVideo, searchVideoBest, getCurrentTime, getDuration, seekTo, setVolume as ytSetVolume, mute, unMute, setOnStateChange } from '../../lib/youtube-api'
import { formatDuration } from '../../lib/utils'
import { isSpotifyConnected } from '../../services/spotify-auth'
import { initSpotifyPlayer, isSpotifyPlayerReady, setSpotifyStateHandler, getSpotifyPlayer, spotifySetVolume } from '../../lib/spotify-player'
import * as spotifyApi from '../../services/spotify-api'
import { isTrackLiked, toggleLike } from '../../lib/liked-tracks'

interface TrackInfo {
  title: string
  artist: string
  album?: string
}

export function Player() {
  const { nowPlaying, recentTracks } = useLastFmData()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [ytReady, setYtReady] = useState(false)
  const [externalTrack, setExternalTrack] = useState<TrackInfo | null>(null)
  const [spotifyMode, setSpotifyMode] = useState(false)
  const [spotifyReady, setSpotifyReady] = useState(false)

  const trackFromLastfm: TrackInfo | null = nowPlaying?.name
    ? { title: nowPlaying.name, artist: nowPlaying.artist?.name || 'Unknown' }
    : recentTracks[0]
      ? { title: recentTracks[0].name, artist: recentTracks[0].artist?.name || 'Unknown' }
      : null

  const currentTrack = externalTrack || trackFromLastfm
  const hasTrack = currentTrack !== null
  const liked = hasTrack ? isTrackLiked(currentTrack.title, currentTrack.artist) : false
  const prevTrackKeyRef = useRef('')
  const currentTrackKey = hasTrack ? `${currentTrack.title} - ${currentTrack.artist}` : ''
  const spotifyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Init YouTube player
  useEffect(() => {
    initPlayer().then(() => setYtReady(true))
    setOnStateChange((state: number) => {
      const YT = (window as any).YT
      if (state === YT?.PlayerState.PLAYING) setIsPlaying(true)
      else if (state === YT?.PlayerState.PAUSED) setIsPlaying(false)
      else if (state === YT?.PlayerState.ENDED) setIsPlaying(false)
    })
  }, [])

  // Init Spotify player if connected
  const initSpotify = useCallback(() => {
    if (!isSpotifyConnected()) {
      setSpotifyMode(false)
      setSpotifyReady(false)
      return
    }
    let cancelled = false
    initSpotifyPlayer().then((ok) => {
      if (!cancelled) {
        setSpotifyReady(ok)
        setSpotifyMode(ok)
      }
    })
    return () => { cancelled = true }
  }, [])

  useEffect(initSpotify, [initSpotify])

  // Re-init when connection changes (e.g. disconnected from Settings)
  useEffect(() => {
    const handler = () => initSpotify()
    window.addEventListener('spotify-connection-changed', handler)
    return () => window.removeEventListener('spotify-connection-changed', handler)
  }, [initSpotify])

  // Listen for Spotify state changes
  useEffect(() => {
    setSpotifyStateHandler((state: any) => {
      if (!state) return
      setIsPlaying(!state.paused)
      setCurrentTime(state.position / 1000)
      setDuration(state.duration / 1000)
    })
  }, [])

  // Poll Spotify playback state when playing (backup for SDK)
  useEffect(() => {
    if (!spotifyMode) return
    spotifyIntervalRef.current = setInterval(async () => {
      const ps = await spotifyApi.getPlaybackState()
      if (ps) {
        setCurrentTime(ps.progress_ms / 1000)
        if (ps.item) {
          setDuration(ps.item.duration_ms / 1000)
        }
        setIsPlaying(ps.is_playing)
      }
    }, 1000)
    return () => {
      if (spotifyIntervalRef.current) clearInterval(spotifyIntervalRef.current)
    }
  }, [spotifyMode])

  // Listen for external play-track events
  useEffect(() => {
    const handler = (e: Event) => {
      const { title, artist } = (e as CustomEvent).detail
      setExternalTrack({ title, artist })
    }
    window.addEventListener('play-track', handler)
    return () => window.removeEventListener('play-track', handler)
  }, [])

  // Play track when track key changes
  useEffect(() => {
    if (!hasTrack) return
    if (currentTrackKey === prevTrackKeyRef.current) return
    prevTrackKeyRef.current = currentTrackKey

    const playOnYoutube = () => {
      if (!ytReady) return
      const query = `${currentTrack.title} ${currentTrack.artist} audio`
      searchVideoBest(query).then((video) => {
        if (video) playVideo(video.id)
      })
    }

    if (spotifyMode && spotifyReady) {
      spotifyApi.searchTrack(`${currentTrack.title} ${currentTrack.artist}`).then((tracks) => {
        if (tracks && tracks.length > 0) {
          const deviceId = localStorage.getItem('spotify_device_id') || undefined
          spotifyApi.startPlaybackWithContext(`spotify:track:${tracks[0].id}`, deviceId)
        } else {
          playOnYoutube()
        }
      })
    } else {
      playOnYoutube()
    }
  }, [currentTrackKey, spotifyMode, spotifyReady, ytReady, hasTrack])

  // Add searchTrack to spotify-api
  // Progress polling for YouTube mode
  useEffect(() => {
    if (spotifyMode) return
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime())
      setDuration(getDuration())
    }, 500)
    return () => clearInterval(interval)
  }, [spotifyMode, isPlaying])

  const handlePlayPause = useCallback(() => {
    if (!hasTrack) return
    if (spotifyMode && spotifyReady) {
      if (isPlaying) spotifyApi.pausePlayback()
      else spotifyApi.startPlayback(localStorage.getItem('spotify_device_id') || undefined)
      return
    }
    if (!ytReady) return
    if (isPlaying) pauseVideo()
    else if (getCurrentTime() > 0) resumeVideo()
    else {
      const query = `${currentTrack!.title} ${currentTrack!.artist} audio`
      searchVideoBest(query).then((video) => {
        if (video) playVideo(video.id)
      })
    }
  }, [hasTrack, spotifyMode, spotifyReady, isPlaying, ytReady, currentTrack])

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      if (spotifyMode) spotifySetVolume(volume)
      else { unMute(); ytSetVolume(volume) }
    } else {
      setIsMuted(true)
      if (!spotifyMode) mute()
      else spotifySetVolume(0)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (duration === 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const pct = x / rect.width
    const target = pct * duration
    if (spotifyMode) {
      spotifyApi.seekToPosition(Math.round(target * 1000))
    } else if (ytReady) {
      seekTo(target)
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const playerReady = spotifyMode ? spotifyReady : ytReady

  return (
    <div className="h-[90px] border-t border-border bg-bg-base flex-shrink-0">
      <div id="youtube-player" className="hidden" />
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
              <Mic2 className="h-6 w-6 text-text-subdued" />
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
                  {spotifyMode && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent leading-none">
                      Spotify
                    </span>
                  )}
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
              disabled={!playerReady || !hasTrack}
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
            <div
              className={`flex-1 h-1 bg-bg-surface-elevated rounded-full overflow-hidden ${hasTrack ? 'cursor-pointer group' : ''}`}
              onClick={hasTrack ? handleSeek : undefined}
            >
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
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
            {/* Visual fill bar */}
            <div className="absolute inset-x-0 h-1 bg-bg-surface-elevated rounded-full pointer-events-none">
              <div
                className="h-full bg-white rounded-full group-hover:bg-accent transition-colors"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              />
            </div>
            {/* Hidden range input for interaction */}
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const v = Number(e.target.value)
                setVolumeState(v)
                if (spotifyMode) spotifySetVolume(v)
                else ytSetVolume(v)
                if (isMuted) {
                  setIsMuted(false)
                  if (!spotifyMode) unMute()
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
