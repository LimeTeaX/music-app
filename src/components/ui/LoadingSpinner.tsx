import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-[#1DB954]/30 border-t-[#1DB954] rounded-full mx-auto mb-4"
        />
        <p className="text-gray-400 animate-pulse">Loading your music data...</p>
      </div>
    </div>
  )
}