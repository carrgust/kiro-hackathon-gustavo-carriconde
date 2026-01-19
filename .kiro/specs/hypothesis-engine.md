# Hypothesis Engine Specification

## Overview
The Hypothesis Engine is the core AI-powered system that generates, validates, and scores market hypotheses for SaaS product ideas.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    HYPOTHESIS ENGINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Generation  │───▶│  Validation  │───▶│   Scoring    │  │
│  │    Phase     │    │    Phase     │    │    Phase     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ DeepSeek R1  │    │  Exa.ai Web  │    │  Structured  │  │
│  │   (free)     │    │   Search     │    │   Criteria   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. HypothesisService (`src/lib/api/hypothesis.ts`)

**Purpose**: Generate and research hypotheses using AI models.

**Key Methods**:
```typescript
class HypothesisService {
  // Generate new hypotheses for a niche
  async generateHypotheses(
    niche: string, 
    focus: 'problems' | 'solutions', 
    count?: number
  ): Promise<Hypothesis[]>
  
  // Research and score a hypothesis
  async researchHypothesis(
    hypothesis: Hypothesis, 
    niche: string
  ): Promise<{ confidence: number; sources: string[] }>
}
```

**Generation Flow**:
1. Build system prompt based on focus (problems vs solutions)
2. Call DeepSeek R1 via OpenRouter
3. Parse JSON response for hypothesis array
4. Create Hypothesis objects with initial state

### 2. ScoringEngine (`src/lib/research/engines/scoring-engine.ts`)

**Purpose**: Validate hypotheses using structured criteria and web search with source prioritization.

**Source Prioritization System**:

| Priority | Source Type | Weight | Use Cases |
|----------|-------------|--------|-----------|
| 1 | Official | 1.0 | Company sites, gov/edu domains, major platforms |
| 2 | Structured API | 0.95 | Academic papers (OpenAlex), structured data |
| 3 | News | 0.80 | TechCrunch, Reuters, Bloomberg, WSJ |
| 4 | Community | 0.75 | Hacker News, forums, blogs |
| 5 | Wikipedia | 0.70 | **FALLBACK ONLY** - definitions, history, company info |

**Wikipedia Context Filtering**:
- ✅ **Allowed**: Industry definitions, company founding dates, HQ locations, historical context
- ❌ **Blocked**: Current market data, pricing, competitive analysis, problem validation

**Confidence Weighting**:
- Base confidence calculated from result count and diversity
- Source quality bonus: `(avg_weight - 0.75) * 20` points
- Wikipedia penalty: `-5%` per Wikipedia source beyond 2
- Official sources bonus: `+8%` per official source
- Academic sources bonus: `+10%` per academic source

**Scoring Criteria**:

| Type | Criterion | Weight | Description |
|------|-----------|--------|-------------|
| Problem | Market Size | 25 | TAM/SAM data, industry reports |
| Problem | Pain Intensity | 25 | Customer complaints, urgency |
| Problem | Existing Solutions | 25 | Competitors (proves demand) |
| Problem | Willingness to Pay | 25 | Pricing data, revenue evidence |
| Solution | Technical Feasibility | 25 | APIs, proven approaches |
| Solution | Competitive Advantage | 25 | Differentiation, moat |
| Solution | Time to Market | 25 | Development complexity |
| Solution | Market Validation | 25 | Similar products with traction |

**Scoring Guidelines**:
- 0-10 points: No evidence or aspirational content
- 11-15 points: Weak signals (blog posts)
- 16-20 points: Moderate evidence (some companies)
- 21-25 points: Strong evidence (revenue data, multiple players)

### 3. StreamingService (`src/lib/api/streaming.ts`)

**Purpose**: Stream AI reasoning in real-time for user feedback.

**Key Methods**:
```typescript
class StreamingService {
  // Stream hypothesis generation rationale
  async streamHypothesisGeneration(
    niche: string,
    focus: 'problems' | 'solutions',
    onRationaleUpdate: (text: string) => void
  ): Promise<void>
}
```

## Data Model

### Hypothesis Interface
```typescript
interface Hypothesis {
  id: string;           // Unique identifier
  text: string;         // Hypothesis statement
  state: 'hypothesis' | 'fact';  // Validation state
  confidence: number;   // 0-100 score
  sources?: string[];   // URLs from web search
  type?: 'functional' | 'non-functional';  // For requirements
  createdAt: Date;
}
```

### State Transitions
```
┌────────────┐     Research      ┌────────────┐
│ hypothesis │ ─────────────────▶│    fact    │
│ (conf: 0)  │   (conf >= 80)    │ (conf: 80+)│
└────────────┘                   └────────────┘
```

## Stage Progression

### Quality Gates
| Stage | Threshold | Min Count | Unlocks |
|-------|-----------|-----------|---------|
| Hypothesis | 80% avg | 5 facts | Problem Quality |
| Problem Quality | 70% | 3 problems | Solution Quality |
| Solution Quality | 70% | 3 solutions | Requirements |
| Requirements | 75% | 3 requirements | PRD |
| PRD | 80% | - | DNA |
| DNA | 85% | - | Build Phase |

### useScoring Hook
```typescript
function useScoring({ hypotheses, solutions, requirements }) {
  return {
    stages: Record<Stage, StageInfo>,
    currentStage: Stage,
    canCreateDNA: boolean
  }
}
```

## API Integration

### OpenRouter Configuration
```typescript
const provider = new OpenRouterProvider(apiKey);

// Standard generation
await provider.chat(messages, 'deepseek/deepseek-r1-0528:free');

// Web search validation (Exa.ai)
await provider.chat(messages, 'google/gemini-2.0-flash-exp:free:online');
```

### Token Tracking
All API calls are tracked via `TokenTracker`:
```typescript
tracker.log({
  promptTokens: response.tokens.prompt,
  completionTokens: response.tokens.completion,
  totalTokens: response.tokens.total,
  model: response.model,
  operation: 'hypothesis-generation'
});
```

## Error Handling

### Retry Logic
- Exponential backoff with jitter
- Max 3 retries for transient failures
- Graceful degradation to fallback messages

### Validation Errors
- Invalid JSON response → throw with clear message
- API rate limit → surface to user with wait time
- Network failure → fallback to cached/demo data

## Usage Example

```typescript
// Initialize service
const service = new HypothesisService(apiKey);

// Generate problems
const problems = await service.generateHypotheses('fintech', 'problems', 3);

// Research each hypothesis
for (const hypothesis of problems) {
  const result = await service.researchHypothesis(hypothesis, 'fintech');
  hypothesis.confidence = result.confidence;
  hypothesis.sources = result.sources;
  hypothesis.state = result.confidence >= 80 ? 'fact' : 'hypothesis';
}
```

## Performance Considerations

- Generation: ~2-5 seconds per batch
- Validation: ~5-10 seconds per hypothesis (web search)
- Streaming: Real-time updates every ~100ms
- Rate limits: 50 req/day on free tier models
