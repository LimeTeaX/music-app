import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Disc, Mic2, Heart, Music2 } from 'lucide-react'
import { isSpotifyConnected } from '../services/spotify-auth'

export function Library() {
  const [spotifyMode, setSpotifyMode] = useState(false)

  useEffect(() => {
    setSpotifyMode(isSpotifyConnected())
  }, [])

  const sections = [
    {
      icon: Mic2,
      label: 'Artists',
      desc: spotifyMode ? 'Your top artists on Spotify' : 'Browse your top artists',
      path: '/library/artists',
      count: spotifyMode ? 'Spotify top artists' : 'Top artists',
    },
    {
      icon: Disc,
      label: 'Albums',
      desc: spotifyMode ? 'Your saved albums on Spotify' : 'Your most played albums',
      path: '/library/albums',
      count: spotifyMode ? 'Saved albums' : 'Top albums',
    },
    {
      icon: Heart,
      label: 'Liked Songs',
      desc: 'Your favorite tracks',
      path: '/library/liked',
      count: 'Liked tracks',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Library</h1>
        <p className="text-sm text-text-subdued">
          Explore your music collection
          {spotifyMode && <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-accent/20 text-accent leading-none">Spotify</span>}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="bg-bg-surface rounded-md p-6 hover:bg-bg-button-hover transition-colors shadow-medium group"
          >
            <div className="w-12 h-12 bg-bg-base rounded-md flex items-center justify-center mb-4 group-hover:bg-bg-button transition-colors">
              <section.icon className="h-6 w-6 text-accent" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">{section.label}</h2>
            <p className="text-sm text-text-subdued">{section.desc}</p>
            <p className="text-xs text-text-subdued mt-3">{section.count}</p>
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-b from-bg-surface to-bg-base rounded-md p-6 shadow-medium">
        <Music2 className="h-8 w-8 text-accent mb-3" />
        <h2 className="text-xl font-bold text-white mb-1">Music Dashboard</h2>
        <p className="text-sm text-text-subdued">
          {spotifyMode ? 'Your personal music analytics powered by Spotify & Last.fm' : 'Your personal music analytics powered by Last.fm'}
        </p>
      </div>
    </div>
  )
}
