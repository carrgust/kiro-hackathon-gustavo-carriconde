import { useState } from 'react';
import { ChatMessage } from '@/types/project';

interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInterface({ chatHistory, onSendMessage, disabled }: ChatInterfaceProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="border-b border-gray-800 bg-gray-950">
      <div className="p-3">
        <div className="text-gray-500 text-xs font-mono mb-2">chat with agent</div>
        
        {/* Chat history */}
        <div className="h-8 overflow-y-auto font-mono text-xs mb-2 space-y-1">
          {chatHistory.slice(-3).map((msg, index) => (
            <div key={index} className="leading-relaxed">
              <span className={msg.role === 'user' ? 'text-cyan-400' : 'text-green-400'}>
                {msg.role}:
              </span>
              <span className="text-gray-300 ml-2">{msg.message}</span>
            </div>
          ))}
        </div>
        
        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <span className="text-gray-500 font-mono text-xs">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="steer the agent..."
            disabled={disabled}
            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs placeholder-gray-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="text-gray-500 hover:text-cyan-400 transition-colors font-mono text-xs disabled:opacity-50"
          >
            send
          </button>
        </form>
      </div>
    </div>
  );
}
