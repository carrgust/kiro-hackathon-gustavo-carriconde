'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Loader2, CheckCircle, XCircle, SkipForward, Download, ExternalLink, RefreshCw } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

interface Feature {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: number;
}

interface AutoCoderEvent {
  type: string;
  timestamp: string;
  feature?: Feature;
  completed?: number;
  total?: number;
  html?: string;
  message?: string;
  phase?: string;
  totalFeatures?: number;
  [key: string]: unknown;
}

interface AutoCoderSectionProps {
  prdData: any;
  isGenerating?: boolean;
  onGenerate?: () => void;
  canGenerate?: boolean;
}

export default function AutoCoderSection({ prdData }: AutoCoderSectionProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [events, setEvents] = useState<AutoCoderEvent[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [previewKey, setPreviewKey] = useState(0);
  const [latestHtml, setLatestHtml] = useState<string>('');
  const logRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<number>(0);

  const startPipeline = async () => {
    if (!prdData) return;
    setStatus('running');
    setEvents([]);
    setFeatures([]);
    setProgress({ completed: 0, total: 0 });
    setLatestHtml('');
    pollRef.current = 0;

    try {
      const res = await fetch('/api/autocoder/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: prdData }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  // Poll for events
  useEffect(() => {
    if (!sessionId || status !== 'running') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/autocoder/status/${sessionId}?after=${pollRef.current}`);
        const data = await res.json();

        if (data.events && data.events.length > 0) {
          pollRef.current = data.totalEvents;
          setEvents(prev => [...prev, ...data.events]);

          for (const event of data.events) {
            if (event.type === 'preview_updated') {
              setPreviewKey(k => k + 1);
              if (event.html) setLatestHtml(event.html as string);
            }
            if (event.type === 'progress') {
              setProgress({ completed: event.completed as number, total: event.total as number });
            }
            if (event.type === 'phase_started' && event.totalFeatures) {
              setProgress(prev => ({ ...prev, total: event.totalFeatures as number }));
            }
            if (event.type === 'feature_started' || event.type === 'feature_completed' || event.type === 'feature_skipped') {
              const f = event.feature as Feature;
              if (f) {
                setFeatures(prev => {
                  const existing = prev.findIndex(p => p.id === f.id);
                  if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = f;
                    return updated;
                  }
                  return [...prev, f];
                });
              }
            }
            if (event.type === 'pipeline_completed') {
              setStatus('completed');
              if (event.html) setLatestHtml(event.html as string);
            }
            if (event.type === 'error') setStatus('error');
          }
        }

        if (data.status === 'completed') setStatus('completed');
        if (data.status === 'error') setStatus('error');
      } catch {
        // Polling error — retry on next interval
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, status]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  const downloadHtml = () => {
    if (!latestHtml) return;
    const blob = new Blob([latestHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockup.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPreview = () => {
    if (!sessionId) return;
    window.open(`/api/autocoder/preview/${sessionId}`, '_blank');
  };

  const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4 sm:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Auto Coder</h1>
          <p className="text-purple-200 text-sm sm:text-base">AI-powered mockup generator from your PRD</p>
        </div>

        {/* Controls */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <motion.button
                onClick={startPipeline}
                disabled={!prdData || status === 'running'}
                className={`px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 transition-all ${
                  prdData && status !== 'running'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 shadow-lg shadow-purple-500/30'
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
                whileHover={prdData && status !== 'running' ? { scale: 1.02 } : {}}
                whileTap={prdData && status !== 'running' ? { scale: 0.98 } : {}}
              >
                {status === 'running' ? (
                  <><Loader2 size={20} className="animate-spin" /> Building...</>
                ) : status === 'completed' ? (
                  <><RefreshCw size={20} /> Rebuild</>
                ) : (
                  <><Play size={20} /> Generate App</>
                )}
              </motion.button>

              {!prdData && (
                <span className="text-sm text-white/50">Generate a PRD first</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {latestHtml && (
                <>
                  <button onClick={downloadHtml} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-1.5 transition-colors">
                    <Download size={16} /> Download HTML
                  </button>
                  <button onClick={openPreview} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm flex items-center gap-1.5 transition-colors">
                    <ExternalLink size={16} /> Full Preview
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {progress.total > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/60 mb-1">
                <span>Features: {progress.completed}/{progress.total}</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-purple-400 to-violet-400 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Main Content: Split Panel */}
        {(status !== 'idle' || features.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '60vh' }}>
            {/* Left: Features + Log */}
            <div className="space-y-4">
              {/* Feature List */}
              <GlassCard className="p-4">
                <h3 className="text-sm font-semibold text-purple-300 uppercase mb-3">Features</h3>
                <div className="space-y-2 max-h-[300px] overflow-auto">
                  <AnimatePresence>
                    {features.map((f) => (
                      <motion.div
                        key={f.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                      >
                        {f.status === 'done' && <CheckCircle size={16} className="text-emerald-400 shrink-0" />}
                        {f.status === 'in_progress' && <Loader2 size={16} className="text-purple-400 animate-spin shrink-0" />}
                        {f.status === 'skipped' && <SkipForward size={16} className="text-yellow-400 shrink-0" />}
                        {f.status === 'pending' && <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />}
                        <div className="min-w-0">
                          <span className="text-sm text-white truncate block">{f.name}</span>
                          <span className="text-xs text-white/40">{f.id}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {features.length === 0 && status === 'running' && (
                    <p className="text-sm text-white/40 italic">Decomposing PRD into features...</p>
                  )}
                </div>
              </GlassCard>

              {/* Event Log */}
              <GlassCard className="p-4">
                <h3 className="text-sm font-semibold text-purple-300 uppercase mb-3">Event Log</h3>
                <div ref={logRef} className="font-mono text-xs text-white/50 overflow-auto max-h-[250px] space-y-1">
                  {events.map((e, i) => (
                    <div key={i} className={`${
                      e.type === 'error' ? 'text-red-400' :
                      e.type === 'feature_completed' ? 'text-emerald-400' :
                      e.type === 'pipeline_completed' ? 'text-purple-300 font-bold' :
                      ''
                    }`}>
                      [{new Date(e.timestamp).toLocaleTimeString()}] {e.type}
                      {e.feature ? ` — ${(e.feature as Feature).name}` : ''}
                      {e.message ? ` — ${e.message}` : ''}
                    </div>
                  ))}
                  {events.length === 0 && <p className="text-white/30 italic">Waiting for events...</p>}
                </div>
              </GlassCard>
            </div>

            {/* Right: Live Preview */}
            <GlassCard className="p-2 flex flex-col min-h-[60vh]">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <h3 className="text-sm font-semibold text-purple-300 uppercase">Live Preview</h3>
                {status === 'running' && (
                  <span className="flex items-center gap-1.5 text-xs text-purple-300">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                    Building...
                  </span>
                )}
              </div>
              <div className="flex-1 rounded-lg overflow-hidden bg-white mt-2">
                {sessionId ? (
                  <iframe
                    key={previewKey}
                    src={`/api/autocoder/preview/${sessionId}`}
                    className="w-full h-full border-0"
                    style={{ minHeight: '55vh' }}
                    title="Live Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900" style={{ minHeight: '55vh' }}>
                    Click &quot;Generate App&quot; to start building
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Completion Status */}
        {status === 'completed' && (
          <GlassCard className="p-6 text-center">
            <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Mockup Complete!</h3>
            <p className="text-white/60 text-sm">
              Built {progress.completed} of {progress.total} features. Download the HTML or open full preview.
            </p>
          </GlassCard>
        )}

        {status === 'error' && (
          <GlassCard className="p-6 text-center">
            <XCircle size={48} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Build Error</h3>
            <p className="text-white/60 text-sm">Something went wrong. Check the event log for details.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
