# API Machine Gun - Multi-Source Hypothesis Validation

## Overview
Replace expensive OpenRouter `:online` search with 7 FREE APIs + Serper for hypothesis validation.

## Problem
- OpenRouter `:online` suffix costs money per search
- Single source validation is unreliable
- No visibility into which sources contributed

## Solution
Query 7 FREE APIs in parallel + Serper, then consolidate with LLM.

## Architecture Flow
```
Hypothesis → [7 FREE APIs + Serper] → LLM Consolidation → Validated Fact
                    ↓
            All queries parallel
```

## API Sources

| API | Purpose | Rate Limit | Auth |
|-----|---------|------------|------|
| Wikipedia | General knowledge | None | None |
| Wikidata | Structured data | None | None |
| HackerNews | Tech discussions | None | None |
| OpenAlex | Academic research | None | None |
| RemoteOK | Job market signals | None | None |
| PullPush (Reddit) | Community discussions | None | None |
| FRED | Economic data | None | None |
| Serper | Web search | 2500/mo | API Key |

## Files to Create

### API Adapters (`src/lib/research/apis/`)
Each adapter exports:
```typescript
interface APIResult {
  source: string;      // API name
  success: boolean;    // Did it work?
  data: any[];         // Results array
  error?: string;      // Error message if failed
  queryTime: number;   // MS to complete
}

function search(query: string): Promise<APIResult>
```

- `wikipedia.ts` - Wikipedia API search
- `wikidata.ts` - Wikidata SPARQL search
- `hackernews.ts` - Algolia HN search
- `openAlex.ts` - OpenAlex works search
- `remoteok.ts` - RemoteOK jobs search
- `pullpush.ts` - Reddit via PullPush
- `fred.ts` - FRED economic series
- `serper.ts` - Serper web search

### Orchestrator (`src/lib/research/engines/api-machine-gun.ts`)
- Fires all APIs in parallel
- Collects results with timing
- Logs failures visibly
- Passes to LLM for consolidation
- Returns validated fact with sources

## Critical Requirements

1. **No Silent Failures**: Every API call logs success/failure
2. **Parallel Execution**: All 8 APIs fire simultaneously
3. **Graceful Degradation**: Continue if some APIs fail
4. **Source Attribution**: Show user which sources worked
5. **Timing Visibility**: Log query time per source

## Integration Point
Replace `searchWeb()` call in `scoring-engine.ts` with `apiMachineGun.search()`.

## Success Criteria
- [ ] All 8 API adapters created and working
- [ ] Orchestrator fires all in parallel
- [ ] Failures logged, not silent
- [ ] LLM consolidates results
- [ ] Sources shown to user
- [ ] Scoring engine uses new system
