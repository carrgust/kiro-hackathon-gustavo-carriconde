import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { pageVariants } from '@/lib/animations';

interface ProcessingSectionProps {
  children: ReactNode;
  isOnline: boolean;
  isProcessing: boolean;
}

export default function ProcessingSection({
  children,
  isOnline,
  isProcessing,
}: ProcessingSectionProps) {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-amber-900/20 via-slate-900 to-slate-950 p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Processing Dashboard</h1>
          <p className="text-amber-200/80">AI-powered hypothesis generation and validation</p>
        </div>

        {/* Content */}
        {children}
      </div>
    </motion.div>
  );
}
