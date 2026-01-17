interface SteeringSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function SteeringSlider({ value, onChange }: SteeringSliderProps) {
  return (
    <div className="px-4 py-3 border-t border-gray-700">
      <div className="flex items-center justify-center space-x-6 font-mono text-xs text-gray-500">
        <span>problems</span>
        
        <div className="flex items-center space-x-2">
          <span>◄</span>
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-32 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-terminal"
          />
          <span>►</span>
        </div>
        
        <span>solutions</span>
      </div>
    </div>
  );
}
