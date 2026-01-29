'use client';

import { motion } from 'framer-motion';
import { FileText, Copy, Download, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import GlassCard from '@/components/GlassCard';
import { pageVariants } from '@/lib/animations';
import { toast } from 'sonner';

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
}

const SECTIONS = [
  { key: 'executive_summary', label: 'Executive Summary' },
  { key: 'market_and_sales', label: 'Market and Sales Strategy' },
  { key: 'team_and_operations', label: 'Team and Operations' },
  { key: 'financial_plan', label: 'Financial Plan' },
];

export default function BusinessPlanSection({
  businessPlan,
  isGenerating,
  onGenerate,
  canGenerate,
}: BusinessPlanSectionProps) {
  const [copied, setCopied] = useState(false);
  const [revealedSections, setRevealedSections] = useState<string[]>([]);
  const [typewriterTexts, setTypewriterTexts] = useState<Record<string, string>>({});
  const [isRevealing, setIsRevealing] = useState(false);
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
      `## ${s.label}\n\n${businessPlan[s.key as keyof typeof businessPlan]}`
    ).join('\n\n---\n\n');
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    toast.success('Business plan copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!businessPlan) return;
    const fullText = SECTIONS.map(s => 
      `## ${s.label}\n\n${businessPlan[s.key as keyof typeof businessPlan]}`
    ).join('\n\n---\n\n');
    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-plan.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Business plan downloaded');
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

        {/* Action Buttons */}
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

          {businessPlan && !isRevealing && (
            <>
              <button
                onClick={handleCopy}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
              >
                <Copy size={20} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-semibold text-white transition-all flex items-center gap-2"
              >
                <Download size={20} />
                Download
              </button>
            </>
          )}
        </div>

        {/* Business Plan Content */}
        <div ref={contentRef} className="space-y-6 max-h-[70vh] overflow-y-auto">
          {isGenerating ? (
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 bg-white/10 rounded animate-pulse"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          ) : businessPlan ? (
            SECTIONS.map((section) => {
              if (!revealedSections.includes(section.key)) return null;

              const displayText = typewriterTexts[section.key] || '';
              const fullText = businessPlan[section.key as keyof typeof businessPlan] || '';

              return (
                <motion.div
                  key={section.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <GlassCard className="p-6 space-y-3">
                    <h2 className="text-lg font-bold text-emerald-400 uppercase">{section.label}</h2>
                    <div
                      className="text-base text-white/90 leading-relaxed prose prose-invert max-w-none"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: displayText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
                    />
                    {displayText.length < fullText.length && (
                      <span className="inline-block w-2 h-5 bg-orange-400 ml-1 animate-pulse" />
                    )}
                  </GlassCard>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 text-white/60">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No business plan generated yet. Click &quot;Generate Business Plan&quot; to create one.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
