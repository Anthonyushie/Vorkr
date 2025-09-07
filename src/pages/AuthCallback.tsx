import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/signin?error=auth_failed')
          return
        }

        if (data.session) {
          // Successfully authenticated, redirect to home
          navigate('/')
        } else {
          // No session found, redirect to sign in
          navigate('/signin')
        }
      } catch (error) {
        console.error('Unexpected error during auth callback:', error)
        navigate('/signin?error=unexpected')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="flex h-20 w-20 items-center justify-center bg-primary border-chunky border-primary mx-auto mb-6 animate-pulse">
          <span className="text-4xl font-black text-primary-foreground">V</span>
        </div>
        <h2 className="text-2xl font-black mb-2">Completing Sign In...</h2>
        <p className="text-body text-muted-foreground">
          Please wait while we finish setting up your account.
        </p>
      </div>
    </div>
  )
}