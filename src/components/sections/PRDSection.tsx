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
  { key: 'executive_summary' as const, label: 'Executive Summary', icon: FileText },
  { key: 'target_users' as const, label: 'Target Users & Personas', icon: Users },
  { key: 'user_stories' as const, label: 'User Stories', icon: BookOpen },
  { key: 'functional_requirements' as const, label: 'Functional Requirements', icon: Cpu },
  { key: 'non_functional_requirements' as const, label: 'Non-Functional Requirements', icon: Shield },
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
        <p className="text-cyan-200/60">MVP PRD with traceability — Users → Stories → Requirements</p>
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
          <p className="text-cyan-300 font-medium">Analyzing business data and generating structured PRD...</p>
        </div>
      )}

      {/* PRD Content */}
      {prdData && (
        <>
          {/* Outer card matching Business Plan style */}
          <div className="rounded-2xl p-6 space-y-6" style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
            {/* Top bar with section count and actions */}
            <div className="flex items-center justify-between">
              <span className="text-cyan-300/80 text-sm font-medium">Product Requirements ({SECTIONS.length} Sections)</span>
              <div className="flex gap-2">
                <motion.button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy JSON'}
                </motion.button>
                <motion.button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download size={14} />
                  Download .json
                </motion.button>
              </div>
            </div>

            {/* Sections */}
            {SECTIONS.map(({ key, label, icon: Icon }) => {
              const isExpanded = expandedSections.has(key);
              return (
                <motion.div
                  key={key}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.1)' }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Section Header — colored uppercase like Business Plan */}
                  <button
                    onClick={() => toggleSection(key)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400">{label}</h3>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-cyan-400/60" /> : <ChevronDown size={18} className="text-cyan-400/60" />}
                  </button>

                  {/* Section Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5"
                      >
                        {key === 'executive_summary' && (
                          <p className="text-white/80 leading-relaxed">{prdData.executive_summary}</p>
                        )}

                        {key === 'target_users' && (
                          <div className="space-y-4">
                            {prdData.target_users.map((user) => (
                              <div key={user.id} className="rounded-lg p-4" style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                                <div className="flex items-center gap-3 mb-3">
                                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyan-500/20 text-cyan-300">{user.id}</span>
                                  <span className="text-white font-semibold">{user.persona}</span>
                                  <span className="text-white/40 text-sm">({user.age_range})</span>
                                </div>
                                <p className="text-white/60 text-sm mb-3">{user.description}</p>
                                <div className="mb-3">
                                  <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Pain Points:</span>
                                  <ul className="mt-1.5 space-y-1">
                                    {user.pain_points.map((p, i) => (
                                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                                        <span className="text-orange-400 mt-0.5">•</span>{p}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Primary Need:</span>
                                  <p className="text-cyan-300 text-sm mt-1">{user.primary_need}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {key === 'user_stories' && (
                          <div className="space-y-4">
                            {prdData.user_stories.map((story) => (
                              <div key={story.id} className="rounded-lg p-4" style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.1)' }}>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-cyan-500/20 text-cyan-300">{story.id}</span>
                                  <span className="text-white/30">→</span>
                                  <span className="px-2 py-0.5 text-xs font-mono rounded bg-white/5 text-white/50">{story.persona_id}</span>
                                </div>
                                <p className="text-white/70 text-sm italic mb-3">&ldquo;{story.story}&rdquo;</p>
                                <div>
                                  <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Acceptance Criteria:</span>
                                  <ul className="mt-1.5 space-y-1">
                                    {story.acceptance_criteria.map((ac, i) => (
                                      <li key={i} className="text-white/60 text-sm flex items-start gap-2">
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
                                <tr className="text-left text-white/40 uppercase text-xs tracking-wider border-b border-cyan-500/10">
                                  <th className="pb-3 pr-4">ID</th>
                                  <th className="pb-3 pr-4">Priority</th>
                                  <th className="pb-3 pr-4">Name</th>
                                  <th className="pb-3 pr-4">Description</th>
                                  <th className="pb-3">Stories</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prdData.functional_requirements.map((fr) => (
                                  <tr key={fr.id} className="border-b border-cyan-500/5">
                                    <td className="py-3 pr-4 font-mono text-cyan-300 text-xs">{fr.id}</td>
                                    <td className="py-3 pr-4">
                                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-500/15 text-amber-300">P{fr.priority}</span>
                                    </td>
                                    <td className="py-3 pr-4 text-white font-medium">{fr.name}</td>
                                    <td className="py-3 pr-4 text-white/60">{fr.description}</td>
                                    <td className="py-3">
                                      <div className="flex gap-1 flex-wrap">
                                        {fr.story_ids.map((sid) => (
                                          <span key={sid} className="px-1.5 py-0.5 text-xs font-mono rounded bg-cyan-500/10 text-cyan-300/70">{sid}</span>
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
                                <tr className="text-left text-white/40 uppercase text-xs tracking-wider border-b border-cyan-500/10">
                                  <th className="pb-3 pr-4">ID</th>
                                  <th className="pb-3 pr-4">Category</th>
                                  <th className="pb-3 pr-4">Name</th>
                                  <th className="pb-3 pr-4">Target</th>
                                  <th className="pb-3">Applies To</th>
                                </tr>
                              </thead>
                              <tbody>
                                {prdData.non_functional_requirements.map((nfr) => (
                                  <tr key={nfr.id} className="border-b border-cyan-500/5">
                                    <td className="py-3 pr-4 font-mono text-cyan-300 text-xs">{nfr.id}</td>
                                    <td className="py-3 pr-4">
                                      <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                        nfr.category === 'Performance' ? 'bg-blue-500/15 text-blue-300' :
                                        nfr.category === 'Security' ? 'bg-red-500/15 text-red-300' :
                                        nfr.category === 'Accessibility' ? 'bg-purple-500/15 text-purple-300' :
                                        'bg-white/10 text-white/60'
                                      }`}>{nfr.category}</span>
                                    </td>
                                    <td className="py-3 pr-4 text-white font-medium">{nfr.name}</td>
                                    <td className="py-3 pr-4 text-emerald-300 font-mono text-xs">{nfr.target}</td>
                                    <td className="py-3">
                                      <div className="flex gap-1 flex-wrap">
                                        {nfr.applies_to.map((ref) => (
                                          <span key={ref} className="px-1.5 py-0.5 text-xs font-mono rounded bg-cyan-500/10 text-cyan-300/70">{ref}</span>
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
