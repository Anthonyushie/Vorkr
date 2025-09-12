import { Button } from "@/components/ui/button-brutal"
import { Wallet, Search, Plus, LogOut, Menu, X, Network, Copy, ExternalLink } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { useStacks } from "@/contexts/StacksContext"
import { useState } from "react"
import ThemeToggle from "@/components/ui/theme-toggle"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

export function Header() {
  const { user, signOut } = useAuth()
  const {
    isSignedIn,
    userData,
    connectedWallet,
    availableWallets,
    networkType,
    stxAddress,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    loading,
    error
  } = useStacks()
  
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleConnectWallet = async (walletType?: string) => {
    try {
      setConnecting(true)
      await connectWallet(walletType as any)
      setIsWalletDialogOpen(false)
    } catch (error: any) {
      console.error('Connection error:', error)
      if (!error.message?.includes('cancelled')) {
        toast({
          title: 'Connection Failed',
          description: error.message || 'Failed to connect wallet',
          variant: 'destructive',
        })
      }
    } finally {
      setConnecting(false)
    }
  }

  const copyAddress = async () => {
    if (!stxAddress) return
    try {
      await navigator.clipboard.writeText(stxAddress)
      toast({
        title: 'Address Copied',
        description: 'STX address copied to clipboard',
      })
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const formatStxBalance = (balance: string): string => {
    const stx = parseFloat(balance) / 1000000
    return stx.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    })
  }

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getWalletIcon = (walletType: string): string => {
    switch (walletType) {
      case 'hiro': return '🔥'
      case 'leather': return '🧳'
      case 'xverse': return '✨'
      default: return '👛'
    }
  }

  const installedWallets = availableWallets.filter(wallet => wallet.installed)

  return (
    <header className="sticky top-0 z-50 w-full border-b-chunky border-border bg-background">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-primary border-thick border-primary">
            <span className="text-xl sm:text-2xl font-black text-primary-foreground">V</span>
          </div>
          <span className="text-lg sm:text-xl font-black">VORKR</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
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

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Post Bounty
          </Button>
          
          {/* Wallet Connection */}
          {isSignedIn && userData && stxAddress ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" className="font-black">
                  <span className="mr-2">{getWalletIcon(connectedWallet || 'unknown')}</span>
                  <span className="hidden sm:inline">{formatAddress(stxAddress)}</span>
                  <span className="sm:hidden">Wallet</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{getWalletIcon(connectedWallet || 'unknown')}</span>
                      <span className="font-medium">{connectedWallet?.charAt(0).toUpperCase()}{connectedWallet?.slice(1)} Wallet</span>
                    </div>
                    <Badge variant={networkType === 'mainnet' ? 'default' : 'secondary'}>
                      {networkType === 'mainnet' ? 'Mainnet' : 'Testnet'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Address:</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">{formatAddress(stxAddress)}</code>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={copyAddress}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(`https://explorer.stacks.co/address/${stxAddress}${networkType === 'testnet' ? '?chain=testnet' : ''}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {balance && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Balance:</span>
                        <span className="text-sm font-mono">{formatStxBalance(balance.stx.available)} STX</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => switchNetwork(networkType === 'mainnet' ? 'testnet' : 'mainnet')}>
                  <Network className="mr-2 h-4 w-4" />
                  Switch to {networkType === 'mainnet' ? 'Testnet' : 'Mainnet'}
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={disconnectWallet}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect Wallet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="font-black" disabled={loading}>
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Connect Your Stacks Wallet</DialogTitle>
                  <DialogDescription>
                    Choose a wallet to connect to the Stacks blockchain
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3">
                  {installedWallets.length > 0 ? (
                    <>
                      <p className="text-sm font-medium">Available Wallets:</p>
                      {installedWallets.map((wallet) => (
                        <Button
                          key={wallet.id}
                          onClick={() => handleConnectWallet(wallet.id)}
                          disabled={connecting}
                          className="w-full justify-start h-auto p-4"
                          variant="outline"
                        >
                          <div className="flex items-center gap-3 w-full">
                            <span className="text-lg">{wallet.icon}</span>
                            <div className="text-left">
                              <p className="font-medium">{wallet.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {connecting ? 'Connecting...' : 'Click to connect'}
                              </p>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-4">
                        No Stacks wallets detected. Install a wallet to continue.
                      </p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://leather.io/', '_blank')}
                        >
                          Install Leather Wallet
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {user && (
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-5 w-5" />
              <span className="hidden lg:inline">Sign Out</span>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-chunky border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link 
                to="/browse" 
                className="block py-2 text-body-bold hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                to="/create" 
                className="block py-2 text-body-bold hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create
              </Link>
              <Link 
                to="/dashboard" 
                className="block py-2 text-body-bold hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            </nav>

            {/* Mobile Actions */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Theme</span>
                <ThemeToggle />
              </div>
              <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Post Bounty
              </Button>
              
              {/* Mobile Wallet Connection */}
              {isSignedIn && userData && stxAddress ? (
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{getWalletIcon(connectedWallet || 'unknown')}</span>
                        <span className="font-medium text-sm">{connectedWallet?.charAt(0).toUpperCase()}{connectedWallet?.slice(1)} Wallet</span>
                      </div>
                      <Badge variant={networkType === 'mainnet' ? 'default' : 'secondary'} className="text-xs">
                        {networkType === 'mainnet' ? 'Mainnet' : 'Testnet'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{formatAddress(stxAddress)}</p>
                    {balance && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Balance: {formatStxBalance(balance.stx.available)} STX
                      </p>
                    )}
                  </div>
                  <Button variant="outline" onClick={disconnectWallet} className="w-full">
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect Wallet
                  </Button>
                </div>
              ) : (
                <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-full font-black" disabled={loading}>
                      <Wallet className="mr-2 h-5 w-5" />
                      Connect Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Connect Your Stacks Wallet</DialogTitle>
                      <DialogDescription>
                        Choose a wallet to connect to the Stacks blockchain
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-3">
                      {installedWallets.length > 0 ? (
                        <>
                          <p className="text-sm font-medium">Available Wallets:</p>
                          {installedWallets.map((wallet) => (
                            <Button
                              key={wallet.id}
                              onClick={() => handleConnectWallet(wallet.id)}
                              disabled={connecting}
                              className="w-full justify-start h-auto p-4"
                              variant="outline"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <span className="text-lg">{wallet.icon}</span>
                                <div className="text-left">
                                  <p className="font-medium">{wallet.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {connecting ? 'Connecting...' : 'Click to connect'}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          ))}
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-muted-foreground mb-4">
                            No Stacks wallets detected. Install a wallet to continue.
                          </p>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open('https://leather.io/', '_blank')}
                              className="w-full"
                            >
                              Install Leather Wallet
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {user && (
                <Button variant="ghost" onClick={handleSignOut} className="w-full">
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign Out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}