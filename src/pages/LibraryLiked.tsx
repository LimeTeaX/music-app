import { useState, useEffect } from 'react'
import { Music2, Heart, Trash2 } from 'lucide-react'
import { getLikedTracks, type LikedTrack, toggleLike } from '../lib/liked-tracks'
import { requestPlayTrack } from '../lib/youtube-api'

export function LibraryLiked() {
  const [tracks, setTracks] = useState<LikedTrack[]>([])

  useEffect(() => {
    setTracks(getLikedTracks())
  }, [])

  const handleUnlike = (t: LikedTrack) => {
    toggleLike(t.title, t.artist)
    setTracks(getLikedTracks())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Liked Songs</h1>
        <p className="text-sm text-text-subdued">{tracks.length} liked tracks</p>
      </div>

      {tracks.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-text-subdued mx-auto mb-4" />
          <p className="text-lg text-text-subdued mb-1">No liked songs yet</p>
          <p className="text-sm text-text-muted">Click the heart icon on any track to save it here</p>
        </div>
      ) : (
        <div className="bg-bg-surface rounded-md shadow-medium divide-y divide-bg-base overflow-hidden">
          {tracks.map((track, i) => (
            <div
              key={`${track.title}-${track.artist}`}
              onClick={() => requestPlayTrack(track.title, track.artist)}
              className="flex items-center justify-between p-4 hover:bg-bg-button-hover transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-text-subdued text-sm w-6 flex-shrink-0">{i + 1}</span>
                <div className="w-9 h-9 bg-bg-base rounded flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <Music2 className="h-4 w-4 text-text-subdued" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-text-subdued truncate">{track.artist}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleUnlike(track) }}
                className="p-2 opacity-0 group-hover:opacity-100 hover:text-negative transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
