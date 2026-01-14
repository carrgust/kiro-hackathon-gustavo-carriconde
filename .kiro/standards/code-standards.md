# Code Standards

## TypeScript Best Practices

### Type Safety
- **Strict mode enabled:** All TypeScript strict checks active
- **No implicit any:** All types explicitly defined
- **Type inference:** Leverage TypeScript's inference where clear
- **Interface over type:** Use interfaces for object shapes

```typescript
// ✅ Good
interface Hypothesis {
  id: string;
  text: string;
  state: 'empty' | 'researching' | 'fact';
  confidence: number;
}

// ❌ Avoid
const hypothesis: any = { ... };
```

### Null Safety
- **Optional chaining:** Use `?.` for nullable access
- **Nullish coalescing:** Use `??` for default values
- **Type guards:** Validate types before use

```typescript
// ✅ Good
const confidence = hypothesis?.confidence ?? 0;

// ❌ Avoid
const confidence = hypothesis.confidence || 0; // Wrong for 0 values
```

## Component Patterns

### React Component Structure
```typescript
'use client'; // Only when needed (state, effects, browser APIs)

import { useState, useEffect } from 'react';
import type { ComponentProps } from '@/types';

interface Props {
  data: string;
  onAction: (value: string) => void;
}

export default function Component({ data, onAction }: Props) {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

### State Management
- **Local state:** `useState` for component-specific state
- **Derived state:** Compute from props/state, don't store
- **Lifting state:** Share state at lowest common ancestor
- **No prop drilling:** Use context for deep trees

### Event Handlers
```typescript
// ✅ Good - Inline arrow for simple handlers
<button onClick={() => setOpen(true)}>Open</button>

// ✅ Good - Named function for complex logic
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  // Complex logic
};
<form onSubmit={handleSubmit}>...</form>
```

## API Design Patterns

### RESTful Endpoints
```typescript
// Route: /api/resource/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await fetchData(params.id);
    return Response.json({ data });
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch' },
      { status: 500 }
    );
  }
}
```

### Response Format
```typescript
// Success response
{
  data: T,
  meta?: {
    timestamp: string,
    version: string
  }
}

// Error response
{
  error: string,
  code?: string,
  details?: unknown
}
```

### Error Handling
```typescript
// API route error handling
try {
  const result = await operation();
  return Response.json({ data: result });
} catch (error) {
  console.error('Operation failed:', error);
  return Response.json(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}
```

## Demo Mode Isolation Pattern

### Core Principle
**Demo mode must never make external API calls.** All data is pre-generated and returned instantly.

### Implementation Pattern
```typescript
class StreamingService {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
  
  async generateContent(prompt: string): Promise<string> {
    // Check for demo mode FIRST
    if (this.apiKey === 'demo') {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      return DEMO_CONTENT; // Pre-generated data
    }
    
    // Real API call
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${this.apiKey}` }
    });
    return response.text();
  }
}
```

### Demo Mode Checklist
- ✅ Check `apiKey === 'demo'` at method entry
- ✅ Return pre-generated data from `demo-data.ts`
- ✅ Add realistic delay (500ms) for UX
- ✅ No network calls in demo mode
- ✅ Reinitialize service when entering demo mode

### Demo Data Structure
```typescript
// src/lib/demo-data.ts
export const DEMO_PRD = `
# Product Requirements Document
...
`;

export const DEMO_LANDING_PAGE = `
<!DOCTYPE html>
<html>
...
</html>
`;
```

## Error Handling Standards

### Client-Side Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Retry logic for transient errors
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      if (!isRetryable(error)) throw error; // Fail fast on 429, 401, etc.
      await delay(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}

function isRetryable(error: unknown): boolean {
  if (error instanceof Response) {
    // Don't retry rate limits (429) or auth errors (401, 403)
    return ![429, 401, 403].includes(error.status);
  }
  return true;
}
```

### User-Facing Errors
```typescript
// Show user-friendly messages
try {
  await operation();
} catch (error) {
  toast.error(
    error instanceof Error 
      ? error.message 
      : 'Something went wrong. Please try again.'
  );
}
```

## Logging Standards

### Development Logging
```typescript
// src/lib/logger.ts
export const logger = {
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    // In production: send to error tracking
  }
};
```

### Usage
```typescript
import { logger } from '@/lib/logger';

logger.info('Generating hypotheses', { niche, count: 5 });
logger.error('API call failed', error);
```

## Constants Management

### Centralized Constants
```typescript
// src/lib/constants.ts
export const TIMING = {
  DEBOUNCE_MS: 300,
  RETRY_DELAY_MS: 1000,
  DEMO_DELAY_MS: 500,
} as const;

export const LIMITS = {
  MAX_HYPOTHESES: 20,
  MIN_CONFIDENCE: 80,
  MAX_RETRIES: 3,
} as const;

export const STORAGE_KEYS = {
  API_KEY: 'openrouter_api_key',
  DEMO_MODE: 'demo_mode',
} as const;
```

### Usage
```typescript
import { TIMING, LIMITS } from '@/lib/constants';

setTimeout(callback, TIMING.DEBOUNCE_MS);
if (confidence >= LIMITS.MIN_CONFIDENCE) { ... }
```

## Testing Standards

### Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('ComponentName', () => {
  beforeEach(() => {
    // Setup
  });
  
  it('should handle expected behavior', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = function(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Test Coverage Priorities
1. **Critical paths:** Demo mode, API calls, data generation
2. **Error handling:** Edge cases, failures, retries
3. **User interactions:** Button clicks, form submissions
4. **Data transformations:** Parsing, validation, formatting

## Security Standards

### API Key Management
- ✅ Store in localStorage (MVP acceptable)
- ✅ Never commit to git (.env.local in .gitignore)
- ✅ Validate format before use
- ✅ Show security warning to users

### Input Validation
```typescript
// Validate user input
function validateNiche(niche: string): boolean {
  return niche.length >= 3 && niche.length <= 100;
}

// Sanitize before API calls
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### Rate Limiting
- Client-side: Debounce user actions
- Server-side: Implement rate limiting middleware (future)
- Demo mode: No rate limits (zero API calls)

## Performance Standards

### Code Splitting
```typescript
// Lazy load heavy components
const HeavyModal = dynamic(() => import('./HeavyModal'), {
  loading: () => <Spinner />,
});
```

### Memoization
```typescript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensive(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

### Bundle Size
- Avoid large dependencies
- Use tree-shaking friendly imports
- Monitor bundle size with `npm run build`

---

**Last Updated:** 2026-01-14 14:42:18 -03:00
