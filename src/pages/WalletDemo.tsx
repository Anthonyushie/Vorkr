import React from 'react';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';

const WalletDemo = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Stacks Wallet Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Test the Hiro Wallet connection functionality
          </p>
        </div>
        
        <div className="flex justify-center">
          <ConnectWallet />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            This demo works independently of Supabase authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletDemo;