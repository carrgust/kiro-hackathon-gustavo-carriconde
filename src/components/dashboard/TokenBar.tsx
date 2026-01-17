interface TokenBarProps {
  provider: string;
  model: string;
  tokensAvailable: number;
  runningTime: string;
}

export default function TokenBar({ provider, model, tokensAvailable, runningTime }: TokenBarProps) {
  return (
    <div className="border-b border-gray-700 p-3 font-mono text-sm text-gray-400">
      {provider} | {model} | {tokensAvailable.toLocaleString()} tokens | {runningTime}
    </div>
  );
}
