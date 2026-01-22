import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader2, ArrowRight } from 'lucide-react';

interface PipelineStage {
  name: string;
  status: 'pending' | 'in-progress' | 'complete' | 'idle' | 'coding';
  count?: string;
  progress?: number;
}

interface PipelineMonitorProps {
  problemsCount: number;
  problemsValidated: number;
  solutionsCount: number;
  solutionsValidated: number;
  requirementsCount: number;
  requirementsValidated: number;
  prdStatus: 'pending' | 'generating' | 'complete';
  autoCoderStatus: 'idle' | 'coding' | 'complete';
}

export default function PipelineMonitor({
  problemsCount,
  problemsValidated,
  solutionsCount,
  solutionsValidated,
  requirementsCount,
  requirementsValidated,
  prdStatus,
  autoCoderStatus,
}: PipelineMonitorProps) {
  const stages: PipelineStage[] = [
    {
      name: 'Problems',
      status: problemsValidated >= 3 ? 'complete' : problemsCount > 0 ? 'in-progress' : 'pending',
      count: `${problemsValidated}/${problemsCount}`,
      progress: problemsCount > 0 ? (problemsValidated / problemsCount) * 100 : 0,
    },
    {
      name: 'Solutions',
      status: solutionsValidated >= 2 ? 'complete' : solutionsCount > 0 ? 'in-progress' : 'pending',
      count: `${solutionsValidated}/${solutionsCount}`,
      progress: solutionsCount > 0 ? (solutionsValidated / solutionsCount) * 100 : 0,
    },
    {
      name: 'Requirements',
      status: requirementsValidated >= 2 ? 'complete' : requirementsCount > 0 ? 'in-progress' : 'pending',
      count: `${requirementsValidated}/${requirementsCount}`,
      progress: requirementsCount > 0 ? (requirementsValidated / requirementsCount) * 100 : 0,
    },
    {
      name: 'PRD',
      status: prdStatus === 'complete' ? 'complete' : prdStatus === 'generating' ? 'in-progress' : 'pending',
      progress: prdStatus === 'complete' ? 100 : prdStatus === 'generating' ? 50 : 0,
    },
    {
      name: 'Auto Code',
      status: autoCoderStatus === 'complete' ? 'complete' : autoCoderStatus === 'coding' ? 'in-progress' : 'idle',
      progress: autoCoderStatus === 'complete' ? 100 : autoCoderStatus === 'coding' ? 50 : 0,
    },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'complete') return <CheckCircle size={20} className="text-green-400" />;
    if (status === 'in-progress' || status === 'coding') return <Loader2 size={20} className="text-blue-400 animate-spin" />;
    return <Circle size={20} className="text-white/30" />;
  };

  return (
    <div className="glass-card p-6 border-blue-500/20">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
        Blueprint Pipeline
      </h3>

      <div className="flex items-center justify-between gap-4">
        {stages.map((stage, index) => (
          <div key={stage.name} className="flex items-center flex-1">
            {/* Stage Card */}
            <motion.div
              className={`relative flex-1 p-4 rounded-lg border transition-all ${
                stage.status === 'complete'
                  ? 'bg-green-500/10 border-green-400/30 shadow-green-400/20 shadow-lg'
                  : stage.status === 'in-progress' || stage.status === 'coding'
                  ? 'bg-blue-500/10 border-blue-400/30 shadow-blue-400/20 shadow-lg'
                  : 'bg-white/5 border-white/10'
              }`}
              animate={
                stage.status === 'in-progress' || stage.status === 'coding'
                  ? { boxShadow: ['0 0 10px rgba(59, 130, 246, 0.2)', '0 0 20px rgba(59, 130, 246, 0.4)', '0 0 10px rgba(59, 130, 246, 0.2)'] }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Blueprint corner marks */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/20" />
              <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/20" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/20" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/20" />

              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(stage.status)}
                <span className="text-sm font-medium text-white">{stage.name}</span>
              </div>

              {stage.count && (
                <p className="text-xs text-white/60 mb-2">{stage.count} validated</p>
              )}

              {/* Progress Ring */}
              {stage.progress !== undefined && (
                <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      stage.status === 'complete'
                        ? 'bg-green-400'
                        : stage.status === 'in-progress' || stage.status === 'coding'
                        ? 'bg-blue-400'
                        : 'bg-white/20'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </motion.div>

            {/* Connector Arrow */}
            {index < stages.length - 1 && (
              <div className="flex items-center justify-center px-2">
                <svg width="24" height="24" viewBox="0 0 24 24" className="text-white/20">
                  <path
                    d="M5 12h14M15 8l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
