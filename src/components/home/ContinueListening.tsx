import { useLastFmData } from '../../hooks/useLastFmData'
import { requestPlayTrack } from '../../lib/youtube-api'
import { Disc, Play } from 'lucide-react'

export function ContinueListening() {
  const { recentTracks } = useLastFmData()
  const continueTracks = recentTracks.slice(0, 4)
  
  return (
    <div>
      {/* Title ke Grid: 16px */}
      <h2 className="text-xl font-bold text-white mb-4">Continue Listening</h2>
      
      {/* Grid gap: 24px antar card */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {continueTracks.map((track, i) => (
          <div key={i} onClick={() => requestPlayTrack(track.name, track.artist?.name || '')} className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-all cursor-pointer shadow-medium group">
            <div className="relative mb-3">
              <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center">
                <Disc className="h-8 w-8 text-text-subdued group-hover:text-accent transition-colors" />
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-heavy hover:scale-105">
                <Play className="h-4 w-4 text-black ml-0.5" />
              </div>
            </div>
            <p className="font-medium text-sm text-white truncate">{track.name}</p>
            <p className="text-xs text-text-subdued truncate mt-1">{track.artist?.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}