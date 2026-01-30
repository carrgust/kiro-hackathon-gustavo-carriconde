'use client';

import { motion } from 'framer-motion';
import { Search, MessageCircle, Terminal, TrendingUp, BookOpen, Globe, Database, Briefcase, RotateCcw, Target, CheckCircle2, Pencil, CheckCircle } from 'lucide-react';
import { getSourceFavicon, getSourceLabel } from '@/lib/source-favicons';
import { useRef, useEffect, useState } from 'react';
import GlassCard from '@/components/GlassCard';
import EvidenceMatrix from './EvidenceMatrix';
import '@/styles/validation-dashboard.css';

/**
 * ValidationDashboardV2 - Steve Jobs Edition
 *
 * Design Principles:
 * 1. Horizontal progress bars - Consistent across all scores
 * 2. Consistent sizing - Every card same width
 * 3. Single accent color - Amber (#F59E0B)
 * 4. Perfect typography - SF Pro hierarchy
 * 5. Mathematical spacing - 8px grid
 */

const API_ICONS: Record<string, React.ElementType> = {
  'search': Search,
  'message-circle': MessageCircle,
  'terminal': Terminal,
  'trending-up': TrendingUp,
  'book-open': BookOpen,
  'globe': Globe,
  'database': Database,
  'briefcase': Briefcase,
};

interface Source {
  apiId?: string;
  apiName?: string;
  apiIcon?: string;
  apiColor?: string;
  // Legacy fields for backward compatibility
  type?: string;
  icon?: string;
  color?: string;
  name?: string;
  status: string;
  title?: string;
  url?: string;
  snippet?: string;
  supports?: string[];
  concerns?: string[];
  confidence?: number;
}

interface Subcategory {
  key: string;
  name: string;
  score: number | null;
  status: string;
  sources: Source[];
}

interface Pillar {
  key: string;
  name: string;
  icon: string;
  score: number | null;
  status: string;
  subcategories: Subcategory[];
}

interface GapAnalysis {
  pillarName: string;
  score: number;
  diagnosis: string;
  actions: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ValidationDashboardV2Props {
  idea?: string;
  canonicalDescription?: string;
  overallScore: number | null;
  scoreLabel?: string;
  pillars: Pillar[];
  onSourceClick: (source: Source) => void;
  agentLogs?: string[];
  onStartOver?: () => void;
  onCloseGaps?: () => void;
  gapAnalysis?: GapAnalysis[];
  isAnalyzingGaps?: boolean;
  improvedIdea?: Record<string, string>;
  onNavigateToPRD?: () => void;
}

// Score label based on value
function getScoreVerdict(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Strong';
  if (score >= 60) return 'Viable';
  if (score >= 50) return 'Moderate';
  if (score >= 40) return 'Weak';
  return 'Critical';
}

export default function ValidationDashboardV2({
  idea,
  canonicalDescription,
  overallScore,
  scoreLabel,
  pillars,
  onSourceClick,
  agentLogs = [],
  onStartOver,
  onCloseGaps,
  gapAnalysis = [],
  isAnalyzingGaps = false,
  improvedIdea,
  onNavigateToPRD
}: ValidationDashboardV2Props) {
  const verdict = overallScore ? getScoreVerdict(overallScore) : '';
  const gapPillars = pillars.filter(p => (p.score ?? 0) < 70);
  
  const closeGapsRef = useRef<HTMLDivElement>(null);
  const improvedIdeaRef = useRef<HTMLDivElement>(null);
  const [revealedPillars, setRevealedPillars] = useState<string[]>([]);
  const [typewriterTexts, setTypewriterTexts] = useState<Record<string, string>>({});
  const [editingImprovedPillar, setEditingImprovedPillar] = useState<string | null>(null);
  const [editImprovedText, setEditImprovedText] = useState('');

  // Check localStorage on mount for improved idea
  useEffect(() => {
    const saved = localStorage.getItem('curatos_improved_idea');
    if (saved && improvedIdea) {
      const allPillars = ['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'];
      setRevealedPillars(allPillars);
      const allTexts: Record<string, string> = {};
      allPillars.forEach(p => { allTexts[p] = improvedIdea[p] || ''; });
      setTypewriterTexts(allTexts);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to Close the Gaps button when it appears
  useEffect(() => {
    if (gapPillars.length > 0 && gapAnalysis.length === 0 && closeGapsRef.current) {
      setTimeout(() => {
        closeGapsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [gapPillars.length, gapAnalysis.length]);

  // Scroll to improved idea and start typewriter when it appears
  useEffect(() => {
    if (!improvedIdea) return;
    
    // Save to localStorage when new data arrives
    localStorage.setItem('curatos_improved_idea', JSON.stringify(improvedIdea));
    
    // Check if already shown (remount scenario)
    const saved = localStorage.getItem('curatos_improved_idea_shown');
    if (saved === JSON.stringify(improvedIdea)) {
      const allPillars = ['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'];
      setRevealedPillars(allPillars);
      const allTexts: Record<string, string> = {};
      allPillars.forEach(p => { allTexts[p] = improvedIdea[p] || ''; });
      setTypewriterTexts(allTexts);
      return;
    }
    
    if (improvedIdeaRef.current) {
      setTimeout(() => {
        improvedIdeaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
      
    // Start sequential reveal with typewriter
    const pillars = ['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'];
    setRevealedPillars([]);
    setTypewriterTexts({});
    
    pillars.forEach((pillar, index) => {
      setTimeout(() => {
        setRevealedPillars(prev => [...prev, pillar]);
        
        const text = improvedIdea[pillar] || '';
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
    
    // Mark as shown after starting animation
    localStorage.setItem('curatos_improved_idea_shown', JSON.stringify(improvedIdea));
  }, [improvedIdea]);

  return (
    <div className="vd-container">
      {/* Overall Score Progress Bar */}
      <motion.div
        className="vd-overall-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ maxWidth: '100%', margin: '0 auto 32px', padding: '0 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '48px', fontWeight: '700', color: '#F59E0B', lineHeight: '1' }}>
              {overallScore ?? 0}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
              {verdict}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ 
              height: '24px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '12px', 
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallScore ?? 0}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: (overallScore ?? 0) >= 70 
                    ? 'linear-gradient(90deg, #10B981, #34D399)' 
                    : (overallScore ?? 0) >= 50 
                    ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' 
                    : 'linear-gradient(90deg, #EF4444, #F87171)',
                  boxShadow: (overallScore ?? 0) >= 70 
                    ? '0 0 20px rgba(16, 185, 129, 0.4)' 
                    : (overallScore ?? 0) >= 50 
                    ? '0 0 20px rgba(245, 158, 11, 0.4)' 
                    : '0 0 20px rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px'
                }}
              />
            </div>
          </div>
        </div>
        <div className="vd-overall-mini-scores">
          {pillars.slice(0, 7).map((pillar) => (
            <div key={pillar.key} className="vd-mini-score">
              <div className="vd-mini-score-value">{pillar.score || 0}</div>
              <div className="vd-mini-score-label">{pillar.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Evidence Matrix */}
      <EvidenceMatrix pillars={pillars} onSourceClick={onSourceClick} />

      {/* Close the Gaps Button */}
      {onCloseGaps && gapPillars.length > 0 && gapAnalysis.length === 0 && (
        <div ref={closeGapsRef} className="flex justify-center mt-8 mb-4">
          <motion.button
            onClick={onCloseGaps}
            disabled={isAnalyzingGaps}
            className="flex items-center gap-3 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all"
            style={{
              background: isAnalyzingGaps 
                ? 'rgba(245, 158, 11, 0.5)' 
                : 'linear-gradient(135deg, #F59E0B, #D97706)',
              cursor: isAnalyzingGaps ? 'not-allowed' : 'pointer',
              animation: isAnalyzingGaps ? 'none' : 'gapGlow 1.5s ease-in-out infinite'
            }}
            whileHover={!isAnalyzingGaps ? { scale: 1.05 } : {}}
            whileTap={!isAnalyzingGaps ? { scale: 0.95 } : {}}
          >
            <Target size={20} />
            {isAnalyzingGaps ? 'Analyzing Gaps...' : `Close the Gaps (${gapPillars.length})`}
          </motion.button>
          <style jsx>{`
            @keyframes gapGlow {
              0%, 100% { box-shadow: 0 0 10px rgba(245, 158, 11, 0.3); }
              50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.8), 0 0 80px rgba(245, 158, 11, 0.4); }
            }
          `}</style>
        </div>
      )}

      {/* Gap Analysis Results */}
      {gapAnalysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 space-y-4"
          style={{ maxWidth: '1200px', margin: '32px auto 0' }}
        >
          <h3 className="text-xl font-bold text-white mb-4 px-4">Gap Analysis & Action Plan</h3>
          {gapAnalysis.map((gap, idx) => (
            <motion.div
              key={gap.pillarName}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-semibold text-white">{gap.pillarName}</h4>
                  <span 
                    className="text-2xl font-bold"
                    style={{ 
                      color: gap.score >= 50 ? '#F59E0B' : '#EF4444' 
                    }}
                  >
                    {gap.score}
                  </span>
                </div>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: gap.priority === 'HIGH' 
                      ? 'rgba(239, 68, 68, 0.2)' 
                      : gap.priority === 'MEDIUM' 
                      ? 'rgba(245, 158, 11, 0.2)' 
                      : 'rgba(156, 163, 175, 0.2)',
                    color: gap.priority === 'HIGH' 
                      ? '#EF4444' 
                      : gap.priority === 'MEDIUM' 
                      ? '#F59E0B' 
                      : '#9CA3AF'
                  }}
                >
                  {gap.priority} PRIORITY
                </span>
              </div>
              
              <p className="text-sm italic text-gray-400 mb-4">{gap.diagnosis}</p>
              
              <div className="space-y-2">
                {gap.actions.map((action, actionIdx) => (
                  <div key={actionIdx} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{action}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Improved Business Idea */}
      {improvedIdea && (
        <div ref={improvedIdeaRef} style={{ maxWidth: '1000px', width: '100%', margin: '48px auto 0', padding: '0 20px' }}>
          <GlassCard className='p-6 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-white'>Improved Business Idea (7 Pillars)</label>
              <div className='space-y-4'>
                {['problem', 'market', 'competition', 'solution', 'monetization', 'gtm', 'timing'].map((pillar) => {
                  if (!revealedPillars.includes(pillar)) return null;
                  
                  const displayText = typewriterTexts[pillar] || '';
                  const fullText = improvedIdea[pillar] || '';
                  
                  return (
                    <motion.div
                      key={pillar}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className='bg-white/5 border border-white/10 rounded-lg p-4'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <h3 className='text-sm font-semibold text-orange-400 uppercase'>{pillar}</h3>
                        <button
                          onClick={() => { setEditingImprovedPillar(pillar); setEditImprovedText(fullText); }}
                          className='text-white/60 hover:text-white transition-colors'
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                      {editingImprovedPillar === pillar ? (
                        <div className='space-y-2'>
                          <textarea
                            value={editImprovedText}
                            onChange={(e) => setEditImprovedText(e.target.value)}
                            className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-400/50'
                            rows={3}
                          />
                          <div className='flex gap-2'>
                            <button
                              onClick={() => {
                                setTypewriterTexts(prev => ({ ...prev, [pillar]: editImprovedText }));
                                setEditingImprovedPillar(null);
                              }}
                              className='px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded'
                            >Save</button>
                            <button
                              onClick={() => setEditingImprovedPillar(null)}
                              className='px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded'
                            >Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <p className='text-sm text-white/80 leading-relaxed' style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                          {displayText}
                          {displayText.length < fullText.length && (
                            <span className='inline-block w-1 h-4 bg-orange-400 ml-1 animate-pulse' />
                          )}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className='flex gap-3'>
              <motion.button
                onClick={onCloseGaps}
                className='flex-1 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Regenerate
              </motion.button>
              <motion.button
                onClick={onNavigateToPRD}
                className='flex-1 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md shadow-orange-500/30'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle size={20} />
                Confirm and Proceed to Business Plan
              </motion.button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// Pillar Card Component
function PillarCard({
  pillar,
  onSourceClick,
  delay
}: {
  pillar: Pillar;
  onSourceClick: (s: Source) => void;
  delay: number;
}) {
  return (
    <motion.div
      className="vd-pillar-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {/* Header */}
      <div className="vd-pillar-header">
        <h3 className="vd-pillar-title">{pillar.name}</h3>
        <span className="vd-pillar-score">{pillar.score || 0}</span>
      </div>

      {/* Progress Bar */}
      <div style={{ 
        height: '8px', 
        background: 'rgba(255, 255, 255, 0.05)', 
        borderRadius: '4px', 
        overflow: 'hidden',
        margin: '16px 0'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pillar.score || 0}%` }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          style={{
            height: '100%',
            background: (pillar.score || 0) >= 70 
              ? 'linear-gradient(90deg, #10B981, #34D399)' 
              : (pillar.score || 0) >= 50 
              ? 'linear-gradient(90deg, #F59E0B, #FBBF24)' 
              : 'linear-gradient(90deg, #EF4444, #F87171)',
            borderRadius: '4px'
          }}
        />
      </div>

      {/* Separator */}
      <div className="vd-pillar-separator" />

      {/* Subcategories */}
      <div className="vd-subcategory-list">
        {pillar.subcategories.map((sub) => (
          <SubcategoryRow
            key={sub.key}
            subcategory={sub}
            onSourceClick={onSourceClick}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Subcategory Row Component
function SubcategoryRow({
  subcategory,
  onSourceClick
}: {
  subcategory: Subcategory;
  onSourceClick: (s: Source) => void;
}) {
  return (
    <div className="vd-subcategory-row">
      <span className="vd-subcategory-name">{subcategory.name}</span>
      <div className="vd-subcategory-sources" style={{ display: 'flex', alignItems: 'center' }}>
        {subcategory.sources.filter(s => s.status === 'found').map((source, idx) => {
          // Get source identifier from various possible fields
          const sourceId = source.apiId || source.apiName || source.type || source.name || '';
          const faviconUrl = getSourceFavicon(sourceId, source.url);
          const sourceLabel = getSourceLabel(sourceId);
          const isActive = source.status === 'found';
          
          return (
            <button
              key={idx}
              onClick={() => isActive && onSourceClick(source)}
              disabled={!isActive}
              title={`${sourceLabel}: ${source.title || source.status}`}
              style={{
                marginLeft: idx === 0 ? '0' : '-8px',
                position: 'relative',
                zIndex: subcategory.sources.length - idx,
                cursor: isActive ? 'pointer' : 'default',
                opacity: isActive ? 1 : 0.4,
                transition: 'all 0.2s',
                background: 'transparent',
                border: 'none',
                padding: 0
              }}
              onMouseEnter={(e) => {
                if (isActive) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.zIndex = '100';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.zIndex = String(subcategory.sources.length - idx);
              }}
            >
              <img
                src={faviconUrl}
                alt="Source favicon"
                className="rounded-full"
                style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  background: '#1a1a1a',
                  objectFit: 'contain',
                  padding: '2px'
                }}
              />
            </button>
          );
        })}
      </div>
      <span className="vd-subcategory-score">{subcategory.score || 0}</span>
    </div>
  );
}
