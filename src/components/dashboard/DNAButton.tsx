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
    <div className="text-center py-4 sm:py-6 border-t border-gray-800/50 font-mono px-4 sm:px-0 md:relative fixed bottom-0 left-0 right-0 bg-[#0a0a0f] md:bg-transparent z-40 md:z-auto safe-area-bottom">
      <motion.button
        onClick={onClick}
        disabled={!unlocked}
        className={`relative px-6 sm:px-8 py-3 rounded-lg font-bold text-sm tracking-wide transition-all overflow-hidden min-h-[48px] sm:min-h-[44px] ${
          unlocked 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' 
            : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
        }`}
        whileHover={unlocked ? { scale: 1.05, y: -2 } : {}}
        whileTap={unlocked ? { scale: 0.95 } : {}}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Multi-layer glow effect when unlocked */}
        <AnimatePresence>
          {unlocked && (
            <>
              {/* Outer glow pulse */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  boxShadow: [
                    '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
                    '0 0 30px rgba(6,182,212,0.6), 0 0 60px rgba(6,182,212,0.3)',
                    '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              
              {/* Inner shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
              
              {/* Sparkle particles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '50%',
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
        
        <div className="relative flex items-center gap-2 justify-center">
          {unlocked ? (
            <>
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <Dna size={18} />
              </motion.div>
              <span>CREATE DNA</span>
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Sparkles size={14} className="text-yellow-300" />
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                animate={{ 
                  rotate: [0, -5, 5, 0],
                }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
              >
                <Lock size={16} />
              </motion.div>
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
