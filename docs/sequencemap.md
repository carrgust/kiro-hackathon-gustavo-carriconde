# Curatos DNA - System Operation Sequence Map

## Overview
This document maps the complete system operation flow from clicking "Start Processing" to generating production-ready deliverables.

---

## Phase 1: Initialization (0-2 seconds)

### 1.1 Input Validation
- System validates Market Niche selection
- Validates Target Geography setting
- Checks API key (OpenRouter) or activates Demo Mode

### 1.2 Agent Loop Activation
- Agent Console starts its 5-8 second evaluation loop
- Initial context is built from user inputs
- Pipeline state initialized: all stages at 0/0 validated

---

## Phase 2: Autonomous Research Begins (2-30 seconds)

### 2.1 First Agent Decision
- Agent analyzes empty pipeline state
- **Decision**: "Need problem hypotheses" → **Action**: `GENERATE_PROBLEM`
- Agent reasoning streams in real-time: *"No problems exist. Generating initial problem hypothesis for [your niche]..."*

### 2.2 Problem Generation
- DeepSeek R1 generates first problem hypothesis
- Card appears in "Problems" column (0/0 → 1/0)
- **State**: `hypothesis` (confidence = 0%)
- **Visual**: Empty confidence indicator

### 2.3 Next Loop Cycle (5-8 seconds later)
- Agent sees: "1 unresearched problem exists"
- **Decision**: `RESEARCH_CARD` with highest priority
- **Reasoning**: *"Validating problem hypothesis via web search..."*

### 2.4 Web Validation
- OpenRouter calls Exa.ai (`:online` suffix)
- Searches web for evidence supporting the problem
- Returns: sources (URLs) + confidence score (0-100%)
- **Structured scoring**:
  - Market Size (25 pts)
  - Pain Intensity (25 pts)
  - Existing Solutions (25 pts)
  - Willingness to Pay (25 pts)

### 2.5 Card Update
- Confidence score appears: e.g., 85%
- State changes: `hypothesis` → `fact` (if ≥80%)
- **Visual**: Confidence bar fills, sources appear as clickable links
- Counter updates: Problems 1/1 validated

---

## Phase 3: Pipeline Expansion (30-120 seconds)

### 3.1 Parallel Generation
- Agent continues loop, generating more problems (up to 8)
- Each gets researched automatically
- User watches cards populate and validate in real-time

### 3.2 Solution Trigger
- Once 3+ problems reach 80%+ confidence
- **Agent decision**: `GENERATE_SOLUTION` for validated problem
- **Reasoning**: *"Problem X validated at 87%. Generating solution..."*

### 3.3 Solution Research
- Solution hypothesis generated (linked to parent problem)
- Appears in "Solutions" column
- Gets researched with structured scoring:
  - Technical Feasibility (25 pts)
  - Competitive Advantage (25 pts)
  - Time to Market (25 pts)
  - Market Validation (25 pts)
- Validates to fact status

### 3.4 Requirements Generation
- Once 3+ solutions validated
- Agent generates functional requirements (FR-001, FR-002...)
- Then non-functional requirements (NFR-001, NFR-002...)
- Each requirement researched and scored
- **Target**: 15+ validated requirements

---

## Phase 4: DNA Helix Flow Updates

Throughout the process, the right panel updates in real-time:

| Stage | Initial | Mid-Process | Complete |
|-------|---------|-------------|----------|
| **Problems** | 0/0 validated | 3/5 validated | 5/8 validated |
| **Solutions** | 0/0 validated | 2/3 validated | 3/5 validated |
| **Requirements** | 0/0 validated | 10/15 validated | 15/20 validated |
| **PRD** | Pending | Pending | Ready |
| **Auto Coder** | Idle | Idle | Ready (future) |

---

## Phase 5: Output Generation (120-180 seconds)

### 5.1 PRD Threshold Met
- **Thresholds**: 3+ problems, 3+ solutions, 15+ requirements all validated
- **Agent decision**: `GENERATE_PRD`
- Gemini Flash creates comprehensive Product Requirements Document
- PRD status: "Pending" → "Generated"

### 5.2 Landing Page Available
- Same thresholds unlock landing page generation
- User can click "Generate Landing Page" button
- Self-contained HTML with inline CSS generated in ~5 seconds

### 5.3 Auto Coder (Future Feature)
- Would generate actual code scaffolding
- Not implemented in current MVP

---

## Phase 6: Continuous Operation

### 6.1 Agent Keeps Running
- Loop continues every 5-8 seconds
- Monitors for:
  - Low confidence cards
  - Missing solutions for validated problems
  - Incomplete requirements
- Takes action:
  - Re-research weak hypotheses
  - Generate more solutions/requirements
  - Improve quality scores

### 6.2 User Interactions Available
- Click any card to see detailed breakdown
- View sources and confidence scoring
- Generate landing page or PRD
- Download outputs (HTML, Markdown)
- Adjust steering slider to focus on problems vs solutions
- Pause/resume agent at any time

---

## Key Operating Principles

### Anti-Hallucination Enforcement
Every decision based **ONLY** on validated card data with web sources. No AI training data used for market insights.

### Transparency
User sees agent reasoning for every action in real-time via Agent Console.

### Autonomy
Zero user intervention needed after clicking "Start Processing".

### Quality Gates
Each stage must pass thresholds before unlocking next stage:

| Stage | Threshold | Min Count |
|-------|-----------|-----------|
| Hypothesis Validation | 80% avg | 5 items |
| Problem Quality | 70% avg | - |
| Solution Quality | 70% avg | - |
| Requirements Quality | 75% avg | - |
| PRD Quality | 80% avg | - |

---

## Timeline Summary

| Time Range | Activity | Output |
|------------|----------|--------|
| 0-2s | Initialization | Agent loop started |
| 2-30s | Problem generation & validation | 1-3 validated problems |
| 30-60s | More problems + first solutions | 5+ problems, 1-2 solutions |
| 60-120s | Solutions + requirements | 3+ solutions, 10+ requirements |
| 120-180s | PRD generation | Complete PRD + Landing Page ready |
| 180s+ | Continuous improvement | Quality refinement |

**Total Time to Production-Ready Deliverables**: 3-5 minutes

---

## Agent Decision Logic

### Action Priority Matrix

| Priority | Action | Condition | Purpose |
|----------|--------|-----------|---------|
| 100 | `GENERATE_PRD` | 3+ problems, 3+ solutions, 15+ requirements validated | Create final document |
| 90 | `RESEARCH_CARD` | Unresearched cards exist | Validate hypotheses |
| 70 | `GENERATE_SOLUTION` | Validated problems without solutions | Create solutions |
| 60 | `GENERATE_REQUIREMENT` | Validated solutions need requirements | Define specs |
| 50 | `GENERATE_PROBLEM` | < 8 problems exist | Expand problem space |
| 20 | `THINK` | Analyze current state | Strategic planning |
| 10 | `WAIT` | Recent action or high progress | Prevent thrashing |

---

## Data Flow

```
User Input (Niche + Geography)
    ↓
Agent Context Building
    ↓
Decision Engine (5-8s loop)
    ↓
Action Execution
    ├─→ GENERATE → DeepSeek R1 → New Card
    ├─→ RESEARCH → Exa.ai → Confidence Score + Sources
    └─→ GENERATE_PRD → Gemini Flash → PRD Document
    ↓
State Update
    ↓
UI Refresh (Real-time)
    ↓
Loop Continues...
```

---

## Error Handling

### Network Failures
- Retry with exponential backoff (3 attempts)
- Fallback to cached data if available
- User notification via toast

### API Rate Limits
- Queue requests with delay
- Prioritize research over generation
- Show rate limit status in UI

### Low Confidence Results
- Agent automatically re-researches
- Uses alternative search queries
- Flags for user review if persistent

---

This autonomous system transforms market research from weeks of manual work into minutes of AI-powered validation, delivering production-ready landing pages and PRDs with full source attribution and confidence scoring.
