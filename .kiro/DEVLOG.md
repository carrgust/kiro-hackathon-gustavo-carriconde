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

*This devlog documents the complete development journey of Curatos for the Dynamous x Kiro Hackathon.*
