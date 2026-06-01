import { Music, CheckCircle } from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-sm text-text-subdued">Data sources</p>
      </div>

      {/* YouTube Card */}
      <div className="bg-bg-surface rounded-md p-6 shadow-medium">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-bg-base rounded-md flex items-center justify-center flex-shrink-0">
            <Music className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">YouTube</h2>
              <span className="flex items-center gap-1 text-xs text-accent">
                <CheckCircle className="h-3 w-3" /> Connected
              </span>
            </div>
            <p className="text-sm text-text-subdued">
              Search and playback powered by YouTube
            </p>
          </div>
        </div>
      </div>

      {/* Last.fm Card */}
      <div className="bg-bg-surface rounded-md p-6 shadow-medium">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-bg-base rounded-md flex items-center justify-center flex-shrink-0">
            <Music className="h-6 w-6 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">Last.fm</h2>
              <span className="flex items-center gap-1 text-xs text-accent">
                <CheckCircle className="h-3 w-3" /> Connected
              </span>
            </div>
            <p className="text-sm text-text-subdued">
              Artist & album data from {import.meta.env.VITE_LASTFM_USERNAME || 'your account'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
