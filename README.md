# Curatos DNA

> **From Idea to MVP in Minutes** — AI-powered business validation platform that transforms any business idea into a validated business plan, technical PRD, and working HTML prototype through real-time web research across 8 APIs and autonomous code generation.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://www.postgresql.org/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-cyan)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## What It Does

Curatos DNA is an end-to-end business validation and prototyping platform. It takes any business idea from initial concept to a working MVP mockup through an automated 6-stage pipeline:

1. **Canonical normalization** — AI interprets your idea into a structured 7-pillar business description
2. **7-pillar validation** — Real-time research across 8 APIs (Google, Reddit, Hacker News, FRED, Academic, Wikipedia, Wikidata, Jobs) scoring Problem, Market, Competition, Solution, Monetization, Go-to-Market, and Timing — each 0-100
3. **Idea refinement** — AI analyzes weak pillars and generates an improved version of your business concept
4. **Business plan generation** — 4-section investor-ready plan with interactive charts and financial projections
5. **PRD generation** — Product Requirements Document: the bridge between business analysis and technical development. It translates validated business insights into structured technical requirements with full traceability (Users → Stories → Functional Requirements → Non-Functional Requirements)
6. **AutoCoder** — Autonomous AI agent that reads the PRD and generates a working HTML/CSS/JS landing page prototype, effectively producing an MVP mockup from your validated idea

From idea to MVP — no coding required.

---

## Features

### 7-Pillar Validation Engine
- AI-powered scoring across 7 business dimensions (3 subcategories each = 21 total)
- Real-time web research via API Machine Gun (5 sources per subcategory = 105 searches)
- Live progress tracking with animated pillar cards and score gauges
- Source attribution with favicons and clickable URLs

### Idea Refinement Engine
- Identifies lowest-scoring pillars automatically after research completes
- Generates an improved business idea addressing each weakness
- Side-by-side before/after comparison in 2-column grid layout
- Green glowing action button signals the next step

### Business Plan Generator
- 4-section plan: Executive Summary, Market & Sales, Team & Operations, Financial Plan
- Interactive charts per section (6 chart types: pie, bar, radar, metric cards, timeline, donut)
- Sequential typewriter animation on first render
- Inline editing with save/cancel for each section

### PDF Download
- Professional investor-grade PDF with emerald branding
- Embedded chart images (Recharts → PNG → PDF)
- Cover page, formatted sections, financial tables, page numbers
- Client-side generation (zero server dependency)

### Progressive Unlock Flow
- Tabbed sidebar navigation: Business Idea → Processing → Business Plan → PRD → AutoCoder
- Each stage unlocks after the previous completes
- Visual progress indicators throughout

### PRD Generator
- Structured Product Requirements Document with traceability
- 5 sections: Executive Summary, Target Users, User Stories, Functional Requirements, Non-Functional Requirements
- Numbered IDs with cross-references (U-xxx → US-xxx → FR-xxx → NFR-xxx)
- Progressive section unlocking with collapsible tables
- Copy/Download functionality

### AutoCoder — PRD to HTML Mockup
- Two-phase autonomous agent: Decomposer (PRD → Features) + Implementer (Features → HTML)
- Generates working HTML landing page from structured PRD
- Single-file output with inline CSS/JS (no build tools needed)
- Live preview in iframe with 2-second polling updates
- Full traceability: each feature links to FR-xxx, US-xxx, NFR-xxx IDs
- Copy/Download final mockup

---

## Quick Start

### Prerequisites

- **Node.js 18+**
- **Docker** (for PostgreSQL database)
- **OpenRouter API key** (PAID subscription required) — [Sign up at openrouter.ai](https://openrouter.ai). This application makes multiple LLM calls across different models (GLM 4.7 Flash, DeepSeek Chat, Gemini Flash) that have been carefully tuned for the optimal balance of efficiency, quality, and cost. Free OpenRouter accounts have strict rate limits that will cause the validation pipeline to fail. A paid account with credit is required.
- **Serper API key** (Required) — [Get 2,500 free searches at serper.dev](https://serper.dev). Powers the Google web research across all 7 pillars.

> **Judges: Don't want to set up API keys?** We deployed the exact same commit to Vercel so you can experience the full application as a regular user without any setup: **[https://curatos-dna.vercel.app](https://curatos-dna.vercel.app)**
> The Vercel deployment matches this repository commit-for-commit and was prepared hours before submission.

### 1. Clone and Install

```bash
git clone https://github.com/carrgust/kiro-hackathon-gustavo-carriconde.git
cd kiro-hackathon-gustavo-carriconde
npm install
```

### 2. Start the Database

```bash
# Start PostgreSQL via Docker
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Database (default works with docker-compose)
DATABASE_URL="postgresql://curatos:curatos_dev_password@localhost:5432/curatos_dev"

# Required (PAID account) - Sign up at https://openrouter.ai
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Required - Get 2,500 free searches at https://serper.dev
SERPER_API_KEY="your_serper_api_key_here"
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5001](http://localhost:5001) and start validating!

---

## How It Works

### Step 1: Input Your Idea
Type any business idea (e.g., "AI-powered fitness coaching app for seniors"). Select your target geography. The system normalizes it into a structured 7-pillar description.

### Step 2: 7-Pillar Validation
Click **Validate** and watch as AI researches your idea across 7 pillars:
- **Market Viability** — TAM/SAM/SOM, demand signals
- **Technical Feasibility** — Tech stack complexity, build timeline
- **Revenue Potential** — Pricing models, unit economics
- **Competitive Landscape** — Existing players, differentiation
- **Scalability** — Growth potential, infrastructure needs
- **Regulatory Risk** — Compliance, legal barriers
- **Team Fit** — Required expertise, hiring needs

Each pillar gets a 0-100 score with real web sources.

### Step 3: Idea Refinement
AI identifies weak pillars from the research results and generates an improved version of your business idea that addresses each gap. The refined idea appears in a 2-column grid matching the original layout for easy comparison.

### Step 4: Business Plan
Generate a 4-section business plan with interactive charts:
- Executive Summary with key metric cards
- Market & Sales with pie charts, channel bars, and radar charts
- Team & Operations with milestone timeline and team composition donut
- Financial Plan with revenue projections and financial tablesNd here is the application audit the readme file to make sure you have information that are 100% correct.

### Step 5: PRD Generation
Generate a structured Product Requirements Document:
- Target Users (U-xxx) with personas
- User Stories (US-xxx) linked to users
- Functional Requirements (FR-xxx) linked to stories
- Non-Functional Requirements (NFR-xxx) with global constraints
- Full traceability chain: U → US → FR → NFR

### Step 6: AutoCoder Mockup
Transform your PRD into a working HTML landing page:
- AI decomposes PRD into 5-15 ordered features
- Each feature implemented sequentially with live preview
- Single-file HTML output (inline CSS/JS, no dependencies)
- Copy or download the complete mockup

### Step 7: Prototype Your MVP
The AutoCoder generates a working HTML landing page from your PRD — effectively creating an MVP prototype. Download the HTML file and you have a functional mockup of your validated business idea, ready to show investors or test with users.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  Tabbed Sidebar    │  Validation Dashboard  │  Business Plan     │
│  (Input/Process/   │  (7-Pillar Cards,      │  (Charts, PDF,     │
│   Gaps/Plan)       │   Score Gauges)        │   Inline Edit)     │
├─────────────────────────────────────────────────────────────────┤
│                    State Management                              │
│  • Validation state (pillars, scores, sources)                  │
│  • Business plan state (4 sections + chart_data)                │
│  • Progressive unlock (stage gating)                            │
│  • localStorage (session persistence)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/validate              POST  Start 7-pillar validation     │
│  /api/validate/[id]         GET   Poll validation progress      │
│  /api/validate/normalize    POST  Canonical idea normalization  │
│  /api/validate/close-gaps   POST  Gap analysis + improvements   │
│  /api/validate/generate-business-plan  POST  Business plan gen  │
│  /api/validate/generate-prd POST  PRD document generation       │
│  /api/research/machine-gun  POST  Multi-source web research     │
│  /api/research/cycle        POST  Continuous research cycle     │
│  /api/health                GET   Health check                  │
│  + 9 more endpoints                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ValidationEngine   │  ModelClient        │  RegistryLoader     │
│  • 7-pillar scoring │  • Fallback chain   │  • API source map   │
│  • Source analysis  │  • JSON mode        │  • Per-pillar APIs  │
│  • Gap detection    │  • Token management │  • Rate limiting    │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Prisma) │ OpenRouter API     │ Serper API          │
│  • Sessions, Pillars │ • GLM / DeepSeek   │ • Web search        │
│  • Scores, Sources   │ • Gemini Flash     │ • Source validation  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 14.2.35 |
| **Language** | TypeScript | 5.3.3 |
| **UI** | React | 18.2.0 |
| **Styling** | Tailwind CSS | 3.4.0 |
| **Animations** | Framer Motion | 12.26.2 |
| **Charts** | Recharts | 3.7.0 |
| **PDF** | @react-pdf/renderer | 4.3.2 |
| **Database** | PostgreSQL + Prisma | 15 + 6.19.2 |
| **Notifications** | Sonner | 2.0.7 |
| **Testing** | Vitest + Playwright | 4.0.17 + 1.57.0 |
| **AI Gateway** | OpenRouter | - |
| **AI Models** | GLM 4.7 Flash, DeepSeek Chat, Gemini Flash | Free tier |
| **Web Search** | Serper API | - |

---

## Project Structure

```
curatos-dna/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── api/                       # 18 API route handlers
│   │   │   ├── validate/             # 7-pillar validation endpoints
│   │   │   ├── research/             # Web research pipeline
│   │   │   └── ...                   # Chat, health, stream, etc.
│   │   └── page.tsx                  # Main application (1600+ lines)
│   ├── components/                    # 57 React components
│   │   ├── sections/                 # Page section components
│   │   ├── pdf/                      # PDF generation pipeline
│   │   └── ...                       # UI components
│   ├── lib/
│   │   ├── validation/              # 7-pillar scoring engine
│   │   ├── config/                  # Model configuration
│   │   ├── research/                # Web research engines
│   │   └── db/                      # Database client
│   └── types/                        # TypeScript definitions
├── .kiro/
│   ├── steering/                     # Product, tech, structure docs
│   ├── specs/                        # Feature specifications
│   ├── prompts/                      # Reusable Kiro prompts
│   ├── settings/                     # LSP and MCP config
│   └── DEVLOG.md                    # Development timeline (840+ lines)
├── prisma/
│   └── schema.prisma                 # Database schema (10 models)
├── public/screenshots/               # Application screenshots
└── docker-compose.yml                # PostgreSQL setup
```

---

## Development Stats

| Metric | Value |
|--------|-------|
| Lines of Code | ~19,700 TypeScript/React |
| Components | 57 |
| API Routes | 18 endpoints |
| Database Models | 10 (Prisma) |
| Chart Types | 6 (Pie, Bar, Radar, Cards, Timeline, Donut) |
| .kiro/ Files | 131 |
| Git Commits | 80 |
| TypeScript Errors | 0 |

---

## Testing

```bash
# Unit tests
npm test

# E2E tests (Playwright)
npm run test:e2e

# Test with UI
npm run test:ui
```

---

## Screenshots

### Main Dashboard
![Main Dashboard](./public/screenshots/main-dashboard.png)

### Validation in Progress
![Validation](./public/screenshots/demo-mode-populated.png)

### Landing Page Generator
![Landing Page](./public/screenshots/landing-page-generated.png)

### PRD Generator
![PRD](./public/screenshots/prd-generated.png)

---

## Built With Kiro

This project was built using [Kiro CLI](https://kiro.dev) for the **Dynamous x Kiro Hackathon 2026**.

### Kiro Usage
- **Steering Documents**: Product vision, technical architecture, project structure
- **Feature Specs**: 6 detailed specifications (hypothesis engine, demo mode, API machine gun, database setup, OpenRouter validation, PRD generator)
- **Prompts**: 12 reusable prompts (code review, feature planning, execution, RCA, system review)
- **Code Generation**: Components, API routes, TypeScript interfaces, test suites
- **Code Reviews**: Automated review with JSDoc additions and TypeScript fixes
- **Documentation**: DEVLOG, architecture docs, API documentation

### Development Timeline
- **Day 1-2**: Project scaffolding, dashboard design, architecture decisions
- **Day 3-6**: Research engine, hypothesis validation, scoring system, demo mode
- **Day 7-8**: 7-pillar validation system, API Machine Gun, glassmorphism UI
- **Day 9**: Close-gaps analysis, business plan generation, sidebar navigation
- **Day 10**: Interactive charts (6 types), PDF download, section-specific visualizations
- **Day 11**: AutoCoder engine (PRD-to-HTML), geography integration, final polish

See [.kiro/DEVLOG.md](./.kiro/DEVLOG.md) for the full development journal.

---

## Documentation

- [Development Log](./.kiro/DEVLOG.md) — Full development timeline
- [Product Overview](./.kiro/steering/product.md) — Product vision and user journey
- [Technical Architecture](./.kiro/steering/tech.md) — Stack, models, and architecture
- [Project Structure](./.kiro/steering/structure.md) — File organization guide
- [Feature Specs](./.kiro/specs/) — Detailed feature specifications

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Author

**Gustavo Martini Carriconde**

- GitHub: [@carrgust](https://github.com/carrgust)
- Project: Dynamous x Kiro Hackathon 2026
- Built with: [Kiro CLI](https://kiro.dev)
