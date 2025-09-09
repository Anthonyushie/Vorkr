import { UserSession, UserData } from '@stacks/connect';
import { StacksNetwork } from '@stacks/network';

export type WalletType = 'hiro' | 'leather' | 'xverse' | 'unknown';

export type NetworkType = 'mainnet' | 'testnet';

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  installed: boolean;
  provider?: any;
}

export interface StacksAddress {
  mainnet?: string;
  testnet?: string;
}

export interface WalletBalance {
  stx: {
    available: string;
    locked: string;
    total: string;
  };
  fungibleTokens?: Array<{
    contractId: string;
    symbol: string;
    balance: string;
    decimals: number;
  }>;
}

export interface TransactionRequest {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: any[];
  network: StacksNetwork;
  postConditionMode?: number;
  postConditions?: any[];
  fee?: number;
  nonce?: number;
  onFinish?: (data: any) => void;
  onCancel?: () => void;
}

export interface StacksContextType {
  // Authentication state
  isSignedIn: boolean;
  userData: UserData | null;
  userSession: UserSession | null;
  loading: boolean;
  
  // Wallet management
  connectedWallet: WalletType | null;
  availableWallets: WalletInfo[];
  
  // Network management
  network: StacksNetwork;
  networkType: NetworkType;
  
  // Balance and address
  stxAddress: string | null;
  balance: WalletBalance | null;
  
  // Actions
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (network: NetworkType) => void;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  callContract: (request: TransactionRequest) => Promise<any>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export interface StacksProviderProps {
  children: React.ReactNode;
}

export interface WalletCapabilities {
  signMessage: boolean;
  signTransaction: boolean;
  getAddresses: boolean;
  switchNetwork: boolean;
}

// Window interface extensions for wallet detection
declare global {
  interface Window {
    StacksProvider?: any;
    LeatherProvider?: any;
    XverseProviders?: {
      StacksProvider?: any;
    };
    HiroWalletProvider?: any;
  }
}

export interface StacksProvider {
  isConnected: boolean;
  request: (method: string, params?: any) => Promise<any>;
}

export interface WalletError extends Error {
  code?: string | number;
  walletType?: WalletType;
}

export interface NetworkConfig {
  url: string;
  chainId: number;
  coreApiUrl: string;
  name: string;
  isTestnet: boolean;
}