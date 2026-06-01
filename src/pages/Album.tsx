import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { requestPlayTrackByName } from '../lib/youtube-api'
import { lastFmApi } from '../lib/lastfm-api'
import { Disc, Music2, Clock, Play } from 'lucide-react'

function getImage(images: { size: string; '#text': string }[]): string {
  return images?.find(i => i.size === 'mega' || i.size === 'extralarge')?.['#text']
    || images?.find(i => i.size === 'large')?.['#text']
    || images?.[0]?.['#text'] || ''
}

export function Album() {
  const { artist, album } = useParams<{ artist: string; album: string }>()
  const artistName = decodeURIComponent(artist || '')
  const albumName = decodeURIComponent(album || '')
  const [info, setInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artistName || !albumName) return
    let cancelled = false

    const fetchAlbum = async () => {
      setLoading(true)
      try {
        const data = await lastFmApi.getAlbumInfo(artistName, albumName)
        if (!cancelled) setInfo(data.album || null)
      } catch (err) {
        console.error('Failed to fetch album:', err)
        if (!cancelled) setInfo(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAlbum()
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

  const imageUrl = getImage(info.image || [])
  const tracks = info.tracks?.track || []
  const trackList = Array.isArray(tracks) ? tracks : [tracks]
  const albumArtist = info.artist || artistName

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
            <p className="text-sm text-text-subdued mb-2">{albumArtist}</p>
            <h1 className="text-4xl font-bold text-white mb-4">{info.name}</h1>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-text-subdued">
                <Music2 className="h-4 w-4 text-accent" />
                {trackList.length} tracks
              </div>
              <div className="flex items-center gap-2 text-sm text-text-subdued">
                <Clock className="h-4 w-4 text-accent" />
                {info.release_date || info.releasedate || ''}
              </div>
              <div className="text-sm text-text-subdued">
                {Number(info.playcount || 0).toLocaleString()} plays
              </div>
            </div>

            {info.tags?.tag?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {(Array.isArray(info.tags.tag) ? info.tags.tag : [info.tags.tag]).slice(0, 6).map((tag: any) => (
                  <span key={tag.name} className="px-3 py-1 bg-bg-button rounded-full text-xs text-white">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {info.wiki?.summary && (
              <p className="text-sm text-text-subdued leading-relaxed line-clamp-3">
                {info.wiki.summary.replace(/<a[^>]*>.*?<\/a>/g, '').replace(/<[^>]+>/g, '')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Track List */}
      {trackList.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Tracks ({trackList.length})</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {trackList.map((track: any, i: number) => (
              <div
                key={track.name + i}
                onClick={() => requestPlayTrackByName(track.name, albumArtist)}
                className="flex items-center justify-between p-4 hover:bg-bg-button-hover transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-text-subdued text-sm w-6 flex-shrink-0">{track['@attr']?.rank || i + 1}</span>
                  <div className="w-8 h-8 bg-bg-base rounded flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Play className="h-4 w-4 text-text-subdued group-hover:text-accent transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{track.name}</p>
                  </div>
                </div>
                <span className="text-xs text-text-subdued flex-shrink-0 ml-4">
                  {track.duration ? `${Math.floor(Number(track.duration) / 60)}:${(Number(track.duration) % 60).toString().padStart(2, '0')}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
