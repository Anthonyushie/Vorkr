import React from 'react';
import { Button } from '@/components/ui/button';
import { useStacks } from '@/contexts/StacksContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ConnectWallet: React.FC = () => {
  const { isSignedIn, userData, connectWallet, disconnectWallet, loading } = useStacks();

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse text-center">Loading wallet...</div>
        </CardContent>
      </Card>
    );
  }

  if (isSignedIn && userData) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base">
            <span>Stacks Wallet Connected</span>
            <Badge variant="secondary" className="self-start sm:self-center">Connected</Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm break-all">
            {userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <p><strong>Username:</strong> {userData.username || 'Anonymous'}</p>
            <p><strong>Profile:</strong> {userData.profile?.name || 'Not set'}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="w-full text-sm"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl">Connect Stacks Wallet</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Connect your Hiro Wallet or other Stacks-compatible wallet to interact with the Stacks blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button 
          onClick={connectWallet}
          className="w-full text-sm sm:text-base"
          size="lg"
        >
          Connect Hiro Wallet
        </Button>
      </CardContent>
    </Card>
  );
};