import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { requestPlayTrack } from '../lib/youtube-api'
import * as spotifyApi from '../services/spotify-api'
import { Search as SearchIcon, Mic2, Heart, X, Disc, Music2, Play } from 'lucide-react'

type Tab = 'all' | 'artists' | 'albums' | 'tracks'

function getArtistImage(artist: spotifyApi.SpotifyArtist): string {
  return artist.images?.[0]?.url || ''
}

function getAlbumImage(album: spotifyApi.SpotifyAlbumSimplified): string {
  return album.images?.[0]?.url || ''
}

function getTrackDetail(track: spotifyApi.SpotifyTrack): { title: string; artist: string; uri: string; albumName: string } {
  return {
    title: track.name,
    artist: track.artists.map(a => a.name).join(', '),
    uri: `spotify:track:${track.id}`,
    albumName: track.album?.name || '',
  }
}

function getFollowed(): string[] {
  try { return JSON.parse(localStorage.getItem('followed_artists') || '[]') }
  catch { return [] }
}

function setFollowed(list: string[]) {
  localStorage.setItem('followed_artists', JSON.stringify(list))
}

const tabs: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
  { key: 'tracks', label: 'Tracks' },
]

export function SearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('all')
  const [artists, setArtists] = useState<spotifyApi.SpotifyArtist[]>([])
  const [albums, setAlbums] = useState<spotifyApi.SpotifyAlbumSimplified[]>([])
  const [tracks, setTracks] = useState<spotifyApi.SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [followed, setFollowedState] = useState<string[]>(getFollowed)
  const $query = useRef(query)
  $query.current = query

  const syncFollowed = () => setFollowedState(getFollowed())

  const searchAll = useCallback(async (q: string) => {
    if (!q.trim()) {
      setArtists([]); setAlbums([]); setTracks([]); return
    }
    setLoading(true)
    try {
      const results = await spotifyApi.searchAll(q.trim())
      if ($query.current !== q) return
      if (results) {
        setArtists(results.artists)
        setAlbums(results.albums)
        setTracks(results.tracks)
      } else {
        setArtists([]); setAlbums([]); setTracks([])
      }
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      if ($query.current === q) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchAll(query), 300)
    return () => clearTimeout(timer)
  }, [query, searchAll])

  const toggleFollow = (name: string) => {
    const current = getFollowed()
    const next = current.includes(name)
      ? current.filter(a => a !== name)
      : [...current, name]
    setFollowed(next)
    setFollowedState(next)
  }

  const hasResults = artists.length > 0 || albums.length > 0 || tracks.length > 0
  const tabCount = { all: artists.length + albums.length + tracks.length, artists: artists.length, albums: albums.length, tracks: tracks.length }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
        <p className="text-sm text-text-subdued">Find artists, albums, and tracks on Spotify</p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-subdued" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for artists, albums, or tracks..."
          className="w-full bg-bg-surface text-white text-base rounded-md pl-12 pr-4 py-3 border border-border focus:outline-none focus:border-accent transition-colors placeholder-text-subdued"
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(''); setArtists([]); setAlbums([]); setTracks([]) }} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-text-subdued hover:text-white" />
          </button>
        )}
      </div>

      {/* Followed Artists */}
      {followed.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-accent fill-accent" />
            Following ({followed.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {followed.map(name => (
              <button
                key={name}
                onClick={() => navigate(`/artist/${encodeURIComponent(name)}`)}
                className="flex items-center gap-1.5 px-3 py-1 bg-bg-surface rounded-full text-xs text-white hover:bg-bg-button-hover transition-colors"
              >
                {name}
                <X className="h-3 w-3 text-text-subdued hover:text-white" onClick={(e) => { e.stopPropagation(); toggleFollow(name) }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      {query && hasResults && (
        <div className="flex gap-1 border-b border-border pb-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-md ${
                tab === t.key
                  ? 'text-white bg-bg-surface border-b-2 border-accent'
                  : 'text-text-subdued hover:text-white'
              }`}
            >
              {t.label} ({tabCount[t.key]})
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {/* Results */}
      {!loading && query && !hasResults && (
        <p className="text-sm text-text-subdued text-center py-16">No results found for "{query}"</p>
      )}

      {!loading && query && hasResults && (tab === 'all' || tab === 'artists') && artists.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Mic2 className="h-4 w-4 text-accent" /> Artists
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.slice(0, tab === 'all' ? 6 : undefined).map((artist) => {
              const img = getArtistImage(artist)
              const followed = getFollowed().includes(artist.name)
              return (
                <div
                  key={artist.id}
                  onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                  className="bg-bg-surface rounded-md p-3 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium group text-center"
                >
                  <div className="w-full aspect-square bg-bg-base rounded-full flex items-center justify-center mb-2 overflow-hidden mx-auto">
                    {img ? <img src={img} alt={artist.name} className="w-full h-full object-cover" /> : <Mic2 className="h-6 w-6 text-text-subdued" />}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{artist.name}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFollow(artist.name) }}
                    className={`mt-2 w-full py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      followed ? 'bg-accent text-black' : 'bg-bg-button text-white hover:bg-bg-button-hover'
                    }`}
                  >
                    {followed ? 'Following' : 'Follow'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!loading && query && hasResults && (tab === 'all' || tab === 'albums') && albums.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Disc className="h-4 w-4 text-accent" /> Albums
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {albums.slice(0, tab === 'all' ? 6 : undefined).map((album) => {
              const img = getAlbumImage(album)
              return (
                <div
                  key={album.id}
                  onClick={() => navigate(`/album/${encodeURIComponent(album.artists[0]?.name || '')}/${encodeURIComponent(album.name)}`)}
                  className="bg-bg-surface rounded-md p-3 hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium"
                >
                  <div className="w-full aspect-square bg-bg-base rounded-md flex items-center justify-center mb-2 overflow-hidden">
                    {img ? <img src={img} alt={album.name} className="w-full h-full object-cover" /> : <Disc className="h-6 w-6 text-text-subdued" />}
                  </div>
                  <p className="text-sm font-medium text-white truncate">{album.name}</p>
                  <p className="text-xs text-text-subdued truncate">{album.artists.map(a => a.name).join(', ')}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {!loading && query && hasResults && (tab === 'all' || tab === 'tracks') && tracks.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Music2 className="h-4 w-4 text-accent" /> Tracks
          </h2>
          <div className="space-y-1">
            {tracks.slice(0, tab === 'all' ? 10 : undefined).map((track) => {
              const { title, artist, uri } = getTrackDetail(track)
              return (
                <div
                  key={track.id}
                  onClick={() => requestPlayTrack(title, artist, uri)}
                  className="flex items-center gap-3 p-3 bg-bg-surface rounded-md hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium group"
                >
                  <div className="w-8 h-8 bg-bg-base rounded flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <Play className="h-4 w-4 text-text-subdued group-hover:text-accent transition-colors" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{track.name}</p>
                    <p className="text-xs text-text-subdued truncate">{artist}</p>
                  </div>
                  <span className="text-xs text-text-subdued flex-shrink-0">
                    {Math.floor(track.duration_ms / 60000)}:{Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!query && (
        <div className="text-center py-16">
          <SearchIcon className="h-12 w-12 text-text-subdued mx-auto mb-4" />
          <p className="text-text-subdued">Type to search artists, albums, and tracks on Spotify</p>
        </div>
      )}
    </div>
  )
}
