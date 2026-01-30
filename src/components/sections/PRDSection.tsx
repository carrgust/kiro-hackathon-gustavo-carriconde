'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Users, BookOpen, Cpu, Shield, ChevronDown, ChevronUp, Copy, Download, Check } from 'lucide-react';
import { useState } from 'react';

// TypeScript interfaces for structured PRD data
export interface TargetUser {
  id: string;
  persona: string;
  age_range: string;
  description: string;
  pain_points: string[];
  primary_need: string;
}

export interface UserStory {
  id: string;
  persona_id: string;
  story: string;
  acceptance_criteria: string[];
}

export interface FunctionalRequirement {
  id: string;
  name: string;
  description: string;
  story_ids: string[];
  priority: number;
}

export interface NonFunctionalRequirement {
  id: string;
  name: string;
  category: string;
  description: string;
  target: string;
  applies_to: string[];
}

export interface PRDData {
  executive_summary: string;
  target_users: TargetUser[];
  user_stories: UserStory[];
  functional_requirements: FunctionalRequirement[];
  non_functional_requirements: NonFunctionalRequirement[];
}

interface PRDSectionProps {
  prdData: PRDData | null;
  isGenerating: boolean;
  onGenerate: () => void;
  canGenerate: boolean;
}

// Section config
const SECTIONS = [
  { key: 'executive_summary' as const, label: 'Executive Summary', icon: FileText, color: 'cyan' },
  { key: 'target_users' as const, label: 'Target Users & Personas', icon: Users, color: 'cyan' },
  { key: 'user_stories' as const, label: 'User Stories', icon: BookOpen, color: 'cyan' },
  { key: 'functional_requirements' as const, label: 'Functional Requirements', icon: Cpu, color: 'cyan' },
  { key: 'non_functional_requirements' as const, label: 'Non-Functional Requirements', icon: Shield, color: 'cyan' },
];

export default function PRDSection({ prdData, isGenerating, onGenerate, canGenerate }: PRDSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(SECTIONS.map(s => s.key)));
  const [copied, setCopied] = useState(false);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleCopy = () => {
    if (!prdData) return;
    navigator.clipboard.writeText(JSON.stringify(prdData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!prdData) return;
    const blob = new Blob([JSON.stringify(prdData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prd.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Product Requirements Document</h1>
        <p className="text-gray-400">MVP PRD with traceability — Users → Stories → Requirements</p>
      </div>

      {/* Generate Button */}
      {!prdData && (
        <motion.button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          whileHover={canGenerate && !isGenerating ? { scale: 1.02 } : {}}
          whileTap={canGenerate && !isGenerating ? { scale: 0.98 } : {}}
        >
          <FileText size={20} />
          {isGenerating ? 'Generating PRD...' : 'Generate PRD'}
        </motion.button>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-400 font-medium">Analyzing business data and generating structured PRD...</p>
        </div>
      )}

      {/* PRD Content */}
      {prdData && (
        <>
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <motion.button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy JSON'}
            </motion.button>
            <motion.button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={16} />
              Download .json
            </motion.button>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {SECTIONS.map(({ key, label, icon: Icon }) => {
              const isExpanded = expandedSections.has(key);
              return (
                <motion.div
                  key={key}
                  className="rounded-xl border border-cyan-500/20 overflow-hidden"
                  style={{ background: 'rgba(6, 182, 212, 0.05)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className="text-cyan-400" />
                      <span className="text-lg font-semibold text-white">{label}</span>
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 pb-6"
                      >
                        {key === 'executive_summary' && (
                          <p className="text-gray-300 leading-relaxed">{prdData.executive_summary}</p>
                        )}

                        {key === 'target_users' && (
                          <div className="grid gap-4">
                            {prdData.target_users.map((user) => (
                              <div key={user.id} className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyan-500/20 text-cyan-300">{user.id}</span>
                                  <span className="text-white font-semibold">{user.persona}</span>
                                  <span className="text-gray-500 text-sm">({user.age_range})</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{user.description}</p>
                                <div className="mb-2">
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Pain Points:</span>
                                  <ul className="mt-1 space-y-1">
                                    {user.pain_points.map((p, i) => (
                                      <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                        <span className="text-red-400 mt-0.5">•</span>{p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Primary Need:</span>
                                  <p className="text-cyan-300 text-sm mt-1">{user.primary_need}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {key === 'user_stories' && (
                          <div className="space-y-4">
                            {prdData.user_stories.map((story) => (
                              <div key={story.id} className="rounded-lg border border-white/10 p-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyan-500/20 text-cyan-300">{story.id}</span>
                                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-white/10 text-gray-400">→ {story.persona_id}</span>
                                </div>
                                <p className="text-gray-300 text-sm italic mb-3">&ldquo;{story.story}&rdquo;</p>
                                <div>
                                  <span className="text-xs text-gray-500 uppercase tracking-wide">Acceptance Criteria:</span>
                                  <ul className="mt-1 space-y-1">
                                    {story.acceptance_criteria.map((ac, i) => (
                                      <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                        <span className="text-emerald-400 mt-0.5">✓</span>{ac}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {key === 'functional_requirements' && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 uppercase text-xs tracking-wide border-b border-white/10">
                                  <th className="pb-2 pr-4">ID</th>
                                  <th className="pb-2 pr-4">Priority</th>
                                  <th className="pb-2 pr-4">Name</th>
                                  <th className="pb-2 pr-4">Description</th>
                                  <th className="pb-2">Stories</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prdData.functional_requirements.map((fr) => (
                                  <tr key={fr.id} className="border-b border-white/5">
                                    <td className="py-3 pr-4 font-mono text-cyan-300">{fr.id}</td>
                                    <td className="py-3 pr-4">
                                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300">P{fr.priority}</span>
                                    </td>
                                    <td className="py-3 pr-4 text-white font-medium">{fr.name}</td>
                                    <td className="py-3 pr-4 text-gray-400">{fr.description}</td>
                                    <td className="py-3">
                                      <div className="flex gap-1 flex-wrap">
                                        {fr.story_ids.map((sid) => (
                                          <span key={sid} className="px-1.5 py-0.5 text-xs font-mono rounded bg-white/10 text-gray-400">{sid}</span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {key === 'non_functional_requirements' && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-left text-gray-500 uppercase text-xs tracking-wide border-b border-white/10">
                                  <th className="pb-2 pr-4">ID</th>
                                  <th className="pb-2 pr-4">Category</th>
                                  <th className="pb-2 pr-4">Name</th>
                                  <th className="pb-2 pr-4">Target</th>
                                  <th className="pb-2">Applies To</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prdData.non_functional_requirements.map((nfr) => (
                                  <tr key={nfr.id} className="border-b border-white/5">
                                    <td className="py-3 pr-4 font-mono text-cyan-300">{nfr.id}</td>
                                    <td className="py-3 pr-4">
                                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                        nfr.category === 'Performance' ? 'bg-blue-500/20 text-blue-300' :
                                        nfr.category === 'Security' ? 'bg-red-500/20 text-red-300' :
                                        nfr.category === 'Accessibility' ? 'bg-purple-500/20 text-purple-300' :
                                        'bg-gray-500/20 text-gray-300'
                                      }`}>{nfr.category}</span>
                                    </td>
                                    <td className="py-3 pr-4 text-white font-medium">{nfr.name}</td>
                                    <td className="py-3 pr-4 text-emerald-300 font-mono text-xs">{nfr.target}</td>
                                    <td className="py-3">
                                      <div className="flex gap-1 flex-wrap">
                                        {nfr.applies_to.map((ref) => (
                                          <span key={ref} className="px-1.5 py-0.5 text-xs font-mono rounded bg-white/10 text-gray-400">{ref}</span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );
}
