import { motion } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { Hypothesis } from '@/types/project';

interface HypothesisItemEnhancedProps {
  hypothesis: Hypothesis;
  onClick: () => void;
  onRemove: () => void;
  index?: number;
}

export default function HypothesisItemEnhanced({ 
  hypothesis, onClick, onRemove, index = 0 
}: HypothesisItemEnhancedProps) {
  const getStatusConfig = () => {
    switch (hypothesis.status) {
      case 'validated':
        return {
          icon: CheckCircle2,
          color: 'text-green-400',
          borderColor: 'border-green-400/30',
          bgGradient: 'from-green-500/10 to-transparent',
          glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]'
        };
      case 'researching':
        return {
          icon: Loader2,
          color: 'text-cyan-400',
          borderColor: 'border-cyan-400/30',
          bgGradient: 'from-cyan-500/10 to-transparent',
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]'
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-400',
          borderColor: 'border-red-400/30',
          bgGradient: 'from-red-500/10 to-transparent',
          glow: ''
        };
      default:
        return {
          icon: Sparkles,
          color: 'text-gray-400',
          borderColor: 'border-gray-700',
          bgGradient: 'from-gray-800/50 to-transparent',
          glow: ''
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;
  const isAnimating = hypothesis.status === 'researching';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        delay: index * 0.05 
      }}
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={`
        group relative overflow-hidden
        bg-gradient-to-br ${config.bgGradient}
        backdrop-blur-sm
        border ${config.borderColor}
        rounded-lg
        ${config.glow}
        transition-all duration-300
        cursor-pointer
      `}
      onClick={onClick}
    >
      {/* Animated background gradient on hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative p-3 flex items-start gap-3">
        {/* Status Icon */}
        <motion.div
          animate={isAnimating ? { rotate: 360 } : {}}
          transition={isAnimating ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
          className={`flex-shrink-0 ${config.color}`}
        >
          <StatusIcon size={16} />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 leading-relaxed font-mono">
            {hypothesis.text}
          </p>

          {/* Confidence Score */}
          {hypothesis.confidence !== undefined && hypothesis.confidence > 0 && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ delay: 0.3 }}
            >
              {/* Progress Bar */}
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    hypothesis.confidence >= 80 
                      ? 'from-green-500 to-emerald-400'
                      : hypothesis.confidence >= 60
                      ? 'from-cyan-500 to-blue-400'
                      : 'from-orange-500 to-yellow-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${hypothesis.confidence}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>

              {/* Percentage */}
              <motion.span 
                className={`text-xs font-mono font-semibold ${
                  hypothesis.confidence >= 80 
                    ? 'text-green-400'
                    : hypothesis.confidence >= 60
                    ? 'text-cyan-400'
                    : 'text-orange-400'
                }`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                {hypothesis.confidence}%
              </motion.span>
            </motion.div>
          )}

          {/* Sources */}
          {hypothesis.sources && hypothesis.sources.length > 0 && (
            <motion.div 
              className="mt-2 flex items-center gap-1 text-xs text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="font-mono">{hypothesis.sources.length} sources</span>
            </motion.div>
          )}
        </div>

        {/* Remove Button */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={14} className="text-gray-500 hover:text-red-400 transition-colors" />
        </motion.button>
      </div>

      {/* Pulse animation for researching state */}
      {isAnimating && (
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg"
          animate={{
            opacity: [0.5, 0, 0.5],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.div>
  );
}
