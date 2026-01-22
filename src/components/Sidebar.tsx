import { motion } from 'framer-motion';
import { LayoutDashboard, Brain, FileText, Code2 } from 'lucide-react';
import { SectionKey } from '@/lib/colors';
import '@/styles/glassmorphism.css';

interface SidebarProps {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
}

const SECTIONS = [
  { key: 'INPUT' as SectionKey, icon: LayoutDashboard, label: 'Input' },
  { key: 'PROCESSING' as SectionKey, icon: Brain, label: 'Processing' },
  { key: 'PRD' as SectionKey, icon: FileText, label: 'PRD' },
  { key: 'AUTOCODER' as SectionKey, icon: Code2, label: 'Auto Coder' },
];

export default function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <aside className="glass-sidebar fixed left-0 top-0 h-screen w-16 sm:w-20 flex flex-col items-center py-6 gap-6 z-50">
      {SECTIONS.map(({ key, icon: Icon, label }) => {
        const isActive = activeSection === key;
        return (
          <motion.button
            key={key}
            onClick={() => onSectionChange(key)}
            className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all ${
              isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={label}
          >
            <Icon size={24} className={isActive ? 'text-white' : 'text-gray-400'} />
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </aside>
  );
}
