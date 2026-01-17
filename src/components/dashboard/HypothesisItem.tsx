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
  if (state === 'hypothesis') return 'text-orange-400';
  return 'text-green-400'; // fact
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
      <span className={getCircleColor(hypothesis.state, hypothesis.confidence)}>
        {getCircleIcon(hypothesis.state)}
      </span>
      <span className="text-gray-300 flex-1">
        {hypothesis.text}
      </span>
      {hypothesis.type && (
        <span className={`text-xs px-1 rounded ${
          hypothesis.type === 'functional' ? 'bg-gray-800 text-white' : 'bg-purple-900 text-purple-300'
        }`}>
          [{hypothesis.type === 'functional' ? 'F' : 'NF'}]
        </span>
      )}
      <button
        onClick={handleRemove}
        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-xs"
        title="Remove hypothesis"
      >
        ×
      </button>
    </div>
  );
}
