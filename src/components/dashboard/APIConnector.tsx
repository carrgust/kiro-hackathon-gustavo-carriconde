import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getProvider, storeApiKey } from '@/lib/api';

interface APIConnectorProps {
  apiConnected: boolean;
  apiKey?: string;
  onConnect: (apiKey: string) => void;
}

export default function APIConnector({ apiConnected, apiKey: connectedApiKey, onConnect }: APIConnectorProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const isValidFormat = apiKey.trim().startsWith('sk-or-') && apiKey.trim().length > 20;

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    setError('');
    
    try {
      const provider = getProvider('openrouter', apiKey.trim());
      const isValid = await provider.validateKey();
      
      if (isValid) {
        storeApiKey(apiKey.trim());
        onConnect(apiKey.trim());
      } else {
        setError('Invalid API key');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDemoMode = () => {
    onConnect('demo');
  };

  if (apiConnected) {
    return (
      <Card className="w-full max-w-md bg-gray-900 border-gray-700">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 font-normal font-mono">
              {connectedApiKey === 'demo' ? 'Demo Mode' : 'API Connected'}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-2 font-mono">
            {connectedApiKey === 'demo' ? 'Mock Data' : 'OpenRouter'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-gray-900 border-gray-700">
      <CardContent className="p-6">
        <h3 className="text-lg font-normal text-white mb-4 text-center font-mono">Connect API</h3>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="OpenRouter API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 font-mono text-sm"
            onKeyPress={(e) => e.key === 'Enter' && !isValidating && handleConnect()}
            disabled={isValidating}
          />
          
          {error && (
            <div className="text-red-400 text-xs font-mono">{error}</div>
          )}
          
          <button
            onClick={handleConnect}
            disabled={!isValidFormat || isValidating}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors font-mono text-sm"
          >
            {isValidating ? 'Validating...' : 'Connect'}
          </button>

          <div className="text-center">
            <div className="text-xs text-gray-500 font-mono mb-2">or</div>
            <button
              onClick={handleDemoMode}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors font-mono text-sm border border-gray-600"
            >
              [ DEMO MODE ]
            </button>
          </div>
          
          <div className="text-xs text-gray-500 font-mono">
            Free models: deepseek-r1, gemini-2.0-flash, llama-3.3-70b
          </div>
          
          <div className="text-xs text-yellow-500 font-mono mt-2 border-t border-gray-700 pt-2">
            ⚠️ API keys are stored locally. Never share your screen while connected.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
