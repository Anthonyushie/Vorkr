import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const SimpleWalletTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const logMessage = `${new Date().toLocaleTimeString()}: ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log('SIMPLE TEST:', message);
  };

  const testDirectConnection = async () => {
    setStatus('Testing direct connection...');
    addLog('Starting direct connection test');

    try {
      // Test 1: Check if @stacks/connect can be imported
      addLog('Step 1: Importing @stacks/connect...');
      const { showConnect, AppConfig, UserSession } = await import('@stacks/connect');
      addLog('✅ @stacks/connect imported successfully');

      // Test 2: Create basic configuration
      addLog('Step 2: Creating AppConfig...');
      const appConfig = new AppConfig(['store_write', 'publish_data']);
      const userSession = new UserSession({ appConfig });
      addLog('✅ AppConfig and UserSession created');

      // Test 3: Check for wallet injection
      addLog('Step 3: Checking wallet injection...');
      const walletCheck = {
        StacksProvider: !!window.StacksProvider,
        HiroWalletProvider: !!window.HiroWalletProvider,
        LeatherProvider: !!window.LeatherProvider,
        XverseProviders: !!window.XverseProviders,
      };
      addLog(`Wallet injection check: ${JSON.stringify(walletCheck)}`);

      if (!walletCheck.StacksProvider && !walletCheck.HiroWalletProvider && !walletCheck.LeatherProvider) {
        addLog('⚠️ No wallets detected - this might be the issue!');
        setStatus('No wallets detected - please install a Stacks wallet');
        return;
      }

      // Test 4: Attempt connection
      addLog('Step 4: Calling showConnect...');
      setStatus('Wallet popup should appear...');
      
      showConnect({
        appDetails: {
          name: 'Simple Wallet Test',
          icon: window.location.origin + '/favicon.ico',
        },
        redirectTo: window.location.href,
        onFinish: (authData) => {
          addLog('✅ CONNECTION SUCCESSFUL!');
          addLog(`Auth data received: ${JSON.stringify(authData, null, 2)}`);
          setStatus('✅ Connection successful!');
        },
        onCancel: () => {
          addLog('❌ User cancelled connection');
          setStatus('❌ Connection cancelled by user');
        },
        userSession,
      });

      addLog('✅ showConnect called successfully - waiting for user action...');
      
    } catch (error: any) {
      addLog(`❌ ERROR: ${error.message}`);
      addLog(`Error stack: ${error.stack}`);
      setStatus(`❌ Error: ${error.message}`);
      console.error('Simple test error:', error);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setStatus('Ready to test');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Simple Wallet Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Status:</strong> {status}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          <Button onClick={testDirectConnection} className="flex-1">
            Test Direct Connection
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Logs
          </Button>
        </div>

        {logs.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Test Logs:</h4>
            <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
            </div>
          </div>
        )}

        <Alert className="text-xs">
          <AlertDescription>
            This test bypasses all context and components, directly testing the @stacks/connect library.
            If this doesn't work, the issue is with wallet installation or browser environment.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};