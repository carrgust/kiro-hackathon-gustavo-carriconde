'use client';

import { motion } from 'framer-motion';
import { Package, Users, AlertCircle, Lightbulb, DollarSign, Zap, Search, MessageCircle, Terminal, TrendingUp, BookOpen, Globe, Database, Briefcase } from 'lucide-react';
import { UnifiedGauge } from './visualizations';
import '@/styles/validation-dashboard.css';

/**
 * ValidationDashboardV2 - Steve Jobs Edition
 *
 * Design Principles:
 * 1. ONE gauge style - UnifiedGauge used everywhere
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

interface ValidationDashboardV2Props {
  idea?: string;
  canonicalDescription?: string;
  overallScore: number | null;
  scoreLabel?: string;
  pillars: Pillar[];
  onSourceClick: (source: Source) => void;
  agentLogs?: string[];
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

// Parse business concept into structured sections
function parseBusinessConcept(text: string) {
  const sections = {
    product: '',
    target: '',
    problem: '',
    solution: '',
    revenue: '',
    edge: ''
  };

  if (!text) return sections;

  const sentences = text.split(/\.\s+/);

  sentences.forEach(sentence => {
    const lower = sentence.toLowerCase();
    if (!sections.product && (lower.includes('product') || lower.includes('saas') || lower.includes('platform') || lower.includes('service'))) {
      sections.product = sentence + '.';
    } else if (!sections.target && (lower.includes('customer') || lower.includes('target') || lower.includes('user'))) {
      sections.target = sentence + '.';
    } else if (!sections.problem && (lower.includes('problem') || lower.includes('pain') || lower.includes('struggle'))) {
      sections.problem = sentence + '.';
    } else if (!sections.solution && (lower.includes('solution') || lower.includes('feature') || lower.includes('provide'))) {
      sections.solution = sentence + '.';
    } else if (!sections.revenue && (lower.includes('monetization') || lower.includes('revenue') || lower.includes('subscription'))) {
      sections.revenue = sentence + '.';
    } else if (!sections.edge && (lower.includes('differentiation') || lower.includes('unique') || lower.includes('competitive'))) {
      sections.edge = sentence + '.';
    }
  });

  // Fallback
  if (!sections.product) sections.product = text.substring(0, 150) + '...';

  return sections;
}

export default function ValidationDashboardV2({
  idea,
  canonicalDescription,
  overallScore,
  scoreLabel,
  pillars,
  onSourceClick,
  agentLogs = []
}: ValidationDashboardV2Props) {
  const businessSections = parseBusinessConcept(canonicalDescription || '');
  const verdict = overallScore ? getScoreVerdict(overallScore) : '';

  return (
    <div className="vd-container">
      {/* Header */}
      <header className="vd-header">
        <h1 className="vd-title">Idea Validation</h1>
        <p className="vd-subtitle">7-pillar analysis with 105 data points</p>
      </header>

      {/* Top Section: Concept + Console side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px', maxWidth: '1400px', margin: '0 auto 32px' }}>
        {/* Business Concept Card */}
        {canonicalDescription && (
          <motion.div
            className="vd-concept-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="vd-concept-title">Business Concept</div>
            <div className="vd-concept-grid">
              {businessSections.product && (
                <div className="vd-concept-item">
                  <Package className="vd-concept-icon" size={18} />
                  <div>
                    <div className="vd-concept-label">Product</div>
                    <div className="vd-concept-text">{businessSections.product}</div>
                  </div>
                </div>
              )}
              {businessSections.target && (
                <div className="vd-concept-item">
                  <Users className="vd-concept-icon" size={18} />
                  <div>
                    <div className="vd-concept-label">Target</div>
                    <div className="vd-concept-text">{businessSections.target}</div>
                  </div>
                </div>
              )}
              {businessSections.problem && (
                <div className="vd-concept-item">
                  <AlertCircle className="vd-concept-icon" size={18} />
                  <div>
                    <div className="vd-concept-label">Problem</div>
                    <div className="vd-concept-text">{businessSections.problem}</div>
                  </div>
                </div>
              )}
              {businessSections.solution && (
                <div className="vd-concept-item">
                  <Lightbulb className="vd-concept-icon" size={18} />
                  <div>
                    <div className="vd-concept-label">Solution</div>
                    <div className="vd-concept-text">{businessSections.solution}</div>
                  </div>
                </div>
              )}
              {businessSections.revenue && (
                <div className="vd-concept-item">
                  <DollarSign className="vd-concept-icon" size={18} />
                  <div>
                    <div className="vd-concept-label">Revenue</div>
                    <div className="vd-concept-text">{businessSections.revenue}</div>
                  </div>
                </div>
              )}
              {businessSections.edge && (
                <div className="vd-concept-item">
                  <Zap className="vd-concept-icon" size={18} />
                  <div>
                    <div className="vd-concept-label">Edge</div>
                    <div className="vd-concept-text">{businessSections.edge}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Agent Console */}
        <motion.div
          className="vd-console-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="vd-console-header">
            <div className="vd-console-dot" />
            <span className="vd-console-title">Agent Console</span>
          </div>
          <div className="vd-console-content">
            {agentLogs.length > 0 ? (
              agentLogs.slice(-8).map((log, i) => (
                <div key={i} className="vd-console-line">{log}</div>
              ))
            ) : (
              <>
                <div className="vd-console-line">&gt; Initializing validation...</div>
                <div className="vd-console-line">&gt; Analyzing 7 pillars...</div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Overall Score Card */}
      <motion.div
        className="vd-overall-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{ maxWidth: '800px', margin: '0 auto 32px' }}
      >
        <div className="vd-overall-label">Overall Score</div>
        <UnifiedGauge
          score={overallScore || 0}
          size="large"
          showLabel={true}
          label={verdict}
        />
        <div className="vd-overall-mini-scores">
          {pillars.slice(0, 7).map((pillar) => (
            <div key={pillar.key} className="vd-mini-score">
              <div className="vd-mini-score-value">{pillar.score || 0}</div>
              <div className="vd-mini-score-label">{pillar.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pillar Grid */}
      <div className="vd-pillar-grid">
        {pillars.map((pillar, idx) => (
          <PillarCard
            key={pillar.key}
            pillar={pillar}
            onSourceClick={onSourceClick}
            delay={0.3 + idx * 0.05}
          />
        ))}
      </div>
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

      {/* Gauge - SAME SIZE FOR ALL */}
      <UnifiedGauge score={pillar.score || 0} size="medium" />

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
      <div className="vd-subcategory-sources">
        {subcategory.sources.map((source, idx) => {
          // Support both new API-based and legacy fields
          const iconKey = source.apiIcon || source.icon || 'globe';
          const IconComponent = API_ICONS[iconKey] || Globe;
          const displayName = source.apiName || source.name || source.type || 'Unknown';
          const displayColor = source.apiColor || source.color;
          
          return (
            <button
              key={idx}
              className={`vd-source-icon ${source.status === 'found' ? 'active' : source.status === 'pending' ? 'pending' : ''}`}
              onClick={() => source.status === 'found' && onSourceClick(source)}
              disabled={source.status !== 'found'}
              title={`${displayName}: ${source.title || source.status}`}
              style={source.status === 'found' && displayColor ? { borderColor: displayColor, color: displayColor } : undefined}
            >
              <IconComponent size={12} />
            </button>
          );
        })}
      </div>
      <span className="vd-subcategory-score">{subcategory.score || 0}</span>
    </div>
  );
}
