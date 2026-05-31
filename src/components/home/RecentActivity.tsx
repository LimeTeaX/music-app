import { useLastFmData } from '../../hooks/useLastFmData'
import { Music2, Clock } from 'lucide-react'

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

export function RecentActivity() {
  const { recentTracks } = useLastFmData()

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {recentTracks.slice(0, 10).map((track, i) => (
          <div key={i} className="flex items-center gap-3 p-4 bg-bg-surface rounded-md hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium">
            <div className="w-10 h-10 bg-bg-base rounded-md flex items-center justify-center flex-shrink-0">
              <Music2 className="h-5 w-5 text-text-subdued" />
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
        ))}
      </div>
    </div>
  )
}
