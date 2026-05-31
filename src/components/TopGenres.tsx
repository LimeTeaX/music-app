import { useState, useEffect } from 'react'
import { lastFmApi } from '../lib/lastfm-api'
import { GlassCard } from './ui/GlassCard'
import { motion } from 'framer-motion'

interface GenreStat {
  name: string
  count: number
  percentage: number
}

export function TopGenres() {
  const [genres, setGenres] = useState<GenreStat[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await lastFmApi.getTopArtists('overall', 50)
        const artists = data.topartists?.artist || []
        
        const genreCount: { [key: string]: number } = {}
        
        for (const artist of artists.slice(0, 30)) {
          try {
            const artistInfo = await lastFmApi.getArtistInfo(artist.name)
            const tags = artistInfo.artist?.tags?.tag || []
            
            tags.forEach((tag: any) => {
              const tagName = tag.name.toLowerCase()
              if (!['seen live', 'all', 'my playlists'].includes(tagName)) {
                genreCount[tagName] = (genreCount[tagName] || 0) + 1
              }
            })
          } catch (e) {
            // Skip jika error
          }
        }
        
        const total = Object.values(genreCount).reduce((a, b) => a + b, 0)
        const sorted = Object.entries(genreCount)
          .map(([name, count]) => ({ name, count, percentage: (count / total) * 100 }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)
        
        setGenres(sorted)
      } catch (error) {
        console.error('Error fetching genres:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchGenres()
  }, [])
  
  if (loading) {
    return (
      <GlassCard className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#282828] rounded w-32 mx-auto" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-[#282828] rounded" />
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }
  
  return (
    <GlassCard className="p-6 text-center">
      <h2 className="text-lg font-bold text-white mb-1">Top Genres</h2>
      <p className="text-xs text-gray-500 mb-4">Based on your top artists' tags</p>
      
      <div className="space-y-3 text-left">
        {genres.map((genre, index) => (
          <motion.div 
            key={genre.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300 capitalize">{genre.name}</span>
              <span className="text-gray-600">{genre.count} artists</span>
            </div>
            <div className="h-2 bg-[#282828] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${genre.percentage}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="h-full bg-gradient-to-r from-[#1DB954] to-[#1aa34a] rounded-full"
              />
            </div>
          </motion.div>
        ))}
      </div>
      
      {genres.length === 0 && (
        <p className="text-center text-gray-500 py-8">No genre data available</p>
      )}
    </GlassCard>
  )
}