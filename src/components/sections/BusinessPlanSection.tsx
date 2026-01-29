'use client';

import { motion } from 'framer-motion';
import { FileText, Copy, Loader2, Pencil } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import GlassCard from '@/components/GlassCard';
import { pageVariants } from '@/lib/animations';
import { toast } from 'sonner';

const PDFDownloadButton = dynamic(() => import('@/components/pdf/PDFDownloadButton'), { ssr: false });
const ExecutiveSummaryCharts = dynamic(() => import('@/components/BusinessPlanCharts').then(m => ({ default: m.ExecutiveSummaryCharts })), { ssr: false });
const MarketSalesCharts = dynamic(() => import('@/components/BusinessPlanCharts').then(m => ({ default: m.MarketSalesCharts })), { ssr: false });
const TeamOperationsCharts = dynamic(() => import('@/components/BusinessPlanCharts').then(m => ({ default: m.TeamOperationsCharts })), { ssr: false });
const FinancialPlanCharts = dynamic(() => import('@/components/BusinessPlanCharts').then(m => ({ default: m.FinancialPlanCharts })), { ssr: false });

interface BusinessPlanSectionProps {
  businessPlan: {
    executive_summary: string;
    market_and_sales: string;
    team_and_operations: string;
    financial_plan: string;
  } | null;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
  onUpdateSection?: (key: string, value: string) => void;
  chartData?: {
    market_breakdown: Array<{ name: string; value: number; color: string }>;
    revenue_projections: Array<{ year: string; revenue: number; costs: number }>;
    financial_table: Array<{ metric: string; value: string }>;
    key_metrics?: Array<{ label: string; value: string; icon?: string }>;
    competitive_landscape?: Array<{ name: string; [key: string]: any }>;
    channels?: Array<{ name: string; percentage: number }>;
    milestones?: Array<{ quarter: string; milestone: string }>;
    team_composition?: Array<{ role: string; count: number; color?: string }>;
  };
  ideaName?: string;
}

const SECTIONS = [
  { key: 'executive_summary', label: 'Executive Summary' },
  { key: 'market_and_sales', label: 'Market and Sales Strategy' },
  { key: 'team_and_operations', label: 'Team and Operations' },
  { key: 'financial_plan', label: 'Financial Plan' },
];

// Helper to render text with bold markers and line breaks safely
function renderFormattedText(text: string) {
  // Split by **bold** markers and newlines
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    const boldStart = remaining.indexOf('**');
    if (boldStart === -1) {
      // No more bold markers - render remaining with line breaks
      remaining.split('\n').forEach((line, i, arr) => {
        parts.push(<span key={keyIdx++}>{line}</span>);
        if (i < arr.length - 1) parts.push(<br key={keyIdx++} />);
      });
      break;
    }

    // Text before bold
    const before = remaining.substring(0, boldStart);
    if (before) {
      before.split('\n').forEach((line, i, arr) => {
        parts.push(<span key={keyIdx++}>{line}</span>);
        if (i < arr.length - 1) parts.push(<br key={keyIdx++} />);
      });
    }

    // Find closing **
    const boldEnd = remaining.indexOf('**', boldStart + 2);
    if (boldEnd === -1) {
      // No closing ** - render rest as-is
      const rest = remaining.substring(boldStart);
      rest.split('\n').forEach((line, i, arr) => {
        parts.push(<span key={keyIdx++}>{line}</span>);
        if (i < arr.length - 1) parts.push(<br key={keyIdx++} />);
      });
      break;
    }

    const boldText = remaining.substring(boldStart + 2, boldEnd);
    parts.push(<strong key={keyIdx++}>{boldText}</strong>);
    remaining = remaining.substring(boldEnd + 2);
  }

  return parts;
}

export default function BusinessPlanSection({
  businessPlan,
  isGenerating,
  onGenerate,
  canGenerate,
  onUpdateSection,
  chartData,
  ideaName,
}: BusinessPlanSectionProps) {
  const [copied, setCopied] = useState(false);
  const [revealedSections, setRevealedSections] = useState<string[]>([]);
  const [typewriterTexts, setTypewriterTexts] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editSectionText, setEditSectionText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('curatos_business_plan');
    if (saved && businessPlan) {
      setRevealedSections(SECTIONS.map(s => s.key));
      const allTexts: Record<string, string> = {};
      SECTIONS.forEach(s => { allTexts[s.key] = businessPlan[s.key as keyof typeof businessPlan] || ''; });
      setTypewriterTexts(allTexts);
    }
  }, []);

  // Sequential typewriter effect
  useEffect(() => {
    if (!businessPlan) return;

    // Save to localStorage
    localStorage.setItem('curatos_business_plan', JSON.stringify(businessPlan));

    // Check if already shown
    const saved = localStorage.getItem('curatos_business_plan_shown');
    if (saved === JSON.stringify(businessPlan)) {
      setRevealedSections(SECTIONS.map(s => s.key));
      const allTexts: Record<string, string> = {};
      SECTIONS.forEach(s => { allTexts[s.key] = businessPlan[s.key as keyof typeof businessPlan] || ''; });
      setTypewriterTexts(allTexts);
      return;
    }

    setIsRevealing(true);
    setRevealedSections([]);
    setTypewriterTexts({});

    SECTIONS.forEach((section, index) => {
      setTimeout(() => {
        setRevealedSections(prev => [...prev, section.key]);

        const text = businessPlan[section.key as keyof typeof businessPlan] || '';
        let charIndex = 0;
        const typeInterval = setInterval(() => {
          if (charIndex <= text.length) {
            setTypewriterTexts(prev => ({
              ...prev,
              [section.key]: text.substring(0, charIndex)
            }));
            charIndex++;

            if (contentRef.current) {
              contentRef.current.scrollTop = contentRef.current.scrollHeight;
            }
          } else {
            clearInterval(typeInterval);
            if (index === SECTIONS.length - 1) {
              setIsRevealing(false);
            }
          }
        }, 15);
      }, index * 600);
    });

    localStorage.setItem('curatos_business_plan_shown', JSON.stringify(businessPlan));
  }, [businessPlan]);

  const handleCopy = async () => {
    if (!businessPlan) return;
    const fullText = SECTIONS.map(s =>
      `## ${s.label}\n\n${typewriterTexts[s.key] || businessPlan[s.key as keyof typeof businessPlan]}`
    ).join('\n\n---\n\n');
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Business plan copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-emerald-500 to-green-800 p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Business Plan</h1>
          <p className="text-emerald-100">AI-generated lean business plan from validated research</p>
        </div>

        {isGenerating ? (
          <GlassCard className="p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-white/10 rounded animate-pulse"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </GlassCard>
        ) : businessPlan ? (
          <div ref={contentRef} style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
            <GlassCard className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Business Plan (4 Sections)</label>
                <div className="space-y-4">
                  {SECTIONS.map((section) => {
                    if (!revealedSections.includes(section.key)) return null;

                    const displayText = typewriterTexts[section.key] || '';
                    const fullText = businessPlan[section.key as keyof typeof businessPlan] || '';

                    return (
                      <motion.div
                        key={section.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-emerald-400 uppercase">{section.label}</h3>
                          {!isRevealing && (
                            <button
                              onClick={() => { setEditingSection(section.key); setEditSectionText(fullText); }}
                              className="text-white/60 hover:text-white transition-colors"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                        </div>
                        {editingSection === section.key ? (
                          <div className="space-y-2">
                            <textarea
                              value={editSectionText}
                              onChange={(e) => setEditSectionText(e.target.value)}
                              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                              rows={6}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setTypewriterTexts(prev => ({ ...prev, [section.key]: editSectionText }));
                                  if (onUpdateSection) onUpdateSection(section.key, editSectionText);
                                  setEditingSection(null);
                                }}
                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded"
                              >Save</button>
                              <button
                                onClick={() => setEditingSection(null)}
                                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded"
                              >Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p
                            className="text-base text-white/90 leading-relaxed"
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                          >
                            {renderFormattedText(displayText)}
                            {displayText.length < fullText.length && (
                              <span className="inline-block w-2 h-5 bg-orange-400 ml-1 animate-pulse" />
                            )}
                          </p>
                        )}

                        {/* Inline section charts */}
                        {!isRevealing && chartData && section.key === 'executive_summary' && (
                          <ExecutiveSummaryCharts chartData={chartData} />
                        )}
                        {!isRevealing && chartData && section.key === 'market_and_sales' && (
                          <MarketSalesCharts chartData={chartData} />
                        )}
                        {!isRevealing && chartData && section.key === 'team_and_operations' && (
                          <TeamOperationsCharts chartData={chartData} />
                        )}
                        {!isRevealing && chartData && section.key === 'financial_plan' && (
                          <FinancialPlanCharts chartData={chartData} />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {!isRevealing && (
                <div className="flex gap-3 pt-2">
                  <motion.button
                    onClick={onGenerate}
                    disabled={!canGenerate || isGenerating}
                    className="flex-1 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FileText size={18} />
                    Regenerate
                  </motion.button>
                  <motion.button
                    onClick={handleCopy}
                    className="px-6 py-3 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 bg-white/10 border border-white/20 hover:bg-white/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Copy size={18} />
                    {copied ? 'Copied!' : 'Copy'}
                  </motion.button>
                  {businessPlan && (
                    <PDFDownloadButton
                      businessPlan={businessPlan}
                      chartData={chartData}
                      ideaName={ideaName || 'Business'}
                    />
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        ) : (
          <GlassCard className="p-6">
            <div className="text-center py-12 text-white/60">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No business plan generated yet. Click &quot;Generate Business Plan&quot; to create one.</p>
            </div>
          </GlassCard>
        )}

        {/* Generate button always visible when no plan */}
        {!businessPlan && (
          <div className="flex gap-4">
            <button
              onClick={onGenerate}
              disabled={!canGenerate || isGenerating}
              className={`flex-1 py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                canGenerate && !isGenerating
                  ? 'bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 shadow-lg hover:shadow-xl'
                  : 'bg-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating Business Plan...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Generate Business Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
