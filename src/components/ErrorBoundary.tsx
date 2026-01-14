'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-red-500 p-6 max-w-md w-full font-mono">
            <h1 className="text-red-400 text-lg mb-4">⚠️ Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-4">
              The application encountered an unexpected error. Please try reloading the page.
            </p>
            {this.state.error && (
              <details className="text-xs text-gray-500 mb-4">
                <summary className="cursor-pointer hover:text-gray-400">
                  Error details
                </summary>
                <pre className="mt-2 p-2 bg-black rounded overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
