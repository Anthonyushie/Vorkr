import { Button } from "@/components/ui/button-brutal"
import { Wallet, Search, Plus, LogOut } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-chunky border-border bg-background">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-12 w-12 items-center justify-center bg-primary border-thick border-primary">
            <span className="text-2xl font-black text-primary-foreground">V</span>
          </div>
          <span className="text-heading font-black">VORKR</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/browse" className="text-body-bold hover:text-primary transition-colors">
            Browse
          </Link>
          <Link to="/create" className="text-body-bold hover:text-primary transition-colors">
            Create
          </Link>
          <Link to="/dashboard" className="text-body-bold hover:text-primary transition-colors">
            Dashboard
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>
          
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Plus className="mr-2 h-4 w-4" />
            Post Bounty
          </Button>
          
          <Button variant="default" className="font-black">
            <Wallet className="mr-2 h-5 w-5" />
            Connect Wallet
          </Button>
          
          <Button variant="ghost" onClick={handleSignOut} className="font-black">
            <LogOut className="mr-2 h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}