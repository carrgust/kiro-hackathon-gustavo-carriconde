# Project Structure

## Directory Layout

```
curatos-dna/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API endpoints
│   │   │   ├── chat/route.ts         # AI chat completion
│   │   │   ├── health/route.ts       # Health check
│   │   │   └── research/             # Research pipeline
│   │   │       ├── start/route.ts    # Start research
│   │   │       └── status/[id]/route.ts  # Get status
│   │   ├── globals.css               # Global styles + Tailwind
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main dashboard (single page app)
│   │
│   ├── components/
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── APIConnector.tsx      # API key input + validation
│   │   │   ├── AgentRationale.tsx    # Streaming AI thoughts
│   │   │   ├── ChatInterface.tsx     # User chat input
│   │   │   ├── ConfirmationModal.tsx # Delete confirmation
│   │   │   ├── DNAButton.tsx         # DNA unlock indicator
│   │   │   ├── DNAModal.tsx          # DNA analysis modal
│   │   │   ├── EnhancedHeader.tsx    # Header with niche input
│   │   │   ├── HypothesisColumn.tsx  # Column container
│   │   │   ├── HypothesisItem.tsx    # Basic hypothesis card
│   │   │   ├── HypothesisItemEnhanced.tsx  # Card with scoring
│   │   │   ├── HypothesisModal.tsx   # Hypothesis detail view
│   │   │   ├── LandingPageModal.tsx  # Landing page generator
│   │   │   ├── PRDModal.tsx          # PRD generator
│   │   │   ├── RadarEqualizer.tsx    # Visual activity indicator
│   │   │   ├── ScoreBreakdown.tsx    # Scoring criteria display
│   │   │   ├── StageProgressBar.tsx  # Stage progression UI
│   │   │   ├── SteeringSlider.tsx    # Problem/Solution balance
│   │   │   ├── TokenBar.tsx          # Token usage display
│   │   │   └── TokenFlow.tsx         # Token animation
│   │   ├── ui/                       # Base UI components
│   │   │   ├── badge.tsx             # Badge component
│   │   │   └── card.tsx              # Card component
│   │   └── ErrorBoundary.tsx         # Error boundary wrapper
│   │
│   ├── hooks/
│   │   └── useScoring.ts             # Stage progression logic
│   │
│   ├── lib/
│   │   ├── api/                      # API integration
│   │   │   ├── index.ts              # Provider factory
│   │   │   ├── openrouter.ts         # OpenRouter implementation
│   │   │   ├── hypothesis.ts         # Hypothesis generation
│   │   │   ├── streaming.ts          # Streaming + generators
│   │   │   ├── token-tracker.ts      # Token usage tracking
│   │   │   ├── retry.ts              # Retry logic with backoff
│   │   │   └── types.ts              # API type definitions
│   │   ├── research/                 # Research pipeline
│   │   │   ├── pipeline.ts           # 3-engine orchestration
│   │   │   ├── types.ts              # Pipeline types
│   │   │   └── engines/
│   │   │       ├── problem-engine.ts # Problem discovery
│   │   │       ├── solution-engine.ts# Solution generation
│   │   │       ├── synthesis-engine.ts# Result synthesis
│   │   │       └── scoring-engine.ts # Structured scoring
│   │   ├── scoring/                  # Scoring system
│   │   │   ├── index.ts              # Exports
│   │   │   ├── gates.ts              # Stage thresholds
│   │   │   └── schemas.ts            # Scoring schemas
│   │   ├── db/                       # Database
│   │   │   ├── index.ts              # Exports
│   │   │   └── client.ts             # Prisma client
│   │   ├── constants.ts              # App constants
│   │   ├── demo-data.ts              # Pre-generated demo data
│   │   ├── logger.ts                 # Logging utility
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── types/
│   │   └── project.ts                # Core type definitions
│   │
│   ├── data/
│   │   └── curatos-dna.json          # Static DNA data
│   │
│   └── __tests__/                    # Test files
│       ├── setup.ts                  # Test configuration
│       └── evaluation/
│           ├── api-health.test.ts    # API health tests
│           ├── demo-mode.test.ts     # Demo mode tests
│           └── streaming-service.test.ts  # Streaming tests
│
├── .kiro/                            # Kiro CLI configuration
│   ├── steering/                     # Project context docs
│   │   ├── product.md                # Product vision
│   │   ├── tech.md                   # Technical architecture
│   │   ├── structure.md              # This file
│   │   ├── scoring-system.md         # Scoring criteria
│   │   └── kiro-cli-reference.md     # Kiro CLI guide
│   ├── specs/                        # Feature specifications
│   ├── prompts/                      # Custom prompts
│   ├── documentation/                # Kiro CLI docs
│   ├── settings/                     # MCP configuration
│   ├── DEVLOG.md                     # Development timeline
│   ├── CODE_REVIEW.md                # Security audit
│   └── *.md                          # Feature docs
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── migrations/                   # Migration files
│   ├── seed.ts                       # Database seeding
│   └── seed-standalone.ts            # Standalone seed script
│
├── docs/                             # Project documentation
│   ├── API.md                        # API documentation
│   ├── CURATOS_DNA.md                # Feature spec
│   ├── DATABASE_SETUP.md             # DB setup guide
│   └── OPENROUTER_*.md               # Integration docs
│
├── public/
│   └── screenshots/                  # Demo screenshots
│
├── scripts/
│   └── test-openrouter.ts            # API test script
│
└── [Config Files]
    ├── package.json                  # Dependencies
    ├── tsconfig.json                 # TypeScript config
    ├── tailwind.config.js            # Tailwind config
    ├── next.config.js                # Next.js config
    ├── vitest.config.ts              # Test config
    ├── docker-compose.yml            # PostgreSQL container
    └── .env.local.example            # Environment template
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `HypothesisColumn.tsx` |
| Hooks | camelCase with `use` prefix | `useScoring.ts` |
| Utilities | camelCase | `tokenTracker.ts` |
| API Routes | `route.ts` (Next.js) | `api/chat/route.ts` |
| Types | PascalCase interfaces | `Hypothesis`, `EngineState` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_RETRY_CONFIG` |
| Test Files | `*.test.ts` | `demo-mode.test.ts` |

## Module Organization

### API Layer (`src/lib/api/`)
Handles all external AI service communication:
- `openrouter.ts` - OpenRouter API implementation
- `hypothesis.ts` - Hypothesis generation service
- `streaming.ts` - Streaming responses + generators
- `token-tracker.ts` - Usage tracking
- `retry.ts` - Exponential backoff retry logic

### Research Layer (`src/lib/research/`)
3-engine research pipeline:
- `problem-engine.ts` - Discovers market problems
- `solution-engine.ts` - Generates solutions
- `synthesis-engine.ts` - Combines results
- `scoring-engine.ts` - Structured validation

### Scoring Layer (`src/lib/scoring/`)
Stage progression system:
- `gates.ts` - Threshold definitions
- `schemas.ts` - Scoring criteria schemas

### Component Layer (`src/components/`)
React components organized by feature:
- `dashboard/` - Main dashboard components
- `ui/` - Reusable base components

## Key Patterns

### State Management
Single `EngineState` object in `page.tsx`:
```typescript
interface EngineState {
  niche: string;
  hypotheses: Hypothesis[];
  solutions: Hypothesis[];
  requirements: Hypothesis[];
  // ... other state
}
```

### Service Pattern
Services encapsulate API logic:
```typescript
const service = new HypothesisService(apiKey);
const hypotheses = await service.generateHypotheses(niche, 'problems');
```

### Provider Pattern
Abstraction for AI providers:
```typescript
const provider = getProvider('openrouter', apiKey);
const response = await provider.chat(messages, model);
```

### Demo Mode Pattern
Check for demo API key:
```typescript
if (this.apiKey === 'demo') {
  return DEMO_LANDING_PAGE;
}
```

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `tsconfig.json` | TypeScript strict mode, path aliases |
| `tailwind.config.js` | Custom colors, animations |
| `next.config.js` | Next.js configuration |
| `vitest.config.ts` | Test framework setup |
| `prisma/schema.prisma` | Database models |
| `.env.local` | Environment variables |

## Environment Variables

```bash
# Required for API mode
OPENROUTER_API_KEY=sk-or-v1-...

# Optional for database features
DATABASE_URL=postgresql://user:pass@localhost:5432/curatos
```

## Build Artifacts

| Directory | Contents |
|-----------|----------|
| `.next/` | Next.js build output |
| `node_modules/` | Dependencies |
| `prisma/migrations/` | Database migrations |
