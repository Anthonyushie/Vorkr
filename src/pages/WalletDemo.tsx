import React, { useState } from 'react';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';
import { useStacks } from '@/contexts/StacksContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet,
  ExternalLink,
  MessageCircle,
  Send,
  Coins,
  Network,
  Info,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const WalletDemo = () => {
  const {
    isSignedIn,
    userData,
    connectedWallet,
    availableWallets,
    networkType,
    stxAddress,
    balance,
    signMessage,
    error,
  } = useStacks();

  const [signingMessage, setSigningMessage] = useState(false);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [messageToSign, setMessageToSign] = useState('Hello, Stacks blockchain!');

  const handleSignMessage = async () => {
    if (!messageToSign.trim()) return;
    
    try {
      setSigningMessage(true);
      const signature = await signMessage(messageToSign);
      setSignedMessage(signature);
      toast({
        title: 'Message Signed',
        description: 'Message has been successfully signed with your wallet',
      });
    } catch (err: any) {
      console.error('Error signing message:', err);
      toast({
        title: 'Signing Failed',
        description: err.message || 'Failed to sign message',
        variant: 'destructive',
      });
    } finally {
      setSigningMessage(false);
    }
  };

  const formatStxBalance = (balance: string): string => {
    const stx = parseFloat(balance) / 1000000; // STX has 6 decimals
    return stx.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  const getWalletIcon = (walletType: string): string => {
    switch (walletType) {
      case 'hiro': return '🔥';
      case 'leather': return '🧳';
      case 'xverse': return '✨';
      default: return '👛';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Enhanced Stacks Wallet Demo
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive multi-wallet integration supporting Hiro, Leather, and Xverse wallets 
            with network switching, balance tracking, and transaction capabilities.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Wallet Connection */}
          <div className="space-y-6">
            <ConnectWallet />

            {/* Wallet Detection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Wallet Detection Status
                </CardTitle>
                <CardDescription>
                  Available wallets detected in your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableWallets.map((wallet) => (
                  <div key={wallet.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{wallet.icon}</span>
                      <div>
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {wallet.id === connectedWallet ? 'Connected' : wallet.installed ? 'Available' : 'Not installed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {wallet.id === connectedWallet && (
                        <Badge variant="default">Active</Badge>
                      )}
                      {wallet.installed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
                {availableWallets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No wallets detected. Install a Stacks wallet to get started.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Network Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Network Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Network:</span>
                  <Badge variant={networkType === 'mainnet' ? 'default' : 'secondary'}>
                    {networkType === 'mainnet' ? 'Mainnet' : 'Testnet'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>• Mainnet: Real STX tokens and live smart contracts</p>
                  <p>• Testnet: Free test tokens for development</p>
                </div>
                {networkType === 'testnet' && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You're on testnet. Get free STX from the{' '}
                      <a 
                        href="https://explorer.stacks.co/sandbox/faucet?chain=testnet" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        testnet faucet
                      </a>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Wallet Features & Testing */}
          <div className="space-y-6">
            {/* Connection Status */}
            {isSignedIn && userData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Wallet Connected
                  </CardTitle>
                  <CardDescription>
                    {getWalletIcon(connectedWallet || 'unknown')} {connectedWallet?.charAt(0).toUpperCase()}{connectedWallet?.slice(1)} Wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Address:</p>
                    <code className="text-xs bg-muted p-2 rounded block break-all">
                      {stxAddress}
                    </code>
                    {stxAddress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(
                          `https://explorer.stacks.co/address/${stxAddress}${networkType === 'testnet' ? '?chain=testnet' : ''}`, 
                          '_blank'
                        )}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </Button>
                    )}
                  </div>

                  {balance && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">STX Balance:</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-muted p-3 rounded">
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-mono font-medium">{formatStxBalance(balance.stx.available)} STX</p>
                        </div>
                        <div className="bg-muted p-3 rounded">
                          <p className="text-muted-foreground">Locked</p>
                          <p className="font-mono font-medium">{formatStxBalance(balance.stx.locked)} STX</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    No Wallet Connected
                  </CardTitle>
                  <CardDescription>
                    Connect a wallet to access advanced features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Connect your Stacks wallet to test message signing, view balances, and interact with smart contracts.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Message Signing Demo */}
            {isSignedIn && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Message Signing Demo
                  </CardTitle>
                  <CardDescription>
                    Test cryptographic message signing with your wallet
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message to sign:
                    </label>
                    <textarea
                      id="message"
                      value={messageToSign}
                      onChange={(e) => setMessageToSign(e.target.value)}
                      className="w-full p-2 border rounded-md resize-none"
                      rows={3}
                      placeholder="Enter a message to sign..."
                    />
                  </div>

                  <Button
                    onClick={handleSignMessage}
                    disabled={!messageToSign.trim() || signingMessage}
                    className="w-full"
                  >
                    {signingMessage ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Sign Message
                      </>
                    )}
                  </Button>

                  {signedMessage && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Signature:</p>
                      <code className="text-xs bg-muted p-2 rounded block break-all">
                        {signedMessage}
                      </code>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Features</CardTitle>
                <CardDescription>
                  What's new in this integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Multi-Wallet Support</p>
                      <p className="text-muted-foreground">Hiro, Leather, and Xverse compatibility</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Network Switching</p>
                      <p className="text-muted-foreground">Toggle between mainnet and testnet</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Balance Display</p>
                      <p className="text-muted-foreground">Real-time STX balance tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Message Signing</p>
                      <p className="text-muted-foreground">Cryptographic message verification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Enhanced Error Handling</p>
                      <p className="text-muted-foreground">Comprehensive error states and recovery</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">TypeScript Support</p>
                      <p className="text-muted-foreground">Full type safety and IntelliSense</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-8">
          <p>
            This enhanced Stacks.js integration works independently of Supabase authentication
            and provides comprehensive multi-wallet support for decentralized applications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletDemo;