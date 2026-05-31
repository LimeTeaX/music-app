import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Music, Headphones, BarChart3, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { GlassCard } from '../components/ui/GlassCard'
import { GradientText } from '../components/ui/GradientText'
import { AnimatedBackground } from '../components/ui/AnimatedBackground'

export function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  
  const handleLogin = () => {
    if (!username.trim()) {
      setError('Please enter your Last.fm username')
      return
    }
    localStorage.setItem('lastfm_user', username)
    navigate('/dashboard')
  }
  
  const features = [
    { icon: BarChart3, title: 'Analytics', desc: 'Visualize your listening habits' },
    { icon: TrendingUp, title: 'Trends', desc: 'See your music evolution' },
    { icon: Headphones, title: 'Real-time', desc: 'Now playing updates' },
    { icon: Sparkles, title: 'Insights', desc: 'Discover your top genres' },
  ]
  
  return (
    <div className="min-h-screen bg-[#121212] overflow-hidden relative">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex items-center gap-3 bg-[#1DB954]/10 rounded-full px-6 py-2 mb-6"
          >
            <Music className="h-5 w-5 text-[#1DB954]" />
            <span className="text-sm font-medium text-[#1DB954]">Last.fm Analytics</span>
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <GradientText as="span">Music Dashboard</GradientText>
          </h1>
          
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Track your listening habits, discover your top artists, and visualize your music journey
          </p>
        </motion.div>
        
        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
        >
          {features.map((feature, i) => (
            <GlassCard key={i} className="p-4 text-center" delay={i * 0.1}>
              <feature.icon className="h-6 w-6 text-[#1DB954] mx-auto mb-2" />
              <h3 className="text-white text-sm font-semibold">{feature.title}</h3>
              <p className="text-gray-500 text-xs">{feature.desc}</p>
            </GlassCard>
          ))}
        </motion.div>
        
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <GlassCard className="p-8 text-center">
            <Headphones className="h-12 w-12 text-[#1DB954] mx-auto mb-4 animate-float" />
            
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm mb-6">
              Enter your Last.fm username to continue
            </p>
            
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="Last.fm username"
              className="w-full bg-[#282828] text-white rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-all"
            />
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <Button onClick={handleLogin} className="w-full flex items-center justify-center gap-2">
              <Music className="h-4 w-4" />
              Connect to Last.fm
            </Button>
            
            <p className="text-gray-500 text-xs mt-6">
              🔒 We only access your public listening data
            </p>
          </GlassCard>
        </motion.div>
        
        {/* Footer Stats */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-600 text-xs mt-12"
        >
          Join millions of music lovers tracking their listening habits
        </motion.p>
      </div>
    </div>
  )
}