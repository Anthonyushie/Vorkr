import React from 'react';
import { Button } from '@/components/ui/button';
import { useStacks } from '@/contexts/StacksContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ConnectWallet: React.FC = () => {
  const { isSignedIn, userData, connectWallet, disconnectWallet, loading } = useStacks();

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="animate-pulse">Loading wallet...</div>
        </CardContent>
      </Card>
    );
  }

  if (isSignedIn && userData) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Stacks Wallet Connected
            <Badge variant="secondary">Connected</Badge>
          </CardTitle>
          <CardDescription>
            {userData.profile?.stxAddress?.testnet || userData.profile?.stxAddress?.mainnet}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Username:</strong> {userData.username || 'Anonymous'}</p>
            <p><strong>Profile:</strong> {userData.profile?.name || 'Not set'}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Connect Stacks Wallet</CardTitle>
        <CardDescription>
          Connect your Hiro Wallet or other Stacks-compatible wallet to interact with the Stacks blockchain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={connectWallet}
          className="w-full"
        >
          Connect Hiro Wallet
        </Button>
      </CardContent>
    </Card>
  );
};