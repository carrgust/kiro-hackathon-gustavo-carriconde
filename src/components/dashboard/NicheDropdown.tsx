import { useState } from 'react';

interface NicheDropdownProps {
  niche: string;
  locked: boolean;
  onNicheChange: (niche: string) => void;
  onLockToggle: () => void;
  disabled?: boolean;
}

const nicheSuggestions = [
  'fintech',
  'healthcare',
  'e-commerce',
  'saas',
  'ai/ml',
  'edtech',
  'proptech',
  'logistics',
  'cybersecurity',
  'devtools'
];

export default function NicheDropdown({ niche, locked, onNicheChange, onLockToggle, disabled }: NicheDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(niche);

  const filteredSuggestions = nicheSuggestions.filter(s => 
    s.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onNicheChange(value);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onNicheChange(suggestion);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };

  return (
    <div className="py-4 text-center">
      <div className="inline-flex items-center space-x-2">
        <span className="text-gray-500 font-mono text-sm">&gt;</span>
        
        <div className="relative">
          <form onSubmit={handleSubmit} className="inline-block">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => !locked && setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              placeholder="enter niche"
              disabled={disabled || locked}
              className={`bg-transparent border-none outline-none font-mono text-sm w-40 ${
                locked ? 'text-gray-500 bg-gray-900' : 'text-white'
              }`}
            />
          </form>
          
          {isOpen && !locked && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 bg-gray-900 border border-gray-700 rounded text-xs font-mono z-10">
              {filteredSuggestions.map((suggestion) => (
                <div
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 hover:bg-gray-800 cursor-pointer text-gray-300"
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button
          onClick={onLockToggle}
          disabled={disabled}
          className="text-gray-500 hover:text-cyan-400 transition-colors font-mono text-sm"
        >
          {locked ? '🔒' : '🔓'}
        </button>
      </div>
    </div>
  );
}
