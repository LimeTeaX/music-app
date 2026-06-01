import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { requestPlayTrackByName } from '../lib/youtube-api'
import { lastFmApi, type LastFmSimilarArtist } from '../lib/lastfm-api'
import { Mic2, Music2, Radio, Users, Disc } from 'lucide-react'

function getImage(images: { size: string; '#text': string }[]): string {
  return images?.find(i => i.size === 'mega' || i.size === 'extralarge')?.['#text']
    || images?.find(i => i.size === 'large')?.['#text']
    || images?.[0]?.['#text'] || ''
}

interface TrackItem {
  name: string
  playcount: string
  duration?: string
}

interface AlbumItem {
  name: string
  playcount: string
  image: { size: string; '#text': string }[]
  url: string
}

export function Artist() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const artistName = decodeURIComponent(id || '')

  const [info, setInfo] = useState<any>(null)
  const [topTracks, setTopTracks] = useState<TrackItem[]>([])
  const [topAlbums, setTopAlbums] = useState<AlbumItem[]>([])
  const [similar, setSimilar] = useState<LastFmSimilarArtist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artistName) return
    let cancelled = false

    const fetchAll = async () => {
      setLoading(true)
      try {
        const [infoData, tracksData, albumsData, similarData] = await Promise.all([
          lastFmApi.getArtistInfo(artistName),
          lastFmApi.getArtistTopTracks(artistName),
          lastFmApi.getArtistTopAlbums(artistName),
          lastFmApi.getSimilarArtists(artistName),
        ])
        if (cancelled) return
        setInfo(infoData.artist || null)
        setTopTracks(tracksData?.toptracks?.track?.slice(0, 10) || [])
        setTopAlbums(albumsData?.topalbums?.album?.slice(0, 10) || [])
        setSimilar(similarData?.similarartists?.artist?.slice(0, 10) || [])
      } catch (err) {
        console.error('Failed to fetch artist data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [artistName])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-text-subdued">Loading artist...</p>
        </div>
      </div>
    )
  }

  if (!info) {
    return (
      <div className="text-center py-24">
        <Mic2 className="h-16 w-16 text-text-subdued mx-auto mb-4" />
        <p className="text-lg text-text-subdued">Artist not found</p>
      </div>
    )
  }

  const imageUrl = getImage(info.image || [])

  return (
    <div className="space-y-12">
      {/* Artist Header */}
      <div className="bg-gradient-to-b from-bg-surface to-bg-base rounded-md p-6 shadow-medium">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-48 h-48 flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={info.name} className="w-full h-full object-cover rounded-md shadow-heavy" />
            ) : (
              <div className="w-full h-full bg-bg-surface-elevated rounded-md flex items-center justify-center">
                <Mic2 className="h-16 w-16 text-text-subdued" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold text-white mb-4">{info.name}</h1>

            <div className="flex flex-wrap gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-accent" />
                <span className="text-sm text-text-subdued">
                  {Number(info.stats?.listeners || 0).toLocaleString()} listeners
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-sm text-text-subdued">
                  {Number(info.stats?.playcount || 0).toLocaleString()} scrobbles
                </span>
              </div>
            </div>

            {info.tags?.tag?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {info.tags.tag.slice(0, 6).map((tag: any) => (
                  <span key={tag.name} className="px-3 py-1 bg-bg-button rounded-full text-xs text-white">
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {info.bio?.summary && (
              <p className="text-sm text-text-subdued leading-relaxed line-clamp-3">
                {info.bio.summary.replace(/<a[^>]*>.*?<\/a>/g, '').replace(/<[^>]+>/g, '')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Popular Tracks</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {topTracks.map((track: any, i: number) => (
              <div
                key={track.name + i}
                onClick={() => requestPlayTrackByName(track.name, info.name)}
                className="flex items-center justify-between p-5 hover:bg-bg-button-hover transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-text-subdued text-sm w-6 flex-shrink-0">{i + 1}</span>
                  <div className="w-8 h-8 bg-bg-base rounded flex items-center justify-center flex-shrink-0">
                    <Music2 className="h-4 w-4 text-text-subdued" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{track.name}</p>
                  </div>
                </div>
                <span className="text-sm text-text-subdued flex-shrink-0 ml-4">
                  {Number(track.playcount || 0).toLocaleString()} plays
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {topAlbums.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topAlbums.slice(0, 10).map((album: any) => (
              <div
                key={album.name}
                onClick={() => navigate(`/album/${encodeURIComponent(info.name)}/${encodeURIComponent(album.name)}`)}
                className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium"
              >
                <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-3 overflow-hidden">
                  {getImage(album.image || []) ? (
                    <img src={getImage(album.image || [])} alt={album.name} className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="h-8 w-8 text-text-subdued" />
                  )}
                </div>
                <p className="font-medium text-sm text-white truncate">{album.name}</p>
                <p className="text-xs text-text-subdued mt-1">{Number(album.playcount || 0).toLocaleString()} plays</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar Artists */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Similar Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {similar.slice(0, 10).map((artist) => {
              const simImage = getImage(artist.image || [])
              return (
                <div
                  key={artist.name}
                  onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                  className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium text-center"
                >
                  <div className="w-full aspect-square bg-bg-base rounded-full flex items-center justify-center mb-3 overflow-hidden mx-auto">
                    {simImage ? (
                      <img src={simImage} alt={artist.name} className="w-full h-full object-cover" />
                    ) : (
                      <Mic2 className="h-8 w-8 text-text-subdued" />
                    )}
                  </div>
                  <p className="font-medium text-sm text-white truncate">{artist.name}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
