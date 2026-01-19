# Source Prioritization Fix - Implementation Summary

## Problem Fixed
Wikipedia was being overused without proper context filtering and source prioritization, leading to poor research quality for market validation queries.

## Changes Made

### 1. Enhanced Source Interface (`src/lib/api/research-agent.ts`)
```typescript
interface Source {
  // ... existing fields
  source_type: 'official' | 'structured_api' | 'news' | 'wikipedia' | 'community';
  confidence_weight: number;
}
```

### 2. Source Prioritization System
**Priority Order** (APIs queried in this sequence):
1. **Serper (Web Search)** - Priority 1, up to 8 results
2. **OpenAlex (Academic)** - Priority 2, up to 5 results  
3. **Hacker News** - Priority 3, up to 5 results
4. **Wikipedia** - Priority 4, up to 3 results (FALLBACK ONLY)

**Early Stop Logic**: If Serper returns ≥5 results, skip lower priority sources.

### 3. Source Classification & Weighting
```typescript
function classifySource(url: string, source: string): {
  source_type: Source['source_type'];
  confidence_weight: number;
}
```

**Weight Distribution**:
- Official sources (gov, edu, major companies): **1.0**
- Structured APIs (OpenAlex, DOI): **0.95**  
- News sources (TechCrunch, Reuters, etc.): **0.80**
- Community sources (forums, blogs): **0.75**
- Wikipedia: **0.70**

### 4. Wikipedia Context Filtering
```typescript
function shouldUseWikipediaResult(hypothesis: string, title: string, snippet: string): boolean
```

**✅ Allowed Contexts**:
- Industry definitions ("what is", "definition")
- Company founding dates ("founded", "established")
- Headquarters locations ("headquarters", "location")  
- Historical context ("history", "timeline", "evolution")

**❌ Blocked Contexts**:
- Pricing/revenue data ("pricing", "cost", "revenue")
- Market size analysis ("market size", "valuation")
- Competitive analysis ("competitors", "vs", "alternative")
- Problem validation ("problem", "pain point", "challenge")

### 5. Enhanced Confidence Scoring
**New Scoring Factors**:
- **Source Quality Bonus**: `(avg_weight - 0.75) * 20` points
- **Wikipedia Penalty**: `-5%` per Wikipedia source beyond 2
- **Official Sources Bonus**: `+8%` per official source
- **Academic Sources Bonus**: `+10%` per academic source
- **Diversity Bonus**: `+10%` for 3+ source types, `+5%` for 2+ types

### 6. Updated Source Display Format
Sources now include source type and confidence weight:
```
[OFFICIAL][stripe.com](100%) Stripe Payment Processing ||| Accept payments online ||| https://stripe.com
[NEWS][techcrunch.com](80%) Fintech Startup Raises $50M ||| Series B funding round ||| https://techcrunch.com/...
[WIKIPEDIA][wikipedia.org](70%) Payment processor ||| A payment processor is... ||| https://en.wikipedia.org/...
```

## Testing
- ✅ Build passes with 0 TypeScript errors
- ✅ All existing functionality preserved
- ✅ New source prioritization logic implemented
- ✅ Wikipedia filtering active for market research queries
- ✅ Enhanced confidence scoring with source weighting

## Impact
- **Better Research Quality**: Official and news sources prioritized over Wikipedia
- **Context-Aware Filtering**: Wikipedia only used for appropriate contexts
- **Transparent Scoring**: Users can see source types and confidence weights
- **Improved Confidence**: More accurate confidence scores based on source quality
- **Maintained Performance**: No breaking changes to existing API contracts

## Files Modified
1. `src/lib/api/research-agent.ts` - Core prioritization logic
2. `src/lib/api/hypothesis.ts` - Updated source formatting
3. `.kiro/specs/hypothesis-engine.md` - Updated documentation
4. `scripts/test-source-prioritization.ts` - New test script
