import { useState, useEffect } from 'react'
import { useLastFmData } from '../../hooks/useLastFmData'
import { lastFmApi } from '../../lib/lastfm-api'
import { Button } from '../ui/Button'
import { Radio, Clock, Calendar, Disc } from 'lucide-react'

export function Hero() {
  const { topArtists, user, recentTracks } = useLastFmData()
  const [topGenre, setTopGenre] = useState<string>('—')
  
  const topArtist = topArtists[0]?.name || '—'
  const totalTracks = user?.playcount || 0
  const estimatedHours = Math.floor(totalTracks * 3.5 / 60)
  const recentPlayCount = recentTracks.length

  useEffect(() => {
    if (!topArtists[0]?.name) return
    let cancelled = false
    lastFmApi.getArtistInfo(topArtists[0].name).then((data) => {
      if (cancelled) return
      const tags = data.artist?.tags?.tag || []
      const validTags = tags.filter((t: any) => !['seen live', 'all', 'my playlists'].includes(t.name.toLowerCase()))
      if (validTags.length > 0) {
        setTopGenre(validTags[0].name)
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [topArtists])

  return (
    <div className="bg-gradient-to-b from-bg-surface to-bg-base rounded-md p-6 shadow-medium">
      <div className="mb-2">
        <p className="text-xs font-bold uppercase tracking-wider text-accent">
          Your Music Story
        </p>
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-6">
        {totalTracks.toLocaleString()} Tracks
      </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="flex items-center gap-3">
          <Radio className="h-5 w-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-xs text-text-subdued uppercase tracking-wider mb-0.5">Top Artist</p>
            <p className="text-sm font-bold text-white">{topArtist}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Disc className="h-5 w-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-xs text-text-subdued uppercase tracking-wider mb-0.5">Top Genre</p>
            <p className="text-sm font-bold text-white">{topGenre}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-xs text-text-subdued uppercase tracking-wider mb-0.5">Listening Time</p>
            <p className="text-sm font-bold text-white">{estimatedHours} Hours</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-accent flex-shrink-0" />
          <div>
            <p className="text-xs text-text-subdued uppercase tracking-wider mb-0.5">Recent Plays</p>
            <p className="text-sm font-bold text-white">{recentPlayCount.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      <Button variant="secondary" size="md">
        View Listening Report →
      </Button>
    </div>
  )
}