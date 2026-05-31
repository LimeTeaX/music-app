import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { lastFmApi } from '../lib/lastfm-api'
import { requestPlayTrack } from '../lib/youtube-api'
import { Disc, Music2, Clock, Play } from 'lucide-react'

function getImage(images: { size: string; '#text': string }[]): string {
  const sizes = ['mega', 'extralarge', 'large', 'medium']
  for (const size of sizes) {
    const img = images.find(i => i.size === size)
    if (img?.['#text']) return img['#text']
  }
  return ''
}

function formatDuration(seconds: string): string {
  const sec = parseInt(seconds || '0')
  if (!sec) return ''
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Album() {
  const { artist, album } = useParams<{ artist: string; album: string }>()
  const navigate = useNavigate()
  const artistName = decodeURIComponent(artist || '')
  const albumName = decodeURIComponent(album || '')
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artistName || !albumName) return
    let cancelled = false
    setLoading(true)
    lastFmApi.getAlbumInfo(artistName, albumName).then((data) => {
      if (!cancelled) setInfo(data.album)
    }).catch((err) => {
      console.error('Failed to fetch album:', err)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [artistName, albumName])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-subdued">Loading album...</p>
        </div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="text-center py-24">
        <Disc className="h-16 w-16 text-text-subdued mx-auto mb-4" />
        <p className="text-lg text-text-subdued">Album not found</p>
      </div>
    )
  }

  const imageUrl = getImage(info.image)
  const tracks = info.tracks?.track || []
  const tags = info.tags?.tag?.filter(
    (t: any) => !['seen live', 'all', 'my playlists'].includes(t.name.toLowerCase())
  ) || []
  const wiki = info.wiki?.content?.replace(/<[^>]*>/g, '').split('. ').slice(0, 2).join('. ')

  return (
    <div className="space-y-12">
      {/* Album Header */}
      <div className="bg-gradient-to-b from-bg-surface to-bg-base rounded-md p-6 shadow-medium">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-48 h-48 flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={info.name} className="w-full h-full object-cover rounded-md shadow-heavy" />
            ) : (
              <div className="w-full h-full bg-bg-surface-elevated rounded-md flex items-center justify-center">
                <Disc className="h-16 w-16 text-text-subdued" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              onClick={() => navigate(`/artist/${encodeURIComponent(info.artist || artistName)}`)}
              className="text-sm text-text-subdued hover:text-white cursor-pointer transition-colors mb-2"
            >
              {info.artist || artistName}
            </p>
            <h1 className="text-4xl font-bold text-white mb-4">{info.name}</h1>

            <div className="flex flex-wrap gap-4 mb-4">
              {info.playcount && (
                <div className="flex items-center gap-2 text-sm text-text-subdued">
                  <Music2 className="h-4 w-4 text-accent" />
                  {parseInt(info.playcount).toLocaleString()} plays
                </div>
              )}
              {info.wiki?.published && (
                <div className="flex items-center gap-2 text-sm text-text-subdued">
                  <Clock className="h-4 w-4 text-accent" />
                  {new Date(info.wiki.published).getFullYear()}
                </div>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.slice(0, 6).map((tag: any) => (
                  <span key={tag.name} className="px-3 py-1 bg-bg-button rounded-full text-xs text-white">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {wiki && (
              <p className="text-sm text-text-subdued leading-relaxed line-clamp-2">{wiki}.</p>
            )}
          </div>
        </div>
      </div>

      {/* Track List */}
      {tracks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Tracks ({tracks.length})</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {tracks.map((track: any, i: number) => {
              const trackName = track.name || track
              const duration = formatDuration(track.duration || '')
              return (
                <div
                  key={i}
                  onClick={() => {
                    if (trackName) {
                      requestPlayTrack(trackName, info.artist || artistName)
                    }
                  }}
                  className="flex items-center justify-between p-4 hover:bg-bg-button-hover transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-text-subdued text-sm w-6 flex-shrink-0">{i + 1}</span>
                    <div className="w-8 h-8 bg-bg-base rounded flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Play className="h-4 w-4 text-text-subdued group-hover:text-accent transition-colors" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{trackName}</p>
                    </div>
                  </div>
                  {duration && (
                    <span className="text-xs text-text-subdued flex-shrink-0 ml-4">{duration}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}