import { useState, memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Trash2, Download, Search } from 'lucide-react';
import { Hypothesis } from '@/types/project';
import ScoreBreakdown from './ScoreBreakdown';
import SourceStack from './SourceStack';

interface HypothesisItemEnhancedProps {
  hypothesis: Hypothesis;
  onClick: () => void;
  onRemove: () => void;
  index?: number;
}

// Processing Progress Bar (shown during downloading/analyzing)
function ProcessingProgress({ status, sourceCount }: { status: string; sourceCount?: number }) {
  const statusText = status === 'downloading' 
    ? `Downloading sources...` 
    : `Analyzing ${sourceCount || 0} sources...`;
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        {status === 'downloading' ? (
          <Download size={10} className="text-blue-400 animate-bounce" />
        ) : (
          <Search size={10} className="text-blue-400 animate-pulse" />
        )}
        <span className="text-[10px] text-blue-400 font-mono">{statusText}</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );
}

// Confidence Gauge (shown after processing complete)
function ConfidenceGauge({ confidence }: { confidence: number }) {
  const gaugeColor = confidence >= 90 ? 'bg-green-500' : confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const textColor = confidence >= 90 ? 'text-green-400' : confidence >= 50 ? 'text-yellow-400' : 'text-red-400';
  const zone = confidence >= 90 ? 'FACT' : 'HYPOTHESIS';
  
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-mono font-bold ${textColor}`}>CONFIDENCE: {confidence}%</span>
        <span className={`text-[9px] font-mono ${confidence >= 90 ? 'text-green-500' : 'text-gray-500'}`}>{zone}</span>
      </div>
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        {/* 90% threshold marker */}
        <div className="absolute left-[90%] top-0 bottom-0 w-px bg-gray-500 z-10" />
        {/* Confidence fill */}
        <div className={`h-full ${gaugeColor} transition-all duration-500`} style={{ width: `${confidence}%` }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[8px] text-gray-600 font-mono">0</span>
        <span className="text-[8px] text-gray-500 font-mono">90%</span>
        <span className="text-[8px] text-gray-600 font-mono">100</span>
      </div>
    </div>
  );
}

const HypothesisItemEnhanced = memo(function HypothesisItemEnhanced({ 
  hypothesis, onClick, onRemove, index = 0 
}: HypothesisItemEnhancedProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  
  const status = hypothesis.status || (hypothesis.confidence > 0 ? 'complete' : 'pending');
  const isProcessing = status === 'downloading' || status === 'analyzing';
  
  const config = useMemo(() => {
    if (hypothesis.state === 'fact') {
      return {
        icon: CheckCircle2,
        color: 'text-green-400',
        borderColor: 'border-green-400/30',
        bgGradient: 'from-green-500/10 to-transparent',
        glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
        stateLabel: 'Validated fact'
      };
    }
    return {
      icon: Sparkles,
      color: 'text-orange-400',
      borderColor: 'border-orange-400/30',
      bgGradient: 'from-orange-500/10 to-transparent',
      glow: '',
      stateLabel: 'Unvalidated hypothesis'
    };
  }, [hypothesis.state]);

  const StatusIcon = config.icon;
  const isAnimating = isProcessing || (hypothesis.state === 'hypothesis' && hypothesis.confidence === 0);

  const breakdownScores = useMemo(() => [
    { label: 'Evidence', value: Math.round(hypothesis.confidence * 0.4), max: 40 },
    { label: 'Relevance', value: Math.round(hypothesis.confidence * 0.3), max: 30 },
    { label: 'Sources', value: Math.round(hypothesis.confidence * 0.3), max: 30 },
  ], [hypothesis.confidence]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemove();
    }
  }, [onClick, onRemove]);

  const handleMouseEnter = useCallback(() => {
    if (hypothesis.state === 'fact') setShowBreakdown(true);
  }, [hypothesis.state]);

  const handleMouseLeave = useCallback(() => setShowBreakdown(false), []);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden bg-gradient-to-br ${config.bgGradient} backdrop-blur-sm border ${config.borderColor} rounded-lg ${config.glow} transition-all duration-300 cursor-pointer focus-within:ring-2 focus-within:ring-cyan-500`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={`${config.stateLabel}: ${hypothesis.text}${hypothesis.confidence > 0 ? `, ${hypothesis.confidence}% confidence` : ''}`}
      tabIndex={0}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.6 }}
        aria-hidden="true"
      />

      <div className="relative p-3 flex items-start gap-3">
        <motion.div
          animate={isAnimating ? { rotate: 360 } : {}}
          transition={isAnimating ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
          className={`flex-shrink-0 ${config.color}`}
          aria-hidden="true"
        >
          <StatusIcon size={16} />
        </motion.div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 leading-relaxed font-mono">
            {hypothesis.text}
          </p>

          {/* Processing Progress - shown during downloading/analyzing */}
          {isProcessing && (
            <ProcessingProgress status={status} sourceCount={hypothesis.sources?.length} />
          )}

          {/* Confidence Gauge - shown after complete */}
          {status === 'complete' && hypothesis.confidence > 0 && (
            <ConfidenceGauge confidence={hypothesis.confidence} />
          )}

          {hypothesis.sources && hypothesis.sources.length > 0 && (
            <motion.div 
              className="mt-2 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <SourceStack sources={hypothesis.sources} />
              <span className="text-xs text-gray-500 font-mono flex-shrink-0">{hypothesis.sources.length} sources</span>
            </motion.div>
          )}
          
          {hypothesis.state === 'fact' && hypothesis.confidence > 0 && (
            <ScoreBreakdown
              isVisible={showBreakdown}
              scores={breakdownScores}
              total={hypothesis.confidence}
            />
          )}
        </div>

        <motion.button
          onClick={handleRemove}
          aria-label={`Remove hypothesis: ${hypothesis.text.substring(0, 30)}...`}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={14} className="text-gray-500 hover:text-red-400 transition-colors" aria-hidden="true" />
        </motion.button>
      </div>

      {isAnimating && (
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400/50 rounded-lg"
          animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
      )}
    </motion.article>
  );
});

export default HypothesisItemEnhanced;
