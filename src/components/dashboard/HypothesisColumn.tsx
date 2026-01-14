import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Plus } from 'lucide-react';
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

export default function HypothesisColumn({ 
  title, hypotheses, score, percentage, locked = false, validatedCount = 0, requiredCount = 3, onItemClick, onItemRemove, onAdd 
}: HypothesisColumnProps) {
  const isUnlocked = validatedCount >= requiredCount;
  
  return (
    <motion.div 
      className="flex-1 p-4 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-10 glass rounded-lg p-3 mb-4 -mx-1">
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-xs font-mono uppercase tracking-wider">
            {title}
            {percentage !== undefined && (
              <span className="text-gradient-cyan ml-2 font-semibold">({percentage}%)</span>
            )}
            <motion.div 
              className={`text-xs mt-1 font-medium ${isUnlocked ? 'text-gradient-green' : 'text-gray-600'}`}
              animate={isUnlocked ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {title === 'requirements' && !locked ? 
                `${validatedCount} validated` : 
                `${validatedCount}/${requiredCount} validated`
              }
            </motion.div>
          </div>
          <motion.div 
            className="text-green-400 text-lg font-mono font-bold"
            key={score}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {score}
          </motion.div>
        </div>
      </div>
      
      {locked ? (
        <motion.div 
          className="flex items-center justify-center h-64 text-gray-600 text-xs font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
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
        <div className="space-y-2 min-h-[300px]">
          <AnimatePresence mode="popLayout">
            {hypotheses.map((hypothesis, index) => (
              <HypothesisItemEnhanced
                key={hypothesis.id}
                hypothesis={hypothesis}
                onClick={() => onItemClick(hypothesis)}
                onRemove={() => onItemRemove(hypothesis)}
                index={index}
              />
            ))}
          </AnimatePresence>
          
          <motion.button
            onClick={onAdd}
            className="flex items-center gap-2 py-2 px-3 text-gray-600 hover:text-cyan-400 transition-all w-full text-left font-mono text-sm rounded-lg hover:bg-gray-900/50"
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={14} />
            <span>add hypothesis</span>
          </motion.button>
        </div>
      )}
      
      {!locked && (
        <motion.div 
          className="mt-4 pt-3 border-t border-gray-800/50 text-xs font-mono text-gray-600 flex items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-orange-400 text-sm">◐</span>
            <span>hypothesis</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-green-400 text-sm">●</span>
            <span>fact</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
