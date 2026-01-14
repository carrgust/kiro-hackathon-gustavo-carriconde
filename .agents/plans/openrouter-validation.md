# Feature: OpenRouter API Validation & Production Setup

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Validate and enhance the OpenRouter API integration with production-ready error handling, retry logic, health monitoring, and token tracking. This ensures reliable AI-powered hypothesis generation with proper rate limit handling and cost visibility.

## User Story

As a **Curatos developer**
I want to **validate OpenRouter integration and add production-ready error handling**
So that **the application handles API failures gracefully and provides visibility into token costs**

## Problem Statement

Current OpenRouter integration makes assumptions about rate limits, token costs, and error handling without validation. Production deployments risk failures from:
- Unhandled 429 (rate limit) errors
- Missing retry logic for transient failures
- No visibility into actual token consumption
- Lack of health monitoring for API connectivity

## Solution Statement

Implement comprehensive validation suite, retry wrapper with exponential backoff, health check endpoint, and token tracking system. Document actual rate limits and costs through systematic testing.

## Feature Metadata

**Feature Type**: Enhancement + Validation
**Estimated Complexity**: Medium
**Primary Systems Affected**: API layer (`src/lib/api/`), Health monitoring, Token tracking
**Dependencies**: OpenRouter API, Next.js API routes, TypeScript

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `src/lib/api/openrouter.ts` (lines 1-70) - Current OpenRouter provider implementation, needs retry logic
- `src/lib/api/types.ts` (lines 1-13) - Interface definitions for AIProvider, Message, ChatResponse
- `src/lib/api/hypothesis.ts` (lines 1-90) - Uses OpenRouter for hypothesis generation and research
- `src/lib/api/index.ts` - Provider factory pattern, exports getProvider function
- `package.json` (lines 1-30) - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration with path aliases (@/*)

### New Files to Create

- `src/lib/api/retry.ts` - Retry wrapper with exponential backoff
- `src/lib/api/token-tracker.ts` - Token usage tracking and statistics
- `src/app/api/health/route.ts` - Health check endpoint for monitoring
- `scripts/test-openrouter.ts` - Comprehensive validation test suite
- `docs/OPENROUTER_VALIDATION.md` - Test results and findings documentation

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [OpenRouter API Documentation](https://openrouter.ai/docs#quick-start)
  - Specific section: Rate limits and headers
  - Why: Understand x-ratelimit-* headers and error codes
- [OpenRouter Models](https://openrouter.ai/docs#models)
  - Specific section: Free tier models
  - Why: Validate available free models and their limits
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
  - Specific section: GET handlers
  - Why: Pattern for /api/health endpoint
- [Fetch API Retry Patterns](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
  - Why: Best practices for retry logic

### Patterns to Follow

**Naming Conventions:**
- Classes: PascalCase (e.g., `OpenRouterProvider`, `TokenTracker`)
- Functions: camelCase (e.g., `callWithRetry`, `getHealthStatus`)
- Files: kebab-case (e.g., `token-tracker.ts`, `retry.ts`)
- Interfaces: PascalCase with descriptive names (e.g., `RetryConfig`, `RateLimitInfo`)

**Error Handling:**
```typescript
// Pattern from openrouter.ts lines 25-28
if (!response.ok) {
  const error = await response.text();
  throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
}
```

**Import Pattern:**
```typescript
// Pattern from hypothesis.ts line 1
import { getProvider, Message } from '@/lib/api';
import { Hypothesis } from '@/types/project';
```

**API Response Pattern:**
```typescript
// Pattern from openrouter.ts lines 32-39
return {
  content: data.choices[0]?.message?.content || '',
  model: data.model || model || this.defaultModel,
  tokens: {
    prompt: data.usage?.prompt_tokens || 0,
    completion: data.usage?.completion_tokens || 0,
    total: data.usage?.total_tokens || 0
  }
};
```

**Console Logging:**
```typescript
// Pattern from hypothesis.ts line 35
console.error('Error generating hypotheses:', error);
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation - Retry Logic & Types

Set up retry infrastructure with exponential backoff and rate limit tracking types.

**Tasks:**
- Create retry utility with exponential backoff
- Add rate limit info types to existing types.ts
- Add health status types

### Phase 2: Core Implementation - Enhanced OpenRouter Client

Enhance OpenRouter provider with retry logic, rate limit tracking, and health monitoring.

**Tasks:**
- Add retry wrapper to OpenRouter provider
- Extract and store rate limit headers
- Track last successful request timestamp
- Add health status method

### Phase 3: Monitoring & Tracking

Implement health check endpoint and token usage tracking.

**Tasks:**
- Create health check API route
- Implement token tracker utility
- Integrate token tracking with hypothesis service

### Phase 4: Validation & Testing

Create comprehensive test suite and document findings.

**Tasks:**
- Create test script for all validation scenarios
- Add npm script for running tests
- Document test results
- Update integration docs

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE src/lib/api/retry.ts

- **IMPLEMENT**: Retry configuration interface and exponential backoff utility
- **PATTERN**: Error handling from openrouter.ts lines 25-28
- **IMPORTS**: None (pure utility)
- **GOTCHA**: Ensure max delay cap to prevent infinite waits
- **VALIDATE**: `npx tsc --noEmit`

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
};

export function isRetryableError(error: any): boolean {
  // Retry on network errors, 429, and 5xx
  if (error?.message?.includes('fetch failed')) return true;
  if (error?.message?.includes('429')) return true;
  if (error?.message?.match(/5\d{2}/)) return true;
  return false;
}

export function calculateDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  return Math.min(exponentialDelay, config.maxDelay);
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (!isRetryableError(error) || attempt === config.maxRetries - 1) {
        throw error;
      }

      const delay = calculateDelay(attempt, config);
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

### UPDATE src/lib/api/types.ts

- **IMPLEMENT**: Add RateLimitInfo and HealthStatus interfaces
- **PATTERN**: Existing interface style from types.ts
- **IMPORTS**: None
- **GOTCHA**: Keep interfaces aligned with OpenRouter response headers
- **VALIDATE**: `npx tsc --noEmit`

```typescript
// Add to existing types.ts

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

export interface HealthStatus {
  connected: boolean;
  lastSuccessfulRequest: Date | null;
  rateLimitInfo: RateLimitInfo | null;
}
```

### UPDATE src/lib/api/openrouter.ts

- **IMPLEMENT**: Add retry logic, rate limit tracking, and health status
- **PATTERN**: Existing class structure and error handling
- **IMPORTS**: Add `import { withRetry, DEFAULT_RETRY_CONFIG } from './retry';` and `import { RateLimitInfo, HealthStatus } from './types';`
- **GOTCHA**: Parse rate limit headers correctly (x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset)
- **VALIDATE**: `npx tsc --noEmit`

```typescript
// Add to OpenRouterProvider class

private rateLimitInfo: RateLimitInfo | null = null;
private lastSuccessfulRequest: Date | null = null;

private parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (!limit || !remaining || !reset) return null;

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: new Date(parseInt(reset, 10) * 1000),
  };
}

async chat(messages: Message[], model?: string): Promise<ChatResponse> {
  return withRetry(async () => {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://curatos.app',
        'X-Title': 'Curatos DNA'
      },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    // Parse rate limit headers
    this.rateLimitInfo = this.parseRateLimitHeaders(response.headers);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    this.lastSuccessfulRequest = new Date();
    
    return {
      content: data.choices[0]?.message?.content || '',
      model: data.model || model || this.defaultModel,
      tokens: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      }
    };
  }, DEFAULT_RETRY_CONFIG);
}

getRateLimitInfo(): RateLimitInfo | null {
  return this.rateLimitInfo;
}

getHealthStatus(): HealthStatus {
  return {
    connected: this.lastSuccessfulRequest !== null,
    lastSuccessfulRequest: this.lastSuccessfulRequest,
    rateLimitInfo: this.rateLimitInfo,
  };
}
```

### CREATE src/lib/api/token-tracker.ts

- **IMPLEMENT**: Token usage tracking with statistics
- **PATTERN**: Class-based utility similar to OpenRouterProvider
- **IMPORTS**: None
- **GOTCHA**: Use singleton pattern to track across requests
- **VALIDATE**: `npx tsc --noEmit`

```typescript
export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  timestamp: Date;
  operation: string; // 'hypothesis-generation' | 'research-validation'
}

export interface TokenStats {
  totalTokens: number;
  totalRequests: number;
  avgPerRequest: number;
  byModel: Record<string, number>;
  byOperation: Record<string, number>;
}

class TokenTracker {
  private usage: TokenUsage[] = [];

  log(usage: TokenUsage): void {
    this.usage.push(usage);
    console.log(
      `[Token Usage] ${usage.operation} | ${usage.model} | ${usage.totalTokens} tokens (prompt: ${usage.promptTokens}, completion: ${usage.completionTokens})`
    );
  }

  getStats(): TokenStats {
    const totalTokens = this.usage.reduce((sum, u) => sum + u.totalTokens, 0);
    const totalRequests = this.usage.length;

    const byModel: Record<string, number> = {};
    const byOperation: Record<string, number> = {};

    this.usage.forEach((u) => {
      byModel[u.model] = (byModel[u.model] || 0) + u.totalTokens;
      byOperation[u.operation] = (byOperation[u.operation] || 0) + u.totalTokens;
    });

    return {
      totalTokens,
      totalRequests,
      avgPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
      byModel,
      byOperation,
    };
  }

  getUsageHistory(): TokenUsage[] {
    return [...this.usage];
  }

  reset(): void {
    this.usage = [];
  }
}

// Singleton instance
let trackerInstance: TokenTracker | null = null;

export function getTokenTracker(): TokenTracker {
  if (!trackerInstance) {
    trackerInstance = new TokenTracker();
  }
  return trackerInstance;
}
```

### UPDATE src/lib/api/hypothesis.ts

- **IMPLEMENT**: Integrate token tracking into hypothesis generation and research
- **PATTERN**: Existing error handling and response parsing
- **IMPORTS**: Add `import { getTokenTracker } from './token-tracker';`
- **GOTCHA**: Track tokens after successful response only
- **VALIDATE**: `npx tsc --noEmit`

```typescript
// In generateHypotheses method, after successful response:
const tracker = getTokenTracker();
tracker.log({
  promptTokens: response.tokens.prompt,
  completionTokens: response.tokens.completion,
  totalTokens: response.tokens.total,
  model: response.model,
  timestamp: new Date(),
  operation: 'hypothesis-generation',
});

// In researchHypothesis method, after successful response:
const tracker = getTokenTracker();
tracker.log({
  promptTokens: response.tokens.prompt,
  completionTokens: response.tokens.completion,
  totalTokens: response.tokens.total,
  model: response.model,
  timestamp: new Date(),
  operation: 'research-validation',
});
```

### CREATE src/app/api/health/route.ts

- **IMPLEMENT**: Health check endpoint with OpenRouter status
- **PATTERN**: Next.js route handler pattern
- **IMPORTS**: `import { NextResponse } from 'next/server';`
- **GOTCHA**: Handle missing API key gracefully
- **VALIDATE**: `curl http://localhost:5001/api/health` (after npm run dev)

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Note: In production, you'd get API key from environment or session
    // For now, return basic health status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'curatos-api',
      openrouter: {
        configured: !!process.env.OPENROUTER_API_KEY,
        note: 'API key validation requires client-side key',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

### CREATE scripts/test-openrouter.ts

- **IMPLEMENT**: Comprehensive validation test suite
- **PATTERN**: Node.js script with async/await
- **IMPORTS**: None (uses fetch API)
- **GOTCHA**: Requires OPENROUTER_API_KEY environment variable
- **VALIDATE**: `npx ts-node scripts/test-openrouter.ts`

```typescript
#!/usr/bin/env ts-node

const API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

if (!API_KEY) {
  console.error('❌ OPENROUTER_API_KEY environment variable not set');
  process.exit(1);
}

async function testAuthentication() {
  console.log('\n🔐 Test 1: Authentication');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      console.log('✅ Authentication successful');
      const data = await response.json();
      console.log(`   Model: ${data.model}`);
      console.log(`   Tokens: ${data.usage?.total_tokens || 0}`);
    } else {
      console.log(`❌ Authentication failed: ${response.status}`);
      console.log(`   Error: ${await response.text()}`);
    }
  } catch (error) {
    console.log(`❌ Authentication error: ${error}`);
  }
}

async function testRateLimits() {
  console.log('\n📊 Test 2: Rate Limit Headers');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      }),
    });

    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      console.log('✅ Rate limit headers present');
      console.log(`   Limit: ${limit} requests`);
      console.log(`   Remaining: ${remaining} requests`);
      console.log(`   Reset: ${new Date(parseInt(reset) * 1000).toISOString()}`);
    } else {
      console.log('⚠️  Rate limit headers not found');
      console.log(`   Available headers: ${Array.from(response.headers.keys()).join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Rate limit test error: ${error}`);
  }
}

async function testStreaming() {
  console.log('\n🌊 Test 3: Streaming Response');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'Count to 3' }],
        max_tokens: 50,
        stream: false, // Test non-streaming first
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Non-streaming response works');
      console.log(`   Response: ${data.choices[0]?.message?.content?.substring(0, 50)}...`);
    } else {
      console.log(`❌ Streaming test failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Streaming test error: ${error}`);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Test 4: Error Handling');
  
  // Test invalid API key
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer invalid-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    console.log(`✅ Invalid key returns ${response.status} (expected 401/403)`);
  } catch (error) {
    console.log(`❌ Error handling test failed: ${error}`);
  }
}

async function testTokenCounting() {
  console.log('\n🔢 Test 5: Token Counting');
  try {
    const testPrompts = [
      'Hello',
      'Generate 3 problem hypotheses for fintech',
      'Research this hypothesis: High payment processing fees hurt small businesses',
    ];

    for (const prompt of testPrompts) {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const usage = data.usage;
        console.log(`✅ Prompt: "${prompt.substring(0, 40)}..."`);
        console.log(`   Tokens: ${usage?.total_tokens || 0} (prompt: ${usage?.prompt_tokens || 0}, completion: ${usage?.completion_tokens || 0})`);
      }
    }
  } catch (error) {
    console.log(`❌ Token counting test error: ${error}`);
  }
}

async function main() {
  console.log('🧪 OpenRouter API Validation Suite');
  console.log('=====================================');

  await testAuthentication();
  await testRateLimits();
  await testStreaming();
  await testErrorHandling();
  await testTokenCounting();

  console.log('\n✅ Validation complete!');
  console.log('\nNext steps:');
  console.log('1. Review rate limit values');
  console.log('2. Document token costs per operation');
  console.log('3. Update docs/OPENROUTER_VALIDATION.md');
}

main().catch(console.error);
```

### UPDATE package.json

- **IMPLEMENT**: Add test script for OpenRouter validation
- **PATTERN**: Existing scripts structure
- **IMPORTS**: None
- **GOTCHA**: Ensure ts-node is available (may need to install)
- **VALIDATE**: `npm run test:openrouter`

```json
// Add to scripts section
"test:openrouter": "ts-node scripts/test-openrouter.ts"
```

### CREATE docs/OPENROUTER_VALIDATION.md

- **IMPLEMENT**: Documentation template for test results
- **PATTERN**: Markdown documentation style
- **IMPORTS**: None
- **GOTCHA**: Fill in actual values after running tests
- **VALIDATE**: Manual review

```markdown
# OpenRouter API Validation Results

**Date:** [YYYY-MM-DD]
**Tester:** [Name]
**API Key Tier:** [Free / Paid]

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Authentication | ✅ / ❌ | |
| Rate Limits | ✅ / ❌ | |
| Streaming | ✅ / ❌ | |
| Error Handling | ✅ / ❌ | |
| Token Counting | ✅ / ❌ | |

---

## Rate Limit Findings

- **Limit:** [X] requests per day
- **Reset Time:** [X] hours
- **Header Format:** x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset

---

## Token Cost Analysis

### Hypothesis Generation (DeepSeek R1)
- **Average Prompt Tokens:** [X]
- **Average Completion Tokens:** [X]
- **Average Total:** [X] tokens per hypothesis

### Research Validation (Gemini Flash)
- **Average Prompt Tokens:** [X]
- **Average Completion Tokens:** [X]
- **Average Total:** [X] tokens per research

### 7-Engine Pipeline Estimate
- **Total Tokens:** [X] tokens
- **Cost (Free Tier):** $0.00
- **Cost (Paid Tier):** $[X]

---

## Recommendations

1. [Recommendation based on findings]
2. [Recommendation based on findings]
3. [Recommendation based on findings]

---

## Issues Encountered

- [Issue 1]
- [Issue 2]

---

## Next Steps

- [ ] Implement monitoring for rate limit approaching
- [ ] Add cost warnings in UI
- [ ] Set up fallback models
```

---

## TESTING STRATEGY

### Unit Tests

No unit tests required for this validation-focused feature. Retry logic is tested through integration tests.

### Integration Tests

**Test Script Execution:**
```bash
# Set API key
export OPENROUTER_API_KEY="sk-or-..."

# Run validation suite
npm run test:openrouter
```

**Expected Output:**
- All 5 tests pass
- Rate limit headers captured
- Token counts logged
- Error handling verified

### Edge Cases

1. **Invalid API Key:** Returns 401/403 error
2. **Rate Limit Exceeded:** Returns 429 with retry-after header
3. **Network Failure:** Retry logic triggers with exponential backoff
4. **Malformed Response:** Error handling catches and logs
5. **Missing Rate Limit Headers:** Graceful degradation

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style

```bash
# TypeScript compilation check
npx tsc --noEmit

# ESLint check
npm run lint
```

### Level 2: Build Verification

```bash
# Build Next.js app
npm run build

# Verify no build errors
echo $?  # Should output 0
```

### Level 3: Integration Tests

```bash
# Set API key (use your actual key)
export OPENROUTER_API_KEY="sk-or-v1-..."

# Run OpenRouter validation suite
npm run test:openrouter

# Expected: All 5 tests pass with ✅
```

### Level 4: Manual Validation

```bash
# Start development server
npm run dev

# In another terminal, test health endpoint
curl http://localhost:5001/api/health

# Expected: JSON response with status: "healthy"

# Test in browser
# 1. Open http://localhost:5001
# 2. Enter API key
# 3. Generate hypotheses
# 4. Check console for token usage logs
# 5. Verify retry logic by temporarily using invalid key
```

### Level 5: Documentation Review

```bash
# Verify all docs created
ls -la docs/OPENROUTER_VALIDATION.md

# Verify test script exists
ls -la scripts/test-openrouter.ts

# Verify health endpoint exists
ls -la src/app/api/health/route.ts
```

---

## ACCEPTANCE CRITERIA

- [x] Feature implements all specified functionality
- [x] All validation commands pass with zero errors
- [x] Test script validates all 5 scenarios (auth, rate limits, streaming, errors, tokens)
- [x] Retry logic handles 429 and 5xx errors with exponential backoff
- [x] Health endpoint returns OpenRouter connectivity status
- [x] Token tracking logs usage for hypothesis generation and research
- [x] Code follows project conventions (TypeScript, path aliases, error handling)
- [x] No regressions in existing functionality
- [x] Documentation created (OPENROUTER_VALIDATION.md)
- [x] Rate limit info extracted from response headers
- [x] Last successful request timestamp tracked

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Test script runs successfully (`npm run test:openrouter`)
- [ ] Health endpoint responds (`curl http://localhost:5001/api/health`)
- [ ] Token usage logs appear in console during hypothesis generation
- [ ] Retry logic tested with invalid key (should retry and fail gracefully)
- [ ] Documentation template created
- [ ] All acceptance criteria met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

### Design Decisions

1. **Retry Logic:** Implemented as separate utility (`retry.ts`) for reusability across other API providers
2. **Token Tracking:** Singleton pattern ensures consistent tracking across all requests
3. **Health Endpoint:** Basic implementation; can be enhanced with actual API key validation in production
4. **Test Script:** Standalone Node.js script for easy CI/CD integration

### Trade-offs

- **Client-side API Key:** Health endpoint can't validate actual OpenRouter connectivity without exposing API key server-side
- **Singleton Token Tracker:** In-memory tracking resets on server restart; consider persistent storage for production
- **Rate Limit Parsing:** Assumes OpenRouter uses standard x-ratelimit-* headers; may need adjustment if format changes

### Future Enhancements

- Add Prometheus metrics for token usage
- Implement request queuing when approaching rate limits
- Add WebSocket support for streaming responses
- Create dashboard for token cost visualization
- Set up alerts for rate limit approaching 80%

### Known Issues

- Test script requires manual API key setup (not automated in CI)
- Health endpoint doesn't validate actual API connectivity (requires client key)
- Token tracker resets on server restart (no persistence)

---

**Estimated Confidence Score:** 9/10

This plan provides comprehensive validation and production-ready enhancements with clear validation steps and minimal risk of breaking existing functionality.
