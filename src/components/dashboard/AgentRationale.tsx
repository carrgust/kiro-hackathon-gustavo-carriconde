import { useEffect, useRef } from 'react';

interface AgentRationaleProps {
  rationale: string[];
  isActive: boolean;
  autopilotEnabled?: boolean;
}

export default function AgentRationale({ 
  rationale, 
  isActive, 
  autopilotEnabled = false
}: AgentRationaleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rationale]);

  return (
    <div className="border-b border-gray-800 bg-gray-950 relative">
      <div className="p-3">
        <div className="text-gray-500 text-xs font-mono mb-2 flex items-center">
          <span>agent rationale</span>
          {autopilotEnabled && (
            <span className="ml-2 px-1 text-green-500 text-xs">[AP]</span>
          )}
          {isActive && (
            <span className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          )}
        </div>
        
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto font-mono text-xs text-gray-300 space-y-0.5"
        >
          {rationale.length === 0 ? (
            <div className="text-gray-600">Waiting for engine to start...</div>
          ) : (
            rationale.map((line, index) => (
              <div key={index} className="leading-tight">
                <span className="text-gray-600">&gt;</span>
                {autopilotEnabled && <span className="text-green-500 ml-1">[AP]</span>}
                <span className="ml-1">{line}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
