'use client';

import '@/styles/glassmorphism.css';
import { motion } from 'framer-motion';
import { Settings, Database, Cpu, Shield } from 'lucide-react';
import APIStatusPanel from '@/components/admin/APIStatusPanel';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Settings size={24} className="text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">API Connections & System Status</p>
            </div>
          </div>
        </motion.header>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <NavTab icon={<Database size={18} />} label="API Hub" active />
          <NavTab icon={<Cpu size={18} />} label="System" disabled />
          <NavTab icon={<Shield size={18} />} label="Security" disabled />
        </motion.div>

        {/* Main Panel */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-white">API Connection Hub</h2>
                <p className="text-sm text-gray-400">
                  Monitor and test all external API connections. APIs are auto-discovered from the registry.
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wide">Registry Path</div>
                <code className="text-xs text-amber-400 font-mono">lib/api-registry/index.ts</code>
              </div>
            </div>

            <APIStatusPanel />
          </div>
        </motion.main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>
            To add a new API: Edit <code className="text-amber-400/70">lib/api-registry/index.ts</code> and create the search function in <code className="text-amber-400/70">lib/research/apis/</code>
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

function NavTab({ icon, label, active, disabled }: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          : disabled
          ? 'bg-white/5 text-gray-600 cursor-not-allowed'
          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
