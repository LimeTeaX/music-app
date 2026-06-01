import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLastFmData } from '../hooks/useLastFmData'
import { TopGenres } from '../components/TopGenres'
import { ListeningHeatmap } from '../components/ListeningHeatmap'
import { Music2 } from 'lucide-react'

interface DayActivity {
  day: string
  count: number
  percentage: number
}

export function Stats() {
  const navigate = useNavigate()
  const { user, topArtists, topAlbums, recentTracks } = useLastFmData()
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([])

  useEffect(() => {
    if (recentTracks.length === 0) return

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayCount: number[] = [0, 0, 0, 0, 0, 0, 0]

    recentTracks.forEach((track: any) => {
      if (track.date?.['#text']) {
        const day = new Date(track.date['#text']).getDay()
        dayCount[day]++
      }
    })

    const maxCount = Math.max(...dayCount, 1)
    setWeeklyActivity(dayNames.map((day, i) => ({
      day,
      count: dayCount[i],
      percentage: Math.round((dayCount[i] / maxCount) * 100),
    })))
  }, [recentTracks])

  const totalTracks = user?.playcount || 0
  const totalArtists = user?.artist_count || 0
  const totalAlbumsCount = parseInt(user?.album_count || '0') || topAlbums.length

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-sm text-text-subdued">Your listening journey in numbers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-bg-surface rounded-md p-6 shadow-medium">
          <p className="text-xs text-text-subdued uppercase tracking-wider mb-2">Tracks</p>
          <p className="text-3xl font-bold text-white">{totalTracks.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface rounded-md p-6 shadow-medium">
          <p className="text-xs text-text-subdued uppercase tracking-wider mb-2">Artists</p>
          <p className="text-3xl font-bold text-white">{totalArtists.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface rounded-md p-6 shadow-medium">
          <p className="text-xs text-text-subdued uppercase tracking-wider mb-2">Albums</p>
          <p className="text-3xl font-bold text-white">{totalAlbumsCount.toLocaleString()}</p>
        </div>
        <div className="bg-bg-surface rounded-md p-6 shadow-medium">
          <p className="text-xs text-text-subdued uppercase tracking-wider mb-2">Genres</p>
          <p className="text-3xl font-bold text-white">{topArtists.length}</p>
        </div>
      </div>

      {/* Weekly Activity */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Weekly Activity</h2>
        <div className="bg-bg-surface rounded-md p-5 shadow-medium">
          <div className="space-y-3">
            {weeklyActivity.length > 0 ? weeklyActivity.map(({ day, count, percentage }) => (
              <div key={day} className="flex items-center gap-4">
                <span className="text-sm text-text-subdued w-10">{day}</span>
                <div className="flex-1 h-8 bg-bg-base rounded overflow-hidden">
                  <div
                    className="h-full bg-accent rounded transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
                <span className="text-sm text-text-subdued w-10 text-right">{count}</span>
              </div>
            )) : (
              <p className="text-sm text-text-subdued text-center py-4">No recent activity data</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Artists */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Top Artists</h2>
        <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
          {topArtists.slice(0, 10).map((artist: any, i) => (
            <div
              key={artist.name || i}
              onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
              className="flex items-center justify-between p-5 hover:bg-bg-button-hover transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-text-subdued text-sm w-6">{i + 1}</span>
                <span className="text-sm font-medium text-white">{artist.name}</span>
              </div>
              <span className="text-sm text-text-subdued">
                {artist.playcount ? `${parseInt(artist.playcount).toLocaleString()} plays` : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Albums */}
      {topAlbums.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Top Albums</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {topAlbums.slice(0, 10).map((album: any, i) => (
              <div
                key={album.name || i}
                onClick={() => navigate(`/album/${encodeURIComponent(album.artist?.name || '')}/${encodeURIComponent(album.name)}`)}
                className="flex items-center justify-between p-5 hover:bg-bg-button-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-text-subdued text-sm w-6">{i + 1}</span>
                  <span className="text-sm font-medium text-white">{album.name}</span>
                </div>
                <span className="text-sm text-text-subdued">{album.playcount ? `${parseInt(album.playcount).toLocaleString()} plays` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Genres & Listening Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopGenres />
        <ListeningHeatmap />
      </div>
    </div>
  )
}
