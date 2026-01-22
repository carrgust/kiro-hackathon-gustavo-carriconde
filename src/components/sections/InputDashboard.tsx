import { motion } from 'framer-motion';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import QualityIndicator from '@/components/QualityIndicator';
import { pageVariants } from '@/lib/animations';

interface InputDashboardProps {
  apiKey: string;
  niche: string;
  onApiKeyChange: (key: string) => void;
  onNicheChange: (niche: string) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
}

export default function InputDashboard({
  apiKey,
  niche,
  onApiKeyChange,
  onNicheChange,
  onStartProcessing,
  isProcessing,
}: InputDashboardProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  const apiKeyQuality = apiKey.length > 20 ? 100 : (apiKey.length / 20) * 100;
  const nicheQuality = niche.length > 10 ? 100 : (niche.length / 10) * 100;
  const canStart = apiKey.length > 0 && niche.length > 0;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Input Configuration</h1>
          <p className="text-blue-200">Configure your research parameters</p>
        </div>

        <GlassCard className="p-6 space-y-6">
          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">API Key</label>
              <QualityIndicator value={apiKeyQuality} />
            </div>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
              >
                {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Niche Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-white">Market Niche</label>
              <QualityIndicator value={nicheQuality} />
            </div>
            <textarea
              value={niche}
              onChange={(e) => onNicheChange(e.target.value)}
              placeholder="Describe your target market niche..."
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
            />
          </div>

          {/* Start Button */}
          <button
            onClick={onStartProcessing}
            disabled={!canStart || isProcessing}
            className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              canStart && !isProcessing
                ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg hover:shadow-xl'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            <Sparkles size={20} />
            {isProcessing ? 'Processing...' : 'Start Processing'}
          </button>
        </GlassCard>
      </div>
    </motion.div>
  );
}
