import { NavLink } from 'react-router-dom'
import { Home, Compass, Search, Library, BarChart3, Settings, Heart, Disc, Mic2 } from 'lucide-react'

const mainNav = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: Search, label: 'Search', path: '/search' },
]

const libraryNav = [
  { icon: Library, label: 'Your Library', path: '/library' },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
]

const playlistNav = [
  { icon: Heart, label: 'Liked Songs', path: '/library/liked' },
  { icon: Disc, label: 'Albums', path: '/library/albums' },
  { icon: Mic2, label: 'Artists', path: '/library/artists' },
]

const bottomNav = [
  { icon: Settings, label: 'Settings', path: '/settings' },
]

export function Sidebar() {
  return (
    <div className="px-4 py-5 flex flex-col h-full">  {/* Padding 16-20px */}
      {/* Logo */}
      <div className="mb-6">  {/* 24px */}
        <h1 className="text-xl font-bold tracking-tight text-white">
          Music<span className="text-accent">Listener</span>
        </h1>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1">
        <div className="space-y-2">  {/* 8px antar item */}
          {mainNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-text-subdued hover:text-white font-normal'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        
        {/* Your Library Section */}
        <div className="mt-6">  {/* 24px antar section */}
          <div className="space-y-2">
            {libraryNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-text-subdued hover:text-white font-normal'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
        
        {/* Playlists Section */}
        <div className="mt-6">  {/* 24px */}
          <p className="px-3 text-xs font-bold uppercase tracking-wider text-text-subdued mb-2">
            Your Library
          </p>
          <div className="space-y-2">  {/* 8px antar playlist item */}
            {playlistNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'text-white font-normal'
                      : 'text-text-subdued hover:text-white'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Bottom Navigation */}
      <div className="mt-auto pt-4">  {/* 16px padding top */}
        <div className="border-t border-border pt-4 space-y-2">  {/* 16px */}
          {bottomNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-text-subdued hover:text-white font-normal'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}