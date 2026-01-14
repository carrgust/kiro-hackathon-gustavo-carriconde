interface DNAButtonProps {
  unlocked: boolean;
  validatedCount: number;
  requiredCount: number;
  onClick: () => void;
}

export default function DNAButton({ unlocked, validatedCount, requiredCount, onClick }: DNAButtonProps) {
  const remaining = Math.max(0, requiredCount - validatedCount);

  return (
    <div className="text-center py-4 border-t border-gray-800 font-mono text-sm">
      <button
        onClick={onClick}
        disabled={!unlocked}
        className={`px-6 py-2 transition-colors ${
          unlocked 
            ? 'bg-cyan-400 text-black hover:bg-cyan-300' 
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        [ CREATE DNA ]
      </button>
      
      {!unlocked && (
        <div className="mt-2 text-gray-500 text-xs">
          {remaining} more ● needed
        </div>
      )}
    </div>
  );
}
