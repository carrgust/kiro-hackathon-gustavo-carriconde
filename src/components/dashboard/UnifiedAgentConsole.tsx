'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';

interface UnifiedAgentConsoleProps {
  rationale: string[];
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function UnifiedAgentConsole({ rationale, onSendMessage, disabled }: UnifiedAgentConsoleProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevRationaleLength = useRef(0);

  // Auto-scroll to bottom when new rationale added (not on stream updates)
  useEffect(() => {
    // Only scroll if a new complete message was added (length changed)
    if (rationale.length !== prevRationaleLength.current) {
      if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
      }
      prevRationaleLength.current = rationale.length;
    }
  }, [rationale]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasInput = input.trim().length > 0;
  const isActive = isFocused || hasInput;

  return (
    <div className="metal-container-dark rounded-lg overflow-hidden flex flex-col h-full" style={{ boxShadow: '0 0 20px rgba(255,255,255,0.05)' }}>
      {/* Header */}
      <div className="metal-header-dark px-4 py-2 flex items-center gap-2 flex-shrink-0">
        <span className="text-white text-xs font-semibold tracking-wider">AGENT CONSOLE</span>
        <motion.span
          className="text-white text-xs"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          _
        </motion.span>
      </div>

      {/* Logs Area */}
      <div 
        ref={logsContainerRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 relative min-h-0" 
        style={{ background: 'linear-gradient(180deg, rgba(26,26,26,0.5) 0%, rgba(26,26,26,0) 10%, rgba(26,26,26,0) 100%)' }}
      >
        <AnimatePresence initial={false}>
          {rationale.map((line, i) => {
            const isSuccess = line.includes('✓');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-mono flex items-start gap-2"
              >
                <span className="text-gray-600 flex-shrink-0">&gt;</span>
                <motion.span
                  className={isSuccess ? 'text-white' : 'text-gray-400'}
                  animate={isSuccess ? { color: ['#ffffff', '#22c55e', '#ffffff'] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {line}
                </motion.span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={logsEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0 relative">
        {/* Scan-line effect when active */}
        {isActive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
            }}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}

        <div className="flex items-center gap-2 relative">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={disabled}
              placeholder="> steer the agent..."
              className="w-full bg-transparent text-white text-sm font-mono px-2 py-2 outline-none transition-all duration-300 border-b"
              style={{
                borderColor: isActive ? '#ffffff' : '#3a3a3a',
                boxShadow: isActive ? '0 2px 8px rgba(255,255,255,0.1)' : 'none',
              }}
            />
          </div>

          {/* Send Button */}
          <motion.button
            onClick={handleSend}
            disabled={disabled || !hasInput}
            className="p-2 rounded transition-all duration-300 disabled:opacity-30"
            style={{
              background: hasInput ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: '1px solid',
              borderColor: hasInput ? '#ffffff' : '#3a3a3a',
            }}
            animate={hasInput ? {
              boxShadow: [
                '0 0 5px rgba(255,255,255,0.2)',
                '0 0 15px rgba(255,255,255,0.4)',
                '0 0 5px rgba(255,255,255,0.2)',
              ],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Send className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
