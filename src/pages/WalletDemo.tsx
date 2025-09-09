import React from 'react';
import { ConnectWallet } from '@/components/wallet/ConnectWallet';

const WalletDemo = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-4">
            Stacks Wallet Demo
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground px-4">
            Test the Hiro Wallet connection functionality
          </p>
        </div>
        
        <div className="flex justify-center px-4">
          <div className="w-full max-w-sm">
            <ConnectWallet />
          </div>
        </div>
        
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground px-4">
            This demo works independently of Supabase authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletDemo;