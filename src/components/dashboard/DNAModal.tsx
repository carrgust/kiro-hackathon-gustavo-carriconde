import { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-normal text-green-400 font-mono">DNA GENERATED</h2>
              <p className="text-gray-400 text-sm mt-1">
                {dna.niche.toUpperCase()} • {formatDate(dna.generatedAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 text-xl"
            >
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('dna')}
              className={`px-4 py-2 font-mono text-sm transition-colors ${
                activeTab === 'dna'
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              DNA ANALYSIS
            </button>
            <button
              onClick={() => setActiveTab('autocoder')}
              className={`px-4 py-2 font-mono text-sm transition-colors ${
                activeTab === 'autocoder'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              AUTO-CODER
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'dna' ? (
            <div>
              {/* Problems Section */}
          <div className="mb-6">
            <h3 className="text-lg font-normal text-cyan-400 mb-3 font-mono">
              VALIDATED PROBLEMS ({dna.problems.length})
            </h3>
            <div className="space-y-2">
              {dna.problems.map((problem) => (
                <div key={problem.id} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded">
                  <span className="text-green-400">●</span>
                  <span className="text-gray-300 flex-1">{problem.text}</span>
                  <span className="text-green-400 text-sm font-mono">{problem.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Section */}
          <div className="mb-6">
            <h3 className="text-lg font-normal text-cyan-400 mb-3 font-mono">
              VALIDATED SOLUTIONS ({dna.solutions.length})
            </h3>
            <div className="space-y-2">
              {dna.solutions.map((solution) => (
                <div key={solution.id} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded">
                  <span className="text-green-400">●</span>
                  <span className="text-gray-300 flex-1">{solution.text}</span>
                  <span className="text-green-400 text-sm font-mono">{solution.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements Section */}
          <div className="mb-6">
            <h3 className="text-lg font-normal text-cyan-400 mb-3 font-mono">
              REQUIREMENTS ({dna.requirements.length})
            </h3>
            <div className="space-y-2">
              {dna.requirements.map((req) => (
                <div key={req.id} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded">
                  <span className="text-green-400">●</span>
                  <span className="text-gray-300 flex-1">{req.text}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    req.type === 'functional' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                  }`}>
                    [{req.type === 'functional' ? 'F' : 'NF'}]
                  </span>
                  <span className="text-green-400 text-sm font-mono">{req.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Token Cost Summary */}
          <div className="mb-6 p-4 bg-gray-800/30 rounded border border-gray-700">
            <h3 className="text-sm font-normal text-yellow-400 mb-2 font-mono">TOKEN COST SUMMARY</h3>
            <div className="text-sm text-gray-300 font-mono">
              Total tokens spent: {dna.tokenCost.toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {onGenerateLandingPage && (
              <button
                onClick={onGenerateLandingPage}
                disabled={isGeneratingLandingPage}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-black py-3 px-6 rounded font-mono font-normal transition-colors"
              >
                {isGeneratingLandingPage ? 'GENERATING...' : 'GENERATE LANDING PAGE'}
              </button>
            )}
            {onGeneratePRD && (
              <button
                onClick={onGeneratePRD}
                disabled={isGeneratingPRD}
                className="flex-1 border-2 border-cyan-600 hover:bg-cyan-600/10 disabled:border-gray-700 disabled:cursor-not-allowed text-cyan-400 py-3 px-6 rounded font-mono font-normal transition-colors"
              >
                {isGeneratingPRD ? 'GENERATING...' : 'GENERATE PRD'}
              </button>
            )}
            <button
              onClick={onStartBuild}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded font-mono font-normal transition-colors"
            >
              START BUILD
            </button>
            <button
              onClick={onExport}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 py-3 px-6 rounded font-mono transition-colors"
            >
              EXPORT
            </button>
          </div>
            </div>
          ) : (
            <AutoCoderPanel generatedDNA={{ requirements: dna.requirements.map(r => r.text) }} />
          )}
        </div>
      </div>
    </div>
  );
}
