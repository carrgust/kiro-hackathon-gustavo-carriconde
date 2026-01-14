import { motion } from 'framer-motion';
import { Dna, Lock } from 'lucide-react';

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
    <div className="text-center py-6 border-t border-gray-800/50 font-mono">
      <motion.button
        onClick={onClick}
        disabled={!unlocked}
        className={`relative px-8 py-3 rounded-lg font-bold text-sm tracking-wide transition-all overflow-hidden ${
          unlocked 
            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)]' 
            : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
        }`}
        whileHover={unlocked ? { scale: 1.05 } : {}}
        whileTap={unlocked ? { scale: 0.95 } : {}}
        animate={unlocked ? {
          boxShadow: [
            '0 0 30px rgba(6,182,212,0.5)',
            '0 0 40px rgba(6,182,212,0.7)',
            '0 0 30px rgba(6,182,212,0.5)'
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Animated background gradient */}
        {unlocked && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        )}
        
        <div className="relative flex items-center gap-2 justify-center">
          {unlocked ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Dna size={18} />
              </motion.div>
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
      
      {!unlocked && (
        <motion.div 
          className="mt-3 space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-gray-500 text-xs">
            {remaining} more validated {remaining === 1 ? 'hypothesis' : 'hypotheses'} needed
          </div>
          
          {/* Progress bar */}
          <div className="max-w-xs mx-auto">
            <div className="h-1.5 bg-gray-900 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {validatedCount}/{requiredCount} validated
            </div>
          </div>
        </motion.div>
      )}
      
      {unlocked && (
        <motion.div
          className="mt-2 text-green-400 text-xs font-semibold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          ✓ Ready to generate
        </motion.div>
      )}
    </div>
  );
}
