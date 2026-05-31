import { useState, useEffect } from 'react'
import { User, Music2, Disc, Headphones, ListMusic, Clock, Users, Mic2 } from 'lucide-react'
import { isSpotifyConnected } from '../services/spotify-auth'
import * as spotifyApi from '../services/spotify-api'

export function Profile() {
  const [me, setMe] = useState<spotifyApi.SpotifyUser | null>(null)
  const [topArtists, setTopArtists] = useState<spotifyApi.SpotifyArtist[]>([])
  const [topTracks, setTopTracks] = useState<spotifyApi.SpotifyTrack[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<spotifyApi.SpotifyRecentlyPlayed[]>([])
  const [playlists, setPlaylists] = useState<spotifyApi.SpotifyPlaylist[]>([])
  const [timeRange, setTimeRange] = useState<'short_term' | 'medium_term' | 'long_term'>('medium_term')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSpotifyConnected()) { setLoading(false); return }
    let cancelled = false
    Promise.all([
      spotifyApi.getMe(),
      spotifyApi.getMyTopArtists(timeRange, 10),
      spotifyApi.getMyTopTracks(timeRange, 10),
      spotifyApi.getRecentlyPlayed(10),
      spotifyApi.getMyPlaylists(10),
    ]).then(([me, artists, tracks, recent, lists]) => {
      if (cancelled) return
      if (me) setMe(me)
      if (artists) setTopArtists(artists.items)
      if (tracks) setTopTracks(tracks.items)
      if (recent) setRecentlyPlayed(recent.items)
      if (lists) setPlaylists(lists.items)
    }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [timeRange])

  if (!isSpotifyConnected()) {
    return (
      <div className="text-center py-24">
        <User className="h-16 w-16 text-text-subdued mx-auto mb-4" />
        <p className="text-lg text-text-subdued mb-1">Connect Spotify to see your profile</p>
        <p className="text-sm text-text-muted">Go to Settings to connect</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-bg-surface to-bg-base rounded-md p-6 shadow-medium">
        <div className="flex items-center gap-6">
          {me?.images?.[0]?.url ? (
            <img src={me.images[0].url} alt="" className="w-24 h-24 rounded-full object-cover shadow-heavy" />
          ) : (
            <div className="w-24 h-24 bg-bg-surface-elevated rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-text-subdued" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{me?.display_name || 'Unknown'}</h1>
            <p className="text-sm text-text-subdued mb-3">{me?.email || ''}</p>
            <div className="flex flex-wrap gap-4 text-sm text-text-subdued">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-accent" />
                {me?.followers?.total?.toLocaleString()} followers
              </span>
              <span className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-accent" />
                {me?.product === 'premium' ? 'Premium' : 'Free'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-accent" />
                {me?.country || ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Artists */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Top Artists</h2>
          <div className="flex gap-1">
            {(['short_term', 'medium_term', 'long_term'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  timeRange === r ? 'bg-accent text-black' : 'bg-bg-button text-text-subdued hover:text-white'
                }`}
              >
                {r === 'short_term' ? '4 weeks' : r === 'medium_term' ? '6 months' : 'All time'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topArtists.map((a, i) => (
            <div key={a.id} className="bg-bg-surface rounded-md p-4 shadow-medium text-center">
              <div className="w-full aspect-square bg-bg-base rounded-full flex items-center justify-center mb-3 overflow-hidden">
                {a.images?.[0]?.url ? (
                  <img src={a.images[0].url} alt={a.name} className="w-full h-full object-cover" />
                ) : (
                  <Mic2 className="h-8 w-8 text-text-subdued" />
                )}
              </div>
              <p className="text-sm font-medium text-white truncate">{a.name}</p>
              <p className="text-xs text-text-subdued mt-1">{a.popularity}% popular</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tracks */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Top Tracks</h2>
        <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
          {topTracks.map((t, i) => (
            <div key={t.id} className="flex items-center gap-4 p-4 hover:bg-bg-button-hover transition-colors">
              <span className="text-text-subdued text-sm w-6 flex-shrink-0">{i + 1}</span>
              <div className="w-10 h-10 bg-bg-base rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {t.album?.images?.[0]?.url ? (
                  <img src={t.album.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music2 className="h-4 w-4 text-text-subdued" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{t.name}</p>
                <p className="text-xs text-text-subdued truncate">{t.artists?.map(a => a.name).join(', ')}</p>
              </div>
              <span className="text-xs text-text-subdued">{t.album?.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recently Played</h2>
        <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
          {recentlyPlayed.slice(0, 10).map((r, i) => (
            <div key={`${r.track.id}-${i}`} className="flex items-center gap-4 p-4 hover:bg-bg-button-hover transition-colors">
              <div className="w-10 h-10 bg-bg-base rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                {r.track.album?.images?.[0]?.url ? (
                  <img src={r.track.album.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music2 className="h-4 w-4 text-text-subdued" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{r.track.name}</p>
                <p className="text-xs text-text-subdued truncate">{r.track.artists?.map(a => a.name).join(', ')}</p>
              </div>
              <span className="text-xs text-text-subdued">{new Date(r.played_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists */}
      {playlists.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {playlists.map((p) => (
              <div key={p.id} className="bg-bg-surface rounded-md p-4 shadow-medium">
                <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-3 overflow-hidden">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <ListMusic className="h-8 w-8 text-text-subdued" />
                  )}
                </div>
                <p className="text-sm font-medium text-white truncate">{p.name}</p>
                <p className="text-xs text-text-subdued mt-1">{p.tracks?.total} tracks</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
