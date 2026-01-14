# Curatos DNA - Complete Feature Architecture

> **Version:** 1.0
> **Created:** January 13, 2026
> **Project:** Dynamous x Kiro Hackathon
> **Author:** Gustavo Martini Carriconde

---

## Executive Summary

Curatos is an **autonomous AI-powered hypothesis engine** that helps founders and product teams discover validated problem/solution hypotheses for SaaS products. The system uses AI to generate, research, and validate market hypotheses at scale.

---

## Core Concept

```
USER INPUT (Niche) → AI GENERATION → RESEARCH → VALIDATION → DNA OUTPUT
```

**DNA = Validated insights packaged as actionable product specifications**

---

## Feature Architecture

### 1. Authentication & API Management

| Feature | Description | Status |
|---------|-------------|--------|
| API Key Storage | Secure localStorage for MVP, server-side for production | ✅ Built |
| Key Validation | Verify API key before operations | ✅ Built |
| Multi-Provider Support | OpenRouter (now), Anthropic, OpenAI (future) | ✅ Architecture |
| BYOK Model | Users bring their own API keys | ✅ Built |

### 2. Token Economy

| Feature | Description | Status |
|---------|-------------|--------|
| Token Counter | Track available vs used tokens | ✅ Built |
| Token Rate Display | Real-time consumption rate | ✅ Built |
| Auto-stop on Depletion | Engine stops when tokens = 0 | ✅ Built |
| Token Persistence | Store token state in localStorage | 🔲 Pending |

### 3. Hypothesis Engine

| Feature | Description | Status |
|---------|-------------|--------|
| AI Generation | Generate hypotheses from niche input | ✅ Built |
| Problem Focus | Generate market problem hypotheses | ✅ Built |
| Solution Focus | Generate solution hypotheses | ✅ Built |
| Steering Slider | Balance problem vs solution generation | ✅ Built |
| Rate Control | Configurable generation frequency | ✅ Built |

### 4. Research Pipeline

| Feature | Description | Status |
|---------|-------------|--------|
| Auto-Research | Automatically validate hypotheses | ✅ Built |
| Confidence Scoring | 0-100% confidence rating | ✅ Built |
| Source Attribution | Track research sources | ✅ Built |
| State Transitions | empty → researching → validated | ✅ Built |

### 5. DNA Generation

| Feature | Description | Status |
|---------|-------------|--------|
| Unlock Mechanism | 5+ validated hypotheses = DNA ready | ✅ Built |
| DNA Export | Package insights as spec document | 🔲 Pending |
| DNA Format | JSON/Markdown output | 🔲 Pending |
| Feature Prioritization | Rank features by confidence | 🔲 Pending |

### 6. User Interface

| Feature | Description | Status |
|---------|-------------|--------|
| Terminal Aesthetic | Retro hacker-style UI | ✅ Built |
| Two-Column Layout | Problems | Solutions | ✅ Built |
| Card System | Hypothesis cards with states | ✅ Built |
| Progress Indicators | Visual state feedback | ✅ Built |
| Responsive Design | Mobile-compatible | 🔲 Pending |

---

## Data Models

### Hypothesis

```typescript
interface Hypothesis {
  id: string;
  text: string;
  state: 'empty' | 'researching' | 'validated';
  confidence: number;  // 0-100
  sources: string[];
  createdAt: Date;
  validatedAt?: Date;
}
```

### EngineState

```typescript
interface EngineState {
  niche: string;
  tokensAvailable: number;
  tokensUsed: number;
  tokenRate: number;
  hypotheses: Hypothesis[];  // Problems
  solutions: Hypothesis[];   // Solutions
  slider: number;            // 0-100 (problem ↔ solution)
  dnaUnlocked: boolean;
}
```

### ChatResponse

```typescript
interface ChatResponse {
  content: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}
```

---

## API Architecture

### Providers

```
AIProvider (Interface)
├── OpenRouterProvider  ✅ Implemented
├── AnthropicProvider   🔲 Stub
└── OpenAIProvider      🔲 Stub
```

### Services

```
Services
├── HypothesisService   ✅ Implemented
│   ├── generateHypotheses()
│   └── researchHypothesis()
├── DNAService          🔲 Pending
│   ├── generateDNA()
│   └── exportDNA()
└── TokenService        🔲 Pending
    ├── trackUsage()
    └── estimateCost()
```

---

## AI Prompts

### Hypothesis Generation Prompt

```
You are a market research expert specializing in SaaS product discovery.
Given a niche, generate problem/solution hypotheses that real customers face.

Format: JSON array with {id, text, state, confidence, sources}
Focus: {problems|solutions}
Niche: {user_niche}
Count: {1-5}

Criteria:
- Specific and actionable
- Based on real market patterns
- Addressable by software
```

### Research Validation Prompt

```
You are a market research analyst. Validate this hypothesis by:
1. Finding supporting evidence
2. Identifying counter-evidence
3. Assigning confidence score (0-100)
4. Listing credible sources

Hypothesis: {hypothesis_text}
Niche: {niche}

Output: JSON with {confidence, sources[], reasoning}
```

---

## User Flows

### Flow 1: First-Time Setup

```
1. User lands on dashboard
2. Sees API connector modal
3. Enters OpenRouter API key
4. Key validated → stored
5. Dashboard unlocks
```

### Flow 2: Engine Operation

```
1. User sets niche (default: FINTECH / PAYMENTS)
2. Adjusts steering slider (problem ↔ solution)
3. Clicks [START ENGINE]
4. Engine generates hypotheses
5. Hypotheses auto-research
6. Cards update: empty → researching → validated
7. Token counter decrements
8. User clicks [STOP ENGINE] or tokens deplete
```

### Flow 3: DNA Unlock

```
1. 5+ hypotheses reach validated state
2. DNA button activates (green glow)
3. User clicks [CREATE DNA]
4. System packages all validated insights
5. DNA document generated
6. User downloads/exports
```

---

## Technical Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS |
| API | OpenRouter (OpenAI-compatible) |
| Storage | localStorage (MVP) |
| Deployment | Vercel (planned) |

---

## Free Model Configuration

```typescript
const FREE_MODELS = [
  'deepseek/deepseek-r1-0528:free',      // Primary
  'google/gemini-2.0-flash-exp:free',    // Research
  'meta-llama/llama-3.3-70b-instruct:free' // Fallback
];
```

---

## Security Considerations

1. **API Keys**: Client-side storage for MVP, recommend server proxy for production
2. **Rate Limiting**: Respect OpenRouter limits (50 req/day free)
3. **Data Privacy**: No prompt logging enabled by default
4. **GitHub Scanning**: OpenRouter detects exposed keys

---

## Hackathon Scope (MVP)

### In Scope ✅

- [x] API key connection flow
- [x] Hypothesis generation
- [x] Research simulation
- [x] Token tracking
- [x] DNA unlock logic
- [x] Terminal UI aesthetic

### Out of Scope (Post-Hackathon) 🔲

- [ ] User accounts
- [ ] Persistent storage (database)
- [ ] Real web research (web scraping)
- [ ] Multiple niches
- [ ] Team collaboration
- [ ] Export to various formats
- [ ] Billing integration

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to First Hypothesis | < 30 seconds |
| Hypotheses per Session | 8-16 |
| Validation Rate | > 60% |
| DNA Unlock Rate | > 50% of sessions |

---

## Roadmap

### Phase 1: Hackathon MVP (Current)
- Core engine with simulated research
- Terminal UI
- OpenRouter integration

### Phase 2: Beta
- Real web research (Serper, Perplexity)
- User accounts
- Database persistence

### Phase 3: Launch
- Multi-niche support
- Advanced DNA formats
- Team features
- API for integrations

---

*This document represents the complete feature architecture for Curatos.*
*Built for the Dynamous x Kiro Hackathon by Gustavo Martini Carriconde.*
