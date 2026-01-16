import { memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus, Sparkles } from 'lucide-react';
import { Hypothesis } from '@/types/project';
import HypothesisItemEnhanced from './HypothesisItemEnhanced';

interface HypothesisColumnProps {
  title: string;
  hypotheses: Hypothesis[];
  score: number;
  percentage?: number;
  locked?: boolean;
  validatedCount?: number;
  requiredCount?: number;
  onItemClick: (hypothesis: Hypothesis) => void;
  onItemRemove: (hypothesis: Hypothesis) => void;
  onAdd: () => void;
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 400,
      damping: 25,
    },
  },
};

const HypothesisColumn = memo(function HypothesisColumn({ 
  title, hypotheses, score, percentage, locked = false, validatedCount = 0, onItemClick, onItemRemove, onAdd 
}: HypothesisColumnProps) {
  // Memoize click handlers to prevent child re-renders
  const handleItemClick = useCallback((hypothesis: Hypothesis) => {
    onItemClick(hypothesis);
  }, [onItemClick]);

  const handleItemRemove = useCallback((hypothesis: Hypothesis) => {
    onItemRemove(hypothesis);
  }, [onItemRemove]);

  const columnId = `column-${title.toLowerCase().replace(/\s+/g, '-')}`;
  
  return (
    <motion.section 
      className="flex-1 min-w-0 w-full md:w-auto p-2 sm:p-4 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      aria-labelledby={`${columnId}-heading`}
      role="region"
    >
      {/* Sticky Header with Glassmorphism */}
      <motion.header 
        className="sticky top-0 z-10 glass rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 -mx-1"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-[10px] sm:text-xs font-mono uppercase tracking-wider">
            <motion.h2
              id={`${columnId}-heading`}
              className="inline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h2>
            {percentage !== undefined && (
              <motion.span 
                className="text-gradient-cyan ml-1 sm:ml-2 font-semibold"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                aria-label={`${percentage}% focus`}
              >
                ({percentage}%)
              </motion.span>
            )}
            <motion.div 
              className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 font-medium ${validatedCount > 0 ? 'text-gradient-green' : 'text-gray-600'}`}
              animate={validatedCount > 0 ? { 
                scale: [1, 1.05, 1],
                textShadow: ['0 0 0px #4ade80', '0 0 10px #4ade80', '0 0 0px #4ade80']
              } : {}}
              transition={{ duration: 0.5 }}
              role="status"
              aria-live="polite"
            >
              {validatedCount} validated
            </motion.div>
          </div>
          <motion.div 
            className="text-green-400 text-base sm:text-lg font-mono font-bold relative"
            key={score}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {/* Glow effect on score change */}
            <motion.div
              className="absolute inset-0 bg-green-400/20 rounded-full blur-md"
              initial={{ scale: 2, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={{ duration: 0.5 }}
              aria-hidden="true"
            />
            <span aria-label={`Score: ${score}`}>{score}</span>
          </motion.div>
        </div>
      </motion.header>
      
      {locked ? (
        <motion.div 
          className="flex items-center justify-center h-64 text-gray-600 text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          role="status"
          aria-label={`${title} column is locked`}
        >
          <div className="text-center">
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Lock size={32} className="mx-auto mb-3 text-gray-700" />
            </motion.div>
            <div className="mb-2 text-sm font-semibold text-gray-500">LOCKED</div>
            {title === 'requirements' && (
              <div className="text-xs text-gray-600 max-w-[200px]">
                Unlock: 3 problems + 3 solutions needed
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-1.5 sm:space-y-2 min-h-[200px] sm:min-h-[300px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence mode="popLayout">
            {hypotheses.map((hypothesis, index) => (
              <motion.div
                key={hypothesis.id}
                variants={itemVariants}
                layout
              >
                <HypothesisItemEnhanced
                  hypothesis={hypothesis}
                  onClick={() => handleItemClick(hypothesis)}
                  onRemove={() => handleItemRemove(hypothesis)}
                  index={index}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add button with micro-interactions */}
          <motion.button
            onClick={onAdd}
            className="group flex items-center gap-2 py-2 px-3 text-gray-600 hover:text-cyan-400 transition-all w-full text-left font-mono text-xs sm:text-sm rounded-lg hover:bg-gray-900/50 relative overflow-hidden min-h-[44px]"
            whileHover={{ x: 4, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Shimmer effect on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={14} />
            </motion.div>
            <span className="relative">add hypothesis</span>
            <motion.div
              className="ml-auto opacity-0 group-hover:opacity-100"
              initial={{ x: -10 }}
              whileHover={{ x: 0 }}
            >
              <Sparkles size={12} className="text-cyan-400" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}
      
      {!locked && (
        <motion.div 
          className="mt-4 pt-3 border-t border-gray-800/50 text-xs font-mono text-gray-600 flex items-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div 
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-orange-400 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ◐
            </motion.span>
            <span>hypothesis</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-1.5"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span 
              className="text-green-400 text-sm"
              animate={{ 
                boxShadow: ['0 0 0px #4ade80', '0 0 8px #4ade80', '0 0 0px #4ade80']
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ●
            </motion.span>
            <span>fact</span>
          </motion.div>
        </motion.div>
      )}
    </motion.section>
  );
});

export default HypothesisColumn;
