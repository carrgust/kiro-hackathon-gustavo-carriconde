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

    // PROBLEMS section: -90° to 30° (top slice, 120°)
    problemSources.forEach((source, i) => {
      const id = `p-${source.id}`;
      if (!existingIds.has(id)) {
        const angle = -80 + (i * 100 / Math.max(problemSources.length, 1)); // -80° to 20°
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

    // SOLUTIONS section: 30° to 150° (right slice, 120°)
    solutionSources.forEach((source, i) => {
      const id = `s-${source.id}`;
      if (!existingIds.has(id)) {
        const angle = 40 + (i * 100 / Math.max(solutionSources.length, 1)); // 40° to 140°
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

    // REQUIREMENTS section: 150° to 270° (left slice, 120°)
    requirementSources.forEach((source, i) => {
      const id = `r-${source.id}`;
      if (!existingIds.has(id)) {
        const angle = 160 + (i * 100 / Math.max(requirementSources.length, 1)); // 160° to 260°
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

  // Helper to create pie slice path
  const createSlicePath = (startAngle: number, endAngle: number) => {
    const start = startAngle * Math.PI / 180;
    const end = endAngle * Math.PI / 180;
    const x1 = center + center * Math.cos(start);
    const y1 = center + center * Math.sin(start);
    const x2 = center + center * Math.cos(end);
    const y2 = center + center * Math.sin(end);
    return `M ${center} ${center} L ${x1} ${y1} A ${center} ${center} 0 0 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Section backgrounds - subtle fills for 3 EQUAL slices */}
        <path d={createSlicePath(-90, 30)} fill="rgba(255,255,255,0.02)" />
        <path d={createSlicePath(30, 150)} fill="rgba(255,255,255,0.01)" />
        <path d={createSlicePath(150, 270)} fill="rgba(255,255,255,0.015)" />

        {/* OUTER CIRCLE ONLY - the pizza edge */}
        <circle
          cx={center}
          cy={center}
          r={center}
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />

        {/* Section divider lines - 3 EQUAL pizza slices (120° each) */}
        {/* Line 1: -90° (straight up) */}
        <line 
          x1={center} 
          y1={center} 
          x2={center + center * Math.cos(-Math.PI / 2)} 
          y2={center + center * Math.sin(-Math.PI / 2)} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1.5" 
        />
        {/* Line 2: 30° (120° clockwise from up) */}
        <line 
          x1={center} 
          y1={center} 
          x2={center + center * Math.cos(Math.PI / 6)} 
          y2={center + center * Math.sin(Math.PI / 6)} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1.5" 
        />
        {/* Line 3: 150° (240° clockwise from up) */}
        <line 
          x1={center} 
          y1={center} 
          x2={center + center * Math.cos(5 * Math.PI / 6)} 
          y2={center + center * Math.sin(5 * Math.PI / 6)} 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="1.5" 
        />

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
            x2={center + center * Math.cos(sweepAngle * Math.PI / 180)}
            y2={center + center * Math.sin(sweepAngle * Math.PI / 180)}
            stroke="url(#sweepGradient)"
            strokeWidth="2"
            filter="url(#glow)"
          />
        )}

        {/* Blips */}
        <AnimatePresence>
          {blips.map((blip) => {
            const x = center + (center * blip.currentDistance / 100) * Math.cos(blip.angle * Math.PI / 180);
            const y = center + (center * blip.currentDistance / 100) * Math.sin(blip.angle * Math.PI / 180);
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

      {/* Labels - positioned INSIDE each slice */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2">
        <span className="text-white text-[10px] font-mono opacity-70">PROBLEMS</span>
        <span className="text-white text-[10px] font-mono ml-1 opacity-50">{problemSources.length}</span>
      </div>
      <div className="absolute bottom-8 left-8">
        <span className="text-white text-[10px] font-mono opacity-70">SOLUTIONS</span>
        <span className="text-white text-[10px] font-mono ml-1 opacity-50">{solutionSources.length}</span>
      </div>
      <div className="absolute bottom-8 right-8">
        <span className="text-white text-[10px] font-mono opacity-70">REQUIREMENTS</span>
        <span className="text-white text-[10px] font-mono ml-1 opacity-50">{requirementSources.length}</span>
      </div>
    </div>
  );
}
