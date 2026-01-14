# Bug Fixes - January 14, 2026

## Issues Fixed

### 1. NextAuth Server Component Error
**Problem:** React Context (SessionProvider) unavailable in Server Components
**Solution:** Removed NextAuth entirely for MVP since we're using API keys in localStorage

**Changes:**
- Uninstalled `next-auth`, `bcrypt`, `@types/bcrypt`
- Removed all auth-related files:
  - `src/lib/auth/`
  - `src/components/auth/`
  - `src/pages/api/auth/`
  - `src/middleware.ts`
  - `src/types/next-auth.d.ts`
- Cleaned up `src/app/layout.tsx` (removed AuthProvider)
- Updated research API endpoints to remove auth checks

### 2. Connect Button Stays Disabled
**Problem:** Button remained disabled even with valid OpenRouter API key entered
**Root Cause:** `validateKey()` was making a full chat request which was slow/failing

**Solution:**
1. Changed `validateKey()` to use lightweight `/models` endpoint instead of chat
2. Added client-side format validation: `sk-or-` prefix + length > 20
3. Button now enables immediately when format is valid

**Changes:**
- `src/lib/api/openrouter.ts`: Updated `validateKey()` method
- `src/components/dashboard/APIConnector.tsx`: Added `isValidFormat` check

### 3. START Button Says "Enter a niche first"
**Problem:** Button showed error even when niche input had text
**Root Cause:** `EnhancedHeader` component's local `nicheInput` state wasn't syncing with parent on every keystroke

**Solution:** Added `onNicheChange(e.target.value)` to the input's `onChange` handler

**Changes:**
- `src/components/dashboard/EnhancedHeader.tsx`: Update parent state on every keystroke

### 4. Research Failing with 404 Error
**Problem:** `google/gemini-2.0-flash-exp:online` returned "No endpoint" error
**Root Cause:** Incorrect format for free models with online search

**Solution:** Changed to correct format: `google/gemini-2.0-flash-exp:free:online`

According to OpenRouter docs, free models with web search use the format `model:free:online`, not `model:online`.

**Changes:**
- `src/lib/api/hypothesis.ts`: Updated model string to `google/gemini-2.0-flash-exp:free:online`

**Cost:** Web search with Exa costs $4 per 1000 results (default 5 results = $0.02 per request)

### 5. Hypothesis Sources Show Wrong URLs
**Problem:** Clicking on validated hypothesis sources showed incorrect href attributes
**Example Bug:** 
- Source text: "60% of Small Businesses Struggle With Cash Flow Management: https://pymnts.com/smbs/2024/..."
- Link href: "https://research.example.com/60%-of-small-businesses-..."

**Root Cause:** `getSourceUrl()` function treated entire source string as a title instead of parsing "Title: URL" format

**Solution:** 
1. Added `parseSource()` function to extract title and URL separately using regex
2. Regex pattern: `/^(.+?):\s*(https?:\/\/[^\s]+)$/` matches "Title: URL" format
3. Links now use actual URLs (pymnts.com, ey.com, quickbooks.intuit.com, etc.)

**Changes:**
- `src/components/dashboard/HypothesisModal.tsx`: 
  - Added `parseSource()` function to extract title and URL
  - Updated source rendering to use parsed values
  - Removed `research.example.com` fallback
  - Added `break-all` class to prevent long URLs from breaking layout

## Verification

✅ TypeScript compilation passes
✅ ESLint validation passes  
✅ Dev server starts without errors
✅ Homepage loads correctly
✅ Connect button enables with valid key format
✅ Niche input updates state on keystroke
✅ Research uses correct online model format

## Testing

To test the full flow:
1. Visit http://localhost:5001
2. Enter an OpenRouter API key starting with `sk-or-`
3. Type a niche (e.g., "fintech payments")
4. Click START ENGINE
5. Research should now work with real web search results

## Notes

- MVP now uses localStorage for API keys (client-side only)
- No authentication/user management in current version
- All research endpoints use `demo-user` as userId
- Web search costs $0.02 per request (5 results via Exa)
- For production, implement proper auth system
