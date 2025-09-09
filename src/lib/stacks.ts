import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = STACKS_TESTNET; // Use STACKS_MAINNET for production

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'Stark Stacks Work',
      icon: window.location.origin + '/favicon.ico',
    },
    redirectTo: window.location.href,
    onFinish: () => {
      // Don't reload, let the context handle state updates
      console.log('Wallet connected successfully');
    },
    userSession,
  });
};

export const disconnectWallet = () => {
  userSession.signUserOut('/');
};

export const isUserSignedIn = () => {
  return userSession.isUserSignedIn();
};

export const getUserData = () => {
  return userSession.loadUserData();
};