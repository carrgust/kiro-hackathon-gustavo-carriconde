# Curatos DNA - AI-Powered Business Idea Validator

You type a business idea. It searches 8 real sources (Google, Reddit, Hacker News, FRED, OpenAlex, Wikipedia, Wikidata, RemoteOK). ~50 AI calls analyze the evidence across 7 pillars and 21 subcategories. You get an honest score backed by data, not opinions.

---

## Live Demo (Try It Now!)

**The app is deployed and ready to use. No installation needed.**

### [https://kiro-hackathon-gustavo-carriconde.vercel.app](https://kiro-hackathon-gustavo-carriconde.vercel.app)

- Connected to Neon PostgreSQL database on Vercel
- OpenRouter API key configured
- Judges can use it immediately

---

## Demo Video

**[https://youtu.be/bwmtiFe6iec](https://youtu.be/bwmtiFe6iec)** - 2-5 minute walkthrough of the full validation flow

---

## Features

### 7-Pillar Validation
Analyzes your business idea across 7 critical dimensions:
- **Problem Severity** - Pain intensity, frequency, workarounds
- **Market Opportunity** - TAM, adjacent markets, growth rate
- **Competitive Landscape** - Competitor weaknesses, differentiation
- **Solution Fit** - Problem-solution match, feature completeness
- **Monetization Potential** - Pricing models, unit economics
- **Go-to-Market Clarity** - Channel strategy, adoption readiness
- **Timing and Trends** - Market timing, industry shifts, economics

### Evidence Matrix
**21 subcategories × 8 sources = 168 data points**

Each subcategory is validated against 8 real-world sources:
- Google (via Serper API)
- Reddit (via PullPush API)
- Hacker News
- FRED Economic Data
- OpenAlex Academic Papers
- Wikipedia
- Wikidata
- RemoteOK Job Listings

### Smart LLM Query Generation
- AI generates targeted search queries for each pillar/subcategory/source combination
- No generic keyword stuffing - context-aware queries
- Fallback to template-based queries if LLM fails

### Business Plan Generator
Auto-generates investor-ready business plan with:
- Executive Summary
- Market Analysis
- Financial Projections
- Interactive charts (Recharts)

### PRD Generator
Comprehensive Product Requirements Document with:
- User personas
- User stories
- Functional requirements (FR-001, FR-002...)
- Non-functional requirements (NFR-001, NFR-002...)
- Full traceability: Users → Stories → Requirements

### Idea Refinement with AI
- Identifies weak pillars (score < 70)
- AI suggests improvements for each weak area
- Regenerates refined 7-pillar description

### Auto Coder (DNA to Working Code)
- Reads the PRD
- Generates working HTML/CSS/JS landing page
- Live preview in iframe
- Download or copy to clipboard

---

## How It Works

```
1. User enters business idea + geography
   ↓
2. AI normalizes into 7-pillar description
   ↓
3. Smart query generation (LLM creates ~50 targeted queries)
   ↓
4. Parallel API calls (8 sources × 21 subcategories)
   ↓
5. LLM analyzes each source result (relevance, impact, confidence)
   ↓
6. Scores calculated (subcategory → pillar → overall)
   ↓
7. Evidence matrix displayed (color-coded scores)
   ↓
8. AI refines weak pillars
   ↓
9. Business plan + PRD generated
   ↓
10. AutoCoder builds working prototype
```

---

## Local Installation (Optional)

**Note:** For the easiest experience, use the live demo at the Vercel URL - no installation required. Local setup is optional.

### Prerequisites

- **Node.js 18+**
- **PostgreSQL database** (Docker recommended, or external provider like Neon)
- **OpenRouter API key** - Requires funded account. Costs ~$0.01 per validation using gemini-2.5-flash-lite (~50 LLM calls per validation)
- **Serper API key** - For Google search (2,500 free searches at serper.dev)

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/carrgust/kiro-hackathon-gustavo-carriconde.git
cd kiro-hackathon-gustavo-carriconde

# 2. Install dependencies
npm install

# 3. Start PostgreSQL (if using Docker)
docker-compose up -d

# 4. Configure environment variables
cp .env.local.example .env.local
# Edit .env.local with your values (see below)

# 5. Run database migrations
npx prisma generate
npx prisma migrate dev

# 6. Start development server
npm run dev

# 7. Open browser
# Navigate to http://localhost:5001
```

### Environment Variables

Create `.env.local` with the following variables:

```bash
# Database connection string
DATABASE_URL="postgresql://user:password@localhost:5432/curatos"

# OpenRouter API key (required for AI features)
OPENROUTER_API_KEY="sk-or-v1-..."

# Serper API key (required for Google search)
SERPER_API_KEY="..."

# NextAuth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="..."
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14, React 18, TypeScript |
| Database | PostgreSQL, Prisma ORM |
| Styling | Tailwind CSS, Framer Motion |
| Charts | Recharts |
| AI Gateway | OpenRouter (Gemini 2.5 Flash Lite, GLM 4.7 Flash, DeepSeek V3.2) |
| Web Research | 8 APIs (Serper, PullPush, HN, FRED, OpenAlex, Wikipedia, Wikidata, RemoteOK) |
| Deployment | Vercel + Neon PostgreSQL |

---

## Built with Kiro CLI

This entire project was built using [Kiro CLI](https://kiro.dev) for the **Dynamous x Kiro Hackathon 2026**.

See the `.kiro/` folder for:
- **Steering documents** - Product vision, technical architecture, project structure
- **Feature specifications** - 7 detailed specs
- **Development log** - Complete build timeline and decisions

---

## Author

**Gustavo Martini Carriconde**

Dynamous x Kiro Hackathon 2026

