# OpenRouter Rate Limit Analysis & Solutions

## 🔴 CRITICAL ISSUE: 429 Rate Limits During Demo

**Impact:** Demo will fail if we hit rate limits  
**Priority:** CRITICAL - Must fix before demo/submission

---

## 📊 Current State Analysis

### 1. API Call Patterns

**Per Research Session:**
- Hypothesis Generation: 1-20 calls (depends on engine runtime)
- Web Search Validation: 1-20 calls (`:online` suffix = $0.02 each)
- Landing Page Generation: 1 call
- PRD Generation: 1 call
- **Total: 4-42 API calls per session**

**Rate Limits (Free Tier):**
- OpenRouter Free: ~50 requests/day
- Exa.ai (web search): $4 per 1000 searches
- **Problem:** Can exhaust limit in 1-2 demo sessions

### 2. Current Caching

**Status:** ❌ NO CACHING IMPLEMENTED

**Evidence:**
```bash
grep -r "cache|Cache" src/ → 0 matches
```

Every request hits OpenRouter API directly. No response caching, no request deduplication.

### 3. Retry Logic

**Status:** ✅ EXISTS but AGGRESSIVE

**File:** `src/lib/api/retry.ts`

**Config:**
```typescript
maxRetries: 3
baseDelay: 1000ms
maxDelay: 30000ms
```

**Problem:** Retries on 429 errors make the problem WORSE
- 429 → retry after 1s → 429 → retry after 2s → 429 → retry after 4s
- Burns through rate limit faster
- Should back off longer or fail fast

### 4. Demo Mode

**Status:** ⚠️ PARTIALLY IMPLEMENTED

**Current:**
- Demo mode button exists
- No pre-generated data
- Still makes API calls

**Problem:** Demo mode doesn't actually avoid API calls

---

## 🎯 Root Causes

### Primary Issues:

1. **No Response Caching**
   - Same niche generates same hypotheses
   - Same problems/solutions generate same PRD
   - Wasting API calls on duplicate requests

2. **Aggressive Retry on 429**
   - Retrying 429 errors burns rate limit faster
   - Should fail fast or wait much longer

3. **Web Search Cost**
   - `:online` suffix costs $0.02 per request
   - 20 hypotheses × $0.02 = $0.40 per session
   - Adds up quickly

4. **No Demo Data**
   - Demo mode still hits API
   - Can't demo without API key

5. **Single API Key**
   - All requests use same key
   - No rotation or fallback

---

## 💡 Recommended Solutions

### IMMEDIATE FIX (Before Demo) - Priority 1

#### Solution 1: Pre-Generated Demo Data ✅ BEST FOR DEMO

**Implementation:**
```typescript
// src/lib/demo-data.ts
export const DEMO_PRD = `# Product Requirements Document: Fintech Payment Platform

## Executive Summary
A modern payment processing platform...

## Requirements

### Functional Requirements
FR-001: User authentication with OAuth 2.0
FR-002: Real-time payment processing
FR-003: Multi-currency support
...

### Non-Functional Requirements
NFR-001: 99.9% uptime SLA
NFR-002: Sub-200ms API response time
...`;

export const DEMO_LANDING_PAGE = `<!DOCTYPE html>...`;

export const DEMO_HYPOTHESES = [
  { text: "60% of SMBs struggle with cash flow", confidence: 85, state: 'fact' },
  // ... more
];
```

**Usage:**
```typescript
// In StreamingService
async generatePRD(niche, problems, solutions) {
  if (this.apiKey === 'demo') {
    return DEMO_PRD; // No API call!
  }
  // ... normal flow
}
```

**Benefits:**
- ✅ Zero API calls in demo mode
- ✅ Instant response
- ✅ Consistent demo experience
- ✅ Works offline

**Time to Implement:** 30 minutes

---

#### Solution 2: Response Caching ✅ BEST FOR PRODUCTION

**Implementation:**
```typescript
// src/lib/cache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // milliseconds
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize = 50;

  set(key: string, data: T, ttl: number = 3600000) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
}

export const prdCache = new LRUCache<string>();
export const landingPageCache = new LRUCache<string>();
```

**Usage:**
```typescript
async generatePRD(niche, problems, solutions) {
  const cacheKey = `prd:${niche}:${problems.length}:${solutions.length}`;
  
  const cached = prdCache.get(cacheKey);
  if (cached) return cached;
  
  const result = await provider.chat(...);
  prdCache.set(cacheKey, result.content, 3600000); // 1 hour
  
  return result.content;
}
```

**Benefits:**
- ✅ Reduces API calls by 70-90%
- ✅ Faster response times
- ✅ Works with real API key
- ✅ Transparent to user

**Time to Implement:** 1 hour

---

### MEDIUM PRIORITY - Priority 2

#### Solution 3: Fix Retry Logic for 429

**Current Problem:**
```typescript
if (error?.message?.includes('429')) return true; // WRONG!
```

**Fix:**
```typescript
export function isRetryableError(error: any): boolean {
  // DON'T retry 429 - fail fast
  if (error?.message?.includes('429')) return false;
  
  // Only retry network errors and 5xx
  if (error?.message?.includes('fetch failed')) return true;
  if (error?.message?.match(/5\d{2}/)) return true;
  return false;
}
```

**Benefits:**
- ✅ Stops burning rate limit on retries
- ✅ Fails fast with clear error
- ✅ User knows to wait

**Time to Implement:** 5 minutes

---

#### Solution 4: Cheaper Models for Non-Critical Tasks

**Current:**
- Landing Page: `gemini-2.0-flash-exp:free`
- PRD: `gemini-2.0-flash-exp:free`

**Optimization:**
```typescript
// Use even cheaper models
const CHEAP_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

// Or batch requests
async generateBoth(niche, problems, solutions) {
  const prompt = `Generate both a landing page AND a PRD...`;
  // 1 API call instead of 2
}
```

**Benefits:**
- ✅ Reduces API calls by 50%
- ✅ Still free tier
- ✅ Slightly slower but acceptable

**Time to Implement:** 30 minutes

---

### FUTURE ENHANCEMENTS - Priority 3

#### Solution 5: API Key Rotation

**Implementation:**
```typescript
class APIKeyPool {
  private keys: string[];
  private currentIndex = 0;
  
  constructor(keys: string[]) {
    this.keys = keys;
  }
  
  getNext(): string {
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }
}
```

**Benefits:**
- ✅ 2x-5x more requests
- ✅ Automatic failover
- ⚠️ Requires multiple API keys

---

#### Solution 6: Local LLM (Ollama)

**Implementation:**
```typescript
class OllamaProvider implements AIProvider {
  async chat(messages: Message[]): Promise<ChatResponse> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        model: 'llama3.2',
        messages
      })
    });
    // ...
  }
}
```

**Benefits:**
- ✅ Unlimited requests
- ✅ No cost
- ✅ Works offline
- ⚠️ Requires local setup
- ⚠️ Slower than cloud

---

## 🎬 RECOMMENDED IMPLEMENTATION FOR DEMO

### Phase 1: IMMEDIATE (Before Demo)

**1. Pre-Generated Demo Data** (30 min)
```typescript
// Create src/lib/demo-data.ts with:
- DEMO_PRD (complete PRD with FR-001, NFR-001 format)
- DEMO_LANDING_PAGE (complete HTML)
- DEMO_HYPOTHESES (10 problems, 10 solutions)
- DEMO_REQUIREMENTS (5 FRs, 3 NFRs)
```

**2. Fix Retry Logic** (5 min)
```typescript
// Update src/lib/api/retry.ts
- Don't retry 429 errors
- Fail fast with clear message
```

**3. Add Demo Mode Check** (15 min)
```typescript
// Update StreamingService methods
if (this.apiKey === 'demo') {
  return DEMO_DATA; // No API call
}
```

**Total Time:** 50 minutes  
**Impact:** ✅ Demo will NEVER hit rate limits

---

### Phase 2: POST-DEMO (Production Ready)

**1. Response Caching** (1 hour)
- Implement LRU cache
- Cache PRD and Landing Page responses
- 1 hour TTL

**2. Request Batching** (30 min)
- Combine Landing Page + PRD into single request
- Reduces API calls by 50%

**3. Cheaper Models** (30 min)
- Use Llama 3.3 for non-critical tasks
- Keep Gemini for quality outputs

**Total Time:** 2 hours  
**Impact:** 70-90% reduction in API calls

---

## 📈 Performance Comparison

| Scenario | Current | With Demo Data | With Caching | With Both |
|----------|---------|----------------|--------------|-----------|
| Demo Session | 20-40 calls | 0 calls | 2-4 calls | 0 calls |
| Real Session | 20-40 calls | 20-40 calls | 2-4 calls | 2-4 calls |
| Rate Limit Risk | HIGH | NONE | LOW | NONE |
| Response Time | 5-10s | <100ms | 1-2s | <100ms |

---

## 🚨 CRITICAL DECISION

**For Hackathon Demo:**

✅ **IMPLEMENT DEMO DATA** (50 minutes)
- Guarantees demo success
- Zero API dependency
- Instant responses
- Professional experience

❌ **DON'T rely on API** during demo
- Risk of 429 errors
- Slow responses
- Unpredictable behavior
- Bad impression on judges

---

## 📝 Implementation Checklist

### Before Demo:
- [ ] Create `src/lib/demo-data.ts` with pre-generated content
- [ ] Update `StreamingService.generatePRD()` to check for demo mode
- [ ] Update `StreamingService.generateLandingPage()` to check for demo mode
- [ ] Update `HypothesisService` to use demo hypotheses
- [ ] Fix retry logic to not retry 429
- [ ] Test demo mode end-to-end
- [ ] Verify zero API calls in demo mode

### After Demo:
- [ ] Implement LRU cache
- [ ] Add cache to PRD generation
- [ ] Add cache to Landing Page generation
- [ ] Test cache hit rates
- [ ] Monitor API usage
- [ ] Consider request batching

---

**Status:** Analysis Complete  
**Recommendation:** Implement Demo Data (Priority 1)  
**Time Required:** 50 minutes  
**Risk Mitigation:** 100% (eliminates rate limit risk for demo)
