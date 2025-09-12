import { STACKS_MAINNET, STACKS_TESTNET, StacksNetwork } from '@stacks/network';
import { 
  AppConfig, 
  UserSession, 
  FinishedAuthData,
  showConnect,
  openContractCall,
  openSignatureRequestPopup
} from '@stacks/connect';
import { toast } from '@/hooks/use-toast';
import { 
  WalletType, 
  WalletInfo, 
  NetworkType, 
  NetworkConfig, 
  StacksProvider,
  WalletError,
  TransactionRequest 
} from '@/types/stacks';

// App Configuration
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network Configuration
export const getNetworkFromEnv = (): NetworkType => {
  const envNetwork = import.meta.env.VITE_STACKS_NETWORK?.toLowerCase();
  return (envNetwork === 'mainnet' || envNetwork === 'testnet') ? envNetwork : 'testnet';
};

export const getStacksNetwork = (networkType?: NetworkType): StacksNetwork => {
  const network = networkType || getNetworkFromEnv();
  return network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;
};

export const networkConfigs: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    url: 'https://stacks-node-api.mainnet.stacks.co',
    chainId: 1,
    coreApiUrl: 'https://stacks-node-api.mainnet.stacks.co',
    name: 'Stacks Mainnet',
    isTestnet: false,
  },
  testnet: {
    url: 'https://stacks-node-api.testnet.stacks.co',
    chainId: 2147483648,
    coreApiUrl: 'https://stacks-node-api.testnet.stacks.co',
    name: 'Stacks Testnet',
    isTestnet: true,
  },
};

// Wallet Detection and Management
export const detectAvailableWallets = (): WalletInfo[] => {
  const wallets: WalletInfo[] = [
    {
      id: 'hiro',
      name: 'Hiro Wallet',
      icon: '🔥',
      installed: !!(window.StacksProvider || window.HiroWalletProvider),
      provider: window.StacksProvider || window.HiroWalletProvider,
    },
    {
      id: 'leather',
      name: 'Leather Wallet',
      icon: '🧳',
      installed: !!(window.LeatherProvider || (window as any).btc?.request || (window as any).LeatherProvider),
      provider: window.LeatherProvider || (window as any).LeatherProvider,
    },
    {
      id: 'xverse',
      name: 'Xverse Wallet',
      icon: '✨',
      installed: !!(window.XverseProviders?.StacksProvider),
      provider: window.XverseProviders?.StacksProvider,
    },
  ];

  return wallets;
};

export const getWalletType = (): WalletType => {
  // Check for specific wallet providers
  if (window.LeatherProvider || (window as any).LeatherProvider) return 'leather';
  if (window.XverseProviders?.StacksProvider) return 'xverse';
  if (window.StacksProvider || window.HiroWalletProvider) return 'hiro';
  return 'unknown';
};

// Enhanced connection functions
export const connectWallet = async (walletType?: WalletType): Promise<FinishedAuthData> => {
  return new Promise((resolve, reject) => {
    try {
      const network = getStacksNetwork();
      
      showConnect({
        appDetails: {
          name: 'Vorkr - Stacks Bounty Platform',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: window.location.href,
        network,
        userSession,
        onFinish: (authData) => {
          console.log('Wallet connected successfully:', getWalletType());
          toast({
            title: 'Wallet Connected',
            description: `Successfully connected to ${getWalletType()} wallet`,
          });
          resolve(authData);
        },
        onCancel: () => {
          const error = new Error('User cancelled wallet connection') as WalletError;
          error.walletType = walletType;
          reject(error);
        },
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      const walletError = error as WalletError;
      walletError.walletType = walletType;
      toast({
        title: 'Connection Failed',
        description: `Failed to connect to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      reject(walletError);
    }
  });
};

export const disconnectWallet = (): void => {
  try {
    userSession.signUserOut();
    toast({
      title: 'Wallet Disconnected',
      description: 'Successfully disconnected from wallet',
    });
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    toast({
      title: 'Disconnection Failed',
      description: 'Failed to disconnect wallet properly',
      variant: 'destructive',
    });
  }
};

// Authentication helpers
export const isUserSignedIn = (): boolean => {
  try {
    return userSession.isUserSignedIn();
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

export const getUserData = () => {
  try {
    return userSession.loadUserData();
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

// Address helpers
export const getStxAddress = (networkType?: NetworkType): string | null => {
  try {
    const userData = getUserData();
    if (!userData?.profile?.stxAddress) return null;
    
    const network = networkType || getNetworkFromEnv();
    return network === 'mainnet' 
      ? userData.profile.stxAddress.mainnet 
      : userData.profile.stxAddress.testnet;
  } catch (error) {
    console.error('Error getting STX address:', error);
    return null;
  }
};

// Balance fetching
export const fetchStxBalance = async (address: string, networkType?: NetworkType): Promise<any> => {
  try {
    const network = getStacksNetwork(networkType);
    const response = await fetch(`${network.coreApiUrl}/extended/v1/address/${address}/balances`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      stx: {
        available: data.stx.balance,
        locked: data.stx.locked,
        total: data.stx.total_sent,
      },
      fungibleTokens: Object.entries(data.fungible_tokens || {}).map(([contractId, tokenData]: [string, any]) => ({
        contractId,
        symbol: contractId.split('::')[1] || 'Unknown',
        balance: tokenData.balance,
        decimals: tokenData.decimals || 6,
      })),
    };
  } catch (error) {
    console.error('Error fetching STX balance:', error);
    throw new Error('Failed to fetch balance');
  }
};

// Transaction helpers
export const callContract = async (request: TransactionRequest): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      openContractCall({
        ...request,
        onFinish: (data: any) => {
          toast({
            title: 'Transaction Sent',
            description: 'Transaction has been broadcast to the network',
          });
          resolve(data);
        },
        onCancel: () => {
          const error = new Error('Transaction cancelled by user');
          reject(error);
        },
      });
    } catch (error) {
      console.error('Error calling contract:', error);
      toast({
        title: 'Transaction Failed',
        description: `Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      reject(error);
    }
  });
};

// Message signing
export const signMessage = async (message: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      openSignatureRequestPopup({
        message,
        network: getStacksNetwork(),
        onFinish: (data: any) => {
          resolve(data.signature);
        },
        onCancel: () => {
          reject(new Error('Message signing cancelled by user'));
        },
      });
    } catch (error) {
      console.error('Error signing message:', error);
      toast({
        title: 'Message Signing Failed',
        description: `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      reject(error);
    }
  });
};

// Network validation
export const validateNetwork = (networkType: string): NetworkType => {
  if (networkType === 'mainnet' || networkType === 'testnet') {
    return networkType;
  }
  console.warn(`Invalid network type: ${networkType}. Defaulting to testnet.`);
  return 'testnet';
};

// Error helpers
export const createWalletError = (message: string, walletType?: WalletType, code?: string | number): WalletError => {
  const error = new Error(message) as WalletError;
  error.walletType = walletType;
  error.code = code;
  return error;
};

// Utility to wait for wallet injection
export const waitForWalletInjection = (timeout = 3000): Promise<boolean> => {
  return new Promise((resolve) => {
    const checkWallet = () => {
      const wallets = detectAvailableWallets();
      if (wallets.some(wallet => wallet.installed)) {
        resolve(true);
        return;
      }
    };

    checkWallet();
    
    const interval = setInterval(checkWallet, 100);
    
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, timeout);
  });
};