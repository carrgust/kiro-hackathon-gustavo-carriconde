import { useState } from 'react';
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
  onDemoMode?: () => void;
}

const nicheSuggestions = [
  'fintech', 'healthcare', 'e-commerce', 'saas', 'ai/ml', 'edtech', 'proptech', 'logistics', 'cybersecurity', 'devtools'
];

export default function EnhancedHeader({
  provider, model, tokenBudget, totalTokensSpent, runningTime, niche, nicheLocked, selectedRegions, autopilotEnabled, engineRunning, sliderValue,
  onTokenBudgetChange, onNicheChange, onNicheLockToggle, onRegionsChange, onAutopilotToggle, onSliderChange, onEngineToggle, onDemoMode
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
    <div className="border-b border-gray-800 p-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        {/* Left: System info + Budget */}
        <div className="flex items-center space-x-4 text-gray-400">
          <span>{provider} | {model}</span>
          <div className="flex items-center space-x-1">
            <span>budget:</span>
            <input
              type="number"
              value={tokenBudget}
              onChange={(e) => onTokenBudgetChange(Number(e.target.value))}
              className="bg-transparent border border-gray-600 rounded px-1 w-16 text-white"
              disabled={engineRunning}
            />
          </div>
          <div className="flex items-center space-x-1">
            <span>invested:</span>
            <span className="text-red-400">{totalTokensSpent.toLocaleString()}</span>
          </div>
          <span>{runningTime}</span>
        </div>
        
        {/* Center: Niche input and Geo selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
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
                className={`bg-transparent border border-gray-600 rounded px-2 py-1 w-48 text-xs ${
                  nicheLocked ? 'text-gray-500 border-gray-700' : 'text-white hover:border-cyan-500 focus:border-cyan-400'
                }`}
              />
              {showNicheDropdown && !nicheLocked && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded text-xs z-10 w-full">
                  {filteredSuggestions.map((suggestion) => (
                    <div
                      key={suggestion}
                      onClick={() => handleNicheSelect(suggestion)}
                      className="px-2 py-1 hover:bg-gray-800 cursor-pointer text-gray-300"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onNicheLockToggle}
              disabled={engineRunning}
              className="text-gray-500 hover:text-cyan-400 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {nicheLocked ? (
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"/>
                ) : (
                  <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V9"/>
                )}
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-xs">geo:</span>
            <GeoSelector
              selectedRegions={selectedRegions}
              onRegionsChange={onRegionsChange}
            />
          </div>
        </div>
        
        {/* Right: Slider + Scores + Start */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <span>problems</span>
            <span>◄</span>
            <input
              type="range"
              min="0"
              max="100"
              value={100 - sliderValue}
              onChange={(e) => onSliderChange(100 - Number(e.target.value))}
              className="w-16 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-terminal"
            />
            <span>►</span>
            <span>solutions</span>
            <span className="text-cyan-400">({sliderValue}%/{100-sliderValue}%)</span>
          </div>
          <AutopilotToggle
            enabled={autopilotEnabled}
            onToggle={onAutopilotToggle}
            disabled={engineRunning}
          />
          {onDemoMode && (
            <button
              onClick={onDemoMode}
              className="px-2 py-1 text-xs border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-colors rounded"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              Demo
            </button>
          )}
          <button
            onClick={onEngineToggle}
            className={`px-2 py-1 transition-colors ${
              engineRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            [ {engineRunning ? 'STOP' : 'START'} ]
          </button>
        </div>
      </div>
    </div>
  );
}
