import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import StatusIndicator from '@/components/StatusIndicator';
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
      className="min-h-screen bg-gradient-to-br from-yellow-500 to-amber-700 p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Processing Dashboard</h1>
            <p className="text-yellow-100">AI-powered hypothesis generation and validation</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusIndicator status={isProcessing ? 'processing' : isOnline ? 'online' : 'offline'} />
            <span className="text-sm font-medium text-white">
              {isProcessing ? 'Processing' : isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Content - Three Columns */}
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </motion.div>
  );
}
