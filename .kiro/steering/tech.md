# Technical Architecture

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2.35 | React framework with App Router |
| React | 18.2.0 | UI library |
| TypeScript | 5.3.3 | Type safety (strict mode) |
| Tailwind CSS | 3.4.0 | Utility-first styling |
| Framer Motion | 12.26.2 | Animations |
| Lucide React | 0.562.0 | Icons |
| Sonner | 2.0.7 | Toast notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 14.2 | Server-side endpoints |
| Prisma | 6.19.2 | Type-safe ORM |
| PostgreSQL | 15+ | Relational database |
| Zod | 3.25.76 | Runtime validation |

### AI Integration
| Service | Model | Purpose |
|---------|-------|---------|
| OpenRouter | - | Unified AI gateway |
| DeepSeek R1 | deepseek-r1-0528:free | Hypothesis generation |
| Gemini Flash | gemini-2.0-flash-exp:free | Landing page & PRD |
| Exa.ai | via `:online` suffix | Web search validation |

### Testing
| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.0.17 | Unit testing |
| Testing Library | 16.3.1 | React component testing |
| Playwright | 1.57.0 | E2E testing |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Dashboard  │  │  Hypothesis  │  │   Modals     │          │
│  │   (page.tsx) │  │   Columns    │  │  (DNA/PRD)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                     │
│  ┌────────────────────────▼────────────────────────────────┐   │
│  │                    State Management                      │   │
│  │  • EngineState (hypotheses, solutions, requirements)     │   │
│  │  • useScoring hook (stage progression)                   │   │
│  │  • localStorage (API key, total spent)                   │   │
│  └────────────────────────┬────────────────────────────────┘   │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/health          GET   Health check                        │
│  /api/chat            POST  AI chat completion                  │
│  /api/research/start  POST  Start research pipeline             │
│  /api/research/status GET   Get research status                 │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ HypothesisService│  │ StreamingService│  │  ScoringEngine  │ │
│  │ • generate()     │  │ • streamRationale│  │ • scoreProblem()│ │
│  │ • research()     │  │ • generateLP()   │  │ • scoreSolution()│ │
│  └────────┬────────┘  │ • generatePRD()  │  └────────┬────────┘ │
│           │           └────────┬─────────┘           │          │
│           └────────────────────┼─────────────────────┘          │
│                                │                                 │
│  ┌─────────────────────────────▼─────────────────────────────┐  │
│  │                   OpenRouterProvider                       │  │
│  │  • chat() - Standard completion                            │  │
│  │  • chat() with :online - Web search via Exa.ai             │  │
│  │  • validateKey() - API key validation                      │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (Optional)                         │
├─────────────────────────────────────────────────────────────────┤
│  Prisma ORM → PostgreSQL                                        │
│  • User, Wallet, Research, Transaction models                   │
│  • Credit-based research pipeline                               │
│  • (Not required for MVP - localStorage sufficient)             │
└─────────────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. BYOK (Bring Your Own Key) Model
**Decision**: Users provide their own OpenRouter API keys
**Trade-offs**:
- ✅ No API key management complexity
- ✅ No usage costs for us
- ✅ User controls their spending
- ❌ Requires user to get API key
- ❌ Can't track aggregate usage

### 2. Client-Side API Key Storage
**Decision**: Store API key in localStorage
**Trade-offs**:
- ✅ Simple implementation
- ✅ No server-side secrets management
- ✅ Works without authentication
- ❌ Less secure than server-side
- ❌ Key visible in browser storage

**Mitigation**: Clear security warning in UI, recommend server proxy for production.

### 3. Free Tier AI Models
**Decision**: Use only free tier models (DeepSeek R1, Gemini Flash)
**Trade-offs**:
- ✅ Zero cost for users
- ✅ No billing integration needed
- ❌ Rate limits (50 req/day on some models)
- ❌ May have slower response times

### 4. Provider Abstraction Pattern
**Decision**: `AIProvider` interface for multi-backend support
```typescript
interface AIProvider {
  chat(messages: Message[], model?: string): Promise<ChatResponse>;
  validateKey(): Promise<boolean>;
  listModels(): Promise<string[]>;
}
```
**Benefit**: Easy to add Anthropic, OpenAI, or other providers later.

### 5. Demo Mode Isolation
**Decision**: Separate code path for demo mode with pre-generated data
**Trade-offs**:
- ✅ Works without API key
- ✅ Consistent demo experience
- ✅ No API costs for demos
- ❌ Requires maintaining demo data

### 6. Structured Scoring Criteria
**Decision**: 4-dimension scoring for problems and solutions
```typescript
PROBLEM: Market Size, Pain Intensity, Existing Solutions, Willingness to Pay
SOLUTION: Technical Feasibility, Competitive Advantage, Time to Market, Market Validation
```
**Benefit**: Transparent, reproducible confidence scores.

## Code Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler"
  }
}
```

### Path Aliases
```typescript
import { Component } from '@/components/dashboard/Component';
import { getProvider } from '@/lib/api';
```

### File Naming
- Components: `PascalCase.tsx`
- Utilities: `camelCase.ts`
- API routes: `route.ts` (Next.js convention)
- Types: `*.ts` with exported interfaces

### Error Handling
- All API calls wrapped in try/catch
- User-friendly error messages via toast
- Fallback behaviors for network failures
- Error boundary at app root

## Performance Considerations

### Optimizations Implemented
- React 18 concurrent features
- Tailwind CSS purging
- Next.js automatic code splitting
- Conditional animations (reduce motion)

### Metrics Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Hypothesis generation: < 5s
- Web validation: < 10s per hypothesis

## Security Considerations

### Current State (MVP)
- API keys in localStorage (with warning)
- No authentication required
- CORS headers on API routes
- Input sanitization via Zod

### Production Recommendations
- Server-side API key storage
- User authentication (NextAuth.js)
- Rate limiting per user
- API key encryption at rest
