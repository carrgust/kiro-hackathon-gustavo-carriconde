# Curatos Development Log

> **Project:** Curatos - Autonomous AI Hypothesis Engine
> **Hackathon:** Dynamous x Kiro Hackathon (January 2026)
> **Developer:** Gustavo Martini Carriconde
> **Started:** January 10, 2026

---

## Project Vision

Curatos is an autonomous AI system that helps founders discover validated problem/solution hypotheses for SaaS products. It combines AI-powered generation with automated research to accelerate the idea validation phase of product development.

---

## Day 1 - January 10, 2026

### Initial Setup
- Created Next.js 15 project with TypeScript
- Set up Tailwind CSS for styling
- Established project structure following Cole's 11-prompt template
- Created .kiro/ folder with steering docs

### Research Phase
- Analyzed 51 GitHub repositories for hackathon patterns
- Evaluated feasibility of different project ideas
- Decided on "Curatos" - AI hypothesis engine concept

**Kiro Usage:** Used Kiro CLI for project scaffolding and initial file generation.

---

## Day 2 - January 11, 2026

### Dashboard Design v1
- Created token-flow UI mockup
- Designed hypothesis card components
- Implemented basic state management

### Architecture Decisions
- Chose client-side API key storage for MVP (BYOK model)
- Designed provider abstraction for multi-AI support
- Planned token economy for gamification

**Kiro Usage:** Kiro generated component boilerplate and TypeScript interfaces.

---

## Day 3 - January 12, 2026

---

## Day 7 - January 16, 2026

### Agent Rationale UX Cleanup (Commit efd2950)

**Problem Identified:**
- Agent rationale panel showing duplicate messages
- Verbose `[THINKING]`, `[SEARCHING]`, `[FOUND]` spam cluttering UI
- Multiple code paths updating `agentRationale` state inconsistently
- React StrictMode causing double-initialization issues

**Solution Implemented:**

1. **Created `addRationale()` Helper**
   - Set-based deduplication using first 50 characters as key
   - 2-second timeout to clear old entries (allows legitimate repeats)
   - Single source of truth for all rationale updates
   - Reduced message history from 10-15 to 8 messages max

2. **Removed Verbose Autopilot Functions**
   - Deleted `handleAddHypothesis`, `handleAddSolution`, `handleAddRequirement` (~200 lines)
   - Eliminated all `[THINKING]`, `[SEARCHING]`, `[FOUND]`, `[VALIDATED]` message spam
   - Removed duplicate code paths that bypassed clean message flow

3. **Unified Message Format**
   - Generation: `+ Problem: "text..."`
   - Validation: `Validating: "text..."`
   - Result: `✓ FACT 98%` or `○ 85%`
   - Errors: `✗ Research failed`
   - LP/PRD: `Generating landing page...` → `✓ Landing page ready`

4. **Guard Against Duplicate Research**
   - Added status check in `researchHypothesis()` to prevent duplicate calls
   - Skips if hypothesis already `downloading`, `analyzing`, or `complete`
   - Prevents race conditions from parallel research requests

5. **Simplified Column UI**
   - Made `HypothesisColumn` `onAdd` prop optional
   - Removed manual "+" buttons (engine auto-generates everything)
   - Cleaner interface with less user confusion

**Technical Details:**
- Replaced 30+ direct `agentRationale: [...]` updates with `addRationale()` calls
- Used `useRef<Set<string>>` for deduplication tracking
- Normalized messages to first 50 chars for comparison (handles truncation)
- Auto-chain remains silent (no spam when generating solutions/requirements)

**Results:**
- Messages per hypothesis: 7+ → 3 max
- Message history: 15 → 8 messages
- Zero duplicate messages
- Clean, concise rationale panel
- Consistent messaging throughout app

**Files Modified:**
- `src/app/page.tsx` - Main dashboard logic
- `src/components/dashboard/HypothesisColumn.tsx` - Column UI

**Commit:** `efd2950` - "fix(ux): clean agent rationale - deduplication and consistent messaging"

**Kiro Usage:** Kiro CLI helped identify all 30+ agentRationale update locations and systematically replaced them with the new helper.

---

## Day 3 - January 12, 2026

### Dashboard Design v2
- Redesigned to terminal/hacker aesthetic
- Implemented two-column layout (Problems | Solutions)
- Added steering slider for problem/solution balance
- Created DNA unlock mechanism (5+ validated = ready)

### Component Development
- TokenBar - Real-time token tracking
- HypothesisColumn - Card container with state management
- HypothesisCard - Individual hypothesis with animation
- SteeringSlider - Problem ↔ Solution balance
- DNAButton - Unlock indicator

**Kiro Usage:** Kiro implemented all dashboard components from specifications.

---

## Day 4 - January 13, 2026

### OpenRouter API Integration
- Researched OpenRouter documentation
- Downloaded Terms of Service and Privacy Policy
- Verified compliance - FULLY COMPLIANT with ToS
- Implemented API provider architecture

### Files Created
- `src/lib/api/types.ts` - Core interfaces
- `src/lib/api/openrouter.ts` - OpenRouter provider
- `src/lib/api/index.ts` - Provider factory
- `src/lib/api/hypothesis.ts` - AI generation service
- `src/app/api/chat/route.ts` - Server-side proxy

### Legal Documentation
- Created comprehensive integration docs
- Downloaded and summarized OpenRouter ToS
- Documented data handling and privacy
- Created compliance checklist

### Curatos DNA
- Defined complete feature architecture
- Created JSON specification for programmatic use
- Documented all models, services, and flows

**Kiro Usage:** Kiro implemented full API integration with error handling and type safety.

---

## Technical Highlights

### AI Models Used (Free Tier)
```
Primary:   deepseek/deepseek-r1-0528:free
Research:  google/gemini-2.0-flash-exp:free
Fallback:  meta-llama/llama-3.3-70b-instruct:free
```

### Key Architecture Decisions

1. **BYOK (Bring Your Own Key)**: Users provide their own OpenRouter API keys
   - *Why:* Simplifies MVP, avoids API key management, respects user privacy

2. **Provider Abstraction**: AIProvider interface for multiple backends
   - *Why:* Future-proof design, easy to add Anthropic/OpenAI support

3. **Token Economy**: Visual token tracking with gamification
   - *Why:* Creates engagement, helps users understand AI costs

4. **Terminal Aesthetic**: Hacker-style UI with green-on-black
   - *Why:* Unique visual identity, appeals to technical founders

---

## Kiro CLI Usage Summary

| Feature | Usage |
|---------|-------|
| Project Scaffolding | Initial Next.js setup |
| Component Generation | All dashboard components |
| API Integration | OpenRouter provider implementation |
| Type Definitions | TypeScript interfaces |
| Documentation | Steering docs in .kiro/ |

**Estimated Kiro Prompts Used:** ~15 of 2,000 available

---

## Challenges & Solutions

### Challenge 1: API Key Security
- **Problem:** Client-side storage of API keys
- **Solution:** localStorage for MVP with clear documentation recommending server proxy for production

### Challenge 2: Rate Limiting
- **Problem:** OpenRouter free tier has 50 req/day limit
- **Solution:** Implemented token tracking and auto-stop to prevent overuse

### Challenge 3: Terminal UI Performance
- **Problem:** CSS animations could cause performance issues
- **Solution:** Used GPU-accelerated transforms and conditional animations

---

## What's Next

- [x] Implement real web research (Exa.ai via OpenRouter :online)
- [x] Add DNA export functionality
- [x] Landing Page Generator
- [x] PRD Generator
- [x] Security audit and fixes
- [ ] Create demo video (2-5 minutes)
- [ ] Deploy to Vercel
- [ ] Final testing and polish

---

## Day 5 - January 14, 2026

### Major Features Completed

#### 1. Real Web Search Integration
- Implemented `:online` suffix for OpenRouter models
- Integrated Exa.ai for real web search results
- Fixed URL extraction from response annotations
- Removed all mock data - system now returns real data or explicit errors

#### 2. Authentication System (Later Removed)
- Initially implemented NextAuth.js with credentials provider
- Added bcrypt password hashing
- Created signup/login API routes
- **Decision:** Removed for MVP - API keys in localStorage sufficient

#### 3. Research Pipeline MVP
- Created 3-engine pipeline (Problem, Solution, Synthesis)
- Implemented credit management system
- Added sequential execution with state tracking
- Database integration with Prisma + PostgreSQL

#### 4. Security & Code Quality
- Comprehensive code review (23 issues found)
- Fixed npm vulnerabilities (4 → 0)
- Added error boundary component
- Created logger utility
- Extracted magic numbers to constants
- Added API key security warning

#### 5. Landing Page Generator 🎨
- AI-generated HTML landing pages from validated research
- Preview and Code tabs
- Copy to clipboard and download functionality
- Self-contained HTML with inline CSS
- Uses Gemini Flash for fast generation

#### 6. PRD Generator 📋
- AI-generated Product Requirements Documents
- Comprehensive markdown format
- Preview (rendered) and Raw tabs
- Includes: Executive Summary, Problem Statement, Requirements, Metrics
- Compatible with Notion, GitHub, Confluence

### Bug Fixes
- Fixed NextAuth v5 compatibility issues (downgraded to v4, then removed)
- Fixed webpack cache issues after Next.js upgrade
- Fixed malformed SVG paths in lock icons
- Fixed niche input state synchronization
- Fixed hypothesis sources URL parsing

### Technical Achievements
- **0 TypeScript errors**
- **0 ESLint warnings**
- **0 npm vulnerabilities**
- **2 AI-generated outputs** (Landing Page + PRD)
- **Real web search** with source attribution

---

## Lessons Learned

1. **Start with constraints:** Free tier limitations shaped better architecture
2. **Document early:** Legal compliance docs saved time later
3. **Visual identity matters:** Terminal aesthetic creates memorable impression
4. **Kiro is powerful:** Complex components generated quickly from specs
5. **Remove complexity:** Dropped NextAuth when localStorage was sufficient
6. **Real data matters:** Mock data masks issues - explicit errors are better
7. **Multiple outputs:** Landing Page + PRD gives users actionable deliverables

---

## Final Stats

- **Lines of Code:** ~8,000+ TypeScript/React
- **Components:** 18 dashboard components
- **API Routes:** 4 endpoints
- **AI Models:** 3 (DeepSeek R1, Gemini Flash, Llama 3.3)
- **Features:** Research engine, web validation, landing page gen, PRD gen
- **Development Time:** 5 days
- **Kiro Prompts Used:** ~50 of 2,000 available

---

## Day 6 - January 15, 2026

### Sprint 2: Documentation & Quality

#### 1. Comprehensive Test Suite
- Created evaluation test suite with 47 passing tests
- Test categories:
  - API health checks (service status, error handling)
  - Demo mode isolation (pre-generated data, no API calls)
  - Streaming service (landing page, PRD generation)
- Test framework: Vitest with Testing Library
- Coverage targets: Core services and API routes

#### 2. Demo Mode Isolation Fix
- Ensured demo mode (`apiKey: 'demo'`) never makes real API calls
- Pre-generated data in `src/lib/demo-data.ts`
- Simulated delays for realistic UX
- Complete isolation from production code paths

#### 3. Scoring System Implementation
- Multi-stage quality gates with thresholds
- Structured scoring criteria:
  - Problems: Market Size, Pain Intensity, Existing Solutions, Willingness to Pay
  - Solutions: Technical Feasibility, Competitive Advantage, Time to Market, Market Validation
- `useScoring` hook for stage progression
- Visual progress bar component

#### 4. Documentation Suite
- **Steering Docs** (`.kiro/steering/`):
  - `product.md` - Product vision, target users, value proposition
  - `tech.md` - Technical architecture, decisions, trade-offs
  - `structure.md` - Codebase organization, patterns
  - `scoring-system.md` - Scoring criteria and thresholds
- **Feature Specs** (`.kiro/specs/`):
  - `hypothesis-engine.md` - Core AI generation system
  - `demo-mode.md` - Demo isolation architecture
  - `prd-generator.md` - PRD generation with FR/NFR format
- **API Documentation** (`docs/API.md`):
  - All 4 endpoints documented
  - Request/response examples
  - Error codes and rate limits
  - TypeScript types

#### 5. README Enhancement
- Added badges (build, tests, coverage)
- Feature highlights with screenshots
- Quick start guide
- ASCII architecture diagram
- Demo mode instructions
- Comprehensive tech stack table

### Kiro CLI Usage Today
| Task | Kiro Contribution |
|------|-------------------|
| Test suite creation | Generated test boilerplate and assertions |
| Documentation | Created all steering docs and specs |
| Code review | Identified documentation gaps |
| README update | Generated showcase-worthy content |

**Kiro Prompts Used Today:** ~20
**Total Kiro Prompts:** ~70 of 2,000 available

### Quality Metrics
- **Tests:** 47 passing
- **TypeScript Errors:** 0
- **ESLint Warnings:** 0
- **npm Vulnerabilities:** 0
- **Documentation Files:** 12 created/updated

---

## Day 7 - January 15, 2026

### API Machine Gun Feature 🔫
Major feature: Multi-source hypothesis validation replacing expensive OpenRouter `:online` search.

#### Architecture
- 7 FREE APIs queried in parallel + Serper for web search
- LLM consolidates results (OpenRouter grok-4.1-fast WITHOUT search)
- No silent failures - all API calls logged with timing

#### Files Created
- `src/lib/research/apis/types.ts` - Shared APIResult interface
- `src/lib/research/apis/wikipedia.ts` - Wikipedia API adapter
- `src/lib/research/apis/wikidata.ts` - Wikidata entity search
- `src/lib/research/apis/hackernews.ts` - Algolia HN search
- `src/lib/research/apis/openAlex.ts` - Academic papers search
- `src/lib/research/apis/remoteok.ts` - Job market signals
- `src/lib/research/apis/pullpush.ts` - Reddit via PullPush
- `src/lib/research/apis/fred.ts` - FRED economic data
- `src/lib/research/apis/serper.ts` - Serper web search
- `src/lib/research/engines/api-machine-gun.ts` - Orchestrator

#### Integration
- Updated `scoring-engine.ts` to use API Machine Gun
- Sources now show which APIs contributed
- Parallel execution for speed

#### Spec Created
- `.kiro/specs/api-machine-gun.md` - Full feature specification

### Kiro CLI Usage Today
| Task | Kiro Contribution |
|------|-------------------|
| Spec creation | Generated feature specification |
| API adapters | Created 8 API adapter files |
| Orchestrator | Built parallel execution engine |
| Integration | Updated scoring engine |

**Kiro Prompts Used Today:** ~5
**Total Kiro Prompts:** ~75 of 2,000 available

---

## Final Stats (Updated)

- **Lines of Code:** ~9,500+ TypeScript/React
- **Components:** 20 dashboard components
- **API Routes:** 4 endpoints
- **AI Models:** 3 (DeepSeek R1, Gemini Flash, Llama 3.3)
- **External APIs:** 8 (Wikipedia, Wikidata, HN, OpenAlex, RemoteOK, PullPush, FRED, Serper)
- **Features:** Research engine, web validation, landing page gen, PRD gen, scoring system, API Machine Gun
- **Tests:** 47 passing
- **Documentation Files:** 16+
- **Development Time:** 7 days
- **Kiro Prompts Used:** ~75 of 2,000 available

---

*This devlog documents the complete development journey of Curatos for the Dynamous x Kiro Hackathon.*
