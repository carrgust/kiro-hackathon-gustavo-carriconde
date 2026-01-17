import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Circle } from 'lucide-react';
import { Stage, STAGE_ORDER } from '@/lib/scoring';
import { StageInfo } from '@/hooks/useScoring';

interface StageProgressBarProps {
  stages: Record<Stage, StageInfo>;
  currentStage: Stage;
}

const STAGE_LABELS: Record<Stage, string> = {
  HYPOTHESIS: 'Hypotheses',
  PROBLEM_QUALITY: 'Problems',
  SOLUTION_QUALITY: 'Solutions',
  REQUIREMENTS: 'Requirements',
  PRD: 'PRD',
  DNA: 'DNA',
};

export default function StageProgressBar({ stages, currentStage }: StageProgressBarProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  
  return (
    <div className="flex items-center gap-0.5 sm:gap-1 font-mono text-xs overflow-x-auto mobile-scroll-x pb-1">
      {STAGE_ORDER.map((stage, index) => {
        const info = stages[stage];
        const isActive = index === currentIndex;
        const isPassed = info.passed;
        const isLocked = index > currentIndex && !isPassed;
        
        return (
          <motion.div 
            key={stage} 
            className="flex items-center flex-shrink-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <motion.div
              className={`relative flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1 rounded cursor-default transition-all min-h-[32px] sm:min-h-0 ${
                isPassed ? 'bg-white/10 text-white' :
                isActive ? 'bg-white/5 text-white' :
                'bg-gray-800 text-gray-600'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              title={`${STAGE_LABELS[stage]}: ${info.score.toFixed(0)}% (need ${info.threshold}%)`}
            >
              {/* Glow effect for active/passed stages */}
              {(isPassed || isActive) && (
                <motion.div
                  className={`absolute inset-0 rounded ${
                    isPassed ? 'bg-white/10' : 'bg-white/5'
                  }`}
                  animate={{
                    boxShadow: isPassed 
                      ? ['0 0 10px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.3)', '0 0 10px rgba(255,255,255,0.2)']
                      : ['0 0 10px rgba(255,255,255,0.1)', '0 0 20px rgba(255,255,255,0.2)', '0 0 10px rgba(255,255,255,0.1)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              <motion.div
                animate={isActive ? { rotate: [0, 360] } : {}}
                transition={isActive ? { duration: 4, repeat: Infinity, ease: 'linear' } : {}}
              >
                {isPassed ? <CheckCircle2 size={12} /> : isLocked ? <Lock size={12} /> : <Circle size={12} />}
              </motion.div>
              <span className="relative hidden sm:inline text-[10px] sm:text-xs">{STAGE_LABELS[stage]}</span>
              <motion.span 
                className="relative text-[9px] sm:text-[10px]"
                key={info.score}
                initial={{ scale: 1.2, color: '#ffffff' }}
                animate={{ scale: 1, color: isPassed ? '#ffffff' : isActive ? '#ffffff' : '#6b7280' }}
                transition={{ duration: 0.3 }}
              >
                {info.score.toFixed(0)}%
              </motion.span>
            </motion.div>
            
            {/* Connector line with animation */}
            {index < STAGE_ORDER.length - 1 && (
              <div className="relative w-1 sm:w-4 h-px mx-0.5">
                <div className={`absolute inset-0 ${isPassed ? 'bg-white' : 'bg-gray-700'}`} />
                {isPassed && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
