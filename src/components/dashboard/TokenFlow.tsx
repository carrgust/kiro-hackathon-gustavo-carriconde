interface TokenFlowProps {
  tokenBudget: number;
  tokensUsed: number;
  engineRunning: boolean;
  activeColumns: string[];
}

export default function TokenFlow({ tokenBudget, tokensUsed, engineRunning, activeColumns }: TokenFlowProps) {
  if (!engineRunning) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <svg className="w-full h-full">
        {/* Flow lines to active columns */}
        {activeColumns.map((column, index) => {
          const startX = 200; // Budget position
          const startY = 20;
          const endX = 200 + (index * 300); // Column positions
          const endY = 60;
          
          return (
            <g key={column}>
              {/* Flow line */}
              <path
                d={`M ${startX} ${startY} Q ${startX + 50} ${startY + 20} ${endX} ${endY}`}
                stroke="rgba(34, 197, 94, 0.6)"
                strokeWidth="1"
                fill="none"
                className="animate-pulse"
              />
              
              {/* Flowing particles */}
              <circle
                r="2"
                fill="rgb(34, 197, 94)"
                className="animate-bounce"
              >
                <animateMotion
                  dur="2s"
                  repeatCount="indefinite"
                  path={`M ${startX} ${startY} Q ${startX + 50} ${startY + 20} ${endX} ${endY}`}
                />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
