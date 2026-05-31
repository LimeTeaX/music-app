import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLastFmData } from '../hooks/useLastFmData'
import { Disc } from 'lucide-react'
import { isSpotifyConnected } from '../services/spotify-auth'
import * as spotifyApi from '../services/spotify-api'

export function LibraryAlbums() {
  const navigate = useNavigate()
  const { topAlbums: lastFmAlbums } = useLastFmData()
  const [spotifyAlbums, setSpotifyAlbums] = useState<any[]>([])
  const [spotifyMode, setSpotifyMode] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!isSpotifyConnected()) { setLoaded(true); return }
    setSpotifyMode(true)
    spotifyApi.getSavedAlbums(20).then((data) => {
      if (data?.items) setSpotifyAlbums(data.items.map((item: any) => item.album))
    }).finally(() => setLoaded(true))
  }, [])

  if (spotifyMode) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Albums</h1>
          <p className="text-sm text-text-subdued">
            Your saved albums on Spotify
            <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent leading-none">Spotify</span>
          </p>
        </div>

        {spotifyAlbums.length === 0 ? (
          <div className="text-center py-16">
            <Disc className="h-16 w-16 text-text-subdued mx-auto mb-4" />
            <p className="text-lg text-text-subdued">No saved albums</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {spotifyAlbums.map((album: any) => (
              <div
                key={album.id}
                onClick={() => navigate(`/album/${encodeURIComponent(album.artists?.[0]?.name || '')}/${encodeURIComponent(album.name)}`)}
                className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium"
              >
                <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-3 overflow-hidden">
                  {album.images?.[0]?.url ? (
                    <img src={album.images[0].url} alt={album.name} className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="h-8 w-8 text-text-subdued" />
                  )}
                </div>
                <p className="font-medium text-sm text-white truncate">{album.name}</p>
                <p className="text-xs text-text-subdued truncate mt-1">{album.artists?.[0]?.name}</p>
                <p className="text-xs text-text-subdued">{album.release_date?.split('-')[0]}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Last.fm fallback
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Albums</h1>
        <p className="text-sm text-text-subdued">Your top albums</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {lastFmAlbums.map((album: any, i) => {
          const image = album.image?.find((img: any) => img.size === 'large')?.['#text'] || ''
          return (
            <div
              key={i}
              onClick={() => navigate(`/album/${encodeURIComponent(album.artist?.name || '')}/${encodeURIComponent(album.name)}`)}
              className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium"
            >
              <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-3 overflow-hidden">
                {image ? (
                  <img src={image} alt={album.name} className="w-full h-full object-cover" />
                ) : (
                  <Disc className="h-8 w-8 text-text-subdued" />
                )}
              </div>
              <p className="font-medium text-sm text-white truncate">{album.name}</p>
              <p className="text-xs text-text-subdued truncate mt-1">{album.artist?.name}</p>
              <p className="text-xs text-text-subdued">
                {parseInt(album.playcount || '0').toLocaleString()} plays
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
