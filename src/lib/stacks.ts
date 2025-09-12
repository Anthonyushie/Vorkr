import { STACKS_MAINNET, STACKS_TESTNET, StacksNetwork } from '@stacks/network';
import {
  AppConfig,
  UserSession,
  connect as stacksConnect,
  disconnect as stacksDisconnect,
  isConnected as stacksIsConnected,
  request as stacksRequest,
  getLocalStorage,
} from '@stacks/connect';
import { toast } from '@/hooks/use-toast';
import {
  WalletType,
  WalletInfo,
  NetworkType,
  NetworkConfig,
  StacksProvider,
  WalletError,
  TransactionRequest,
} from '@/types/stacks';

// App Configuration (kept for partial backward-compat in v8)
export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

// Network Configuration
export const getNetworkFromEnv = (): NetworkType => {
  const envNetwork = import.meta.env.VITE_STACKS_NETWORK?.toLowerCase();
  return envNetwork === 'mainnet' || envNetwork === 'testnet' ? envNetwork : 'testnet';
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

// Wallet Detection and Management (Leather-only)
export const detectAvailableWallets = (): WalletInfo[] => {
  const wallets: WalletInfo[] = [
    {
      id: 'leather',
      name: 'Leather Wallet',
      icon: '🧳',
      installed: !!(window.LeatherProvider || (window as any).btc?.request || (window as any).LeatherProvider),
      provider: window.LeatherProvider || (window as any).LeatherProvider,
    },
  ];

  return wallets;
};

export const getWalletType = (): WalletType => {
  if (window.LeatherProvider || (window as any).LeatherProvider) return 'leather';
  return 'unknown';
};

// Connection (Leather-only)
export const connectWallet = async (walletType?: WalletType): Promise<any> => {
  try {
    const approvedProviderIds = ['LeatherProvider'];

    const response = await stacksConnect({ forceWalletSelect: true, approvedProviderIds });

    toast({
      title: 'Wallet Connected',
      description: `Successfully connected to ${getWalletType()} wallet`,
    });

    // Notify listeners (context hooks) to refresh state
    window.dispatchEvent(new CustomEvent('stacks:auth'));

    return response;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    const walletError = error as WalletError;
    walletError.walletType = walletType;
    toast({
      title: 'Connection Failed',
      description: `Failed to connect to wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: 'destructive',
    });
    throw walletError;
  }
};

export const disconnectWallet = (): void => {
  try {
    stacksDisconnect();
    userSession.signUserOut?.();
    toast({
      title: 'Wallet Disconnected',
      description: 'Successfully disconnected from wallet',
    });
    window.dispatchEvent(new CustomEvent('stacks:auth'));
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
    return stacksIsConnected();
  } catch (error) {
    console.error('Error checking sign-in status:', error);
    return false;
  }
};

export const getUserData = () => {
  try {
    // v8 stores addresses in local storage by default
    return getLocalStorage?.() as any;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

// Address helpers
export const getStxAddress = (networkType?: NetworkType): string | null => {
  try {
    const ls = getLocalStorage?.();
    const stxAddress = ls?.addresses?.stx?.[0]?.address as string | undefined;
    if (stxAddress) return stxAddress;

    // Fallback to legacy UserSession cache if available
    const legacy = (userSession as any)?.loadUserData?.();
    if (legacy?.profile?.stxAddress) {
      const network = networkType || getNetworkFromEnv();
      return network === 'mainnet' ? legacy.profile.stxAddress.mainnet : legacy.profile.stxAddress.testnet;
    }

    return null;
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
        balance: (tokenData as any).balance,
        decimals: (tokenData as any).decimals || 6,
      })),
    };
  } catch (error) {
    console.error('Error fetching STX balance:', error);
    throw new Error('Failed to fetch balance');
  }
};

// Transaction helpers
export const callContract = async (tx: TransactionRequest): Promise<any> => {
  try {
    const networkType: NetworkType = tx.network?.isTestnet ? 'testnet' : 'mainnet';

    const result = await stacksRequest('stx_callContract', {
      contract: `${tx.contractAddress}.${tx.contractName}`,
      functionName: tx.functionName,
      functionArgs: tx.functionArgs,
      network: networkType,
      postConditionMode: tx.postConditionMode,
      postConditions: tx.postConditions,
      fee: tx.fee,
      nonce: tx.nonce,
    });

    toast({
      title: 'Transaction Sent',
      description: 'Transaction has been broadcast to the network',
    });

    return result;
  } catch (error) {
    console.error('Error calling contract:', error);
    toast({
      title: 'Transaction Failed',
      description: `Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: 'destructive',
    });
    throw error;
  }
};

// Message signing
export const signMessage = async (message: string): Promise<string> => {
  try {
    const result = await stacksRequest('stx_signMessage', { message });
    return (result as any).signature as string;
  } catch (error) {
    console.error('Error signing message:', error);
    toast({
      title: 'Message Signing Failed',
      description: `Failed to sign message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: 'destructive',
    });
    throw error;
  }
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
