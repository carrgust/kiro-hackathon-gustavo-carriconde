import { Hypothesis } from '@/types/project';

interface HypothesisModalProps {
  hypothesis: Hypothesis | null;
  onClose: () => void;
}

export default function HypothesisModal({ hypothesis, onClose }: HypothesisModalProps) {
  if (!hypothesis) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fallback URL mapping for old format sources
  const getSourceUrl = (source: string) => {
    const urlMap: { [key: string]: string } = {
      'World Bank report': 'https://worldbank.org/fees-report-2024',
      'Fintech survey': 'https://fintechweekly.com/survey',
      'SMB interviews': 'https://smb-research.io/interviews',
      'Accounting firms': 'https://accounting-today.com/reconciliation-study',
      'CFO survey': 'https://cfo-insights.com/payment-gaps',
      'Industry analysis': 'https://fintech-analysis.com/trends',
      'ML research': 'https://arxiv.org/ml-fraud-detection',
      'Security reports': 'https://cybersec-reports.com/ai-fraud',
      'Vendor analysis': 'https://vendor-research.io/fraud-tools'
    };
    return urlMap[source] || '#';
  };

  // Extract title and URL from source string (format: "Title: URL")
  const parseSource = (source: string) => {
    const urlMatch = source.match(/^(.+?):\s*(https?:\/\/[^\s]+)$/);
    if (urlMatch) {
      return { title: urlMatch[1], url: urlMatch[2] };
    }
    return { title: source, url: getSourceUrl(source) };
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-gray-700 p-4 max-w-lg w-full mx-4 font-mono">
        <div className="flex items-center justify-between mb-3">
          <div className="text-white text-xs flex-1 pr-4">{hypothesis.text}</div>
          <div className="flex items-center space-x-3">
            {hypothesis.confidence > 0 && (
              <span className="text-white text-xs">{hypothesis.confidence}%</span>
            )}
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mb-3"></div>
        
        {hypothesis.sources && hypothesis.sources.length > 0 ? (
          <div className="space-y-3">
            {hypothesis.sources.map((source, index) => {
              const { title, url } = parseSource(source);
              return (
                <div key={index}>
                  <div className="text-white text-xs">{title}</div>
                  <a 
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 text-xs hover:underline block break-all"
                  >
                    {url}
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-500 text-xs">No sources available</div>
        )}
      </div>
    </div>
  );
}
