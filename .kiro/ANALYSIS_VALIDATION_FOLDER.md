# Validation Folder Analysis

**Date**: 2026-01-28  
**Location**: `src/lib/validation/`

---

## FILE INVENTORY

| File | Size | Last Modified | Status |
|------|------|---------------|--------|
| api-pillar-registry.json | 5.3 KB | Jan 28 17:38 | ✅ ACTIVE |
| source-searcher.ts | 7.3 KB | Jan 28 17:38 | ✅ ACTIVE |
| config.ts | 20.5 KB | Jan 28 17:37 | ✅ ACTIVE |
| model-client.ts | 1.4 KB | Jan 28 17:08 | ✅ ACTIVE |
| query-builder.ts | 755 B | Jan 28 13:33 | ✅ ACTIVE |
| keyword-extractor.ts | 2.6 KB | Jan 28 13:33 | ✅ ACTIVE |
| registry-loader.ts | 1.4 KB | Jan 28 13:32 | ✅ ACTIVE |
| prompts.ts | 1.6 KB | Jan 28 10:48 | ✅ ACTIVE |

**Total Files**: 8  
**Total Size**: ~40 KB

---

## DETAILED ANALYSIS

### 1. api-pillar-registry.json (5.3 KB)
**Purpose**: Central registry mapping 7 pillars to 8 APIs with 28 search prompts

**Structure**:
```json
{
  "apis": { /* 8 API configs */ },
  "pillars": { /* 7 pillars with API mappings and prompts */ }
}
```

**Used By**:
- `registry-loader.ts` (imports directly)

**Status**: ✅ ACTIVE - Core data file

---

### 2. registry-loader.ts (1.4 KB)
**Purpose**: Loads and queries the API-Pillar registry

**Exports**:
- `getRegistry()` - Returns full registry
- `getPillarConfig(pillarKey)` - Get pillar config
- `getApiConfig(apiId)` - Get API config
- `getApisForPillar(pillarKey)` - Get APIs for a pillar
- `getPromptForApi(pillarKey, apiId)` - Get prompt template

**Used By**:
- `query-builder.ts` (imports `getPromptForApi`, `getPillarConfig`)
- `source-searcher.ts` (imports `getApiConfig`, `getApisForPillar`)
- `src/app/api/validate/route.ts` (imports `getApisForPillar`)

**Status**: ✅ ACTIVE - Core registry access layer

---

### 3. keyword-extractor.ts (2.6 KB)
**Purpose**: Extracts keywords and industry from business description

**Exports**:
- `ExtractedKeywords` interface
- `extractKeywords(businessDescription)` - Returns `{keyword, industry, terms}`

**Algorithm**:
- Tokenizes text
- Filters stop words
- Detects industry from keyword map (25 industries)
- Returns top 3 terms as keyword

**Used By**:
- `query-builder.ts` (imports `ExtractedKeywords` type)
- `source-searcher.ts` (imports `extractKeywords` function)

**Status**: ✅ ACTIVE - Used in search query generation

---

### 4. query-builder.ts (755 B)
**Purpose**: Builds API search queries from templates

**Exports**:
- `buildQuery(pillarKey, apiId, keywords)` - Replaces `{keyword}` and `{industry}` in templates
- `buildQueriesForPillar(pillarKey, keywords)` - Builds queries for all APIs in a pillar

**Used By**:
- `source-searcher.ts` (imports `buildQuery`)

**Status**: ✅ ACTIVE - Core query generation

---

### 5. model-client.ts (1.4 KB)
**Purpose**: LLM client with fallback chain for validation analysis

**Exports**:
- `callWithFallback(apiKey, messages, options)` - Calls LLM with 3-model fallback

**Fallback Chain**:
1. `z-ai/glm-4.7-flash` (Primary)
2. `google/gemini-2.5-flash-lite` (Fallback 1)
3. `deepseek/deepseek-v3.2-speciale` (Fallback 2)

**Used By**:
- `source-searcher.ts` (imports `callWithFallback`)
- `src/app/api/validate/normalize/route.ts` (imports `callWithFallback`)

**Status**: ✅ ACTIVE - Core LLM client

---

### 6. source-searcher.ts (7.3 KB)
**Purpose**: Orchestrates API searches and LLM analysis

**Exports**:
- `searchAndAnalyzeSource(idea, pillarKey, subcategoryKey, apiId)` - Main search function
- `calculateSubcategoryScore(sources)` - Aggregates source scores

**Flow**:
1. Extract keywords from idea
2. Build query for API
3. Call API function
4. Analyze results with LLM
5. Return structured analysis

**Used By**:
- `src/app/api/validate/route.ts` (imports `searchAndAnalyzeSource`, `calculateSubcategoryScore`)

**Status**: ✅ ACTIVE - Core validation engine

---

### 7. config.ts (20.5 KB)
**Purpose**: Pillar and subcategory configuration with scoring criteria

**Exports**:
- `SubcategoryConfig` interface
- `PillarConfig` interface
- `PILLARS` array (7 pillars with ~50 subcategories)
- `calculatePillarScore(subcategoryScores)` - Aggregates subcategory scores
- `calculateOverallScore(pillarScores)` - Aggregates pillar scores
- `getScoreLabel(score)` - Returns label (Excellent, Strong, etc.)

**Structure**:
```typescript
PILLARS = [
  {
    key: 'problem',
    subcategories: [
      { key: 'pain_intensity', prompt: '...' },
      { key: 'pain_frequency', prompt: '...' },
      // ... more subcategories
    ]
  },
  // ... 6 more pillars
]
```

**Used By**:
- `source-searcher.ts` (imports `PILLARS`)
- `src/app/api/validate/route.ts` (imports `PILLARS`, `calculateOverallScore`, `calculatePillarScore`)
- `src/app/api/validate/[id]/pdf/route.ts` (imports `getScoreLabel`)
- `src/app/api/validate/[id]/route.ts` (imports `calculateOverallScore`, `getScoreLabel`)

**Status**: ✅ ACTIVE - Core scoring system

---

### 8. prompts.ts (1.6 KB)
**Purpose**: Business concept normalizer prompt

**Exports**:
- `NORMALIZER_PROMPT` - LLM prompt to convert raw input to structured description

**Used By**:
- `src/app/api/validate/normalize/route.ts` (imports `NORMALIZER_PROMPT`)

**Status**: ✅ ACTIVE - Used in normalization API

---

## DEPENDENCY GRAPH

```
External Files
    ↓
┌─────────────────────────────────────────────────────────┐
│ src/app/api/validate/normalize/route.ts                 │
│   → prompts.ts (NORMALIZER_PROMPT)                      │
│   → model-client.ts (callWithFallback)                  │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ src/app/api/validate/route.ts                           │
│   → config.ts (PILLARS, calculateOverallScore, etc.)    │
│   → source-searcher.ts (searchAndAnalyzeSource, etc.)   │
│   → registry-loader.ts (getApisForPillar)               │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ source-searcher.ts                                       │
│   → config.ts (PILLARS)                                 │
│   → model-client.ts (callWithFallback)                  │
│   → keyword-extractor.ts (extractKeywords)              │
│   → query-builder.ts (buildQuery)                       │
│   → registry-loader.ts (getApiConfig, getApisForPillar) │
│   → ../research/apis/* (8 API functions)                │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ query-builder.ts                                         │
│   → registry-loader.ts (getPromptForApi, getPillarConfig)│
│   → keyword-extractor.ts (ExtractedKeywords type)       │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ registry-loader.ts                                       │
│   → api-pillar-registry.json (data)                     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ keyword-extractor.ts                                     │
│   (no dependencies)                                      │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ model-client.ts                                          │
│   → @/lib/config/models (FALLBACK_CHAIN)                │
└─────────────────────────────────────────────────────────┘
```

---

## USAGE SUMMARY

### Files Used Externally (Outside validation/)
1. **prompts.ts** - Used by normalize API route
2. **model-client.ts** - Used by normalize API route
3. **config.ts** - Used by validate API routes (3 files)
4. **source-searcher.ts** - Used by validate API route
5. **registry-loader.ts** - Used by validate API route

### Files Used Only Internally (Within validation/)
1. **keyword-extractor.ts** - Used by source-searcher.ts, query-builder.ts
2. **query-builder.ts** - Used by source-searcher.ts
3. **api-pillar-registry.json** - Used by registry-loader.ts

---

## DEAD CODE ANALYSIS

### ❌ NO DEAD CODE FOUND

All 8 files are actively used:
- **5 files** are imported by external API routes
- **3 files** are used internally by other validation files
- **0 files** are unused

### Dependency Chain
```
API Routes
  ↓
prompts.ts, model-client.ts, config.ts, source-searcher.ts, registry-loader.ts
  ↓
keyword-extractor.ts, query-builder.ts
  ↓
api-pillar-registry.json
```

---

## ARCHITECTURE QUALITY

### ✅ STRENGTHS
1. **Clear Separation**: Each file has a single responsibility
2. **Layered Architecture**: Data → Loaders → Builders → Orchestrators → API
3. **No Circular Dependencies**: Clean dependency graph
4. **Centralized Configuration**: Registry pattern for API-Pillar mappings
5. **Reusable Components**: keyword-extractor, query-builder, model-client

### ⚠️ POTENTIAL IMPROVEMENTS
1. **config.ts is large** (20.5 KB) - Could split subcategories into separate files
2. **No TypeScript types exported** from api-pillar-registry.json - Could add schema validation
3. **API functions hardcoded** in source-searcher.ts - Could use dynamic imports from registry

---

## CONCLUSION

**Status**: ✅ ALL FILES ACTIVE - NO DEAD CODE

The validation folder is well-structured with:
- **8 active files** (0 dead code)
- **Clear dependency hierarchy**
- **Good separation of concerns**
- **Used by 4 external API routes**

All files serve a purpose in the validation pipeline:
1. User input → Normalization (prompts.ts, model-client.ts)
2. Keyword extraction (keyword-extractor.ts)
3. Query building (query-builder.ts, registry-loader.ts, api-pillar-registry.json)
4. API search (source-searcher.ts)
5. Scoring (config.ts)

**Recommendation**: Keep all files. No cleanup needed.
