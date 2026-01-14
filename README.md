# Curatos DNA 🧬

> **Autonomous SaaS Research Engine** - Transform market research into deployable products with AI-powered validation and generation

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
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
- Includes: Executive Summary, Requirements, Success Metrics, Risks
- Preview rendered markdown or raw source
- Download as .md file

### 🎯 **Requirements Extraction**
- Automatic functional/non-functional requirements
- Unlocks after validating problems + solutions
- Feeds into PRD generation
- Structured for development teams

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

### Installation

```bash
# Clone the repository
git clone https://github.com/gustavocarriconde/kiro-hackathon-gustavo-carriconde
cd kiro-hackathon-gustavo-carriconde

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your OpenRouter API key to .env.local

# Start development server
npm run dev
```

Open [http://localhost:5001](http://localhost:5001) and start researching!

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

### Frontend
- **Next.js 14.2** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React 19** - Latest React features

### AI & APIs
- **OpenRouter** - Unified AI model access
- **DeepSeek R1** - Hypothesis generation (free tier)
- **Gemini Flash** - Landing page & PRD generation (free tier)
- **Exa.ai** - Real web search via OpenRouter `:online`

### Database (Optional)
- **Prisma 6** - Type-safe ORM
- **PostgreSQL** - Relational database
- **Docker** - Local development

### Development
- **Kiro CLI** - AI-powered development workflow
- **ESLint** - Code linting
- **TypeScript** - Static type checking

---

## 🎥 Demo & Screenshots

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
│   │   ├── api/               # API routes
│   │   └── page.tsx           # Main dashboard
│   ├── components/            # React components
│   │   └── dashboard/         # Dashboard-specific components
│   ├── lib/                   # Utilities and services
│   │   ├── api/              # OpenRouter integration
│   │   ├── research/         # Research pipeline
│   │   └── constants.ts      # App constants
│   └── types/                 # TypeScript definitions
├── .kiro/                     # Kiro CLI configuration
│   ├── steering/             # Product context docs
│   ├── DEVLOG.md            # Development timeline
│   └── CODE_REVIEW.md       # Security & quality audit
├── prisma/                    # Database schema (optional)
└── public/                    # Static assets
```

---

## 🔑 Environment Variables

Create `.env.local` with:

```env
# OpenRouter API Key (required)
OPENROUTER_API_KEY=sk-or-v1-...

# Database (optional - for persistence)
DATABASE_URL=postgresql://user:pass@localhost:5432/curatos

# NextAuth (optional - removed in MVP)
# NEXTAUTH_SECRET=your-secret-here
# NEXTAUTH_URL=http://localhost:5001
```

---

## 🎯 Use Cases

### For Solo Founders
- Validate SaaS ideas before building
- Generate landing pages for market testing
- Create PRDs for development planning

### For Product Teams
- Rapid market research and validation
- Generate requirements from research
- Create marketing materials from validated insights

### For Indie Hackers
- Find profitable niches systematically
- Validate problems before solutions
- Export deliverables for quick launches

---

## 🏆 Built With Kiro

This project was built using [Kiro CLI](https://kiro.dev) for the **AWS Kiro Hackathon 2026**.

Kiro CLI accelerated development by:
- Generating React components from specifications
- Implementing API integrations with error handling
- Creating type-safe TypeScript interfaces
- Scaffolding project structure
- Providing AI-powered code assistance

**Estimated time saved:** 40+ hours of manual coding

---

## 📊 Hackathon Highlights

### Innovation
- **Dual AI Outputs:** Landing Page + PRD from same research
- **Real Web Search:** Exa.ai integration via OpenRouter `:online`
- **Autonomous Pipeline:** 3-engine research system
- **Terminal Aesthetic:** Unique hacker-style UI

### Technical Excellence
- ✅ 0 TypeScript errors
- ✅ 0 ESLint warnings
- ✅ 0 npm vulnerabilities
- ✅ Error boundary implementation
- ✅ Comprehensive code review

### Documentation
- Complete DEVLOG with 5-day timeline
- Code review with 23 issues addressed
- Feature documentation for Landing Page & PRD
- Steering docs (product, tech, structure)

---

## 🚧 Roadmap

### Phase 1: MVP (Complete ✅)
- [x] Hypothesis generation
- [x] Web search validation
- [x] Landing page generator
- [x] PRD generator
- [x] Token tracking

### Phase 2: Enhancement
- [ ] Streaming generation (real-time updates)
- [ ] Multiple landing page templates
- [ ] A/B testing variations
- [ ] Image generation for landing pages
- [ ] Export to Notion/Jira/Linear

### Phase 3: Scale
- [ ] User authentication
- [ ] Project persistence
- [ ] Team collaboration
- [ ] API for programmatic access
- [ ] Chrome extension

---

## 🤝 Contributing

This is a hackathon project, but contributions are welcome!

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

## 🙏 Acknowledgments

- **Kiro CLI** - AI-powered development workflow
- **OpenRouter** - Unified AI model access
- **Dynamous** - Hackathon organization
- **AWS** - Cloud infrastructure and sponsorship
- **Cole Medin** - Hackathon template and guidance

---

## 📞 Support

- 📧 Email: [your-email]
- 🐛 Issues: [GitHub Issues](https://github.com/gustavocarriconde/kiro-hackathon-gustavo-carriconde/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/gustavocarriconde/kiro-hackathon-gustavo-carriconde/discussions)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Built with ❤️ using Kiro CLI for the AWS Kiro Hackathon 2026

[Demo](https://curatos.vercel.app) • [Documentation](.kiro/DEVLOG.md) • [Report Bug](https://github.com/gustavocarriconde/kiro-hackathon-gustavo-carriconde/issues)

</div>
