'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Play, Square, Sun, Moon } from 'lucide-react';
import GeoSelector from './GeoSelector';
import AutopilotToggle from './AutopilotToggle';
import { useTheme } from '@/components/ThemeProvider';

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
  isProcessing: boolean;
  onTokenBudgetChange: (budget: number) => void;
  onNicheChange: (niche: string) => void;
  onNicheLockToggle: () => void;
  onRegionsChange: (regions: string[]) => void;
  onAutopilotToggle: () => void;
  onSliderChange: (value: number) => void;
  onEngineToggle: () => void;
  onStopProcessing: () => void;
}

const nicheSuggestions = [
  'fintech', 'healthcare', 'e-commerce', 'saas', 'ai/ml', 'edtech', 'proptech', 'logistics', 'cybersecurity', 'devtools'
];

export default function EnhancedHeader({
  provider, model, tokenBudget, totalTokensSpent, runningTime, niche, nicheLocked, selectedRegions, autopilotEnabled, engineRunning, sliderValue, isProcessing,
  onTokenBudgetChange, onNicheChange, onNicheLockToggle, onRegionsChange, onAutopilotToggle, onSliderChange, onEngineToggle, onStopProcessing
}: EnhancedHeaderProps) {
  const [showNicheDropdown, setShowNicheDropdown] = useState(false);
  const [nicheInput, setNicheInput] = useState(niche);
  const { theme, toggleTheme } = useTheme();

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
      className="metal-header-dark p-3 md:p-4 font-mono sticky top-0 z-20"
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {/* Logo */}
        <motion.div 
          className="text-base md:text-lg font-bold tracking-tight pr-3 md:pr-6 border-r border-gray-700"
          style={{ color: 'var(--text-primary-color)' }}
          whileHover={{ scale: 1.05 }}
        >
          CURATOS DNA
        </motion.div>
        
        {/* System Info - Hide on mobile */}
        <div className="header-section header-hide-mobile">
          <span className="header-label">SYSTEM</span>
          <span className="text-[10px] md:text-[11px] text-gray-500">{provider} • {model}</span>
        </div>
        
        {/* Budget Section */}
        <div className="header-section">
          <div className="flex items-center gap-2 md:gap-3 px-2 py-1 rounded metal-input">
            <div className="flex items-center gap-1">
              <span className="header-label text-[9px] md:text-[10px]">BUDGET</span>
              <input
                type="number"
                value={tokenBudget}
                onChange={(e) => onTokenBudgetChange(Number(e.target.value))}
                className="bg-transparent border-none outline-none w-12 md:w-16 text-white text-[10px] md:text-xs"
                disabled={engineRunning}
              />
            </div>
            <div className="w-px h-3 md:h-4 bg-gray-700"></div>
            <div className="flex items-center gap-1">
              <span className="header-label text-[9px] md:text-[10px]">SPENT</span>
              <motion.span 
                className="font-semibold text-[10px] md:text-xs"
                style={{ color: totalTokensSpent > tokenBudget * 0.8 ? 'var(--status-error)' : 'var(--text-secondary-color)' }}
                key={totalTokensSpent}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
              >
                {totalTokensSpent.toLocaleString()}
              </motion.span>
            </div>
            <div className="w-px h-3 md:h-4 bg-gray-700 header-hide-mobile"></div>
            <div className="flex items-center gap-1 header-hide-mobile">
              <span className="header-label text-[9px] md:text-[10px]">TIME</span>
              <motion.span 
                className="text-white text-[10px] md:text-xs"
                animate={engineRunning ? { opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {runningTime}
              </motion.span>
            </div>
          </div>
        </div>
        
        {/* Niche Section */}
        <div className="header-section">
          <span className="header-label hidden md:inline">NICHE</span>
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
              placeholder="niche"
              disabled={nicheLocked || engineRunning}
              className={`metal-input px-2 md:px-3 py-1 w-28 md:w-40 text-[10px] md:text-xs transition-all ${
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
                    className="px-3 py-2 hover:bg-white/5 cursor-pointer text-gray-300 hover:text-white transition-colors relative z-10"
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
            className="text-gray-500 hover:text-white transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {nicheLocked ? <Lock size={12} className="md:w-[14px] md:h-[14px]" /> : <Unlock size={12} className="md:w-[14px] md:h-[14px]" />}
          </motion.button>
        </div>
        
        {/* Geo Section - Hide on mobile */}
        <div className="header-section header-hide-mobile">
          <span className="header-label">GEO</span>
          <GeoSelector
            selectedRegions={selectedRegions}
            onRegionsChange={onRegionsChange}
          />
        </div>
        
        {/* Focus Balance - Hide on tablet and mobile */}
        <div className="header-section header-hide-tablet">
          <span className="header-label">FOCUS</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Problems {sliderValue}%</span>
            <span className="text-gray-700">|</span>
            <span className="text-[10px] text-gray-500">Solutions {100-sliderValue}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={100 - sliderValue}
            onChange={(e) => onSliderChange(100 - Number(e.target.value))}
            className="w-20 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-terminal"
          />
        </div>
        
        {/* Actions */}
        <div className="header-section ml-auto border-l-0">
          {/* Stop Processing Button */}
          {isProcessing && (
            <motion.button
              onClick={onStopProcessing}
              className="relative p-2 rounded-md transition-colors hover:bg-red-900/20 border border-red-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Stop all processing"
              animate={{
                boxShadow: [
                  '0 0 5px rgba(239, 68, 68, 0.5)',
                  '0 0 20px rgba(239, 68, 68, 0.8)',
                  '0 0 5px rgba(239, 68, 68, 0.5)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Square size={16} className="text-red-500" />
            </motion.button>
          )}
          
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors hover:bg-gray-800"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun size={16} style={{ color: 'var(--status-warning)' }} />
            ) : (
              <Moon size={16} style={{ color: 'var(--accent-primary)' }} />
            )}
          </motion.button>
          
          <AutopilotToggle
            enabled={autopilotEnabled}
            onToggle={onAutopilotToggle}
            disabled={engineRunning}
          />
          
          <motion.button
            onClick={onEngineToggle}
            className={`metal-btn-primary flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 font-semibold text-[10px] md:text-xs ${
              engineRunning ? 'text-white' : ''
            }`}
            style={engineRunning ? { 
              backgroundColor: 'var(--status-error)', 
              borderColor: 'var(--status-error)' 
            } : {}}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {engineRunning ? <Square size={12} className="md:w-[14px] md:h-[14px]" /> : <Play size={12} className="md:w-[14px] md:h-[14px]" />}
            <span>{engineRunning ? 'STOP' : 'START'}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
