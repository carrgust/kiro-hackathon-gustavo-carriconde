import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Play, FileText, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import { DNAData } from '@/types/project';
import AutoCoderPanel from './AutoCoderPanel';

interface DNAModalProps {
  dna: DNAData | null;
  onClose: () => void;
  onStartBuild: () => void;
  onExport: () => void;
  onGenerateLandingPage?: () => void;
  onGeneratePRD?: () => void;
  isGeneratingLandingPage?: boolean;
  isGeneratingPRD?: boolean;
}

export default function DNAModal({ 
  dna, 
  onClose, 
  onStartBuild, 
  onExport,
  onGenerateLandingPage,
  onGeneratePRD,
  isGeneratingLandingPage = false,
  isGeneratingPRD = false
}: DNAModalProps) {
  const [activeTab, setActiveTab] = useState<'dna' | 'autocoder'>('dna');
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  
  if (!dna) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="glass border border-gray-700/50 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex justify-between items-start">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-gradient-green font-mono flex items-center gap-2">
                  <CheckCircle2 size={28} className="text-green-400" />
                  DNA GENERATED
                </h2>
                <p className="text-gray-400 text-sm mt-1 font-mono">
                  {dna.niche.toUpperCase()} • {formatDate(dna.generatedAt)}
                </p>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-300 p-2 hover:bg-gray-800/50 rounded-lg transition-all"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-6 border-b border-gray-800/50">
            {[
              { id: 'dna', label: 'DNA ANALYSIS', color: 'green' },
              { id: 'autocoder', label: 'AUTO-CODER', color: 'cyan' }
            ].map((tab, i) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dna' | 'autocoder')}
                className={`px-6 py-3 font-mono text-sm transition-all relative ${
                  activeTab === tab.id
                    ? `text-${tab.color}-400`
                    : 'text-gray-500 hover:text-gray-300'
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-${tab.color}-400`}
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <AnimatePresence mode="wait">
              {activeTab === 'dna' ? (
                <motion.div
                  key="dna"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Problems */}
                  <Section title="VALIDATED PROBLEMS" count={dna.problems.length} delay={0}>
                    {dna.problems.map((problem, i) => (
                      <ItemCard key={problem.id} item={problem} index={i} />
                    ))}
                  </Section>

                  {/* Solutions */}
                  <Section title="VALIDATED SOLUTIONS" count={dna.solutions.length} delay={0.1}>
                    {dna.solutions.map((solution, i) => (
                      <ItemCard key={solution.id} item={solution} index={i} />
                    ))}
                  </Section>

                  {/* Requirements */}
                  <Section title="REQUIREMENTS" count={dna.requirements.length} delay={0.2}>
                    {dna.requirements.map((req, i) => (
                      <motion.div
                        key={req.id}
                        className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-cyan-500/30 transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ x: 4 }}
                      >
                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                        <span className="text-gray-300 flex-1 text-sm">{req.text}</span>
                        <span className={`text-xs px-2 py-1 rounded font-mono ${
                          req.type === 'functional' 
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {req.type === 'functional' ? 'FUNC' : 'NON-FUNC'}
                        </span>
                        <span className="text-green-400 text-sm font-mono font-semibold">{req.confidence}%</span>
                      </motion.div>
                    ))}
                  </Section>

                  {/* Token Cost */}
                  <motion.div 
                    className="p-4 glass rounded-lg border border-yellow-500/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-sm font-semibold text-yellow-400 mb-2 font-mono">TOKEN COST SUMMARY</h3>
                    <div className="text-lg text-gray-300 font-mono font-bold">
                      {dna.tokenCost.toLocaleString()} tokens
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="autocoder"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <AutoCoderPanel generatedDNA={{ requirements: dna.requirements.map(r => r.text) }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-800/50 glass">
            <div className="flex gap-3">
              {onGenerateLandingPage && (
                <motion.button
                  onClick={onGenerateLandingPage}
                  disabled={isGeneratingLandingPage}
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 text-white py-3 px-6 rounded-lg font-mono font-semibold transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGeneratingLandingPage ? (
                    <><Loader2 size={18} className="animate-spin" /> GENERATING...</>
                  ) : (
                    <><Globe size={18} /> LANDING PAGE</>
                  )}
                </motion.button>
              )}
              {onGeneratePRD && (
                <motion.button
                  onClick={onGeneratePRD}
                  disabled={isGeneratingPRD}
                  className="flex-1 border-2 border-cyan-500 hover:bg-cyan-500/10 disabled:border-gray-700 text-cyan-400 py-3 px-6 rounded-lg font-mono font-semibold transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isGeneratingPRD ? (
                    <><Loader2 size={18} className="animate-spin" /> GENERATING...</>
                  ) : (
                    <><FileText size={18} /> GENERATE PRD</>
                  )}
                </motion.button>
              )}
              <motion.button
                onClick={onStartBuild}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-mono font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play size={18} /> START BUILD
              </motion.button>
              <motion.button
                onClick={onExport}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 px-6 rounded-lg font-mono transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={18} /> EXPORT
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper Components
function Section({ title, count, delay, children }: { title: string; count: number; delay: number; children: React.ReactNode }) {
  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <h3 className="text-lg font-semibold text-cyan-400 mb-3 font-mono flex items-center gap-2">
        {title} <span className="text-sm text-gray-500">({count})</span>
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </motion.div>
  );
}

function ItemCard({ item, index }: { item: { text: string; confidence: number }; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-800/50 hover:border-green-500/30 transition-all"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4 }}
    >
      <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
      <span className="text-gray-300 flex-1 text-sm">{item.text}</span>
      <span className="text-green-400 text-sm font-mono font-semibold">{item.confidence}%</span>
    </motion.div>
  );
}
