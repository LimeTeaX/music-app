import { useLastFmData } from '../../hooks/useLastFmData'
import { requestPlayTrackByName } from '../../lib/youtube-api'
import { Clock, Play } from 'lucide-react'

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

function getImage(images: { size: string; '#text': string }[]): string {
  return images?.find(i => i.size === 'large' || i.size === 'extralarge')?.['#text']
    || images?.[0]?.['#text'] || ''
}

export function RecentlyPlayed() {
  const { recentTracks } = useLastFmData()
  
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Recently Played</h2>
      
      <div className="space-y-2">
        {recentTracks.slice(0, 10).map((track: any, i) => {
          const img = getImage(track.image || [])
          return (
            <div key={i} onClick={() => requestPlayTrackByName(track.name, track.artist?.name || '')} className="flex items-center gap-3 p-4 bg-bg-surface rounded-md hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium group">
              <div className="w-10 h-10 bg-bg-base rounded-md flex-shrink-0 overflow-hidden">
                {img ? (
                  <img src={img} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-5 w-5 text-text-subdued" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock className="h-3 w-3 text-text-subdued" />
                  <p className="text-xs text-text-subdued">
                    {track.date?.['#text'] ? timeAgo(track.date['#text']) : 'Unknown'}
                  </p>
                </div>
                <p className="text-sm font-medium text-white truncate">{track.name}</p>
                <p className="text-xs text-text-subdued truncate mt-0.5">{track.artist?.name}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}