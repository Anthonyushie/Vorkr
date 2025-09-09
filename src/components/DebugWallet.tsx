import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DebugWallet: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log('DEBUG:', message);
  };

  useEffect(() => {
    addLog('Component mounted, checking for wallets...');
    
    const checkWallets = () => {
      const info = {
        stacksProvider: !!window.StacksProvider,
        hiroWallet: !!window.HiroWalletProvider,
        leatherProvider: !!window.LeatherProvider,
        leatherBTC: !!(window as any).btc?.request,
        xverseProvider: !!window.XverseProviders?.StacksProvider,
        environment: import.meta.env.VITE_STACKS_NETWORK,
        userAgent: navigator.userAgent,
        windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('wallet') || k.toLowerCase().includes('stacks') || k.toLowerCase().includes('leather') || k.toLowerCase().includes('hiro'))
      };
      
      setDebugInfo(info);
      addLog(`Wallet detection complete: ${JSON.stringify(info, null, 2)}`);
    };

    checkWallets();
    
    // Check again after 2 seconds (wallets might inject later)
    setTimeout(() => {
      addLog('Re-checking wallets after delay...');
      checkWallets();
    }, 2000);
  }, []);

  const testBasicConnection = async () => {
    addLog('Testing basic Stacks Connect...');
    
    try {
      addLog('Step 1: Importing @stacks/connect...');
      const stacksConnect = await import('@stacks/connect').catch((error) => {
        addLog(`❌ Failed to import @stacks/connect: ${error}`);
        throw error;
      });
      
      addLog('✅ @stacks/connect imported successfully');
      addLog(`Available exports: ${Object.keys(stacksConnect).join(', ')}`);
      
      // Try to get functions from different possible locations
      const showConnect = stacksConnect.showConnect || stacksConnect.default?.showConnect || (stacksConnect as any).showConnect;
      const AppConfig = stacksConnect.AppConfig || stacksConnect.default?.AppConfig || (stacksConnect as any).AppConfig;
      const UserSession = stacksConnect.UserSession || stacksConnect.default?.UserSession || (stacksConnect as any).UserSession;
      
      // Validate functions
      if (typeof showConnect !== 'function') {
        addLog(`❌ showConnect is not a function. Type: ${typeof showConnect}`);
        throw new Error('showConnect function not available');
      }
      
      addLog('✅ showConnect is available');
      
      const appConfig = new AppConfig(['store_write', 'publish_data']);
      const userSession = new UserSession({ appConfig });
      
      addLog('✅ AppConfig and UserSession created');
      
      showConnect({
        appDetails: {
          name: 'Debug Test',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: window.location.href,
        onFinish: () => {
          addLog('✅ Connection successful!');
        },
        onCancel: () => {
          addLog('❌ Connection cancelled');
        },
        userSession,
      });
      
      addLog('✅ showConnect called successfully');
      
    } catch (error) {
      addLog(`❌ Error in basic connection: ${error instanceof Error ? error.message : String(error)}`);
      console.error('Connection error:', error);
    }
  };

  const testWalletDetection = () => {
    addLog('Testing wallet detection manually...');
    
    // Test different wallet detection methods
    const detectionResults = {
      method1_StacksProvider: !!window.StacksProvider,
      method2_HiroWalletProvider: !!window.HiroWalletProvider,
      method3_LeatherProvider: !!window.LeatherProvider,
      method4_LeatherBTC: !!(window as any).btc,
      method5_XverseProviders: !!window.XverseProviders,
      method6_windowStacks: !!(window as any).stacks,
    };
    
    addLog(`Detection results: ${JSON.stringify(detectionResults, null, 2)}`);
    
    // Log all window properties that might be wallet-related
    const walletKeys = Object.keys(window).filter(key => 
      key.toLowerCase().includes('wallet') || 
      key.toLowerCase().includes('stacks') || 
      key.toLowerCase().includes('leather') || 
      key.toLowerCase().includes('hiro') ||
      key.toLowerCase().includes('xverse')
    );
    
    addLog(`Potential wallet keys in window: ${walletKeys.join(', ')}`);
  };

  const testLibraryImports = async () => {
    addLog('Testing library imports...');
    
    try {
      const stacksConnect = await import('@stacks/connect').catch((error) => {
        addLog(`❌ Failed to import @stacks/connect: ${error}`);
        throw error;
      });
      
      addLog('✅ @stacks/connect imported successfully');
      addLog(`Available exports: ${Object.keys(stacksConnect).slice(0, 10).join(', ')}...`);
      
      // Test if specific functions are available
      const functions = {
        showConnect: stacksConnect.showConnect ? 'function' : 'not found',
        AppConfig: stacksConnect.AppConfig ? 'function' : 'not found',
        UserSession: stacksConnect.UserSession ? 'function' : 'not found',
        openContractCall: stacksConnect.openContractCall ? 'function' : 'not found',
        openSignatureRequestPopup: stacksConnect.openSignatureRequestPopup ? 'function' : 'not found',
      };
      
      addLog(`Function availability: ${JSON.stringify(functions, null, 2)}`);
      
      // Check if functions exist in different locations
      if (!stacksConnect.showConnect && stacksConnect.default) {
        addLog('Checking default export...');
        const defaultFunctions = Object.keys(stacksConnect.default).slice(0, 10);
        addLog(`Default export contains: ${defaultFunctions.join(', ')}`);
      }
      
    } catch (error) {
      addLog(`❌ Error testing library imports: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔍 Wallet Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Stacks Provider:</strong> {debugInfo.stacksProvider ? '✅' : '❌'}
            </div>
            <div>
              <strong>Hiro Wallet:</strong> {debugInfo.hiroWallet ? '✅' : '❌'}
            </div>
            <div>
              <strong>Leather Provider:</strong> {debugInfo.leatherProvider ? '✅' : '❌'}
            </div>
            <div>
              <strong>Leather BTC:</strong> {debugInfo.leatherBTC ? '✅' : '❌'}
            </div>
            <div>
              <strong>Xverse Provider:</strong> {debugInfo.xverseProvider ? '✅' : '❌'}
            </div>
            <div>
              <strong>Environment:</strong> {debugInfo.environment || 'Not set'}
            </div>
          </div>
          
          {debugInfo.windowKeys && debugInfo.windowKeys.length > 0 && (
            <Alert>
              <AlertDescription>
                <strong>Wallet-related window properties:</strong> {debugInfo.windowKeys.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={testLibraryImports} className="w-full">
            Test Library Imports
          </Button>
          <Button onClick={testWalletDetection} className="w-full" variant="outline">
            Test Wallet Detection
          </Button>
          <Button onClick={testBasicConnection} className="w-full" variant="secondary">
            Test Basic Connection
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md max-h-40 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};