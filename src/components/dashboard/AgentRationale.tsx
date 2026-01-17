import { useEffect, useRef } from 'react';

interface AgentRationaleProps {
  rationale: string[];
  isActive: boolean;
  autopilotEnabled?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  'THINKING': 'text-purple-500',
  'HYPOTHESIS': 'text-yellow-500',
  'SEARCHING': 'text-white',
  'FOUND': 'text-white',
  'VALIDATING': 'text-orange-500',
  'VALIDATED': 'text-green-500',
  'ERROR': 'text-red-500',
};

function parseTaggedLine(line: string) {
  const match = line.match(/^\[([A-Z]+)\]\s*(.*)/);
  if (match && TAG_COLORS[match[1]]) {
    return { tag: match[1], text: match[2], color: TAG_COLORS[match[1]] };
  }
  return { tag: null, text: line, color: 'text-gray-300' };
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
    <div className="metal-panel border-b relative">
      <div className="p-3 relative z-10">
        <div className="metal-label text-xs font-mono mb-2 flex items-center">
          <span>agent rationale</span>
          {autopilotEnabled && (
            <span className="ml-2 px-1 text-green-500 text-xs">[AP]</span>
          )}
          {isActive && (
            <span className="ml-2 metal-status active"></span>
          )}
        </div>
        
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto font-mono text-xs text-gray-300 space-y-0.5 metal-scrollbar"
        >
          {rationale.length === 0 ? (
            <div className="text-gray-600">Waiting for engine to start...</div>
          ) : (
            rationale.map((line, index) => {
              const { tag, text, color } = parseTaggedLine(line);
              return (
                <div key={index} className="leading-tight">
                  <span className="text-gray-600">&gt;</span>
                  {autopilotEnabled && <span className="text-green-500 ml-1">[AP]</span>}
                  {tag ? (
                    <>
                      <span className={`ml-1 font-bold ${color}`}>[{tag}]</span>
                      <span className="ml-1 text-gray-300">{text}</span>
                    </>
                  ) : (
                    <span className="ml-1">{text}</span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
