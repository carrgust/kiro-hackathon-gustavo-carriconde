import { motion, AnimatePresence } from 'framer-motion';
import { Dna, Lock, Sparkles } from 'lucide-react';

interface DNAButtonProps {
  unlocked: boolean;
  validatedCount: number;
  requiredCount: number;
  onClick: () => void;
}

export default function DNAButton({ unlocked, validatedCount, requiredCount, onClick }: DNAButtonProps) {
  const remaining = Math.max(0, requiredCount - validatedCount);
  const progress = (validatedCount / requiredCount) * 100;

  return (
    <div className="text-center py-4 sm:py-6 linear-divider border-t font-mono px-4 sm:px-0 md:relative fixed bottom-0 left-0 right-0 bg-[#0a0a0f] md:bg-transparent z-40 md:z-auto safe-area-bottom">
      <motion.button
        onClick={onClick}
        disabled={!unlocked}
        className={`relative px-6 sm:px-8 py-3 font-bold text-sm tracking-wide transition-all overflow-hidden min-h-[48px] sm:min-h-[44px] ${
          unlocked 
            ? 'linear-btn-primary' 
            : 'linear-btn text-gray-600 cursor-not-allowed'
        }`}
        whileHover={unlocked ? { scale: 1.02 } : {}}
        whileTap={unlocked ? { scale: 0.98 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative flex items-center gap-2 justify-center">
          {unlocked ? (
            <>
              <Dna size={18} />
              <span>CREATE DNA</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>CREATE DNA</span>
            </>
          )}
        </div>
      </motion.button>
      
      {/* Progress section when locked */}
      <AnimatePresence>
        {!unlocked && (
          <motion.div 
            className="mt-3 space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="text-gray-500 text-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {remaining} more validated {remaining === 1 ? 'hypothesis' : 'hypotheses'} needed
            </motion.div>
            
            {/* Animated progress bar */}
            <div className="max-w-xs mx-auto">
              <div className="h-2 bg-gray-900 rounded-full overflow-hidden relative">
                {/* Background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                {/* Progress fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  {/* Shimmer on progress bar */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
              </div>
              
              <motion.div 
                className="text-xs text-gray-600 mt-1 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <span>{validatedCount}/{requiredCount} validated</span>
                <motion.span
                  key={progress}
                  initial={{ scale: 1.2, color: '#22d3ee' }}
                  animate={{ scale: 1, color: '#6b7280' }}
                >
                  {progress.toFixed(0)}%
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Success message when unlocked */}
      <AnimatePresence>
        {unlocked && (
          <motion.div
            className="mt-2 text-green-400 text-xs font-semibold flex items-center justify-center gap-1"
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              ✓
            </motion.span>
            <span>Ready to generate</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
