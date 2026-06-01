import { useNavigate } from 'react-router-dom'
import { useLastFmData } from '../hooks/useLastFmData'
import { Mic2 } from 'lucide-react'

export function LibraryArtists() {
  const navigate = useNavigate()
  const { topArtists } = useLastFmData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Artists</h1>
        <p className="text-sm text-text-subdued">Your top artists</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {topArtists.map((artist: any, i) => (
          <div
            key={artist.name || i}
            onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
            className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium text-center"
          >
            <div className="w-full aspect-square bg-bg-base rounded-full flex items-center justify-center mb-3 mx-auto overflow-hidden">
              {artist.image?.find((i: any) => i.size === 'large')?.['#text'] ? (
                <img src={artist.image.find((i: any) => i.size === 'large')?.['#text']} alt={artist.name} className="w-full h-full object-cover" />
              ) : (
                <Mic2 className="h-8 w-8 text-text-subdued" />
              )}
            </div>
            <p className="font-medium text-sm text-white truncate">{artist.name}</p>
            <p className="text-xs text-text-subdued mt-1">
              {parseInt(artist.playcount || '0').toLocaleString()} plays
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
