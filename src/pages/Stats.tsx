import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLastFmData } from '../hooks/useLastFmData'
import { TopGenres } from '../components/TopGenres'
import { ListeningHeatmap } from '../components/ListeningHeatmap'
import { isSpotifyConnected } from '../services/spotify-auth'
import * as spotifyApi from '../services/spotify-api'
import { Mic2, Music2 } from 'lucide-react'

interface DayActivity {
  day: string
  count: number
  percentage: number
}

export function Stats() {
  const navigate = useNavigate()
  const { user, topArtists, topAlbums, recentTracks } = useLastFmData()
  const [spotifyMode, setSpotifyMode] = useState(false)
  const [spotifyTopArtists, setSpotifyTopArtists] = useState<spotifyApi.SpotifyArtist[]>([])
  const [spotifyTopTracks, setSpotifyTopTracks] = useState<spotifyApi.SpotifyTrack[]>([])
  const [spotifyRecent, setSpotifyRecent] = useState<spotifyApi.SpotifyRecentlyPlayed[]>([])
  const [loaded, setLoaded] = useState(false)
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([])

  // Spotify data
  useEffect(() => {
    if (!isSpotifyConnected()) { setLoaded(true); return }
    setSpotifyMode(true)
    Promise.all([
      spotifyApi.getMyTopArtists('medium_term', 10),
      spotifyApi.getMyTopTracks('medium_term', 10),
      spotifyApi.getRecentlyPlayed(20),
    ]).then(([artists, tracks, recent]) => {
      if (artists) setSpotifyTopArtists(artists.items)
      if (tracks) setSpotifyTopTracks(tracks.items)
      if (recent) setSpotifyRecent(recent.items)
    }).finally(() => setLoaded(true))
  }, [])

  // Last.fm weekly activity (only when not using Spotify)
  useEffect(() => {
    if (spotifyMode) return
    if (recentTracks.length === 0) return

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayCount: number[] = [0, 0, 0, 0, 0, 0, 0]

    recentTracks.forEach((track) => {
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
  }, [spotifyMode, recentTracks])

  // Spotify data helpers
  const displayArtists = spotifyMode ? spotifyTopArtists : topArtists
  const displayTopTracks = spotifyMode ? spotifyTopTracks.slice(0, 10) : []
  const displayAlbums = spotifyMode ? [] : topAlbums

  // Extract genres from Spotify artists
  const spotifyGenres = spotifyMode
    ? [...new Set(spotifyTopArtists.flatMap(a => a.genres))].slice(0, 10)
    : []

  const totalTracks = spotifyMode
    ? spotifyTopTracks.length
    : (user?.playcount || 0)

  const totalArtists = spotifyMode
    ? spotifyTopArtists.length
    : (user?.artist_count || 0)

  const totalAlbumsCount = spotifyMode
    ? 0
    : (user?.album_count ? parseInt(user.album_count) : (topAlbums.length || 0))

  return (
    <div className="space-y-12">
      {/* Page Title */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
        <p className="text-sm text-text-subdued">
          {spotifyMode ? 'Powered by Spotify' : 'Your listening journey in numbers'}
          {spotifyMode && <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent leading-none">Spotify</span>}
        </p>
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
          <p className="text-3xl font-bold text-white">
            {spotifyMode ? spotifyGenres.length : displayArtists.length}
          </p>
        </div>
      </div>

      {/* Weekly Activity — only for Last.fm */}
      {!spotifyMode && (
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
      )}

      {/* Spotify Recently Played */}
      {spotifyMode && spotifyRecent.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recently Played</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {spotifyRecent.slice(0, 10).map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-bg-button-hover transition-colors">
                <div className="w-10 h-10 bg-bg-base rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {r.track.album?.images?.[0]?.url ? (
                    <img src={r.track.album.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Music2 className="h-4 w-4 text-text-subdued" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{r.track.name}</p>
                  <p className="text-xs text-text-subdued truncate">{r.track.artists.map(a => a.name).join(', ')}</p>
                </div>
                <span className="text-xs text-text-subdued">{new Date(r.played_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spotify Top Tracks */}
      {spotifyMode && displayTopTracks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Top Tracks</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {displayTopTracks.map((t, i) => (
              <div key={(t as any).id} className="flex items-center justify-between p-5 hover:bg-bg-button-hover transition-colors">
                <div className="flex items-center gap-4">
                  <span className="text-text-subdued text-sm w-6">{i + 1}</span>
                  <div className="w-10 h-10 bg-bg-base rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {(t as any).album?.images?.[0]?.url ? (
                      <img src={(t as any).album.images[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music2 className="h-4 w-4 text-text-subdued" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-white">{t.name}</span>
                </div>
                <span className="text-sm text-text-subdued">{t.artists?.map(a => a.name).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Artists */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Top Artists</h2>
        <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
          {displayArtists.slice(0, 10).map((artist: any, i) => (
            <div
              key={i}
              onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
              className="flex items-center justify-between p-5 hover:bg-bg-button-hover transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <span className="text-text-subdued text-sm w-6">{i + 1}</span>
                {artist.images?.[0]?.url && (
                  <img src={artist.images[0].url} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                <span className="text-sm font-medium text-white">{artist.name}</span>
              </div>
              <span className="text-sm text-text-subdued">
                {artist.playcount ? `${artist.playcount} plays` : `${artist.popularity}% popular`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Albums — only for Last.fm */}
      {!spotifyMode && displayAlbums.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Top Albums</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {displayAlbums.slice(0, 10).map((album: any, i) => (
              <div
                key={i}
                onClick={() => navigate(`/album/${encodeURIComponent(album.artist?.name || '')}/${encodeURIComponent(album.name)}`)}
                className="flex items-center justify-between p-5 hover:bg-bg-button-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-text-subdued text-sm w-6">{i + 1}</span>
                  <span className="text-sm font-medium text-white">{album.name}</span>
                </div>
                <span className="text-sm text-text-subdued">{album.artist?.name || album.playcount} plays</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Genres & Listening Heatmap side by side */}
      {!spotifyMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TopGenres />
          <ListeningHeatmap />
        </div>
      )}

      {/* Spotify Genres */}
      {spotifyMode && spotifyGenres.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Top Genres</h2>
          <div className="flex flex-wrap gap-2">
            {spotifyGenres.map((g) => (
              <span key={g} className="px-4 py-2 bg-bg-surface rounded-md text-sm text-white shadow-medium">
                {g}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
