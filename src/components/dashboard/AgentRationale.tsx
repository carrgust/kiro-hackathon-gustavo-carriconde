import { useEffect, useRef } from 'react';

interface AgentRationaleProps {
  rationale: string[];
  isActive: boolean;
  autopilotEnabled?: boolean;
}

const TAG_COLORS: Record<string, string> = {
  'THINKING': 'var(--accent-primary)',
  'HYPOTHESIS': 'var(--status-warning)',
  'SEARCHING': 'var(--text-primary-color)',
  'FOUND': 'var(--text-primary-color)',
  'VALIDATING': 'var(--status-warning)',
  'VALIDATED': 'var(--status-success)',
  'ERROR': 'var(--status-error)',
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
            <span className="ml-2 px-1 text-xs" style={{ color: 'var(--status-success)' }}>[AP]</span>
          )}
          {isActive && (
            <span className="ml-2 metal-status active"></span>
          )}
        </div>
        
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto font-mono text-xs space-y-0.5 metal-scrollbar"
          style={{ color: 'var(--text-secondary-color)' }}
        >
          {rationale.length === 0 ? (
            <div className="text-xs" style={{ color: 'var(--text-muted-color)' }}>Waiting for engine to start...</div>
          ) : (
            rationale.map((line, index) => {
              const { tag, text, color } = parseTaggedLine(line);
              return (
                <div key={index} className="leading-tight">
                  <span style={{ color: 'var(--text-muted-color)' }}>&gt;</span>
                  {autopilotEnabled && <span className="ml-1" style={{ color: 'var(--status-success)' }}>[AP]</span>}
                  {tag ? (
                    <>
                      <span className="ml-1 font-bold" style={{ color }}>[{tag}]</span>
                      <span className="ml-1" style={{ color: 'var(--text-secondary-color)' }}>{text}</span>
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
