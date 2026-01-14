# STORY: OpenRouter API Validation & Production Setup

**Priority:** P0 (Critical)  
**Status:** Not Started  
**Estimated Effort:** 4-6 hours  
**Owner:** TBD

---

## Goal

Validate OpenRouter integration assumptions and ensure production-ready API connectivity for the Curatos hypothesis engine.

---

## Context

Current implementation uses OpenRouter free-tier models (DeepSeek R1, Gemini Flash, Llama 3.3) with assumptions about:
- Rate limits (50 req/day free, 1000/day with $10 credits)
- Token costs and consumption rates
- Streaming response behavior
- Error handling for 429 (rate limit) and 5xx errors

**Risk:** Production failures if assumptions are incorrect or error handling is insufficient.

---

## Acceptance Criteria

### 1. API Authentication Validation
- [ ] Test API key authentication with DeepSeek free model
- [ ] Verify error messages for invalid/expired keys
- [ ] Document authentication flow and error codes

### 2. Rate Limit Verification
- [ ] Confirm 50 requests/day limit on free tier
- [ ] Confirm 1000 requests/day with $10 credits
- [ ] Test behavior when limits are exceeded (429 errors)
- [ ] Measure actual rate limit reset timing

### 3. Retry Logic Implementation
- [ ] Implement exponential backoff for 429 errors
- [ ] Add retry logic for 5xx server errors
- [ ] Set max retry attempts (3-5 recommended)
- [ ] Log retry attempts for monitoring

### 4. Health Check Endpoint
- [ ] Create `/api/health` endpoint
- [ ] Check OpenRouter connectivity
- [ ] Return rate limit status
- [ ] Include last successful request timestamp

### 5. Token Cost Documentation
- [ ] Log actual token usage per hypothesis generation
- [ ] Log actual token usage per research validation
- [ ] Calculate total tokens for 7-engine pipeline
- [ ] Document cost per hypothesis (free vs paid)

### 6. Streaming Response Validation
- [ ] Test streaming with DeepSeek R1
- [ ] Test streaming with Gemini Flash
- [ ] Verify partial response handling
- [ ] Test connection interruption recovery

---

## Technical Design

### 1. Enhanced OpenRouter Client

**File:** `src/lib/api/openrouter.ts`

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // ms
  maxDelay: number; // ms
}

interface RateLimitInfo {
  remaining: number;
  reset: Date;
  limit: number;
}

class OpenRouterClient {
  private rateLimitInfo: RateLimitInfo | null = null;
  private lastSuccessfulRequest: Date | null = null;
  
  async callWithRetry(
    prompt: string,
    config: RetryConfig = { maxRetries: 3, baseDelay: 1000, maxDelay: 30000 }
  ): Promise<Response> {
    // Exponential backoff implementation
  }
  
  getRateLimitInfo(): RateLimitInfo | null {
    return this.rateLimitInfo;
  }
  
  getHealthStatus(): HealthStatus {
    // Return connectivity status
  }
}
```

### 2. Health Check Endpoint

**File:** `src/app/api/health/route.ts`

```typescript
export async function GET() {
  const client = getOpenRouterClient();
  const status = client.getHealthStatus();
  const rateLimits = client.getRateLimitInfo();
  
  return Response.json({
    status: status.connected ? 'healthy' : 'degraded',
    openrouter: {
      connected: status.connected,
      lastSuccess: status.lastSuccessfulRequest,
      rateLimit: rateLimits
    },
    timestamp: new Date().toISOString()
  });
}
```

### 3. Token Usage Logger

**File:** `src/lib/api/token-tracker.ts`

```typescript
interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  timestamp: Date;
}

class TokenTracker {
  private usage: TokenUsage[] = [];
  
  log(usage: TokenUsage): void {
    this.usage.push(usage);
    console.log(`[Token Usage] ${usage.model}: ${usage.totalTokens} tokens`);
  }
  
  getStats(): {
    totalTokens: number;
    avgPerRequest: number;
    byModel: Record<string, number>;
  } {
    // Calculate statistics
  }
}
```

### 4. Test Script

**File:** `scripts/test-openrouter.ts`

```typescript
async function testOpenRouterSetup() {
  console.log('🧪 Testing OpenRouter API Setup...\n');
  
  // Test 1: Authentication
  await testAuthentication();
  
  // Test 2: Rate Limits
  await testRateLimits();
  
  // Test 3: Streaming
  await testStreaming();
  
  // Test 4: Error Handling
  await testErrorHandling();
  
  // Test 5: Token Counting
  await testTokenCounting();
}
```

---

## Implementation Tasks

### Phase 1: Core Validation (2 hours)
- [ ] Create test script `scripts/test-openrouter.ts`
- [ ] Test API key authentication with DeepSeek
- [ ] Test streaming response handling
- [ ] Document findings in `docs/OPENROUTER_VALIDATION.md`

### Phase 2: Retry Logic (1.5 hours)
- [ ] Add retry configuration to `openrouter.ts`
- [ ] Implement exponential backoff for 429 errors
- [ ] Add retry logic for 5xx errors
- [ ] Add logging for retry attempts
- [ ] Unit tests for retry logic

### Phase 3: Health Check (1 hour)
- [ ] Create `/api/health/route.ts`
- [ ] Implement OpenRouter connectivity check
- [ ] Add rate limit info to response
- [ ] Test health endpoint

### Phase 4: Token Tracking (1.5 hours)
- [ ] Create `token-tracker.ts` utility
- [ ] Integrate with hypothesis generation
- [ ] Integrate with research validation
- [ ] Log token usage to console
- [ ] Calculate 7-engine pipeline costs
- [ ] Update `docs/OPENROUTER_INTEGRATION.md` with real data

---

## Testing Strategy

### Manual Testing
1. Run test script with valid API key
2. Run test script with invalid API key
3. Trigger rate limit (make 51 requests)
4. Test streaming with slow connection
5. Monitor token usage for 10 hypothesis generations

### Automated Testing
```bash
# Run validation script
npm run test:openrouter

# Check health endpoint
curl http://localhost:3000/api/health

# Monitor token usage
npm run dev # Watch console logs
```

---

## Success Metrics

- ✅ All 6 acceptance criteria met
- ✅ Zero production API failures in first week
- ✅ Actual token costs documented (±10% accuracy)
- ✅ Rate limit handling prevents user-facing errors
- ✅ Health endpoint returns accurate status

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Free tier rate limits too restrictive | High | Document paid tier upgrade path |
| Token costs higher than expected | Medium | Implement token budget warnings |
| Streaming unreliable | Medium | Add fallback to non-streaming |
| OpenRouter API changes | Low | Monitor changelog, version API calls |

---

## Documentation Updates

After completion, update:
1. `docs/OPENROUTER_INTEGRATION.md` - Add validation results
2. `README.md` - Update API setup instructions
3. `.kiro/DEVLOG.md` - Log findings and decisions
4. Create `docs/OPENROUTER_VALIDATION.md` - Detailed test results

---

## Dependencies

- OpenRouter API key (free tier sufficient for testing)
- Node.js 18+ for test script
- Access to production environment for health check testing

---

## Follow-up Stories

- **Monitoring & Alerting:** Set up alerts for rate limit approaching
- **Cost Optimization:** Implement model selection based on token budget
- **Fallback Strategy:** Add alternative AI providers (Anthropic, OpenAI direct)
- **Caching Layer:** Cache hypothesis generations to reduce API calls

---

## Notes

- OpenRouter provides rate limit info in response headers (`x-ratelimit-*`)
- Free tier models may have variable availability
- Consider implementing request queuing for rate limit management
- Token costs vary by model - track separately for each

---

**Created:** 2026-01-13  
**Last Updated:** 2026-01-13
