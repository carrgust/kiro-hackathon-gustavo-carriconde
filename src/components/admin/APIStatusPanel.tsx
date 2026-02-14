'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Clock,
  Hash,
  Loader2,
  Server,
  Activity,
  Eye,
  X,
  Search,
  Cpu,
  BookOpen,
  Database,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Users,
  BarChart2,
} from 'lucide-react';
import {
  API_REGISTRY,
  APIConfig,
  PillarCategory,
  PILLAR_LABELS,
  PILLAR_COLORS,
} from '@/lib/api-registry';

// Map icon strings to Lucide components
const ICON_MAP: Record<string, React.ReactNode> = {
  'search': <Search size={20} />,
  'cpu': <Cpu size={20} />,
  'book-open': <BookOpen size={20} />,
  'database': <Database size={20} />,
  'message-square': <MessageSquare size={20} />,
  'graduation-cap': <GraduationCap size={20} />,
  'briefcase': <Briefcase size={20} />,
  'users': <Users size={20} />,
  'bar-chart-2': <BarChart2 size={20} />,
};

interface APITestResult {
  apiId: string;
  apiName: string;
  success: boolean;
  responseTime?: number;
  resultCount?: number;
  error?: string;
  fullResponse?: any;
}

type APIStatus = 'idle' | 'testing' | 'success' | 'error';

interface APIState {
  status: APIStatus;
  lastTested?: Date;
  responseTime?: number;
  resultCount?: number;
  error?: string;
  fullResponse?: any;
}

export default function APIStatusPanel() {
  const [apiStates, setApiStates] = useState<Record<string, APIState>>({});
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<PillarCategory | 'all'>('all');
  const [viewingResponse, setViewingResponse] = useState<{ apiId: string; data: any } | null>(null);

  // Initialize states
  useEffect(() => {
    const initial: Record<string, APIState> = {};
    API_REGISTRY.forEach(api => {
      initial[api.id] = { status: 'idle' };
    });
    setApiStates(initial);
  }, []);

  // Test a single API
  const testAPI = async (apiId: string) => {
    setApiStates(prev => ({
      ...prev,
      [apiId]: { ...prev[apiId], status: 'testing' },
    }));

    try {
      const res = await fetch('/api/admin/test-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiId }),
      });

      const result: APITestResult = await res.json();

      setApiStates(prev => ({
        ...prev,
        [apiId]: {
          status: result.success ? 'success' : 'error',
          lastTested: new Date(),
          responseTime: result.responseTime,
          resultCount: result.resultCount,
          error: result.error,
          fullResponse: result.fullResponse,
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setApiStates(prev => ({
        ...prev,
        [apiId]: {
          status: 'error',
          lastTested: new Date(),
          error: message,
          fullResponse: { error: message },
        },
      }));
    }
  };

  // Test all APIs - uses individual POST requests to get full response data
  const testAllAPIs = async () => {
    setIsTestingAll(true);

    // Set all to testing
    const testing: Record<string, APIState> = {};
    API_REGISTRY.forEach(api => {
      testing[api.id] = { status: 'testing' };
    });
    setApiStates(testing);

    // Test each API individually in parallel to get full responses
    const promises = API_REGISTRY.map(async (api) => {
      try {
        const res = await fetch('/api/admin/test-api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiId: api.id }),
        });
        const result: APITestResult = await res.json();
        return { apiId: api.id, result };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          apiId: api.id,
          result: {
            success: false,
            error: message,
            fullResponse: { error: message },
          } as APITestResult,
        };
      }
    });

    const results = await Promise.all(promises);

    const newStates: Record<string, APIState> = {};
    results.forEach(({ apiId, result }) => {
      newStates[apiId] = {
        status: result.success ? 'success' : 'error',
        lastTested: new Date(),
        responseTime: result.responseTime,
        resultCount: result.resultCount,
        error: result.error,
        fullResponse: result.fullResponse,
      };
    });
    setApiStates(newStates);

    setIsTestingAll(false);
  };

  // Filter APIs by category
  const filteredAPIs = selectedCategory === 'all'
    ? API_REGISTRY
    : API_REGISTRY.filter(api => api.categories.includes(selectedCategory));

  // Stats
  const totalAPIs = API_REGISTRY.length;
  const testedAPIs = Object.values(apiStates).filter(s => s.status === 'success' || s.status === 'error').length;
  const successfulAPIs = Object.values(apiStates).filter(s => s.status === 'success').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Server size={20} />}
          label="Total APIs"
          value={totalAPIs}
          color="#F59E0B"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Tested"
          value={`${testedAPIs}/${totalAPIs}`}
          color="#3B82F6"
        />
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Online"
          value={successfulAPIs}
          color="#10B981"
        />
        <StatCard
          icon={<XCircle size={20} />}
          label="Offline"
          value={testedAPIs - successfulAPIs}
          color="#EF4444"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <CategoryPill
            label="All"
            active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            color="#6B7280"
          />
          {(Object.keys(PILLAR_LABELS) as PillarCategory[]).map(cat => (
            <CategoryPill
              key={cat}
              label={PILLAR_LABELS[cat].split(' ')[0]}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              color={PILLAR_COLORS[cat]}
            />
          ))}
        </div>

        {/* Test All Button */}
        <button
          onClick={testAllAPIs}
          disabled={isTestingAll}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-amber-400 font-medium transition-all disabled:opacity-50"
        >
          {isTestingAll ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Zap size={18} />
          )}
          {isTestingAll ? 'Testing...' : 'Test All APIs'}
        </button>
      </div>

      {/* API List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAPIs.map((api, idx) => (
            <APIRow
              key={api.id}
              api={api}
              state={apiStates[api.id] || { status: 'idle' }}
              onTest={() => testAPI(api.id)}
              onViewResponse={() => {
                const state = apiStates[api.id];
                if (state?.fullResponse) {
                  setViewingResponse({ apiId: api.id, data: state.fullResponse });
                }
              }}
              delay={idx * 0.05}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {viewingResponse && (
          <ResponseModal
            apiId={viewingResponse.apiId}
            data={viewingResponse.data}
            onClose={() => setViewingResponse(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="glass-card p-4 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
        </div>
      </div>
    </div>
  );
}

// Category Pill Component
function CategoryPill({ label, active, onClick, color }: {
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
        active
          ? 'text-white'
          : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
      }`}
      style={{
        backgroundColor: active ? `${color}40` : undefined,
        borderColor: active ? color : 'transparent',
        border: `1px solid ${active ? color : 'transparent'}`,
      }}
    >
      {label}
    </button>
  );
}

// API Row Component
function APIRow({ api, state, onTest, onViewResponse, delay }: {
  api: APIConfig;
  state: APIState;
  onTest: () => void;
  onViewResponse: () => void;
  delay: number;
}) {
  const statusIcon = {
    idle: <AlertCircle size={16} className="text-gray-500" />,
    testing: <Loader2 size={16} className="text-amber-400 animate-spin" />,
    success: <CheckCircle2 size={16} className="text-green-400" />,
    error: <XCircle size={16} className="text-red-400" />,
  };

  const statusColor = {
    idle: 'bg-gray-500',
    testing: 'bg-amber-400 animate-pulse',
    success: 'bg-green-400',
    error: 'bg-red-400',
  };

  const icon = ICON_MAP[api.icon] || <Server size={20} />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay }}
      className="glass-card p-4 border border-white/10 hover:border-amber-500/30 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Status Dot */}
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${statusColor[state.status]}`} />
          {state.status === 'success' && (
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-green-400 animate-ping opacity-50" />
          )}
        </div>

        {/* Icon */}
        <div className="text-gray-400">
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">{api.name}</h3>
            {api.requiresKey && (
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                API Key
              </span>
            )}
            {api.docsUrl && (
              <a
                href={api.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-amber-400 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">{api.description}</p>

          {/* Category Tags */}
          <div className="flex gap-1 mt-2">
            {api.categories.map(cat => (
              <span
                key={cat}
                className="text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${PILLAR_COLORS[cat]}20`,
                  color: PILLAR_COLORS[cat],
                }}
              >
                {PILLAR_LABELS[cat].split(' ')[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          {state.responseTime !== undefined && (
            <div className="flex items-center gap-1 text-gray-400">
              <Clock size={14} />
              <span>{state.responseTime}ms</span>
            </div>
          )}
          {state.resultCount !== undefined && (
            <div className="flex items-center gap-1 text-gray-400">
              <Hash size={14} />
              <span>{state.resultCount} results</span>
            </div>
          )}
          {state.error && (
            <div className="text-red-400 text-xs max-w-32 truncate" title={state.error}>
              {state.error}
            </div>
          )}
        </div>

        {/* View Response Button */}
        {state.fullResponse && (
          <button
            onClick={onViewResponse}
            className="flex items-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white text-xs font-medium transition-all"
          >
            <Eye size={12} />
            Response
          </button>
        )}

        {/* Test Button */}
        <button
          onClick={onTest}
          disabled={state.status === 'testing'}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 rounded-lg text-gray-300 hover:text-amber-400 text-sm font-medium transition-all disabled:opacity-50"
        >
          {state.status === 'testing' ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          Test
        </button>
      </div>
    </motion.div>
  );
}

// Response Modal Component
function ResponseModal({ apiId, data, onClose }: {
  apiId: string;
  data: any;
  onClose: () => void;
}) {
  const api = API_REGISTRY.find(a => a.id === apiId);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-card p-6 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">
              {api?.name || apiId} - Full Response
            </h2>
            <p className="text-sm text-gray-400">
              Complete API communication details
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <pre className="text-sm text-gray-300 font-mono bg-black/30 p-4 rounded-lg overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(data, null, 2));
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm font-medium transition-all"
          >
            Copy to Clipboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
