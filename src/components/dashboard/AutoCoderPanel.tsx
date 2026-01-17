'use client';

import { useState } from 'react';

interface GeneratedDNA {
  requirements: string[];
  [key: string]: any;
}

interface FeatureItem {
  id: string;
  category: string;
  section: string;
  description: string;
  steps: string[];
  passes: number;
}

interface AutoCoderPanelProps {
  generatedDNA: GeneratedDNA;
}

export default function AutoCoderPanel({ generatedDNA }: AutoCoderPanelProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const transformToFeatureList = (): FeatureItem[] => {
    return generatedDNA.requirements.map((req, index) => ({
      id: `feature_${index + 1}`,
      category: 'core',
      section: 'implementation',
      description: req,
      steps: [
        'Analyze requirement',
        'Design implementation',
        'Write code',
        'Test functionality'
      ],
      passes: 0
    }));
  };

  const handleExport = () => {
    setIsProcessing(true);
    
    const featureList = transformToFeatureList();
    const jsonData = JSON.stringify(featureList, null, 2);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feature_list.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsProcessing(false), 1000);
  };

  return (
    <div className="bg-black border border-green-500 rounded-lg p-6 font-mono text-green-400 shadow-lg shadow-green-500/20">
      {/* Header */}
      <div className="border-b border-green-500 pb-4 mb-6">
        <h2 className="text-xl font-bold text-white mb-2">
          ╔═══════════════════════════════════════╗
        </h2>
        <h2 className="text-xl font-bold text-white text-center">
          ║         AUTO-CODER PANEL            ║
        </h2>
        <h2 className="text-xl font-bold text-white">
          ╚═══════════════════════════════════════╝
        </h2>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="text-green-300 mb-2">
          &gt; SYSTEM STATUS: <span className="text-white">READY</span>
        </div>
        <div className="text-green-300">
          &gt; REQUIREMENTS LOADED: <span className="text-white">{generatedDNA.requirements.length}</span>
        </div>
      </div>

      {/* Requirements Preview */}
      <div className="mb-6">
        <div className="text-green-300 mb-2">&gt; FEATURE PREVIEW:</div>
        <div className="bg-gray-900 border border-green-600 p-3 max-h-40 overflow-y-auto">
          {generatedDNA.requirements.slice(0, 3).map((req, index) => (
            <div key={index} className="text-green-400 text-sm mb-1">
              [{String(index + 1).padStart(2, '0')}] {req.substring(0, 60)}...
            </div>
          ))}
          {generatedDNA.requirements.length > 3 && (
            <div className="text-white text-sm">
              ... and {generatedDNA.requirements.length - 3} more features
            </div>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="text-center">
        <button
          onClick={handleExport}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-black font-bold py-3 px-8 border-2 border-green-400 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/50"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⚡</span>
              PROCESSING...
            </span>
          ) : (
            '[ EXPORT FEATURE_LIST.JSON ]'
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-green-500 text-center text-green-600 text-sm">
        CURATOS AUTO-CODER v1.0 | READY FOR AUTONOMOUS DEVELOPMENT
      </div>
    </div>
  );
}
