import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import QualityIndicator from '@/components/QualityIndicator';
import DNAHelixFlow from '@/components/dashboard/DNAHelixFlow';
import { pageVariants } from '@/lib/animations';

interface InputDashboardProps {
  niche: string;
  geography: string;
  onNicheChange: (niche: string) => void;
  onGeographyChange: (geo: string) => void;
  onStartProcessing: () => void;
  isProcessing: boolean;
  // Pipeline monitor props
  problemsCount: number;
  problemsValidated: number;
  solutionsCount: number;
  solutionsValidated: number;
  requirementsCount: number;
  requirementsValidated: number;
  prdStatus: 'pending' | 'generating' | 'complete';
  autoCoderStatus: 'idle' | 'coding' | 'complete';
}

const NICHE_OPTIONS = [
  'AI/ML Tools',
  'SaaS',
  'E-commerce',
  'FinTech',
  'HealthTech',
  'EdTech',
  'Developer Tools',
  'Marketing',
  'Productivity',
  'Other',
];

const GEOGRAPHY_OPTIONS = [
  'Global',
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East',
  'Africa',
];

export default function InputDashboard({
  niche,
  geography,
  onNicheChange,
  onGeographyChange,
  onStartProcessing,
  isProcessing,
  problemsCount,
  problemsValidated,
  solutionsCount,
  solutionsValidated,
  requirementsCount,
  requirementsValidated,
  prdStatus,
  autoCoderStatus,
}: InputDashboardProps) {
  const nicheQuality = niche ? 100 : 0;
  const geographyQuality = geography ? 100 : 0;
  const canStart = niche && geography;

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 p-4 sm:p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Input Configuration</h1>
          <p className="text-blue-200 text-sm sm:text-base">Configure your research parameters</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Card */}
          <div className="space-y-6">
            <GlassCard className="p-6 space-y-6">
              {/* Market Niche Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Market Niche</label>
                  <QualityIndicator value={nicheQuality} />
                </div>
                <select
                  value={niche}
                  onChange={(e) => onNicheChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="" className="bg-gray-800">Select a market niche...</option>
                  {NICHE_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-gray-800">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Geography Dropdown */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-white">Target Geography</label>
                  <QualityIndicator value={geographyQuality} />
                </div>
                <select
                  value={geography}
                  onChange={(e) => onGeographyChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                  }}
                >
                  <option value="" className="bg-gray-800">Select target geography...</option>
                  {GEOGRAPHY_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-gray-800">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Button */}
              <motion.button
                onClick={onStartProcessing}
                disabled={!canStart || isProcessing}
                className={`w-full py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  canStart && !isProcessing
                    ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
                whileHover={canStart && !isProcessing ? { scale: 1.02 } : {}}
                whileTap={canStart && !isProcessing ? { scale: 0.98 } : {}}
              >
                <Sparkles size={20} />
                {isProcessing ? 'Processing...' : 'Start Processing'}
              </motion.button>
            </GlassCard>
          </div>

          {/* DNA Helix Flow */}
          <div>
            <DNAHelixFlow
              problemsCount={problemsCount}
              problemsValidated={problemsValidated}
              solutionsCount={solutionsCount}
              solutionsValidated={solutionsValidated}
              requirementsCount={requirementsCount}
              requirementsValidated={requirementsValidated}
              prdStatus={prdStatus}
              autoCoderStatus={autoCoderStatus}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
