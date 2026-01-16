# Product Overview

## Vision Statement
Curatos DNA transforms weeks of manual market research into minutes of AI-powered validation. It's the first autonomous SaaS research engine that generates, validates, and converts market hypotheses into production-ready deliverables.

## Product Purpose
Curatos DNA is an autonomous AI system that:
1. **Generates** problem and solution hypotheses for any market niche
2. **Validates** each hypothesis against real web data using Exa.ai search
3. **Scores** confidence levels using structured criteria (0-100%)
4. **Produces** actionable outputs: HTML landing pages and comprehensive PRDs

## Target Users

### Primary: Solo Founders & Indie Hackers
- Need rapid idea validation before building
- Limited time/budget for market research
- Want data-driven decisions, not gut feelings
- Value speed-to-market over perfection

### Secondary: Product Teams
- Require structured requirements documentation
- Need validated problem statements for roadmaps
- Want to reduce time spent on discovery phases

### Tertiary: Technical Entrepreneurs
- Appreciate the terminal/hacker aesthetic
- Comfortable with BYOK (Bring Your Own Key) model
- Value transparency in AI reasoning

## Value Proposition

| Traditional Research | Curatos DNA |
|---------------------|-------------|
| 2-4 weeks manual research | 5-10 minutes automated |
| Subjective confidence | Quantified 0-100% scores |
| No source attribution | Real URLs from web search |
| Separate tools for outputs | Integrated landing page + PRD |
| High cost (consultants/tools) | Free tier AI models |

## Key Features

### 🔍 Hypothesis Engine
- AI-powered generation using DeepSeek R1
- Dual columns: Problems | Solutions
- Steering slider for focus balance (0-100%)
- Real-time agent rationale streaming

### ✅ Web Validation System
- Exa.ai integration via OpenRouter `:online` suffix
- Structured scoring criteria (4 dimensions per type)
- Source attribution with clickable URLs
- Visual confidence indicators (hypothesis → fact at 80%+)

### 🏠 Landing Page Generator
- Self-contained HTML with inline CSS
- Preview and Code tabs
- One-click download or clipboard copy
- Mobile-responsive design

### 📋 PRD Generator
- Comprehensive markdown format
- FR-001/NFR-001 requirement numbering
- Compatible with Notion, GitHub, Confluence
- Includes: Executive Summary, Requirements, Metrics, Risks

### 🎯 Stage Progression System
- 6-stage quality gates with thresholds
- Visual progress bar
- Unlocks outputs at validated milestones

## User Journey

```
┌─────────────────────────────────────────────────────────────┐
│  1. CONNECT          2. CONFIGURE        3. GENERATE        │
│  ───────────         ────────────        ──────────         │
│  Enter OpenRouter    Set niche &         Click START        │
│  API key             steering slider     ENGINE             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. VALIDATE         5. UNLOCK           6. EXPORT          │
│  ──────────          ────────            ────────           │
│  Watch AI research   Reach 5+ facts      Generate landing   │
│  each hypothesis     at 80%+ confidence  page or PRD        │
└─────────────────────────────────────────────────────────────┘
```

## Success Criteria

### MVP (Current State) ✅
- [x] Hypothesis generation working
- [x] Web validation with real sources
- [x] Landing page generation
- [x] PRD generation
- [x] Demo mode for testing
- [x] 0 TypeScript errors, 0 vulnerabilities

### Post-Hackathon Goals
- [ ] Streaming generation (real-time updates)
- [ ] Multiple landing page templates
- [ ] Export to Notion/Jira/Linear
- [ ] User authentication & persistence
- [ ] Team collaboration features

## Business Model (Future)
- **Free Tier**: BYOK model, unlimited usage with own API keys
- **Pro Tier**: Managed API keys, saved projects, templates
- **Team Tier**: Collaboration, shared research, analytics

## Competitive Differentiation
1. **Dual Output**: Only tool generating both landing pages AND PRDs
2. **Real Validation**: Web search, not just AI hallucination
3. **Transparent Scoring**: See exactly why confidence is high/low
4. **Terminal Aesthetic**: Unique visual identity for technical users
5. **Free Tier Models**: DeepSeek R1 + Gemini Flash = $0 cost
