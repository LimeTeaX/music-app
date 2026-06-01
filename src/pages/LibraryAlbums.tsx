import { useNavigate } from 'react-router-dom'
import { useLastFmData } from '../hooks/useLastFmData'
import { Disc } from 'lucide-react'

export function LibraryAlbums() {
  const navigate = useNavigate()
  const { topAlbums } = useLastFmData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Albums</h1>
        <p className="text-sm text-text-subdued">Your top albums</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {topAlbums.map((album: any, i) => {
          const image = album.image?.find((img: any) => img.size === 'large')?.['#text'] || ''
          return (
            <div
              key={album.name || i}
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
