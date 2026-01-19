import { Hypothesis, HypothesisState } from '@/types/project';

interface HypothesisItemProps {
  hypothesis: Hypothesis;
  onClick: () => void;
  onRemove: () => void;
}

const getCircleIcon = (state: HypothesisState) => {
  if (state === 'hypothesis') return '◐';
  return '●'; // fact
};

const getCircleColor = (state: HypothesisState, confidence: number) => {
  if (state === 'hypothesis') return 'var(--status-warning)';
  return 'var(--status-success)'; // fact
};

export default function HypothesisItem({ hypothesis, onClick, onRemove }: HypothesisItemProps) {
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div 
      className="flex items-start space-x-2 py-1 cursor-pointer hover:bg-gray-900/30 transition-colors font-mono text-sm group"
      onClick={onClick}
    >
      <span style={{ color: getCircleColor(hypothesis.state, hypothesis.confidence) }}>
        {getCircleIcon(hypothesis.state)}
      </span>
      <span className="text-gray-300 flex-1">
        {hypothesis.text}
      </span>
      {hypothesis.type && (
        <span className={`text-xs px-1 rounded ${
          hypothesis.type === 'functional' ? 'text-white' : ''
        }`} style={{ 
          backgroundColor: hypothesis.type === 'functional' ? 'var(--border-default)' : 'var(--accent-primary)', 
          color: hypothesis.type === 'functional' ? 'var(--text-primary-color)' : 'var(--accent-primary)'
        }}>
          [{hypothesis.type === 'functional' ? 'F' : 'NF'}]
        </span>
      )}
      <button
        onClick={handleRemove}
        className="opacity-0 group-hover:opacity-100 transition-all text-xs hover:opacity-75"
        style={{ color: 'var(--text-muted-color)' }}
        title="Remove hypothesis"
      >
        ×
      </button>
    </div>
  );
}
