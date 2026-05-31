import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { handleCallback as spotifyCallback } from '../services/spotify-auth'

export function CallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('Processing...')
  
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')
      
      if (errorParam) {
        setError(`Spotify authentication failed: ${errorParam}`)
        setTimeout(() => navigate('/settings'), 3000)
        return
      }
      
      if (code) {
        setStatus('Connecting to Spotify...')
        const success = await spotifyCallback(code)
        if (success) {
          setStatus('Connected! Redirecting...')
          setTimeout(() => navigate('/'), 1500)
        } else {
          setError('Failed to connect to Spotify')
          setTimeout(() => navigate('/settings'), 3000)
        }
      } else {
        navigate('/')
      }
    }
    run()
  }, [navigate])
  
  if (error) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-negative text-2xl mb-3">⚠️</div>
          <p className="text-text-base mb-2">{error}</p>
          <p className="text-text-subdued text-sm">Redirecting...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-text-subdued">{status}</p>
      </div>
    </div>
  )
}