'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileJson, FileText, Table, Link2, Check, Copy } from 'lucide-react';
import { Hypothesis } from '@/types/project';
import {
  downloadJSON,
  downloadCSV,
  downloadMarkdown,
  downloadHTML,
  generateShareableLink,
  copyToClipboard,
} from '@/lib/export';
import { toast } from 'sonner';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  niche: string;
  hypotheses: Hypothesis[];
  solutions: Hypothesis[];
  prdContent?: string;
  landingPageHTML?: string;
}

type ExportOption = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  action: () => void;
  disabled?: boolean;
};

export function ExportModal({
  isOpen,
  onClose,
  niche,
  hypotheses,
  solutions,
  prdContent,
  landingPageHTML,
}: ExportModalProps) {
  const [copied, setCopied] = useState(false);

  const exportData = {
    niche,
    hypotheses,
    solutions,
    exportedAt: new Date().toISOString(),
  };

  const validatedCount = [...hypotheses, ...solutions].filter(
    h => h.confidence && h.confidence >= 90
  ).length;

  const handleShare = async () => {
    const link = generateShareableLink(exportData);
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  const exportOptions: ExportOption[] = [
    {
      id: 'json',
      label: 'Export JSON',
      description: 'Full hypothesis data with metadata',
      icon: <FileJson size={20} />,
      format: '.json',
      action: () => {
        downloadJSON(exportData, `curatos-${niche.replace(/\s+/g, '-')}`);
        toast.success('JSON exported successfully');
      },
    },
    {
      id: 'csv',
      label: 'Export CSV',
      description: `${validatedCount} validated hypotheses`,
      icon: <Table size={20} />,
      format: '.csv',
      action: () => {
        downloadCSV([...hypotheses, ...solutions], `validated-${niche.replace(/\s+/g, '-')}`);
        toast.success('CSV exported successfully');
      },
      disabled: validatedCount === 0,
    },
    {
      id: 'prd',
      label: 'Export PRD',
      description: 'Product Requirements Document',
      icon: <FileText size={20} />,
      format: '.md',
      action: () => {
        if (prdContent) {
          downloadMarkdown(prdContent, `prd-${niche.replace(/\s+/g, '-')}`);
          toast.success('PRD exported successfully');
        }
      },
      disabled: !prdContent,
    },
    {
      id: 'html',
      label: 'Export Landing Page',
      description: 'Self-contained HTML file',
      icon: <Download size={20} />,
      format: '.html',
      action: () => {
        if (landingPageHTML) {
          downloadHTML(landingPageHTML, `landing-${niche.replace(/\s+/g, '-')}`);
          toast.success('Landing page exported successfully');
        }
      },
      disabled: !landingPageHTML,
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6 font-mono"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-title"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id="export-title" className="text-lg text-green-400 font-bold">
              Export & Share
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Share Link */}
          <div className="mb-6 p-4 bg-black/50 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Shareable Link</span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Share your research with others (top 10 hypotheses included)
            </p>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            {exportOptions.map(option => (
              <button
                key={option.id}
                onClick={option.action}
                disabled={option.disabled}
                className={`w-full p-4 rounded-lg border transition-all flex items-center gap-4 text-left ${
                  option.disabled
                    ? 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                    : 'border-gray-700 hover:border-green-500/50 hover:bg-gray-800/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${option.disabled ? 'bg-gray-800' : 'bg-green-500/20'}`}>
                  <span className={option.disabled ? 'text-gray-600' : 'text-green-400'}>
                    {option.icon}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-200">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
                <span className="text-xs text-gray-600 font-mono">{option.format}</span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-500">
            <span>{hypotheses.length + solutions.length} total hypotheses</span>
            <span>{validatedCount} validated (80%+)</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
