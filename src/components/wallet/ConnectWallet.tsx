import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useStacks } from '@/contexts/StacksContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Wallet,
  ExternalLink,
  AlertCircle,
  Loader2,
  RefreshCw,
  Network,
  Copy,
  Check,
} from 'lucide-react';
import { WalletType, NetworkType } from '@/types/stacks';
import { toast } from '@/hooks/use-toast';

export const ConnectWallet: React.FC = () => {
  const {
    isSignedIn,
    userData,
    userSession,
    loading,
    connectedWallet,
    availableWallets,
    network,
    networkType,
    stxAddress,
    balance,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
    error,
    clearError,
  } = useStacks();

  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  const handleConnectWallet = async (walletType?: WalletType) => {
    try {
      setConnecting(true);
      await connectWallet(walletType);
    } catch (err: any) {
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleNetworkChange = (newNetwork: string) => {
    switchNetwork(newNetwork as NetworkType);
  };

  const copyAddress = async () => {
    if (!stxAddress) return;
    
    try {
      await navigator.clipboard.writeText(stxAddress);
      setAddressCopied(true);
      toast({
        title: 'Address Copied',
        description: 'STX address copied to clipboard',
      });
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const formatStxBalance = (balance: string): string => {
    const stx = parseFloat(balance) / 1000000; // STX has 6 decimals
    return stx.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletIcon = (walletType: WalletType): string => {
    switch (walletType) {
      case 'hiro': return '🔥';
      case 'leather': return '🧳';
      case 'xverse': return '✨';
      default: return '👛';
    }
  };

  const getWalletName = (walletType: WalletType): string => {
    switch (walletType) {
      case 'hiro': return 'Hiro Wallet';
      case 'leather': return 'Leather Wallet';
      case 'xverse': return 'Xverse Wallet';
      default: return 'Unknown Wallet';
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading wallet...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={clearError}>
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Connected state
  if (isSignedIn && userData && stxAddress) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span>{getWalletIcon(connectedWallet || 'unknown')}</span>
              <span>{getWalletName(connectedWallet || 'unknown')} Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="self-start sm:self-center">
                Connected
              </Badge>
              <Badge variant="outline" className="self-start sm:self-center">
                {networkType === 'mainnet' ? 'Mainnet' : 'Testnet'}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="break-all">{formatAddress(stxAddress)}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={copyAddress}
            >
              {addressCopied ? (
                <Check className="h-3 w-3 text-green-600" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => window.open(`https://explorer.stacks.co/address/${stxAddress}${networkType === 'testnet' ? '?chain=testnet' : ''}`, '_blank')}
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-0">
          {/* Balance Section */}
          {balance && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">STX Balance</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={refreshBalance}
                  disabled={loading}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Available</p>
                  <p className="font-mono">{formatStxBalance(balance.stx.available)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Locked</p>
                  <p className="font-mono">{formatStxBalance(balance.stx.locked)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-mono font-semibold">{formatStxBalance(balance.stx.total)}</p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Network Switcher */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Network className="h-4 w-4" />
              Network
            </label>
            <Select value={networkType} onValueChange={handleNetworkChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="testnet">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    Testnet
                  </div>
                </SelectItem>
                <SelectItem value="mainnet">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Mainnet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* User Info */}
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <p><strong>Username:</strong> {userData.username || 'Anonymous'}</p>
            <p><strong>Profile:</strong> {userData.profile?.name || 'Not set'}</p>
          </div>

          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="w-full text-sm"
            disabled={loading}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Connection state
  const installedWallets = availableWallets.filter(wallet => wallet.installed);
  const notInstalledWallets = availableWallets.filter(wallet => !wallet.installed);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Stacks Wallet
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Choose a wallet to connect to the Stacks blockchain and interact with decentralized applications.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Available Wallets */}
        {installedWallets.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Available Wallets</h4>
            <div className="space-y-2">
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
                    {connecting && <Loader2 className="h-4 w-4 animate-spin ml-auto" />}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No Stacks wallets detected. Please install a wallet to continue.
            </AlertDescription>
          </Alert>
        )}

        {/* Not Installed Wallets */}
        {notInstalledWallets.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Install a Wallet</h4>
              <div className="space-y-2">
                {notInstalledWallets.map((wallet) => (
                  <div 
                    key={wallet.id}
                    className="flex items-center justify-between p-3 rounded-md border border-dashed"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg opacity-50">{wallet.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">Not installed</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const urls: Record<WalletType, string> = {
                          hiro: 'https://wallet.hiro.so/',
                          leather: 'https://leather.io/',
                          xverse: 'https://www.xverse.app/',
                          unknown: '#',
                        };
                        window.open(urls[wallet.id], '_blank');
                      }}
                    >
                      Install
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Network Info */}
        <div className="mt-4 p-3 bg-muted rounded-md">
          <div className="flex items-center gap-2 text-sm">
            <Network className="h-4 w-4" />
            <span>Current Network: </span>
            <Badge variant={networkType === 'mainnet' ? 'default' : 'secondary'}>
              {networkType === 'mainnet' ? 'Mainnet' : 'Testnet'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};