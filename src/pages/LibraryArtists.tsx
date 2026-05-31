import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLastFmData } from '../hooks/useLastFmData'
import { Mic2 } from 'lucide-react'
import { isSpotifyConnected } from '../services/spotify-auth'
import * as spotifyApi from '../services/spotify-api'

export function LibraryArtists() {
  const navigate = useNavigate()
  const { topArtists: lastFmArtists } = useLastFmData()
  const [spotifyArtists, setSpotifyArtists] = useState<spotifyApi.SpotifyArtist[]>([])
  const [spotifyMode, setSpotifyMode] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isSpotifyConnected()) { setLoaded(true); return }
    setSpotifyMode(true)
    spotifyApi.getMyTopArtists('long_term', 20).then((data) => {
      if (data) setSpotifyArtists(data.items)
    }).finally(() => setLoaded(true))
  }, [])

  const artists = spotifyMode ? spotifyArtists : lastFmArtists

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Artists</h1>
        <p className="text-sm text-text-subdued">
          {spotifyMode ? 'Your top artists on Spotify' : 'Your top artists'}
          {spotifyMode && <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent leading-none">Spotify</span>}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {artists.map((artist: any, i) => (
          <div
            key={artist.id || i}
            onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
            className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium text-center"
          >
            <div className="w-full aspect-square bg-bg-base rounded-full flex items-center justify-center mb-3 mx-auto overflow-hidden">
              {artist.images?.[0]?.url ? (
                <img src={artist.images[0].url} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <Mic2 className="h-8 w-8 text-text-subdued" />
              )}
            </div>
            <p className="font-medium text-sm text-white truncate">{artist.name}</p>
            <p className="text-xs text-text-subdued mt-1">
              {artist.playcount
                ? `${parseInt(artist.playcount || '0').toLocaleString()} plays`
                : `${artist.popularity || 0}% popular`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
