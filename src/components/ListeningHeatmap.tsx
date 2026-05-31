import { useState, useEffect } from 'react'
import { lastFmApi } from '../lib/lastfm-api'
import { GlassCard } from './ui/GlassCard'
import { motion } from 'framer-motion'

interface HeatmapData {
  hour: number
  count: number
}

export function ListeningHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const data = await lastFmApi.getRecentTracks(200)
        const tracks = data.recenttracks?.track || []
        
        const hourCount: { [key: number]: number } = {}
        for (let i = 0; i < 24; i++) hourCount[i] = 0
        
        tracks.forEach((track: any) => {
          if (track.date?.['#text']) {
            const hour = new Date(track.date['#text']).getHours()
            hourCount[hour]++
          }
        })
        
        const chartData = Object.entries(hourCount).map(([hour, count]) => ({
          hour: parseInt(hour),
          count,
        }))
        
        setHeatmapData(chartData)
      } catch (error) {
        console.error('Error fetching heatmap data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchHeatmap()
  }, [])
  
  if (loading) {
    return (
      <GlassCard className="p-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-[#282828] rounded w-32 mx-auto" />
          <div className="h-32 bg-[#282828] rounded" />
        </div>
      </GlassCard>
    )
  }
  
  const maxCount = Math.max(...heatmapData.map(d => d.count))
  
  return (
    <GlassCard className="p-6 text-center">
      <h2 className="text-lg font-bold text-white mb-1">Listening Heatmap</h2>
      <p className="text-xs text-gray-500 mb-4">Shows what time of day you listen most</p>
      
      <div className="grid grid-cols-12 gap-1">
        {heatmapData.map(({ hour, count }) => {
          const intensity = maxCount > 0 ? (count / maxCount) * 100 : 0
          const color = intensity > 70 ? 'bg-[#1DB954]' :
                        intensity > 40 ? 'bg-[#1aa34a]' :
                        intensity > 20 ? 'bg-[#15803d]' :
                        intensity > 5 ? 'bg-[#0f5c2e]' : 'bg-[#282828]'
          
          return (
            <div key={hour} className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: hour * 0.02 }}
                className={`h-12 ${color} rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer`}
                style={{ opacity: 0.3 + (intensity / 100) * 0.7 }}
                title={`${hour}:00 - ${count} plays`}
              />
              <p className="text-xs text-gray-600 mt-1">{hour}:00</p>
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-center mt-4 text-xs text-gray-600 gap-4">
        <span>Less active</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-[#282828] rounded" />
          <div className="w-4 h-4 bg-[#0f5c2e] rounded" />
          <div className="w-4 h-4 bg-[#15803d] rounded" />
          <div className="w-4 h-4 bg-[#1aa34a] rounded" />
          <div className="w-4 h-4 bg-[#1DB954] rounded" />
        </div>
        <span>Most active</span>
      </div>
    </GlassCard>
  )
}