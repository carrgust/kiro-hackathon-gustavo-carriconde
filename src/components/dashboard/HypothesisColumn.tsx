import { Hypothesis } from '@/types/project';
import HypothesisItem from './HypothesisItem';

interface HypothesisColumnProps {
  title: string;
  hypotheses: Hypothesis[];
  score: number;
  percentage?: number;
  locked?: boolean;
  validatedCount?: number;
  requiredCount?: number;
  onItemClick: (hypothesis: Hypothesis) => void;
  onItemRemove: (hypothesis: Hypothesis) => void;
  onAdd: () => void;
}

export default function HypothesisColumn({ 
  title, hypotheses, score, percentage, locked = false, validatedCount = 0, requiredCount = 3, onItemClick, onItemRemove, onAdd 
}: HypothesisColumnProps) {
  return (
    <div className="flex-1 p-4 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-500 text-xs font-mono uppercase">
          {title}
          {percentage !== undefined && (
            <span className="text-cyan-400 ml-2">({percentage}%)</span>
          )}
          <div className={`text-xs mt-1 ${validatedCount >= requiredCount ? 'text-green-400' : 'text-gray-600'}`}>
            {title === 'requirements' && !locked ? 
              `${validatedCount} validated` : 
              `${validatedCount}/${requiredCount} validated`
            }
          </div>
        </div>
        <div className="text-green-400 text-xs font-mono">
          {score}
        </div>
      </div>
      
      {locked ? (
        <div className="flex items-center justify-center h-32 text-gray-600 text-xs font-mono">
          <div className="text-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2">
              <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11"/>
            </svg>
            <div className="mb-1">LOCKED</div>
            {title === 'requirements' && (
              <div className="text-xs text-gray-500">
                Unlock: 3 problems + 3 solutions needed
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-1 min-h-[300px]">
          {hypotheses.map((hypothesis) => (
            <HypothesisItem
              key={hypothesis.id}
              hypothesis={hypothesis}
              onClick={() => onItemClick(hypothesis)}
              onRemove={() => onItemRemove(hypothesis)}
            />
          ))}
          
          <button
            onClick={onAdd}
            className="flex items-center space-x-2 py-1 text-gray-600 hover:text-cyan-400 transition-colors w-full text-left font-mono text-sm"
          >
            <span>+</span>
            <span>add</span>
          </button>
        </div>
      )}
      
      {!locked && (
        <div className="mt-4 pt-2 border-t border-gray-800 text-xs font-mono text-gray-600">
          <span className="text-orange-400">◐</span> hypothesis  
          <span className="text-green-400 ml-2">●</span> fact
        </div>
      )}
    </div>
  );
}
