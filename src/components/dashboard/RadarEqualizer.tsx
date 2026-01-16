import { useEffect, useState, useRef } from 'react';

interface RadarEqualizerProps {
  problems: number;
  solutions: number;
  requirements: number;
  isActive: boolean;
}

export default function RadarEqualizer({ problems, solutions, requirements, isActive }: RadarEqualizerProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [pulseStates, setPulseStates] = useState<boolean[]>([]);
  const prevCounts = useRef({ problems: 0, solutions: 0, requirements: 0 });
  const [hasActivity, setHasActivity] = useState(false);

  // Detect activity when counts change or isActive
  const totalCount = problems + solutions + requirements;
  const shouldAnimate = isActive || totalCount > 0;

  // Detect new activity (count changes)
  useEffect(() => {
    const prev = prevCounts.current;
    if (problems !== prev.problems || solutions !== prev.solutions || requirements !== prev.requirements) {
      setHasActivity(true);
      prevCounts.current = { problems, solutions, requirements };
      // Keep activity indicator on for 3 seconds after last change
      const timer = setTimeout(() => setHasActivity(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [problems, solutions, requirements]);

  // Animation effects - run when there's any data or activity
  useEffect(() => {
    if (!shouldAnimate) return;

    const sweepInterval = setInterval(() => {
      setSweepAngle(prev => (prev + 3) % 360);
    }, 30);

    const pulseInterval = setInterval(() => {
      setPulseStates(prev => prev.map(() => Math.random() > 0.6));
    }, 150);

    return () => {
      clearInterval(sweepInterval);
      clearInterval(pulseInterval);
    };
  }, [shouldAnimate]);

  // Initialize pulse states
  useEffect(() => {
    setPulseStates(new Array(108).fill(false));
  }, []);

  const renderSection = (
    startAngle: number,
    endAngle: number,
    count: number,
    colorClass: string,
    sectionIndex: number
  ) => {
    if (count === 0) return [];
    
    const tiles = [];
    const maxRings = 6;
    const tilesPerRing = 6;
    const activeRings = Math.min(Math.ceil(count / 4), maxRings);
    const sectionSpan = endAngle - startAngle;

    for (let ring = 0; ring < activeRings; ring++) {
      const radius = 25 + ring * 12;
      
      for (let tile = 0; tile < tilesPerRing; tile++) {
        const padding = sectionSpan * 0.1;
        const usableSpan = sectionSpan - 2 * padding;
        const angle = startAngle + padding + (tile / (tilesPerRing - 1)) * usableSpan;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        
        const tileIndex = sectionIndex * 36 + ring * 6 + tile;
        const isPulsing = shouldAnimate && pulseStates[tileIndex];
        const opacity = isPulsing ? 1 : 0.6;
        
        tiles.push(
          <rect
            key={`${ring}-${tile}`}
            x={x - 2}
            y={y - 2}
            width="4"
            height="4"
            rx="0.5"
            className={`${colorClass} transition-opacity duration-200`}
            style={{ opacity }}
          />
        );
      }
    }
    return tiles;
  };

  // Always render sweep line when there's data
  const renderSweepLine = () => {
    if (!shouldAnimate) return null;
    
    const x = Math.cos(sweepAngle * Math.PI / 180) * 105;
    const y = Math.sin(sweepAngle * Math.PI / 180) * 105;
    
    // Brighter color when actively processing
    const baseColor = hasActivity || isActive ? '0, 255, 150' : '0, 200, 150';
    const glowIntensity = hasActivity || isActive ? '12px' : '6px';
    
    return (
      <g>
        {/* Trailing fade effect - render first so main line is on top */}
        {[5, 4, 3, 2, 1].map(i => {
          const trailAngle = (sweepAngle - i * 10 + 360) % 360;
          const tx = Math.cos(trailAngle * Math.PI / 180) * 105;
          const ty = Math.sin(trailAngle * Math.PI / 180) * 105;
          return (
            <line
              key={`trail-${i}`}
              x1="0"
              y1="0"
              x2={tx}
              y2={ty}
              stroke={`rgba(${baseColor}, ${0.4 - i * 0.07})`}
              strokeWidth={2 - i * 0.2}
            />
          );
        })}
        {/* Main sweep line with glow */}
        <line
          x1="0"
          y1="0"
          x2={x}
          y2={y}
          stroke={`rgba(${baseColor}, 0.95)`}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ 
            filter: `drop-shadow(0 0 ${glowIntensity} rgba(${baseColor}, 0.9))`,
          }}
        />
        {/* Bright tip */}
        <circle
          cx={x}
          cy={y}
          r="3"
          fill={`rgba(${baseColor}, 1)`}
          style={{ filter: `drop-shadow(0 0 8px rgba(${baseColor}, 1))` }}
        />
      </g>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900/20 rounded-lg border border-gray-800">
      <svg width="100%" height="100%" viewBox="-120 -120 240 240" className="overflow-visible">
        {/* Section dividers */}
        <g stroke="rgba(75, 85, 99, 0.3)" strokeWidth="1">
          <line x1="0" y1="0" x2="0" y2="-100" />
          <line x1="0" y1="0" x2="87" y2="50" />
          <line x1="0" y1="0" x2="-87" y2="50" />
        </g>
        
        {/* Concentric rings */}
        <g stroke="rgba(75, 85, 99, 0.4)" strokeWidth="1" fill="none">
          {[30, 45, 60, 75, 90, 105].map(r => (
            <circle key={r} cx="0" cy="0" r={r} />
          ))}
        </g>
        
        {/* Problems section (top, 210-330°) */}
        <g>
          {renderSection(210, 330, problems, "fill-blue-400", 0)}
        </g>
        
        {/* Solutions section (bottom-left, 330-90°) */}
        <g>
          {renderSection(330, 450, solutions, "fill-cyan-400", 1)}
        </g>
        
        {/* Requirements section (bottom-right, 90-210°) */}
        <g>
          {renderSection(90, 210, requirements, "fill-purple-400", 2)}
        </g>
        
        {/* Sweep line */}
        {renderSweepLine()}
        
        {/* Center dot */}
        <circle 
          cx="0" 
          cy="0" 
          r="4" 
          fill={shouldAnimate ? "rgba(0, 255, 150, 0.8)" : "rgba(255, 255, 255, 0.5)"} 
          style={shouldAnimate ? { filter: 'drop-shadow(0 0 6px rgba(0, 255, 150, 0.8))' } : {}}
        />
        
        {/* Section labels */}
        <text x="0" y="-115" textAnchor="middle" className="fill-blue-400 text-xs font-mono">
          PROBLEMS
        </text>
        <text x="-75" y="70" textAnchor="middle" className="fill-cyan-400 text-xs font-mono">
          SOLUTIONS
        </text>
        <text x="75" y="70" textAnchor="middle" className="fill-purple-400 text-xs font-mono">
          REQUIREMENTS
        </text>
      </svg>
    </div>
  );
}
