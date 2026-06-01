import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { requestPlayTrack } from '../lib/youtube-api'
import * as spotifyApi from '../services/spotify-api'
import { Mic2, Music2, Radio, Users, Disc } from 'lucide-react'

export function Artist() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const artistName = decodeURIComponent(id || '')

  const [info, setInfo] = useState<spotifyApi.SpotifyArtistFull | null>(null)
  const [topTracks, setTopTracks] = useState<spotifyApi.SpotifyTrack[]>([])
  const [topAlbums, setTopAlbums] = useState<spotifyApi.SpotifyAlbumSimplified[]>([])
  const [similar, setSimilar] = useState<spotifyApi.SpotifyArtist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!artistName) return
    let cancelled = false

    const fetchAll = async () => {
      setLoading(true)
      try {
        // Search artist by name to get Spotify ID
        const searchResults = await spotifyApi.searchArtist(artistName)
        if (cancelled || !searchResults || searchResults.length === 0) {
          if (!cancelled) setLoading(false)
          return
        }

        const artist = searchResults[0]
        const [infoData, tracksData, albumsData, relatedData] = await Promise.all([
          spotifyApi.getArtist(artist.id),
          spotifyApi.getArtistTopTracks(artist.id),
          spotifyApi.getArtistAlbums(artist.id, 10),
          spotifyApi.getRelatedArtists(artist.id),
        ])

        if (cancelled) return
        setInfo(infoData)
        setTopTracks(tracksData || [])
        setTopAlbums(albumsData || [])
        setSimilar(relatedData || [])
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

  const imageUrl = info.images?.[0]?.url || ''

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
                  {info.followers?.total?.toLocaleString() || '0'} followers
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                <span className="text-sm text-text-subdued">
                  Popularity: {info.popularity}/100
                </span>
              </div>
            </div>

            {info.genres && info.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {info.genres.slice(0, 6).map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-bg-button rounded-full text-xs text-white">
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Tracks */}
      {topTracks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Popular Tracks</h2>
          <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
            {topTracks.slice(0, 10).map((track, i) => {
              const uri = `spotify:track:${track.id}`
              const artistsNames = track.artists.map(a => a.name).join(', ')
              return (
                <div
                  key={track.id || i}
                  onClick={() => requestPlayTrack(track.name, artistsNames, uri)}
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
                    {track.album?.name || ''}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {topAlbums.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Albums</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {topAlbums.slice(0, 10).map((album) => {
              const albumImage = album.images?.[0]?.url || ''
              return (
                <div
                  key={album.id}
                  onClick={() => navigate(`/album/${encodeURIComponent(info.name)}/${encodeURIComponent(album.name)}`)}
                  className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium"
                >
                  <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-3 overflow-hidden">
                    {albumImage ? (
                      <img src={albumImage} alt={album.name} className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="h-8 w-8 text-text-subdued" />
                    )}
                  </div>
                  <p className="font-medium text-sm text-white truncate">{album.name}</p>
                  <p className="text-xs text-text-subdued mt-1">{album.release_date?.split('-')[0] || ''}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Similar Artists */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Similar Artists</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {similar.slice(0, 10).map((artist) => {
              const artistImage = artist.images?.[0]?.url || ''
              return (
                <div
                  key={artist.id}
                  onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                  className="bg-bg-surface rounded-md p-4 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium text-center"
                >
                  <div className="w-full aspect-square bg-bg-base rounded-full flex items-center justify-center mb-3 overflow-hidden mx-auto">
                    {artistImage ? (
                      <img src={artistImage} alt={artist.name} className="w-full h-full object-cover" />
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
