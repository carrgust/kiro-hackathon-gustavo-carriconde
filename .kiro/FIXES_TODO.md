# Critical Fixes Implementation Guide

## ✅ Completed (Immediate Fixes)

### 1. Security Warning for API Keys
**File:** `src/components/dashboard/APIConnector.tsx`
- Added yellow warning text about local storage security
- Users now see: "⚠️ API keys are stored locally. Never share your screen while connected."

### 2. Error Boundary
**Files:** 
- `src/components/ErrorBoundary.tsx` (new)
- `src/app/layout.tsx` (updated)
- Catches unhandled React errors
- Shows user-friendly error screen with reload button
- Prevents entire app crash

### 3. Logger Utility
**File:** `src/lib/logger.ts` (new)
- Centralized logging
- Only logs in development
- Ready for production error tracking integration (Sentry, etc.)

### 4. Constants Extraction
**File:** `src/lib/constants.ts` (new)
- Extracted all magic numbers
- Organized by category (TIMING, LIMITS, SCORES, STORAGE_KEYS)
- Type-safe with `as const`

---

## 🔧 TODO: High Priority Fixes

### 1. Fix npm Vulnerabilities (10 min)
```bash
# Review changes first
npm audit fix --force

# This will update Next.js from 14.0.4 to 14.2.35
# Test thoroughly after update
npm run build
npm run dev
```

**Risk:** May introduce breaking changes. Test all features after update.

### 2. Add Input Sanitization (1 hour)
```bash
npm install dompurify @types/dompurify
```

**Files to update:**
- `src/components/dashboard/HypothesisModal.tsx`
- `src/components/dashboard/HypothesisItem.tsx`
- `src/components/dashboard/ChatInterface.tsx`

**Example:**
```typescript
import DOMPurify from 'dompurify';

// Before
<div>{hypothesis.text}</div>

// After
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(hypothesis.text) 
}} />
```

### 3. Fix useEffect Dependencies (1 hour)
**File:** `src/app/page.tsx`

**Current issue:**
```typescript
useEffect(() => {
  // Uses state.niche, state.slider
}, [engineRunning, streamingService, state.slider, state.niche]);
```

**Fix with useCallback:**
```typescript
const handleStreaming = useCallback(async () => {
  if (!engineRunning || !streamingService) return;
  
  const focus = Math.random() < (state.slider / 100) ? 'problems' : 'solutions';
  await streamingService.streamHypothesisGeneration(state.niche, focus, onUpdate);
}, [engineRunning, streamingService, state.slider, state.niche]);

useEffect(() => {
  const interval = setInterval(handleStreaming, TIMING.STREAMING_INTERVAL_MS);
  return () => clearInterval(interval);
}, [handleStreaming]);
```

### 4. Add Accessibility Attributes (2 hours)
**Files:** All component files

**Priority components:**
- `HypothesisModal.tsx` - Add role="dialog", aria-modal, aria-labelledby
- `APIConnector.tsx` - Add aria-label to buttons
- `DNAButton.tsx` - Add aria-disabled, aria-label
- `ConfirmationModal.tsx` - Add role="alertdialog"

**Example:**
```typescript
<div 
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="..."
>
  <h2 id="modal-title" className="sr-only">
    Hypothesis Details
  </h2>
  <button 
    onClick={onClose}
    aria-label="Close modal"
  >
    ×
  </button>
</div>
```

---

## 📋 TODO: Medium Priority

### 1. Add Rate Limiting (2 hours)
**File:** `src/middleware.ts` (create)

See CODE_REVIEW.md for implementation.

### 2. Replace Console Statements (1 hour)
**Files:** 9 files with console.log/error/warn

**Find and replace:**
```bash
# Find all console statements
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# Replace with logger
import { logger } from '@/lib/logger';
logger.error('Message', error);
logger.warn('Message', data);
logger.info('Message', data);
```

### 3. Add Memoization (2 hours)
**Files:** 
- `src/components/dashboard/HypothesisColumn.tsx`
- `src/app/page.tsx`

**Example:**
```typescript
import { useMemo } from 'react';

const validatedItems = useMemo(
  () => items.filter(item => item.state === 'validated'),
  [items]
);

const dnaUnlocked = useMemo(
  () => validatedItems.length >= SCORES.DNA_UNLOCK_THRESHOLD,
  [validatedItems]
);
```

### 4. Split God Component (4 hours)
**File:** `src/app/page.tsx` (800+ lines)

**Extract into:**
- `src/components/dashboard/EngineController.tsx` - Engine start/stop logic
- `src/components/dashboard/HypothesisManager.tsx` - Hypothesis CRUD
- `src/components/dashboard/DNAGenerator.tsx` - DNA generation logic
- `src/hooks/useEngineState.ts` - State management hook
- `src/hooks/useHypothesisGeneration.ts` - Generation logic hook

---

## 🔍 Testing Checklist

After implementing fixes:

- [ ] TypeScript compiles: `npm run build`
- [ ] ESLint passes: `npm run lint`
- [ ] App loads without errors
- [ ] API connection works
- [ ] Hypothesis generation works
- [ ] Research functionality works
- [ ] DNA generation works
- [ ] Error boundary catches errors (test by throwing error)
- [ ] Security warning displays
- [ ] All modals have proper ARIA attributes
- [ ] Keyboard navigation works

---

## 📊 Progress Tracking

| Priority | Task | Status | Time Est. |
|----------|------|--------|-----------|
| 🔴 Critical | Security warning | ✅ Done | - |
| 🔴 Critical | Error boundary | ✅ Done | - |
| 🔴 Critical | Logger utility | ✅ Done | - |
| 🔴 Critical | Constants extraction | ✅ Done | - |
| 🔴 Critical | Fix npm vulnerabilities | ⏳ TODO | 10 min |
| 🟡 High | Input sanitization | ⏳ TODO | 1 hour |
| 🟡 High | Fix useEffect deps | ⏳ TODO | 1 hour |
| 🟡 High | Accessibility | ⏳ TODO | 2 hours |
| 🟢 Medium | Rate limiting | ⏳ TODO | 2 hours |
| 🟢 Medium | Replace console | ⏳ TODO | 1 hour |
| 🟢 Medium | Add memoization | ⏳ TODO | 2 hours |
| 🟢 Medium | Refactor god component | ⏳ TODO | 4 hours |

**Total Remaining:** ~14 hours of work

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All critical fixes completed
- [ ] All high priority fixes completed
- [ ] npm audit shows 0 vulnerabilities
- [ ] Environment variables configured
- [ ] Error tracking service integrated (Sentry)
- [ ] Rate limiting enabled
- [ ] Input sanitization active
- [ ] Accessibility audit passed
- [ ] Performance audit passed (Lighthouse)
- [ ] Security headers configured
- [ ] HTTPS enforced
- [ ] API keys moved to server-side (httpOnly cookies)

---

**Last Updated:** January 14, 2026  
**Next Review:** After implementing high priority fixes
