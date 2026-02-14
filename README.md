# Curatos DNA

### 5th Place Winner — Dynamous x Kiro Hackathon 2026 (out of 160 submissions)

An AI-powered business idea validator that searches 8 real sources, runs ~50 AI calls, and scores your idea across 7 pillars and 21 subcategories — backed by data, not opinions.

---

## Demo

[![Watch the Demo](https://img.youtube.com/vi/bwmtiFe6iec/maxresdefault.jpg)](https://youtu.be/bwmtiFe6iec)

**[Watch the full demo on YouTube](https://youtu.be/bwmtiFe6iec)**

---

## The Story

Curatos DNA was built in a single hackathon sprint for the **Dynamous x Kiro Hackathon 2026**, competing against **160 submissions** from developers around the world. The challenge: build something meaningful using [Kiro CLI](https://kiro.dev).

The idea was simple but ambitious — what if you could type a business idea and get an honest, evidence-based validation instead of gut feelings? Not a survey. Not a pitch deck template. A system that actually goes out, searches real sources, and tells you what the data says.

The result was Curatos DNA: an app that takes a raw business idea, normalizes it into 7 validation pillars, generates ~50 targeted search queries, hits 8 real-world APIs in parallel (Google, Reddit, Hacker News, FRED economic data, OpenAlex academic papers, Wikipedia, Wikidata, RemoteOK job listings), and then uses AI to analyze every result for relevance, impact, and confidence. That's **168 data points** per validation (21 subcategories x 8 sources).

It doesn't stop at scoring. It identifies your weak pillars, suggests improvements, generates investor-ready business plans with financial projections, creates full Product Requirements Documents with traceability (users -> stories -> requirements), and even auto-generates a working landing page from the PRD.

The entire project was built using Kiro CLI's steering documents and feature specifications (see the `.kiro/` folder for the full development history).

**It placed 5th out of 160 submissions.**

---

## What It Does

```
1. You type a business idea + target geography
   ↓
2. AI normalizes it into a 7-pillar description
   ↓
3. Smart query generation (~50 targeted queries)
   ↓
4. Parallel API calls across 8 real-world sources
   ↓
5. AI analyzes each result (relevance, impact, confidence)
   ↓
6. Scores calculated: subcategory → pillar → overall
   ↓
7. Color-coded evidence matrix displayed
   ↓
8. AI refines your weak pillars
   ↓
9. Business plan + PRD auto-generated
   ↓
10. AutoCoder builds a working prototype
```

### The 7 Pillars

| Pillar | What It Measures |
|--------|-----------------|
| Problem Severity | Pain intensity, frequency, workarounds |
| Market Opportunity | TAM, adjacent markets, growth rate |
| Competitive Landscape | Competitor weaknesses, differentiation |
| Solution Fit | Problem-solution match, feature completeness |
| Monetization Potential | Pricing models, unit economics |
| Go-to-Market Clarity | Channel strategy, adoption readiness |
| Timing and Trends | Market timing, industry shifts, economics |

### The 8 Sources

Google (Serper API), Reddit (PullPush API), Hacker News, FRED Economic Data, OpenAlex Academic Papers, Wikipedia, Wikidata, RemoteOK Job Listings

---

## What's Next

Curatos is a startup under **ResumoCast Ventures**. This hackathon prototype proved the concept — an improved commercial version of Curatos DNA will be available soon.

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

## Local Development

> This is the hackathon version. For the commercial product, visit [ResumoCast Ventures](https://resumocast.com).

```bash
git clone https://github.com/carrgust/kiro-hackathon-gustavo-carriconde.git
cd kiro-hackathon-gustavo-carriconde
npm install
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL, OPENROUTER_API_KEY, SERPER_API_KEY, NEXTAUTH_SECRET
npx prisma generate && npx prisma migrate dev
npm run dev
# Open http://localhost:5001
```

---

## Contributing

Contributions are welcome! If you'd like to help improve Curatos DNA, here's how:

1. **Fork** the repository
2. **Create a branch** for your feature or fix (`git checkout -b feature/my-feature`)
3. **Commit** your changes with clear, descriptive messages
4. **Push** to your fork and open a **Pull Request**

### Guidelines

- Keep PRs focused — one feature or fix per PR
- Follow the existing code style (TypeScript, Tailwind CSS)
- Test your changes locally before submitting
- Describe what your PR does and why in the description

### Areas Where Help Is Appreciated

- New data source integrations (beyond the current 8)
- Improved scoring algorithms
- UI/UX enhancements
- Performance optimizations
- Bug fixes and documentation improvements

By submitting a contribution, you agree that your work will be owned by ResumoCast Ventures under the same terms as the rest of the project.

---

## License

All rights reserved. Copyright (c) 2026 ResumoCast Ventures.

This code is provided for reference purposes only. No permission is granted to copy, modify, distribute, or use this software for any purpose without explicit written consent from ResumoCast Ventures.

---

## Author

**Gustavo Martini Carriconde**

[ResumoCast Ventures](https://resumocast.com)
