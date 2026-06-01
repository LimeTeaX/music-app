import { useLastFmData } from '../../hooks/useLastFmData'
import { requestPlayTrackByName } from '../../lib/youtube-api'
import { Play } from 'lucide-react'

function getImage(images: { size: string; '#text': string }[]): string {
  return images?.find(i => i.size === 'large' || i.size === 'extralarge')?.['#text']
    || images?.[0]?.['#text'] || ''
}

export function ContinueListening() {
  const { recentTracks } = useLastFmData()
  const continueTracks = recentTracks.slice(0, 4)

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Continue Listening</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {continueTracks.map((track: any, i) => {
          const img = getImage(track.image || [])
          return (
            <div key={i} onClick={() => requestPlayTrackByName(track.name, track.artist?.name || '')} className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-all cursor-pointer shadow-medium group">
              <div className="relative mb-3">
                <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center overflow-hidden">
                  {img ? (
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-bg-base rounded-md flex items-center justify-center">
                      <Play className="h-5 w-5 text-text-subdued" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center shadow-heavy hover:scale-105">
                  <Play className="h-4 w-4 text-black ml-0.5" />
                </div>
              </div>
              <p className="font-medium text-sm text-white truncate">{track.name}</p>
              <p className="text-xs text-text-subdued truncate mt-1">{track.artist?.name}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}