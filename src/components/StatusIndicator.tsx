import '@/styles/glassmorphism.css';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'processing';
}

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const statusClass = {
    online: 'status-complete',
    offline: 'status-error',
    processing: 'status-processing',
  }[status];

  return (
    <div className={`status-indicator ${statusClass}`} aria-label={`Status: ${status}`} />
  );
}
