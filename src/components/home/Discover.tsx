import { useState, useEffect } from 'react'
import { useLastFmData } from '../../hooks/useLastFmData'
import { lastFmApi, LastFmSimilarArtist } from '../../lib/lastfm-api'
import { Button } from '../ui/Button'
import { Mic2, Users, Sparkles } from 'lucide-react'

export function Discover() {
  const { topArtists } = useLastFmData()
  const [similarArtists, setSimilarArtists] = useState<LastFmSimilarArtist[]>([])
  
  const becauseYouLike = topArtists[0]?.name || ''
  const recommendedArtist = similarArtists[0]?.name || becauseYouLike

  useEffect(() => {
    if (!becauseYouLike) return
    let cancelled = false
    lastFmApi.getSimilarArtists(becauseYouLike).then((data) => {
      if (!cancelled) {
        setSimilarArtists(data.similarartists?.artist || [])
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [becauseYouLike])

  if (!becauseYouLike) return null
  
  return (
    <div>
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">Discover</p>
        <h2 className="text-2xl font-bold text-white">Find Your Next Favorite Artist</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-surface rounded-md p-6 shadow-medium hover:bg-bg-button-hover transition-colors">
          <p className="text-xs text-text-subdued uppercase tracking-wider mb-3">Because You Like</p>
          <h3 className="text-2xl font-bold text-white mb-4">{becauseYouLike}</h3>
          <div className="aspect-square bg-gradient-to-br from-accent/20 to-bg-base rounded-md flex items-center justify-center">
            <Mic2 className="h-28 w-28 text-accent/30" />
          </div>
        </div>
        
        <div className="bg-bg-surface rounded-md p-6 shadow-medium hover:bg-bg-button-hover transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-accent" />
              <p className="text-xs text-text-subdued uppercase tracking-wider">Recommended for You</p>
            </div>
            <div className="w-20 h-20 bg-bg-base rounded-md flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-text-subdued" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">{recommendedArtist}</h3>
            <p className="text-sm text-text-subdued mb-4">Similar to {becauseYouLike}</p>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Explore Similar →
          </Button>
        </div>
      </div>
    </div>
  )
}