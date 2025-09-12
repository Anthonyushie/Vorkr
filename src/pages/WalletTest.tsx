import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { connectWallet, disconnectWallet, isUserSignedIn, getUserData, detectAvailableWallets, getStxAddress } from '@/lib/stacks';

const WalletTest = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[WalletTest] ${message}`);
  };

  useEffect(() => {
    // Check initial connection status
    const checkConnection = () => {
      addLog('Checking initial connection status...');
      const connected = isUserSignedIn();
      setIsConnected(connected);
      
      if (connected) {
        const userData = getUserData();
        setWalletData(userData);
        addLog('Wallet already connected!');
        addLog(`Address: ${getStxAddress('testnet')}`);
      } else {
        addLog('No wallet connected');
      }
    };

    // Detect available wallets
    const checkWallets = () => {
      addLog('Detecting available wallets...');
      const wallets = detectAvailableWallets();
      setAvailableWallets(wallets);
      
      wallets.forEach(wallet => {
        if (wallet.installed) {
          addLog(`✅ ${wallet.name} detected`);
        } else {
          addLog(`❌ ${wallet.name} not detected`);
        }
      });

      // Check for Leather specifically
      if ((window as any).LeatherProvider) {
        addLog('✅ Leather wallet provider found at window.LeatherProvider');
      } else if ((window as any).btc?.request) {
        addLog('✅ Leather wallet provider found at window.btc.request');
      } else {
        addLog('⚠️ Leather wallet provider not found in expected locations');
      }
    };

    checkConnection();
    checkWallets();

    // Check again after a delay (wallets might inject later)
    const timeout = setTimeout(() => {
      addLog('Re-checking wallet availability after delay...');
      checkWallets();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    addLog('Starting wallet connection...');

    try {
      addLog('Calling connectWallet function...');
      const authData = await connectWallet();
      
      addLog('Connection successful!');
      addLog(`Auth data received: ${JSON.stringify(authData, null, 2)}`);
      
      const userData = getUserData();
      setWalletData(userData);
      setIsConnected(true);
      
      const address = getStxAddress('testnet');
      addLog(`Connected address: ${address}`);
    } catch (err: any) {
      const errorMessage = err.message || 'Unknown error occurred';
      addLog(`Connection failed: ${errorMessage}`);
      setError(errorMessage);
      console.error('Connection error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    addLog('Disconnecting wallet...');
    disconnectWallet();
    setIsConnected(false);
    setWalletData(null);
    addLog('Wallet disconnected');
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            Leather Wallet Connection Test
          </CardTitle>
          <CardDescription>
            Test page to verify Leather wallet connection functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Status:</span>
              {isConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary">Not Connected</Badge>
              )}
            </div>

            {/* Available Wallets */}
            <div>
              <span className="font-medium">Available Wallets:</span>
              <div className="mt-2 space-y-2">
                {availableWallets.map(wallet => (
                  <div key={wallet.id} className="flex items-center gap-2">
                    <span className="text-xl">{wallet.icon}</span>
                    <span>{wallet.name}:</span>
                    {wallet.installed ? (
                      <Badge variant="outline" className="text-green-600">Installed</Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">Not Installed</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Connection Buttons */}
            <div className="flex gap-4">
              {!isConnected ? (
                <Button 
                  onClick={handleConnect} 
                  disabled={isConnecting}
                  className="flex items-center gap-2"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Leather Wallet'}
                </Button>
              ) : (
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                >
                  Disconnect
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Wallet Data */}
            {walletData && (
              <div className="space-y-2">
                <h3 className="font-medium">Wallet Data:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm">
                    <strong>Address (Testnet):</strong> {getStxAddress('testnet')}
                  </p>
                  <p className="text-sm">
                    <strong>Address (Mainnet):</strong> {getStxAddress('mainnet')}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-gray-600">
                      View Full Data
                    </summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {JSON.stringify(walletData, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            )}

            {/* Debug Logs */}
            <div className="space-y-2">
              <h3 className="font-medium">Debug Logs:</h3>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-auto font-mono text-xs">
                {logs.map((log, index) => (
                  <div key={index} className="py-0.5">
                    {log}
                  </div>
                ))}
                {logs.length === 0 && (
                  <div className="text-gray-500">No logs yet...</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletTest;