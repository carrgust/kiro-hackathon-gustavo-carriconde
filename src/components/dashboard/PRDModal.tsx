'use client';

import { useState, useMemo } from 'react';
import { Hypothesis } from '@/types/project';

interface PRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  problems: Hypothesis[];
  solutions: Hypothesis[];
  niche: string;
  markdown: string;
}

interface Requirement {
  id: string;
  text: string;
  validated: boolean;
}

export default function PRDModal({
  isOpen,
  onClose,
  problems,
  solutions,
  niche,
  markdown
}: PRDModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);
  const [showBuildMessage, setShowBuildMessage] = useState(false);

  // Parse requirements from markdown
  const { functionalReqs, nonFunctionalReqs } = useMemo(() => {
    const frMatches = markdown.match(/FR-\d+:.*$/gm) || [];
    const nfrMatches = markdown.match(/NFR-\d+:.*$/gm) || [];

    return {
      functionalReqs: frMatches.map(req => ({
        id: req.match(/FR-\d+/)?.[0] || '',
        text: req,
        validated: false
      })),
      nonFunctionalReqs: nfrMatches.map(req => ({
        id: req.match(/NFR-\d+/)?.[0] || '',
        text: req,
        validated: false
      }))
    };
  }, [markdown]);

  const [frs, setFrs] = useState<Requirement[]>(functionalReqs);
  const [nfrs, setNfrs] = useState<Requirement[]>(nonFunctionalReqs);

  // Calculate validation stats
  const frValidated = frs.filter(r => r.validated).length;
  const nfrValidated = nfrs.filter(r => r.validated).length;
  const allValidated = frValidated === frs.length && nfrValidated === nfrs.length && frs.length > 0 && nfrs.length > 0;

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${niche.replace(/\s+/g, '-').toLowerCase()}-prd.md`;
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

  const toggleFR = (id: string) => {
    setFrs(prev => prev.map(r => r.id === id ? { ...r, validated: !r.validated } : r));
  };

  const toggleNFR = (id: string) => {
    setNfrs(prev => prev.map(r => r.id === id ? { ...r, validated: !r.validated } : r));
  };

  const handleBuild = () => {
    setShowBuildMessage(true);
    setTimeout(() => setShowBuildMessage(false), 3000);
  };

  // Simple markdown to HTML converter for preview
  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-cyan-400 mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-gray-300">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
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
            <h2 className="text-white text-lg font-normal">Product Requirements Document</h2>
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

        {/* Validation Status Bar */}
        {(frs.length > 0 || nfrs.length > 0) && (
          <div className="border-b border-gray-700 p-3 bg-gray-950 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${allValidated ? 'bg-green-500' : 'bg-gray-600'}`} />
                <span className="text-xs text-gray-400">
                  {allValidated ? 'All Requirements Validated' : 'Validation Incomplete'}
                </span>
              </div>
              <div className="text-xs text-gray-400">
                FRs: {frValidated}/{frs.length}
              </div>
              <div className="text-xs text-gray-400">
                NFRs: {nfrValidated}/{nfrs.length}
              </div>
            </div>
          </div>
        )}

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
            onClick={() => setActiveTab('raw')}
            className={`px-6 py-3 text-sm transition-colors ${
              activeTab === 'raw'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Raw Markdown
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 bg-gray-950">
          {activeTab === 'preview' ? (
            <div className="space-y-6">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
              />
              
              {/* Interactive Requirements Validation */}
              {frs.length > 0 && (
                <div className="mt-8 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Validate Functional Requirements</h3>
                  <div className="space-y-2">
                    {frs.map(req => (
                      <label key={req.id} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={req.validated}
                          onChange={() => toggleFR(req.id)}
                          className="mt-1 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <span className={`text-sm ${req.validated ? 'text-green-400' : 'text-gray-300'}`}>
                          {req.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {nfrs.length > 0 && (
                <div className="mt-6 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold text-cyan-400 mb-4">Validate Non-Functional Requirements</h3>
                  <div className="space-y-2">
                    {nfrs.map(req => (
                      <label key={req.id} className="flex items-start space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={req.validated}
                          onChange={() => toggleNFR(req.id)}
                          className="mt-1 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <span className={`text-sm ${req.validated ? 'text-green-400' : 'text-gray-300'}`}>
                          {req.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Build Button */}
              {(frs.length > 0 || nfrs.length > 0) && (
                <div className="mt-8 border-t border-gray-700 pt-6 text-center">
                  <button
                    onClick={handleBuild}
                    disabled={!allValidated}
                    className={`px-8 py-3 rounded font-mono font-normal transition-colors ${
                      allValidated
                        ? 'bg-cyan-600 hover:bg-cyan-700 text-black cursor-pointer'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    [ BUILD THIS SYSTEM ]
                  </button>
                  {showBuildMessage && (
                    <div className="mt-4 text-green-400 text-sm animate-pulse">
                      ✅ System ready for development!
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
              {markdown}
            </pre>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-700 p-4 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Markdown format • Ready for Notion, GitHub, or any markdown editor
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy Markdown'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-black text-sm rounded transition-colors font-medium"
            >
              Download .md
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
