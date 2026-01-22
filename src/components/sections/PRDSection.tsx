import { motion } from 'framer-motion';
import { FileText, Copy, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { pageVariants } from '@/lib/animations';
import { toast } from 'sonner';

interface PRDSectionProps {
  prdContent: string;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

export default function PRDSection({
  prdContent,
  isGenerating,
  onGenerate,
  canGenerate,
}: PRDSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prdContent);
    setCopied(true);
    toast.success('PRD copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([prdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-requirements.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('PRD downloaded');
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
          <h1 className="text-4xl font-bold text-white mb-2">Product Requirements Document</h1>
          <p className="text-emerald-100">Generate comprehensive PRD from validated research</p>
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
                Generating PRD...
              </>
            ) : (
              <>
                <FileText size={20} />
                Generate PRD
              </>
            )}
          </button>

          {prdContent && (
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

        {/* PRD Content */}
        <GlassCard className="p-6">
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
          ) : prdContent ? (
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-white/90 font-mono">
                {prdContent}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-white/60">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No PRD generated yet. Click &quot;Generate PRD&quot; to create one.</p>
            </div>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}
