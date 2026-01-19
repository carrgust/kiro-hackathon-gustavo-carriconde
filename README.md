d# Curatos DNA 🧬

> **Autonomous SaaS Research Engine** - Transform market research into deployable products with AI-powered validation and generation

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-47%20passing-brightgreen)](./src/__tests__)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-cyan)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 What It Does

Curatos accelerates SaaS product validation by autonomously generating, researching, and validating market hypotheses. In minutes, transform a niche idea into validated problems, solutions, and production-ready deliverables: **HTML landing pages** and **comprehensive PRDs**.

Stop spending weeks on manual market research. Let AI discover validated opportunities while you focus on building.

---

## ✨ Features

### 🔍 **Autonomous Research Engine**
- AI-powered hypothesis generation using DeepSeek R1
- Real-time web validation via Exa.ai search
- Automatic confidence scoring (0-100%)
- Source attribution with real URLs

### 📊 **Smart Validation System**
- Problems and solutions validated against real market data
- Visual confidence indicators (empty → researching → validated)
- Unlock DNA generation at 5+ validated hypotheses
- Token tracking with consumption rate monitoring

### 🏠 **Landing Page Generator**
- Generate professional HTML landing pages from validated research
- Self-contained with inline CSS (no dependencies)
- Preview and code tabs
- One-click download or copy to clipboard
- Ready to deploy immediately

### 📋 **PRD Generator**
- Create comprehensive Product Requirements Documents
- Markdown format (Notion, GitHub, Confluence compatible)
- Includes: Executive Summary, Requiremen
- ts, Success Metrics, Risks
- Preview rendered markdown or raw source
- Download as .md file

### 🎯 **Stage Progression System**
- 6-stage quality gates with thresholds
- Visual progress bar
- Unlocks outputs at validated milestones

### 🎨 **Terminal Aesthetic**
- Hacker-style UI with dark theme
- Real-time agent rationale streaming
- Token flow visualization
- Problem ↔ Solution steering slider

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- OpenRouter API key ([get one free](https://openrouter.ai))
- Serper API key ([get 2,500 free searches](https://serper.dev)) - Optional but recommended for web search

### Installation

```bash
# Clone the repository
git clone https://github.com/gustavocarriconde/kiro-hackathon-gustavo-carriconde
cd kiro-hackathon-gustavo-carriconde

# Install dependencies
npm install

# Copy environment template and add your API keys
cp .env.local.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY and SERPER_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:5001](http://localhost:5001) and start researching!

### Demo Mode (No API Key Required)

Click **"Try Demo Mode"** to explore all features with pre-generated data.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Hypothesis Columns  │  Modals (DNA/PRD/LP)       │
│             │  (Problems/Solutions) │                            │
├─────────────────────────────────────────────────────────────────┤
│                    State Management                              │
│  • EngineState (hypotheses, solutions, requirements)            │
│  • useScoring hook (stage progression)                          │
│  • localStorage (API key, total spent)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Next.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  /api/health          GET   Health check                        │
│  /api/chat            POST  AI chat completion                  │
│  /api/research/start  POST  Start research pipeline             │
│  /api/research/status GET   Get research status                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  HypothesisService  │  StreamingService  │  ScoringEngine       │
│  • generate()       │  • generateLP()    │  • scoreProblem()    │
│  • research()       │  • generatePRD()   │  • scoreSolution()   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OpenRouter API                                │
│  DeepSeek R1 (generation) │ Gemini Flash (LP/PRD) │ Exa.ai     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📖 How It Works

### 1. **Enter Your Niche**
Type your market niche (e.g., "fintech payments", "developer tools", "healthcare tech")

### 2. **Start the Engine**
Click START ENGINE and watch as AI:
- Generates problem hypotheses
- Generates solution hypotheses
- Researches each with real web search
- Assigns confidence scores based on findings

### 3. **Watch Validation**
Hypotheses move through states:
- **Empty** (just generated)
- **Researching** (being validated)
- **Validated** (confidence score assigned with sources)

### 4. **Create DNA**
Once 5+ hypotheses reach 80%+ confidence:
- Click **CREATE DNA** to unlock outputs
- Choose **GENERATE LANDING PAGE** for HTML marketing page
- Choose **GENERATE PRD** for markdown requirements doc

### 5. **Export & Deploy**
- Download HTML landing page (ready to deploy)
- Download PRD markdown (ready to share with team)
- Both generated in ~5-10 seconds

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 14.2.35 |
| **Language** | TypeScript | 5.3.3 |
| **UI** | React | 18.2.0 |
| **Styling** | Tailwind CSS | 3.4.0 |
| **Animations** | Framer Motion | 12.26.2 |
| **Notifications** | Sonner | 2.0.7 |
| **Database** | PostgreSQL + Prisma | 6.19.2 |
| **Testing** | Vitest | 4.0.17 |
| **AI Gateway** | OpenRouter | - |
| **AI Models** | DeepSeek R1, Gemini Flash | Free tier |
| **Web Search** | Exa.ai | via OpenRouter |

---

## 🎥 Screenshots

### Main Dashboard
![Main Dashboard](./public/screenshots/main-dashboard.png)
*Terminal-style interface with real-time hypothesis generation and validation*

### DNA Analysis Modal
![DNA Analysis](./public/screenshots/demo-mode-populated.png)
*DNA modal showing validated research with generation options*

### Landing Page Generator
![Landing Page Generator](./public/screenshots/landing-page-generated.png)
*Generate professional HTML landing pages from validated research*

### PRD Generator
![PRD Generator](./public/screenshots/prd-generated.png)
*Create comprehensive Product Requirements Documents in markdown*

---

## 📁 Project Structure

```
curatos-dna/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (4 endpoints)
│   │   └── page.tsx           # Main dashboard
│   ├── components/dashboard/   # 20 React components
│   ├── hooks/                 # Custom hooks (useScoring)
│   ├── lib/
│   │   ├── api/              # OpenRouter integration
│   │   ├── research/         # 3-engine pipeline
│   │   └── scoring/          # Stage progression
│   └── __tests__/            # 47 tests
├── .kiro/
│   ├── steering/             # Product context docs
│   ├── specs/                # Feature specifications
│   └── DEVLOG.md            # Development timeline
├── docs/                      # API documentation
└── prisma/                    # Database schema
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

**Test Coverage:**
- API health checks
- Demo mode isolation
- Streaming service
- Scoring engine

---

## 📊 Scoring System

### Quality Gates
| Stage | Threshold | Unlocks |
|-------|-----------|---------|
| Hypothesis | 80% avg, 5+ facts | Problem Quality |
| Problem Quality | 70% | Solution Quality |
| Solution Quality | 70% | Requirements |
| Requirements | 75% | PRD |
| PRD | 80% | DNA |

### Scoring Criteria

**Problems:**
- Market Size (25 pts)
- Pain Intensity (25 pts)
- Existing Solutions (25 pts)
- Willingness to Pay (25 pts)

**Solutions:**
- Technical Feasibility (25 pts)
- Competitive Advantage (25 pts)
- Time to Market (25 pts)
- Market Validation (25 pts)

---

## 🏆 Built With Kiro

This project was built using [Kiro CLI](https://kiro.dev) for the **AWS Kiro Hackathon 2026**.

### Kiro Usage Highlights
| Task | Kiro Contribution |
|------|-------------------|
| Project Scaffolding | Initial Next.js setup |
| Component Generation | All 20 dashboard components |
| API Integration | OpenRouter provider with retry logic |
| Test Suite | 47 tests with assertions |
| Documentation | Steering docs, specs, API docs |

**Kiro Prompts Used:** ~70 of 2,000 available

---

## 📈 Development Stats

| Metric | Value |
|--------|-------|
| Lines of Code | ~9,000+ |
| Components | 20 |
| API Routes | 4 |
| Tests | 47 passing |
| AI Models | 3 |
| Development Time | 6 days |
| TypeScript Errors | 0 |
| npm Vulnerabilities | 0 |

---

## 🚧 Roadmap

### Phase 1: MVP ✅
- [x] Hypothesis generation
- [x] Web search validation
- [x] Landing page generator
- [x] PRD generator
- [x] Demo mode
- [x] Scoring system

### Phase 2: Enhancement
- [ ] Streaming generation
- [ ] Multiple landing page templates
- [ ] A/B testing variations
- [ ] Export to Notion/Jira/Linear

### Phase 3: Scale
- [ ] User authentication
- [ ] Project persistence
- [ ] Team collaboration
- [ ] API for programmatic access

---

## 📄 Documentation

- [API Documentation](./docs/API.md)
- [Development Log](./.kiro/DEVLOG.md)
- [Technical Architecture](./.kiro/steering/tech.md)
- [Product Overview](./.kiro/steering/product.md)
- [Feature Specs](./.kiro/specs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Gustavo Martini Carriconde**

- GitHub: [@gustavocarriconde](https://github.com/gustavocarriconde)
- Project: Dynamous x Kiro Hackathon Entry
- Built with: [Kiro CLI](https://kiro.dev)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Built with ❤️ using Kiro CLI for the AWS Kiro Hackathon 2026

[Demo Mode](#demo-mode-no-api-key-required) • [Documentation](./docs/API.md) • [Report Bug](https://github.com/gustavocarriconde/kiro-hackathon-gustavo-carriconde/issues)

</div>
