'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Source {
  id: string;
  url: string;
  confidence?: number;
  isValidated?: boolean;
}

interface RadarEqualizerProps {
  problemSources: Source[];
  solutionSources: Source[];
  requirementSources: Source[];
  isActive: boolean;
}

interface Blip {
  id: string;
  angle: number;
  targetDistance: number;
  currentDistance: number;
  section: 'problems' | 'solutions' | 'requirements';
  createdAt: number;
  isValidated: boolean;
}

export default function RadarEqualizer({ 
  problemSources, 
  solutionSources, 
  requirementSources, 
  isActive 
}: RadarEqualizerProps) {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [blips, setBlips] = useState<Blip[]>([]);
  const blipsRef = useRef<Blip[]>([]);

  // Convert sources to blips with initial center position
  useEffect(() => {
    const existingIds = new Set(blipsRef.current.map(b => b.id));
    const newBlips: Blip[] = [];

    // PROBLEMS section: 0° to 120° (top)
    problemSources.forEach((source, i) => {
      const id = `p-${source.id}`;
      if (!existingIds.has(id)) {
        const angle = 10 + (i * 100 / Math.max(problemSources.length, 1));
        const targetDistance = 30 + Math.random() * 60; // 30-90%
        newBlips.push({ 
          id, 
          angle, 
          targetDistance, 
          currentDistance: 10, // Start at center
          section: 'problems',
          createdAt: Date.now(),
          isValidated: source.isValidated || false
        });
      }
    });

    // SOLUTIONS section: 120° to 240° (bottom-left)
    solutionSources.forEach((source, i) => {
      const id = `s-${source.id}`;
      if (!existingIds.has(id)) {
        const angle = 130 + (i * 100 / Math.max(solutionSources.length, 1));
        const targetDistance = 30 + Math.random() * 60;
        newBlips.push({ 
          id, 
          angle, 
          targetDistance, 
          currentDistance: 10,
          section: 'solutions',
          createdAt: Date.now(),
          isValidated: source.isValidated || false
        });
      }
    });

    // REQUIREMENTS section: 240° to 360° (bottom-right)
    requirementSources.forEach((source, i) => {
      const id = `r-${source.id}`;
      if (!existingIds.has(id)) {
        const angle = 250 + (i * 100 / Math.max(requirementSources.length, 1));
        const targetDistance = 30 + Math.random() * 60;
        newBlips.push({ 
          id, 
          angle, 
          targetDistance, 
          currentDistance: 10,
          section: 'requirements',
          createdAt: Date.now(),
          isValidated: source.isValidated || false
        });
      }
    });

    if (newBlips.length > 0) {
      blipsRef.current = [...blipsRef.current, ...newBlips];
      setBlips(blipsRef.current);
    }
  }, [problemSources, solutionSources, requirementSources]);

  // Radar sweep animation and blip expansion
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setSweepAngle(prev => (prev + 0.5) % 360);
      
      // Expand blips that haven't reached target
      setBlips(prevBlips => {
        const updated = prevBlips.map(blip => {
          if (blip.currentDistance < blip.targetDistance) {
            return {
              ...blip,
              currentDistance: Math.min(
                blip.currentDistance + 2, // Expand by 2% per sweep tick
                blip.targetDistance
              )
            };
          }
          return blip;
        });
        blipsRef.current = updated;
        return updated;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isActive]);

  const size = 240;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Concentric circles */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={center * scale}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* Section divider lines */}
        <line x1={center} y1={center} x2={center} y2={0} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,4" />
        <line x1={center} y1={center} x2={center + center * Math.cos(Math.PI * 2/3)} y2={center + center * Math.sin(Math.PI * 2/3)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,4" />
        <line x1={center} y1={center} x2={center + center * Math.cos(Math.PI * 4/3)} y2={center + center * Math.sin(Math.PI * 4/3)} stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,4" />

        {/* Radar sweep line with glow */}
        <defs>
          <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="80%" stopColor="rgba(255,255,255,0.3)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.8)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {isActive && (
          <line
            x1={center}
            y1={center}
            x2={center + center * Math.cos((sweepAngle - 90) * Math.PI / 180)}
            y2={center + center * Math.sin((sweepAngle - 90) * Math.PI / 180)}
            stroke="url(#sweepGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
        )}

        {/* Blips */}
        <AnimatePresence>
          {blips.map((blip) => {
            const x = center + (center * blip.currentDistance / 100) * Math.cos((blip.angle - 90) * Math.PI / 180);
            const y = center + (center * blip.currentDistance / 100) * Math.sin((blip.angle - 90) * Math.PI / 180);
            const progress = blip.currentDistance / blip.targetDistance;
            const opacity = 0.4 + (progress * 0.6); // Fade in as it expands
            const radius = 1.5 + (progress * 0.5); // Grow from 1.5 to 2px
            const color = blip.isValidated ? '#22c55e' : '#fbbf24'; // Green if validated, yellow if pending
            
            return (
              <motion.g
                key={blip.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={color}
                  opacity={opacity}
                  filter="url(#glow)"
                  animate={{
                    opacity: [opacity * 0.8, opacity, opacity * 0.8],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* Labels */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6">
        <span className="text-white text-[9px] font-mono opacity-60">PROBLEMS</span>
        <span className="text-white text-[9px] font-mono ml-1 opacity-40">{problemSources.length}</span>
      </div>
      <div className="absolute bottom-0 left-0 -translate-x-2 translate-y-6">
        <span className="text-white text-[9px] font-mono opacity-60">SOLUTIONS</span>
        <span className="text-white text-[9px] font-mono ml-1 opacity-40">{solutionSources.length}</span>
      </div>
      <div className="absolute bottom-0 right-0 translate-x-2 translate-y-6">
        <span className="text-white text-[9px] font-mono opacity-60">REQUIREMENTS</span>
        <span className="text-white text-[9px] font-mono ml-1 opacity-40">{requirementSources.length}</span>
      </div>
    </div>
  );
}
