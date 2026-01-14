'use client';

import { useState } from 'react';
import { Hypothesis } from '@/types/project';

interface LandingPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Hypothesis[];
  solutions: Hypothesis[];
  niche: string;
  html: string;
}

export default function LandingPageModal({
  isOpen,
  onClose,
  problems,
  solutions,
  niche,
  html
}: LandingPageModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${niche.replace(/\s+/g, '-').toLowerCase()}-landing-page.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 w-full max-w-6xl h-[90vh] flex flex-col font-mono">
        {/* Header */}
        <div className="border-b border-gray-700 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-white text-lg font-normal">Landing Page Generated</h2>
            <p className="text-gray-500 text-xs mt-1">
              {problems.length} problems + {solutions.length} solutions → {niche}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 flex">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 text-sm transition-colors ${
              activeTab === 'preview'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-6 py-3 text-sm transition-colors ${
              activeTab === 'code'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Code
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'preview' ? (
            <iframe
              srcDoc={html}
              className="w-full h-full bg-white border-2 border-gray-600"
              title="Landing Page Preview"
            />
          ) : (
            <pre className="p-4 text-xs text-gray-300 overflow-auto h-full">
              <code>{html}</code>
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-700 p-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Self-contained HTML • No external dependencies
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-black text-sm rounded transition-colors font-medium"
            >
              Download HTML
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
