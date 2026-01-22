import { motion } from 'framer-motion';
import { CheckCircle, Circle, Loader2, Brain, Lightbulb, FileText, Code2, Sparkles } from 'lucide-react';

interface DNAHelixFlowProps {
  problemsCount: number;
  problemsValidated: number;
  solutionsCount: number;
  solutionsValidated: number;
  requirementsCount: number;
  requirementsValidated: number;
  prdStatus: 'pending' | 'generating' | 'complete';
  autoCoderStatus: 'idle' | 'coding' | 'complete';
}

interface Stage {
  id: string;
  name: string;
  icon: any;
  status: 'pending' | 'in-progress' | 'complete';
  count?: string;
  progress: number;
}

export default function DNAHelixFlow({
  problemsCount,
  problemsValidated,
  solutionsCount,
  solutionsValidated,
  requirementsCount,
  requirementsValidated,
  prdStatus,
  autoCoderStatus,
}: DNAHelixFlowProps) {
  const stages: Stage[] = [
    {
      id: 'problems',
      name: 'Problems',
      icon: Brain,
      status: problemsValidated >= 3 ? 'complete' : problemsCount > 0 ? 'in-progress' : 'pending',
      count: `${problemsValidated}/${problemsCount} validated`,
      progress: problemsCount > 0 ? (problemsValidated / problemsCount) * 100 : 0,
    },
    {
      id: 'solutions',
      name: 'Solutions',
      icon: Lightbulb,
      status: solutionsValidated >= 2 ? 'complete' : solutionsCount > 0 ? 'in-progress' : 'pending',
      count: `${solutionsValidated}/${solutionsCount} validated`,
      progress: solutionsCount > 0 ? (solutionsValidated / solutionsCount) * 100 : 0,
    },
    {
      id: 'requirements',
      name: 'Requirements',
      icon: Sparkles,
      status: requirementsValidated >= 2 ? 'complete' : requirementsCount > 0 ? 'in-progress' : 'pending',
      count: `${requirementsValidated}/${requirementsCount} validated`,
      progress: requirementsCount > 0 ? (requirementsValidated / requirementsCount) * 100 : 0,
    },
    {
      id: 'prd',
      name: 'PRD',
      icon: FileText,
      status: prdStatus === 'complete' ? 'complete' : prdStatus === 'generating' ? 'in-progress' : 'pending',
      count: prdStatus === 'complete' ? 'Complete' : prdStatus === 'generating' ? 'Generating...' : 'Pending',
      progress: prdStatus === 'complete' ? 100 : prdStatus === 'generating' ? 50 : 0,
    },
    {
      id: 'autocoder',
      name: 'Auto Coder',
      icon: Code2,
      status: autoCoderStatus === 'complete' ? 'complete' : autoCoderStatus === 'coding' ? 'in-progress' : 'pending',
      count: autoCoderStatus === 'complete' ? 'Complete' : autoCoderStatus === 'coding' ? 'Coding...' : 'Idle',
      progress: autoCoderStatus === 'complete' ? 100 : autoCoderStatus === 'coding' ? 50 : 0,
    },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'complete') return 'text-green-400 bg-green-500/20 border-green-500/50 shadow-green-500/50';
    if (status === 'in-progress') return 'text-blue-400 bg-blue-500/20 border-blue-500/50 shadow-blue-500/50';
    return 'text-white/30 bg-white/5 border-white/10';
  };

  const getProgressColor = (status: string) => {
    if (status === 'complete') return 'bg-green-400';
    if (status === 'in-progress') return 'bg-blue-400';
    return 'bg-white/20';
  };

  return (
    <div className="relative max-w-md mx-auto">
      {/* DNA Helix Title */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-400">
            <path d="M12 2L12 22M8 6C8 6 10 8 12 8C14 8 16 6 16 6M8 12C8 12 10 14 12 14C14 14 16 12 16 12M8 18C8 18 10 20 12 20C14 20 16 18 16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          DNA Helix Flow
        </h3>
        <p className="text-blue-200 text-sm">Track your pipeline progress</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Glowing backbone line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-blue-400/30 to-blue-500/50" />

        {/* DNA Helix decorative curves */}
        <svg className="absolute left-0 top-0 w-12 h-full opacity-20 pointer-events-none" viewBox="0 0 48 400">
          <path
            d="M24 0 Q36 50 24 100 Q12 150 24 200 Q36 250 24 300 Q12 350 24 400"
            stroke="url(#gradient)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="4 4"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Stages */}
        <div className="space-y-4 relative">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connection node */}
                <div className="absolute left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <motion.div
                    className={`w-3 h-3 rounded-full border-2 ${
                      stage.status === 'complete'
                        ? 'bg-green-400 border-green-400'
                        : stage.status === 'in-progress'
                        ? 'bg-blue-400 border-blue-400'
                        : 'bg-white/20 border-white/30'
                    }`}
                    animate={
                      stage.status === 'in-progress'
                        ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>

                {/* Stage Card */}
                <div className="ml-12 glass-card p-4 border-blue-500/20 hover:border-blue-500/40 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getStatusColor(stage.status)} transition-all`}>
                      {stage.status === 'complete' ? (
                        <CheckCircle size={20} />
                      ) : stage.status === 'in-progress' ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>

                    {/* Stage Info */}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm">{stage.name}</h4>
                      <p className="text-white/60 text-xs">{stage.count}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full ${getProgressColor(stage.status)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stage.progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
