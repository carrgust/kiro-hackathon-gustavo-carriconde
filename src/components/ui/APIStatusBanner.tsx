'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface APIStatusBannerProps {
  error?: string | null;
  onDismiss?: () => void;
}

export function APIStatusBanner({ error, onDismiss }: APIStatusBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible || !error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-red-900/90 border-b border-red-700 px-4 py-2 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-400" />
        <span className="text-red-200 text-sm font-mono">[ERROR] {error}</span>
      </div>
      <button onClick={() => { setVisible(false); onDismiss?.(); }} className="text-red-400 hover:text-red-200">
        <X size={16} />
      </button>
    </motion.div>
  );
}
