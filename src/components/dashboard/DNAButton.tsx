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
    <div className="text-center py-4 sm:py-6 metal-divider border-t font-mono px-4 sm:px-0 md:relative fixed bottom-0 left-0 right-0 md:bg-transparent z-40 md:z-auto safe-area-bottom" style={{ backgroundColor: 'var(--bg-base)' }}>
      <motion.button
        onClick={onClick}
        disabled={!unlocked}
        className={`relative px-6 sm:px-8 py-3 font-bold text-sm tracking-wide transition-all overflow-hidden min-h-[48px] sm:min-h-[44px] ${
          unlocked 
            ? 'metal-btn-primary' 
            : 'metal-btn text-gray-600 cursor-not-allowed'
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
                {/* Progress fill */}
                <motion.div
                  className="h-full relative"
                  style={{ background: 'var(--metal-accent)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
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
                  initial={{ scale: 1.2, color: 'var(--text-primary-color)' }}
                  animate={{ scale: 1, color: 'var(--text-muted-color)' }}
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
            className="mt-2 text-xs font-semibold flex items-center justify-center gap-1"
            style={{ color: 'var(--status-success)' }}
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
