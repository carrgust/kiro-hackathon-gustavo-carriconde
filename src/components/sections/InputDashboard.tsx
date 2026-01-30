import { motion } from 'framer-motion';
import { FlaskConical, CheckCircle, Pencil, RotateCcw, Play } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import QualityIndicator from '@/components/QualityIndicator';
import { pageVariants } from '@/lib/animations';

interface InputDashboardProps {
  niche: string;
  geography: string;
  onNicheChange: (niche: string) => void;
  onGeographyChange: (geo: string) => void;
  onStartValidation?: (niche: string, canonicalDescription: string, geography: string) => void;
  onDemoMode?: () => void;
  clearAnalysis?: boolean;
}

const NICHE_OPTIONS = [
  'AI/ML Tools',
  'SaaS',
  'E-commerce',
  'FinTech',
  'HealthTech',
  'EdTech',
  'Developer Tools',
  'Marketing',
  'Productivity',
  'Other',
];

const GEOGRAPHY_OPTIONS = [
  'Global',
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa',
];

export default function InputDashboard({
  niche,
  geography,
  onNicheChange,
  onGeographyChange,
  onStartValidation,
  onDemoMode,
  clearAnalysis = false,
}: InputDashboardProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [showCanonical, setShowCanonical] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Clear analysis when clearAnalysis prop is true
  useEffect(() => {
    if (clearAnalysis) {
      setAnalysis(null);
      setShowCanonical(false);
      setRevealedPillars([]);
      setTypewriterTexts({});
      localStorage.removeItem('curatos_analysis');
    }
  }, [clearAnalysis]);
  const [editingPillar, setEditingPillar] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [revealedPillars, setRevealedPillars] = useState<string[]>([]);
  const [typewriterTexts, setTypewriterTexts] = useState<Record<string, string>>({});

  const GDP_SCORES: Record<string, number> = {
    'Global': 100,        // Full bars - sum of all
    'North America': 28,  // ~28% of world GDP
    'Europe': 22,         // ~22% of world GDP
    'Asia Pacific': 35,   // ~35% of world GDP
    'Latin America': 6,   // ~6% of world GDP
    'Middle East': 4,     // ~4% of world GDP
    'Africa': 3,          // ~3% of world GDP
  };

  const geographyQuality = geography ? (GDP_SCORES[geography] || 50) : 0;

  // localStorage loading disabled - component always starts fresh

  const handleValidateIdea = async () => {
    if (!niche) return;
    
    setIsGenerating(true);
    setRevealedPillars([]);
    setTypewriterTexts({});
    
    try {
      const response = await fetch('/api/validate/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: niche }),
      });
      
      const data = await response.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        setShowCanonical(true);
        
        // Save to localStorage
        localStorage.setItem('curatos_analysis', JSON.stringify(data.analysis));
        localStorage.setItem('curatos_niche', niche);
        
        // Sequential reveal with typewriter effect
        const pillars = ['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'];
        pillars.forEach((pillar, index) => {
          setTimeout(() => {
            setRevealedPillars(prev => [...prev, pillar]);
            
            // Typewriter effect
            const text = data.analysis[pillar] || '';
            let charIndex = 0;
            const typeInterval = setInterval(() => {
              if (charIndex <= text.length) {
                setTypewriterTexts(prev => ({
                  ...prev,
                  [pillar]: text.substring(0, charIndex)
                }));
                charIndex++;
              } else {
                clearInterval(typeInterval);
              }
            }, 25);
          }, index * 400);
        });
      }
    } catch (error) {
      console.error('Failed to normalize:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmValidation = () => {
    if (onStartValidation && analysis) {
      // Convert analysis object to string for backward compatibility
      const canonicalDescription = Object.entries(analysis)
        .map(([key, value]) => `${key.toUpperCase()}: ${value}`)
        .join('\n\n');
      onStartValidation(niche, canonicalDescription, geography);
    }
  };

  const handleEditPillar = (pillar: string, text: string) => {
    setEditingPillar(pillar);
    setEditText(text);
  };

  const handleSaveEdit = (pillar: string) => {
    const updatedAnalysis = { ...analysis, [pillar]: editText };
    setAnalysis(updatedAnalysis);
    setEditingPillar(null);
    setEditText('');
    
    // Update localStorage with edited version
    localStorage.setItem('curatos_analysis', JSON.stringify(updatedAnalysis));
  };

  const handleStartOver = () => {
    // Clear all analysis data
    setAnalysis(null);
    setShowCanonical(false);
    setRevealedPillars([]);
    setTypewriterTexts({});
    
    // Clear localStorage
    localStorage.removeItem('curatos_analysis');
    localStorage.removeItem('curatos_niche');
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4 sm:p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ fontFamily: "'OCR-B', monospace" }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Business Idea</h1>
            <p className="text-blue-200 text-sm sm:text-base">Define your market niche and validate your idea</p>
          </div>
          {showCanonical && (
            <button
              onClick={handleStartOver}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all"
            >
              <RotateCcw size={14} />
              Start Over
            </button>
          )}
        </div>

        {/* Configuration Card */}
        <GlassCard className="p-6 space-y-6">
              {/* Market Niche Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Market Niche</label>
                <select
                  value={niche}
                  onChange={(e) => onNicheChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="" className="bg-gray-800">Select a market niche...</option>
                  {NICHE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-gray-800">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Geography Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Target Geography</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">GDP</span>
                    <QualityIndicator value={geographyQuality} />
                  </div>
                </div>
                <select
                  value={geography}
                  onChange={(e) => onGeographyChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="" className="bg-gray-800">Select target geography...</option>
                  {GEOGRAPHY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-gray-800">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Demo Mode Button */}
              {onDemoMode && !showCanonical && (
                <motion.button
                  onClick={onDemoMode}
                  className="w-full py-3 rounded-lg font-medium text-emerald-400 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play size={20} />
                  Try Demo Mode
                </motion.button>
              )}

              {/* Validate Idea Button */}
              {onStartValidation && !showCanonical && (
                <motion.button
                  onClick={handleValidateIdea}
                  disabled={!niche || isGenerating}
                  className={`w-full py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
                    niche && !isGenerating
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 shadow-md shadow-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/40'
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                  }`}
                  whileHover={niche && !isGenerating ? { scale: 1.02 } : {}}
                  whileTap={niche && !isGenerating ? { scale: 0.98 } : {}}
                >
                  <FlaskConical size={20} />
                  {isGenerating ? 'Analyzing...' : 'Validate Idea'}
                </motion.button>
              )}
            </GlassCard>

            {/* Loading State */}
            {isGenerating && (
              <GlassCard className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <motion.div
                    className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.p
                    className="text-white/80 text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Analyzing your idea...
                  </motion.p>
                </div>
              </GlassCard>
            )}

            {/* Analysis Section */}
            {showCanonical && analysis && (
              <GlassCard className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Business Analysis (7 Pillars)</label>
                  <div className="space-y-4">
                    {['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'].map((pillar) => {
                      if (!revealedPillars.includes(pillar)) return null;
                      
                      const description = analysis[pillar];
                      const displayText = typewriterTexts[pillar] || '';
                      
                      return (
                        <motion.div
                          key={pillar}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="bg-white/5 border border-white/10 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-orange-400 uppercase">{pillar}</h3>
                            <button
                              onClick={() => handleEditPillar(pillar, description as string)}
                              className="text-white/60 hover:text-white transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                          </div>
                          {editingPillar === pillar ? (
                            <div className="space-y-2">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                                rows={3}
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(pillar)}
                                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingPillar(null)}
                                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-white/80 leading-relaxed">
                              {displayText}
                              {displayText.length < description.length && (
                                <span className="inline-block w-1 h-4 bg-orange-400 ml-1 animate-pulse" />
                              )}
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={handleValidateIdea}
                    disabled={isGenerating}
                    className={`flex-1 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
                      !isGenerating
                        ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    whileHover={!isGenerating ? { scale: 1.02 } : {}}
                    whileTap={!isGenerating ? { scale: 0.98 } : {}}
                  >
                    <FlaskConical size={20} />
                    Regenerate
                  </motion.button>

                  <motion.button
                    onClick={handleConfirmValidation}
                    disabled={!analysis}
                    className={`flex-1 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 ${
                      analysis
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30 hover:shadow-lg hover:shadow-orange-500/40'
                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }`}
                    whileHover={analysis ? { scale: 1.02 } : {}}
                    whileTap={analysis ? { scale: 0.98 } : {}}
                  >
                    <CheckCircle size={20} />
                    Confirm & Start Validation
                  </motion.button>
                </div>
              </GlassCard>
            )}
          </div>
        </motion.div>
      );
    }
