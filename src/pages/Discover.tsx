import { useState, useEffect } from 'react'
import { useLastFmData } from '../hooks/useLastFmData'
import { lastFmApi, LastFmSimilarArtist } from '../lib/lastfm-api'
import { Button } from '../components/ui/Button'
import { Sparkles, Mic2, Users } from 'lucide-react'

export function Discover() {
  const { topArtists, recentTracks } = useLastFmData()
  const [similarArtists, setSimilarArtists] = useState<LastFmSimilarArtist[]>([])
  const [similarLoading, setSimilarLoading] = useState(false)

  const becauseYouLike = topArtists[0]?.name || ''

  useEffect(() => {
    if (!becauseYouLike) return
    setSimilarLoading(true)
    let cancelled = false
    lastFmApi.getSimilarArtists(becauseYouLike).then((data) => {
      if (!cancelled) {
        console.log('Similar artists response:', data)
        setSimilarArtists(data.similarartists?.artist || [])
      }
    }).catch((err) => {
      if (!cancelled) console.error('Failed to fetch similar artists:', err)
    }).finally(() => {
      if (!cancelled) setSimilarLoading(false)
    })
    return () => { cancelled = true }
  }, [becauseYouLike])

  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-accent mb-2">Discover</p>
        <h1 className="text-4xl font-bold text-white mb-8">Find Your Next Favorite Artist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-bg-surface rounded-md p-6 shadow-medium">
            <p className="text-xs text-text-subdued uppercase tracking-wider mb-3">Because You Like</p>
            <h2 className="text-3xl font-bold text-white mb-4">{becauseYouLike || 'Loading...'}</h2>
            <div className="aspect-square bg-gradient-to-br from-accent/20 to-bg-base rounded-md flex items-center justify-center">
              <Mic2 className="h-24 w-24 text-accent/30" />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-white mb-4">Similar Artists</p>
            {similarArtists.length > 0 ? similarArtists.slice(0, 5).map((artist, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-bg-surface rounded-md hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-bg-base rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-text-subdued" />
                  </div>
                  <span className="text-sm font-medium text-white">{artist.name}</span>
                </div>
                <Button variant="outline" size="sm">Explore →</Button>
              </div>
            )) : (
              <p className="text-sm text-text-subdued text-center py-8">
                {similarLoading ? 'Loading recommendations...' : 'No similar artists found'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Based on Your Recent Listening</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {recentTracks.slice(0, 4).map((track, i) => (
            <div key={i} className="bg-bg-surface rounded-md p-4 text-center hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium">
              <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-3">
                <Mic2 className="h-8 w-8 text-text-subdued" />
              </div>
              <p className="font-medium text-sm text-white truncate">{track.name}</p>
              <p className="text-xs text-text-subdued truncate mt-1">{track.artist?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
