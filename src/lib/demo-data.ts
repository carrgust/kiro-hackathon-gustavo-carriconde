// Pre-generated demo data to avoid API calls in demo mode

export const DEMO_PRD = `# Product Requirements Document: GitHub Intelligence API

## Executive Summary
GitHub Intelligence API is a SaaS platform providing AI-powered repository analytics, intelligent code review, and unified team productivity metrics for development teams.

## Problem Statement
- Developers struggle to understand repository health metrics
- Code review processes lack intelligent insights  
- Team productivity metrics are scattered across tools

## Target Users
- Software Engineering Managers: Track team performance
- Tech Leads: Improve code review efficiency
- Individual Developers: Improve code quality

## Proposed Solution
1. AI-powered repository health dashboard
2. Intelligent code review assistant with ML insights
3. Unified team analytics API with GitHub integration

## Requirements

### Functional Requirements
FR-001: GitHub API integration with OAuth authentication
FR-002: Real-time webhook processing for repository events
FR-003: Machine learning pipeline for code analysis
FR-004: Dashboard with customizable widgets
FR-005: Automated code review comments on PRs
FR-006: Team activity reports and exports

### Non-Functional Requirements
NFR-001: Sub-200ms API response time for dashboard queries
NFR-002: GDPR compliant data processing and storage
NFR-003: Horizontal scaling to 10k+ repositories
NFR-004: 99.9% uptime SLA

## Success Metrics
- 50% reduction in code review time
- 30% improvement in code quality scores
- 90% user satisfaction rating
`;

export const DEMO_LANDING_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitHub Intelligence API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #fff; }
    .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; }
    h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(90deg, #06b6d4, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    p { font-size: 1.25rem; color: #9ca3af; max-width: 600px; margin-bottom: 2rem; }
    .cta { background: #06b6d4; color: #000; padding: 1rem 2rem; font-size: 1rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .problems { padding: 4rem 2rem; background: #111; }
    .problems h2 { text-align: center; color: #06b6d4; margin-bottom: 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; max-width: 1200px; margin: 0 auto; }
    .card { background: #1a1a1a; padding: 2rem; border-radius: 12px; border: 1px solid #333; }
    .card h3 { color: #fff; margin-bottom: 1rem; }
    .card p { color: #9ca3af; font-size: 0.95rem; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>Struggling to Understand Your GitHub Repositories?</h1>
    <p>Unlock actionable insights and boost your team's productivity with our AI-powered GitHub Intelligence API.</p>
    <button class="cta">Get Started Free</button>
  </section>
  <section class="problems">
    <h2>The Problems We Solve</h2>
    <div class="grid">
      <div class="card">
        <h3>Repository Health Blindness</h3>
        <p>Developers lack clear visibility into critical repository health metrics, leading to slow issue resolution.</p>
      </div>
      <div class="card">
        <h3>Inefficient Code Reviews</h3>
        <p>Code review processes are slow and lack objective insights, missing critical issues.</p>
      </div>
      <div class="card">
        <h3>Scattered Metrics</h3>
        <p>Team productivity metrics are fragmented across tools, hindering data-driven decisions.</p>
      </div>
    </div>
  </section>
</body>
</html>`;
