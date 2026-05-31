import { useState, useEffect } from 'react'
import { lastFmApi, LastFmTrack, LastFmArtist, LastFmAlbum } from '../lib/lastfm-api'

export interface NowPlayingTrack {
  name: string
  artist: { name: string; url: string }
  album: { name: string; '#text': string }
  image: { size: string; '#text': string }[]
  url: string
  '@attr'?: { nowplaying: string }
}

export function useLastFmData() {
  const [user, setUser] = useState<any>(null)
  const [nowPlaying, setNowPlaying] = useState<NowPlayingTrack | null>(null)
  const [recentTracks, setRecentTracks] = useState<LastFmTrack[]>([])
  const [topArtists, setTopArtists] = useState<LastFmArtist[]>([])
  const [topTracks, setTopTracks] = useState<LastFmTrack[]>([])
  const [topAlbums, setTopAlbums] = useState<LastFmAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<string>('6month')
  
  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [userData, recentData, artistsData, tracksData, albumsData] = await Promise.all([
        lastFmApi.getUserInfo(),
        lastFmApi.getRecentTracks(50),
        lastFmApi.getTopArtists(period, 10),
        lastFmApi.getTopTracks(period, 10),
        lastFmApi.getTopAlbums(period, 10),
      ])
      
      setUser(userData.user)
      setRecentTracks(recentData.recenttracks?.track?.filter((t: any) => !t['@attr']?.nowplaying) || [])
      setTopArtists(artistsData.topartists?.artist || [])
      setTopTracks(tracksData.toptracks?.track || [])
      setTopAlbums(albumsData.topalbums?.album || [])
      
      const nowPlayingData = await lastFmApi.getNowPlaying()
      setNowPlaying(nowPlayingData)
      
    } catch (err) {
      setError('Failed to fetch data from Last.fm')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
    
    const interval = setInterval(async () => {
      const nowPlayingData = await lastFmApi.getNowPlaying()
      setNowPlaying(nowPlayingData)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [period])
  
  return {
    user,
    nowPlaying,
    recentTracks,
    topArtists,
    topTracks,
    topAlbums,
    loading,
    error,
    period,
    setPeriod,
    refresh: fetchData,
  }
}