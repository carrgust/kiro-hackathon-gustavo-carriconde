import { toast } from 'sonner';

// Error types for categorization
export type ErrorType = 
  | 'network'
  | 'api'
  | 'validation'
  | 'auth'
  | 'rate_limit'
  | 'timeout'
  | 'unknown';

export interface AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  retryable: boolean;
  userMessage: string;
  originalError?: unknown;
}

// Create typed errors
export function createAppError(
  message: string,
  type: ErrorType,
  options: {
    statusCode?: number;
    retryable?: boolean;
    userMessage?: string;
    originalError?: unknown;
  } = {}
): AppError {
  const error = new Error(message) as AppError;
  error.type = type;
  error.statusCode = options.statusCode;
  error.retryable = options.retryable ?? true;
  error.userMessage = options.userMessage ?? getDefaultUserMessage(type);
  error.originalError = options.originalError;
  return error;
}

function getDefaultUserMessage(type: ErrorType): string {
  switch (type) {
    case 'network':
      return 'Unable to connect. Please check your internet connection.';
    case 'api':
      return 'The service is temporarily unavailable. Please try again.';
    case 'validation':
      return 'Please check your input and try again.';
    case 'auth':
      return 'Authentication failed. Please check your API key.';
    case 'rate_limit':
      return 'Too many requests. Please wait a moment and try again.';
    case 'timeout':
      return 'The request took too long. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// Parse errors from various sources
export function parseError(error: unknown): AppError {
  // Already an AppError
  if (error && typeof error === 'object' && 'type' in error) {
    return error as AppError;
  }

  // Fetch/Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return createAppError(error.message, 'network', { originalError: error });
  }

  // Standard Error
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return createAppError(error.message, 'rate_limit', { 
        statusCode: 429, 
        retryable: true,
        originalError: error 
      });
    }
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return createAppError(error.message, 'timeout', { retryable: true, originalError: error });
    }
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      return createAppError(error.message, 'auth', { 
        statusCode: 401, 
        retryable: false,
        originalError: error 
      });
    }
    if (error.message.includes('ECONNREFUSED') || error.message.includes('network')) {
      return createAppError(error.message, 'network', { originalError: error });
    }

    return createAppError(error.message, 'unknown', { originalError: error });
  }

  // Unknown error type
  return createAppError(String(error), 'unknown', { originalError: error });
}

// Toast notifications for errors
export function showErrorToast(error: AppError | unknown) {
  const appError = error instanceof Error && 'type' in error 
    ? error as AppError 
    : parseError(error);

  const icons: Record<ErrorType, string> = {
    network: '🌐',
    api: '⚡',
    validation: '⚠️',
    auth: '🔐',
    rate_limit: '⏱️',
    timeout: '⌛',
    unknown: '❌',
  };

  toast.error(appError.userMessage, {
    description: appError.retryable ? 'You can try again.' : undefined,
    icon: icons[appError.type],
    duration: appError.type === 'rate_limit' ? 8000 : 5000,
  });

  return appError;
}

// Retry logic with exponential backoff
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: AppError) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;
  
  let lastError: AppError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseError(error);

      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt === maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      );

      onRetry?.(attempt + 1, lastError);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// Safe async wrapper that catches and handles errors
export async function safeAsync<T>(
  fn: () => Promise<T>,
  options: {
    showToast?: boolean;
    fallback?: T;
    onError?: (error: AppError) => void;
  } = {}
): Promise<T | undefined> {
  const { showToast = true, fallback, onError } = options;

  try {
    return await fn();
  } catch (error) {
    const appError = parseError(error);
    
    if (showToast) {
      showErrorToast(appError);
    }
    
    onError?.(appError);
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    return undefined;
  }
}

// Global error handler setup
export function setupGlobalErrorHandler() {
  if (typeof window === 'undefined') return;

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    const appError = parseError(event.error);
    showErrorToast(appError);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
    const appError = parseError(event.reason);
    showErrorToast(appError);
    event.preventDefault();
  });

  // Handle app-specific errors from ErrorBoundary
  window.addEventListener('app-error', ((event: CustomEvent) => {
    console.error('App error:', event.detail);
  }) as EventListener);
}
