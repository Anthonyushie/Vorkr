import { Button } from "@/components/ui/button-brutal"
import { Github } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useEffect } from "react"

export default function SignIn() {
  const { signInWithGitHub, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && !loading) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleGitHubSignIn = async () => {
    try {
      await signInWithGitHub()
    } catch (error) {
      console.error('Error signing in:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-2xl font-black">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="flex h-20 w-20 items-center justify-center bg-primary border-chunky border-primary mx-auto mb-6">
            <span className="text-4xl font-black text-primary-foreground">V</span>
          </div>
          <h1 className="text-heading font-black mb-2">VORKR</h1>
          <p className="text-body text-muted-foreground">Build. Earn. Get Paid in STX.</p>
        </div>

        {/* Sign In Card */}
        <div className="bg-card border-chunky border-border shadow-brutal p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black mb-2">Welcome Back</h2>
            <p className="text-body text-muted-foreground">
              Sign in to access the bounty platform
            </p>
          </div>

          <Button 
            onClick={handleGitHubSignIn}
            className="w-full font-black text-lg py-6"
            size="lg"
          >
            <Github className="mr-3 h-6 w-6" />
            Continue with GitHub
          </Button>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our terms and privacy policy
            </p>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            New to bounty hunting?{" "}
            <span className="text-primary font-bold">Get started today</span>
          </p>
        </div>
      </div>
    </div>
  )
}