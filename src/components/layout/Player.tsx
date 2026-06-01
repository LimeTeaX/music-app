import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Heart, ExternalLink } from 'lucide-react'
import { isTrackLiked, toggleLike } from '../../lib/liked-tracks'
import { formatDuration } from '../../lib/utils'
import * as yt from '../../lib/youtube-api'

interface TrackInfo {
  title: string
  artist: string
  album?: string
  videoId?: string
  thumbnail?: string
}

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolumeState] = useState(() => {
    return Number(localStorage.getItem('yt_volume') ?? 70)
  })
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [track, setTrack] = useState<TrackInfo | null>(null)
  const [ytReady, setYtReady] = useState(false)

  const prevVideoRef = useRef('')
  const isSeeking = useRef(false)
  const pollRef = useRef<number>(0)

  const hasTrack = track !== null
  const liked = hasTrack ? isTrackLiked(track.title, track.artist) : false

  // Init YouTube player
  useEffect(() => {
    yt.initPlayer('yt-player').then(() => {
      setYtReady(true)
      yt.setVolume(volume)
      yt.setOnStateChange((state: number) => {
        setIsPlaying(state === 1)
        // track ended
        if (state === 0) {
          setCurrentTime(0)
          setIsPlaying(false)
        }
      })
    })
  }, [])

  // Poll progress
  useEffect(() => {
    if (!ytReady || !isPlaying || isSeeking.current) return
    pollRef.current = window.setInterval(() => {
      setCurrentTime(yt.getCurrentTime())
      setDuration(yt.getDuration())
    }, 500)
    return () => clearInterval(pollRef.current)
  }, [ytReady, isPlaying])

  // Listen for play-track events
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail as TrackInfo
      setTrack(d)
    }
    window.addEventListener('play-track', handler)
    return () => window.removeEventListener('play-track', handler)
  }, [])

  // Play when videoId changes
  useEffect(() => {
    if (!ytReady || !track?.videoId) return
    if (track.videoId === prevVideoRef.current) return
    prevVideoRef.current = track.videoId
    yt.playVideo(track.videoId)
  }, [track?.videoId, ytReady])

  const handlePlayPause = useCallback(() => {
    if (!hasTrack) return
    if (isPlaying) {
      yt.pauseVideo()
    } else {
      yt.resumeVideo()
    }
  }, [hasTrack, isPlaying])

  const handleSeek = useCallback((seconds: number) => {
    yt.seekTo(seconds)
    setCurrentTime(seconds)
  }, [])

  const handleVolumeChange = (v: number) => {
    setVolumeState(v)
    yt.setVolume(v)
    localStorage.setItem('yt_volume', String(v))
    if (isMuted) setIsMuted(false)
  }

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      yt.unMute()
      yt.setVolume(volume)
    } else {
      setIsMuted(true)
      yt.mute()
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const ytUrl = track?.videoId ? `https://youtube.com/watch?v=${track.videoId}` : ''

  return (
    <>
      <div id="yt-player" />
      <div className="h-[90px] border-t border-border bg-bg-base flex-shrink-0">
        <div className="h-full flex items-center justify-between px-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-[30%] min-w-[180px]">
            <div className="w-14 h-14 bg-bg-surface-elevated rounded-md flex items-center justify-center shadow-medium flex-shrink-0 overflow-hidden">
              {track?.thumbnail ? (
                <img src={track.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : isPlaying ? (
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
                    <p className="text-sm font-medium text-white truncate">{track.title}</p>
                    <button onClick={() => toggleLike(track.title, track.artist, track.album)} className="flex-shrink-0">
                      <Heart className={`h-4 w-4 ${liked ? 'text-accent fill-accent' : 'text-text-subdued'}`} />
                    </button>
                    {ytUrl && (
                      <a href={ytUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <ExternalLink className="h-3.5 w-3.5 text-text-subdued hover:text-white" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-text-subdued truncate flex items-center gap-1.5">
                    {track.artist}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 leading-none">YouTube</span>
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
              <button
                onClick={handlePlayPause}
                disabled={!hasTrack}
                className="w-8 h-8 rounded-full bg-white hover:scale-105 flex items-center justify-center transition-all shadow-heavy disabled:opacity-40 disabled:hover:scale-100"
              >
                {isPlaying ? <Pause className="h-4 w-4 text-black" /> : <Play className="h-4 w-4 text-black ml-0.5" />}
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
                    isSeeking.current = false
                    handleSeek(Number((e.target as HTMLInputElement).value))
                  }}
                  onTouchStart={() => { isSeeking.current = true }}
                  onTouchEnd={(e) => {
                    isSeeking.current = false
                    handleSeek(Number((e.target as HTMLInputElement).value))
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
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
