import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });

export const network = STACKS_TESTNET; // Use STACKS_MAINNET for production

export const connectWallet = () => {
  showConnect({
    appDetails: {
      name: 'My App',
      icon: window.location.origin + '/favicon.ico',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
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