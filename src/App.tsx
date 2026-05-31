import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { Player } from './components/layout/Player'
import { Home } from './pages/Home'
import { Discover } from './pages/Discover'
import { Artist } from './pages/Artist'
import { Album } from './pages/Album'
import { Stats } from './pages/Stats'
import { SearchPage } from './pages/Search'
import { Library } from './pages/Library'
import { LibraryArtists } from './pages/LibraryArtists'
import { LibraryAlbums } from './pages/LibraryAlbums'
import { LibraryLiked } from './pages/LibraryLiked'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { LoginPage } from './pages/Login'
import { CallbackPage } from './pages/Callback'

function Layout() {
  return (
    <div className="h-screen flex flex-col bg-bg-base">
      <div className="flex-1 flex min-h-0 overflow-hidden">
        <div className="w-[240px] flex-shrink-0 bg-bg-base overflow-y-auto">
          <Sidebar />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 md:px-8 pt-6 pb-8 max-w-[1400px] mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/artist/:id" element={<Artist />} />
              <Route path="/album/:artist/:album" element={<Album />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/library" element={<Library />} />
              <Route path="/library/artists" element={<LibraryArtists />} />
              <Route path="/library/albums" element={<LibraryAlbums />} />
              <Route path="/library/liked" element={<LibraryLiked />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </div>
      </div>
      
      <Player />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/callback" element={<CallbackPage />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App