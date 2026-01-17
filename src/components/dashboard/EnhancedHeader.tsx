import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Play, Square } from 'lucide-react';
import GeoSelector from './GeoSelector';
import AutopilotToggle from './AutopilotToggle';

interface EnhancedHeaderProps {
  provider: string;
  model: string;
  tokenBudget: number;
  totalTokensSpent: number;
  runningTime: string;
  niche: string;
  nicheLocked: boolean;
  selectedRegions: string[];
  autopilotEnabled: boolean;
  engineRunning: boolean;
  sliderValue: number;
  onTokenBudgetChange: (budget: number) => void;
  onNicheChange: (niche: string) => void;
  onNicheLockToggle: () => void;
  onRegionsChange: (regions: string[]) => void;
  onAutopilotToggle: () => void;
  onSliderChange: (value: number) => void;
  onEngineToggle: () => void;
}

const nicheSuggestions = [
  'fintech', 'healthcare', 'e-commerce', 'saas', 'ai/ml', 'edtech', 'proptech', 'logistics', 'cybersecurity', 'devtools'
];

export default function EnhancedHeader({
  provider, model, tokenBudget, totalTokensSpent, runningTime, niche, nicheLocked, selectedRegions, autopilotEnabled, engineRunning, sliderValue,
  onTokenBudgetChange, onNicheChange, onNicheLockToggle, onRegionsChange, onAutopilotToggle, onSliderChange, onEngineToggle
}: EnhancedHeaderProps) {
  const [showNicheDropdown, setShowNicheDropdown] = useState(false);
  const [nicheInput, setNicheInput] = useState(niche);

  const filteredSuggestions = nicheSuggestions.filter(s => 
    s.toLowerCase().includes(nicheInput.toLowerCase())
  );

  const handleNicheSelect = (suggestion: string) => {
    setNicheInput(suggestion);
    onNicheChange(suggestion);
    setShowNicheDropdown(false);
  };

  const handleNicheSubmit = () => {
    onNicheChange(nicheInput);
    setShowNicheDropdown(false);
  };

  return (
    <motion.div 
      className="metal-header-dark p-4 font-mono text-xs sticky top-0 z-20"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between gap-6">
        {/* Left: Branding + System Info */}
        <div className="flex items-center gap-6">
          <motion.div 
            className="text-lg font-bold tracking-tight"
            style={{ color: 'var(--metal-accent)' }}
            whileHover={{ scale: 1.05 }}
          >
            CURATOS DNA
          </motion.div>
          
          <div className="flex items-center gap-4 text-gray-400 text-xs">
            <span className="text-gray-500">{provider}</span>
            <span className="text-gray-600">|</span>
            <span className="text-cyan-400/70">{model}</span>
            <span className="text-gray-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">budget:</span>
              <input
                type="number"
                value={tokenBudget}
                onChange={(e) => onTokenBudgetChange(Number(e.target.value))}
                className="metal-input px-2 py-0.5 w-20 text-white"
                disabled={engineRunning}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">spent:</span>
              <motion.span 
                className="text-red-400 font-semibold"
                key={totalTokensSpent}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {totalTokensSpent.toLocaleString()}
              </motion.span>
            </div>
            <motion.span 
              className="text-cyan-400 font-mono"
              animate={engineRunning ? { opacity: [1, 0.5, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {runningTime}
            </motion.span>
          </div>
        </div>
        
        {/* Center: Niche + Geo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">niche:</span>
            <div className="relative">
              <input
                type="text"
                value={nicheInput}
                onChange={(e) => {
                  setNicheInput(e.target.value);
                  onNicheChange(e.target.value);
                }}
                onClick={() => !nicheLocked && setShowNicheDropdown(true)}
                onFocus={() => !nicheLocked && setShowNicheDropdown(true)}
                onBlur={() => setTimeout(() => setShowNicheDropdown(false), 200)}
                onKeyPress={(e) => e.key === 'Enter' && handleNicheSubmit()}
                placeholder="select your niche"
                disabled={nicheLocked || engineRunning}
                className={`metal-input px-3 py-1.5 w-52 text-xs transition-all ${
                  nicheLocked 
                    ? 'text-gray-500 opacity-50' 
                    : 'text-white'
                }`}
              />
              {showNicheDropdown && !nicheLocked && filteredSuggestions.length > 0 && (
                <motion.div 
                  className="absolute top-full left-0 mt-2 metal-container-dark rounded-lg text-xs z-30 w-full overflow-hidden"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {filteredSuggestions.map((suggestion, i) => (
                    <motion.div
                      key={suggestion}
                      onClick={() => handleNicheSelect(suggestion)}
                      className="px-3 py-2 hover:bg-cyan-500/10 cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors relative z-10"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4 }}
                    >
                      {suggestion}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
            <motion.button
              onClick={onNicheLockToggle}
              disabled={engineRunning}
              className="text-gray-500 hover:text-cyan-400 transition-colors p-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {nicheLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </motion.button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">geo:</span>
            <GeoSelector
              selectedRegions={selectedRegions}
              onRegionsChange={onRegionsChange}
            />
          </div>
        </div>
        
        {/* Right: Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <span>problems</span>
            <span className="text-gray-700">◄</span>
            <input
              type="range"
              min="0"
              max="100"
              value={100 - sliderValue}
              onChange={(e) => onSliderChange(100 - Number(e.target.value))}
              className="w-20 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-terminal"
            />
            <span className="text-gray-700">►</span>
            <span>solutions</span>
            <span className="text-cyan-400 font-semibold ml-1">
              {sliderValue}%/{100-sliderValue}%
            </span>
          </div>
          
          <AutopilotToggle
            enabled={autopilotEnabled}
            onToggle={onAutopilotToggle}
            disabled={engineRunning}
          />
          
          <motion.button
            onClick={onEngineToggle}
            className={`metal-btn-primary flex items-center gap-2 px-4 py-1.5 font-semibold ${
              engineRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : ''
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {engineRunning ? <Square size={14} /> : <Play size={14} />}
            <span>{engineRunning ? 'STOP' : 'START'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
