import React, { createContext, useContext, useEffect, useState } from 'react';
import { userSession, isUserSignedIn, getUserData } from '@/lib/stacks';

interface StacksContextType {
  isSignedIn: boolean;
  userData: any;
  connectWallet: () => void;
  disconnectWallet: () => void;
  loading: boolean;
}

const StacksContext = createContext<StacksContextType | undefined>(undefined);

export const useStacks = () => {
  const context = useContext(StacksContext);
  if (context === undefined) {
    throw new Error('useStacks must be used within a StacksProvider');
  }
  return context;
};

interface StacksProviderProps {
  children: React.ReactNode;
}

export const StacksProvider: React.FC<StacksProviderProps> = ({ children }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        if (isUserSignedIn()) {
          setIsSignedIn(true);
          setUserData(getUserData());
        }
      } catch (error) {
        console.error('Error checking Stacks auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for auth events
    const handleAuth = () => {
      if (isUserSignedIn()) {
        setIsSignedIn(true);
        setUserData(getUserData());
      } else {
        setIsSignedIn(false);
        setUserData(null);
      }
    };

    window.addEventListener('stacks:auth', handleAuth);
    return () => window.removeEventListener('stacks:auth', handleAuth);
  }, []);

  const connectWallet = () => {
    try {
      const { showConnect } = require('@stacks/connect');
      showConnect({
        appDetails: {
          name: 'Stark Stacks Work',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: window.location.href,
        onFinish: () => {
          setTimeout(() => {
            setIsSignedIn(true);
            setUserData(getUserData());
            window.dispatchEvent(new CustomEvent('stacks:auth'));
          }, 100);
        },
        userSession,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setIsSignedIn(false);
    setUserData(null);
    window.dispatchEvent(new CustomEvent('stacks:auth'));
  };

  const value = {
    isSignedIn,
    userData,
    connectWallet,
    disconnectWallet,
    loading,
  };

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  );
};