'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal } from 'lucide-react';

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

  // Auto-scroll to bottom when new rationale added
  useEffect(() => {
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

  return (
    <div className="glass-card bg-amber-900/40 p-6 h-[400px] flex flex-col border-amber-400/30 hover:border-amber-400/50 transition-all backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Terminal size={20} className="text-amber-200" />
        <h2 className="text-xl font-semibold text-white">Agent Console</h2>
        <motion.span
          className="text-amber-200 text-sm ml-auto"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {disabled ? 'Idle' : 'Active'}
        </motion.span>
      </div>

      {/* Logs Area */}
      <div 
        ref={logsContainerRef}
        className="flex-1 overflow-y-auto mb-4 bg-black/20 rounded-lg p-4 backdrop-blur-sm border border-white/10"
      >
        <AnimatePresence initial={false}>
          {rationale.map((line, i) => {
            const isSuccess = line.includes('✓');
            const isError = line.includes('✗');
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-mono flex items-start gap-2 mb-1"
              >
                <span className="text-amber-400/70 flex-shrink-0">&gt;</span>
                <span className={
                  isSuccess ? 'text-green-300' : 
                  isError ? 'text-red-300' : 
                  'text-white/90'
                }>
                  {line}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={logsEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="Send message to agent..."
          className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all backdrop-blur-sm"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-all flex items-center gap-2 shadow-lg shadow-amber-500/30"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
