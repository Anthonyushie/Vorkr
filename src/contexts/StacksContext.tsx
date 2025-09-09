import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserData } from '@stacks/connect';
import { UserSession } from '@stacks/connect';
import {
  userSession,
  isUserSignedIn,
  getUserData,
  connectWallet as connectStacksWallet,
  disconnectWallet as disconnectStacksWallet,
  detectAvailableWallets,
  getWalletType,
  getStacksNetwork,
  getNetworkFromEnv,
  getStxAddress,
  fetchStxBalance,
  signMessage as signStacksMessage,
  callContract as callStacksContract,
  waitForWalletInjection,
} from '@/lib/stacks';
import {
  StacksContextType,
  StacksProviderProps,
  WalletType,
  WalletInfo,
  NetworkType,
  WalletBalance,
  TransactionRequest,
} from '@/types/stacks';
import { toast } from '@/hooks/use-toast';

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export const useStacks = (): StacksContextType => {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
};

export const StacksProvider: React.FC<StacksProviderProps> = ({ children }) => {
  // Authentication state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userSessionState, setUserSession] = useState<UserSession | null>(userSession);
  const [loading, setLoading] = useState(true);

  // Wallet management
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  // Network management
  const [networkType, setNetworkType] = useState<NetworkType>(getNetworkFromEnv());
  const [network, setNetwork] = useState(getStacksNetwork(networkType));

  // Balance and address
  const [stxAddress, setStxAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Initialize wallet detection
  useEffect(() => {
    const initializeWallets = async () => {
      try {
        // Wait a bit for wallet injection
        await waitForWalletInjection(1000);
        const wallets = detectAvailableWallets();
        setAvailableWallets(wallets);
      } catch (err) {
        console.error('Error detecting wallets:', err);
      }
    };

    initializeWallets();
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        if (isUserSignedIn()) {
          const data = getUserData();
          if (data) {
            setIsSignedIn(true);
            setUserData(data);
            setConnectedWallet(getWalletType());
            
            // Get STX address
            const address = getStxAddress(networkType);
            setStxAddress(address);
            
            // Fetch balance if address is available
            if (address) {
              try {
                const balanceData = await fetchStxBalance(address, networkType);
                setBalance(balanceData);
              } catch (balanceError) {
                console.warn('Could not fetch balance:', balanceError);
              }
            }
          }
        } else {
          // Reset state when not signed in
          setIsSignedIn(false);
          setUserData(null);
          setConnectedWallet(null);
          setStxAddress(null);
          setBalance(null);
        }
      } catch (err) {
        console.error('Error checking Stacks auth:', err);
        setError('Failed to check authentication status');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth events
    const handleAuth = () => {
      checkAuth();
    };

    // Listen for wallet events
    const handleWalletChange = () => {
      // Refresh wallet detection
      const wallets = detectAvailableWallets();
      setAvailableWallets(wallets);
      checkAuth();
    };

    window.addEventListener('stacks:auth', handleAuth);
    window.addEventListener('wallet:changed', handleWalletChange);
    
    // Listen for account changes in wallets
    if (window.ethereum) {
      window.ethereum.on?.('accountsChanged', handleAuth);
    }

    return () => {
      window.removeEventListener('stacks:auth', handleAuth);
      window.removeEventListener('wallet:changed', handleWalletChange);
      if (window.ethereum) {
        window.ethereum.removeListener?.('accountsChanged', handleAuth);
      }
    };
  }, [networkType]);

  // Connect wallet function
  const connectWallet = useCallback(async (walletType?: WalletType): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Check if wallet is available
      if (walletType) {
        const wallet = availableWallets.find(w => w.id === walletType);
        if (!wallet?.installed) {
          throw new Error(`${walletType} wallet is not installed. Please install it to continue.`);
        }
      }

      await connectStacksWallet(walletType);
      
      // The auth status will be updated by the event listener
      
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      
      if (err.message?.includes('not installed')) {
        toast({
          title: 'Wallet Not Found',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [availableWallets]);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    try {
      disconnectStacksWallet();
      
      // Reset state
      setIsSignedIn(false);
      setUserData(null);
      setConnectedWallet(null);
      setStxAddress(null);
      setBalance(null);
      setError(null);
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('stacks:auth'));
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet properly');
    }
  }, []);

  // Switch network function
  const switchNetwork = useCallback((newNetworkType: NetworkType) => {
    try {
      setNetworkType(newNetworkType);
      setNetwork(getStacksNetwork(newNetworkType));
      
      // Clear balance and address to force refresh
      setBalance(null);
      setStxAddress(null);
      
      toast({
        title: 'Network Switched',
        description: `Switched to ${newNetworkType}`,
      });
    } catch (err) {
      console.error('Error switching network:', err);
      setError('Failed to switch network');
    }
  }, []);

  // Refresh balance function
  const refreshBalance = useCallback(async (): Promise<void> => {
    if (!stxAddress) return;
    
    try {
      const balanceData = await fetchStxBalance(stxAddress, networkType);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error refreshing balance:', err);
      setError('Failed to refresh balance');
    }
  }, [stxAddress, networkType]);

  // Sign message function
  const signMessage = useCallback(async (message: string): Promise<string> => {
    if (!isSignedIn) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await signStacksMessage(message);
    } catch (err) {
      console.error('Error signing message:', err);
      throw err;
    }
  }, [isSignedIn]);

  // Call contract function
  const callContract = useCallback(async (request: TransactionRequest): Promise<any> => {
    if (!isSignedIn) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await callStacksContract({
        ...request,
        network: network,
      });
    } catch (err) {
      console.error('Error calling contract:', err);
      throw err;
    }
  }, [isSignedIn, network]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: StacksContextType = {
    // Authentication state
    isSignedIn,
    userData,
    userSession: userSessionState,
    loading,
    
    // Wallet management
    connectedWallet,
    availableWallets,
    
    // Network management
    network,
    networkType,
    
    // Balance and address
    stxAddress,
    balance,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
    signMessage,
    callContract,
    
    // Error handling
    error,
    clearError,
  };

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  );
};