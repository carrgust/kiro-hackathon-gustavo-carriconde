import { motion } from 'framer-motion';
import { Code2, Play, Pause, Download, Loader2, CheckCircle, FileCode } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import StatusIndicator from '@/components/StatusIndicator';
import { pageVariants, cardContainerVariants, cardItemVariants } from '@/lib/animations';
import { toast } from 'sonner';

type CodingStatus = 'idle' | 'analyzing' | 'coding' | 'complete';

interface GeneratedFile {
  path: string;
  language: string;
  lines: number;
}

export default function AutoCoderSection() {
  const [status, setStatus] = useState<CodingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [codeOutput, setCodeOutput] = useState('// Auto Coder ready\n// Click "Start Coding" to begin PRD implementation');
  const [logs, setLogs] = useState<string[]>([
    '[System] Auto Coder initialized',
    '[System] Waiting for PRD input...',
  ]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([
    { path: 'src/components/Dashboard.tsx', language: 'TypeScript', lines: 245 },
    { path: 'src/lib/api/client.ts', language: 'TypeScript', lines: 128 },
    { path: 'src/styles/globals.css', language: 'CSS', lines: 89 },
  ]);

  const handleStart = () => {
    setStatus('analyzing');
    setCurrentTask('Analyzing PRD requirements...');
    setProgress(10);
    toast.info('Auto Coder started');
    
    setTimeout(() => {
      setStatus('coding');
      setCurrentTask('Generating component structure...');
      setProgress(45);
      setLogs(prev => [...prev, '[LLM] Analyzing PRD structure', '[LLM] Generating file tree']);
    }, 2000);
    
    setTimeout(() => {
      setProgress(75);
      setCurrentTask('Implementing business logic...');
      setCodeOutput(`// Generated Dashboard Component
import React from 'react';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {/* Auto-generated content */}
    </div>
  );
}`);
      setLogs(prev => [...prev, '[LLM] Writing Dashboard.tsx', '[LLM] Applying best practices']);
    }, 4000);
  };

  const handlePause = () => {
    setStatus('idle');
    toast.info('Auto Coder paused');
  };

  const handleExport = () => {
    toast.success('Code exported to /generated folder');
  };

  const getStatusIndicator = (): 'online' | 'offline' | 'processing' => {
    if (status === 'complete') return 'online';
    if (status === 'idle') return 'offline';
    return 'processing';
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-900 p-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Auto Coder</h1>
            <p className="text-purple-200">LLM-powered autonomous PRD implementation</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusIndicator status={getStatusIndicator()} />
            <span className="text-sm font-medium text-white capitalize">{status}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={status === 'analyzing' || status === 'coding'}
            className={`flex-1 py-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              status === 'idle' || status === 'complete'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            {status === 'analyzing' || status === 'coding' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Coding...
              </>
            ) : (
              <>
                <Play size={20} />
                Start Coding
              </>
            )}
          </button>

          <button
            onClick={handlePause}
            disabled={status === 'idle' || status === 'complete'}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all flex items-center gap-2"
          >
            <Pause size={20} />
            Pause
          </button>

          <button
            onClick={handleExport}
            disabled={generatedFiles.length === 0}
            className="px-6 py-4 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white transition-all flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </button>
        </div>

        {/* Progress Bar */}
        {status !== 'idle' && (
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{currentTask}</span>
              <span className="text-sm text-purple-200">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Output Panel */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={20} className="text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Code Output</h2>
            </div>
            <div className="bg-black/40 rounded-lg p-4 h-[400px] overflow-auto">
              <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                {codeOutput}
              </pre>
            </div>
          </GlassCard>

          {/* File Tree */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileCode size={20} className="text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Generated Files</h2>
            </div>
            <motion.div
              className="space-y-2"
              variants={cardContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {generatedFiles.map((file, index) => (
                <motion.div
                  key={file.path}
                  variants={cardItemVariants}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{file.path}</p>
                      <p className="text-xs text-purple-300">{file.language} • {file.lines} lines</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </GlassCard>
        </div>

        {/* Logs Panel */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={20} className="text-purple-400" />
            <h2 className="text-xl font-semibold text-white">LLM Reasoning Logs</h2>
          </div>
          <div className="bg-black/40 rounded-lg p-4 h-[200px] overflow-auto">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <p key={index} className="text-sm text-gray-300 font-mono">
                  {log}
                </p>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
