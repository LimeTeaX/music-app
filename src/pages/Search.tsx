import { useState, useEffect } from 'react'
import { Search as SearchIcon, X, Play, Clock, Music2 } from 'lucide-react'
import { searchVideos, requestPlayTrack, type YouTubeVideo } from '../lib/youtube-api'

function cleanTitle(title: string): string {
  return title
    .replace(/\s*\(Official\s+(Music\s+)?Video\)\s*/gi, '')
    .replace(/\s*\(Official\s+Audio\)\s*/gi, '')
    .replace(/\s*\(Lyric\s+Video\)\s*/gi, '')
    .replace(/\s*\(Lyrics?\)\s*/gi, '')
    .replace(/\s*\(Audio\)\s*/gi, '')
    .replace(/\s*\(Video\)\s*/gi, '')
    .replace(/\s*\(Visualizer\)\s*/gi, '')
    .replace(/\s*\(4K\)\s*/gi, '')
    .replace(/\s*\(HD\)\s*/gi, '')
    .replace(/\s*\[Official\s+(Music\s+)?Video\]\s*/gi, '')
    .replace(/\s*\[Official\s+Audio\]\s*/gi, '')
    .replace(/\s*\[Lyrics?\]\s*/gi, '')
    .trim()
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) { setVideos([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      const results = await searchVideos(query.trim())
      setVideos(results)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  const handlePlay = (v: YouTubeVideo) => {
    requestPlayTrack(cleanTitle(v.title), '', v.id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
        <p className="text-sm text-text-subdued">Find any song on YouTube</p>
      </div>

      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-subdued" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for any song..."
          className="w-full bg-bg-surface text-white text-base rounded-md pl-12 pr-4 py-3 border border-border focus:outline-none focus:border-accent transition-colors placeholder-text-subdued"
          autoFocus
        />
        {query && (
          <button onClick={() => { setQuery(''); setVideos([]) }} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="h-4 w-4 text-text-subdued hover:text-white" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      )}

      {!loading && query && videos.length === 0 && (
        <p className="text-sm text-text-subdued text-center py-16">
          No results found for "{query}"
        </p>
      )}

      {!loading && videos.length > 0 && (
        <div className="space-y-1">
          {videos.map((v) => (
            <div
              key={v.id}
              onClick={() => handlePlay(v)}
              className="flex items-center gap-3 p-3 bg-bg-surface rounded-md hover:bg-bg-button-hover transition-colors cursor-pointer shadow-medium group"
            >
              <div className="w-12 h-12 bg-bg-base rounded flex-shrink-0 overflow-hidden relative">
                {v.thumbnail ? (
                  <img src={v.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="h-5 w-5 text-text-subdued" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{cleanTitle(v.title)}</p>
                <p className="text-xs text-text-subdued truncate">YouTube</p>
              </div>
              <Play className="h-4 w-4 text-text-subdued flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <SearchIcon className="h-12 w-12 text-text-subdued mx-auto mb-4" />
          <p className="text-text-subdued">Type to search any song on YouTube</p>
        </div>
      )}
    </div>
  )
}
