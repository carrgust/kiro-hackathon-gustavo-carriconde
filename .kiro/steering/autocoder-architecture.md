# AutoCoder Architecture

## Overview

The AutoCoder is a two-phase autonomous agent that transforms a structured PRD into a working HTML mockup. It extends the DNA pipeline's final stage: after validation, gap analysis, business plan, and PRD generation, the AutoCoder builds a visual prototype.

**Key Principle**: The autocoder produces a **single `index.html`** file with all CSS and JS inlined. No build tools, no bundling, no external dependencies beyond Google Fonts. The file is valid and renderable after every feature implementation — enabling live preview.

## Two-Phase Agent Pattern

### Phase 1: Initializer (PRD → Features)

The LLM reads the structured PRD and decomposes it into 5-15 ordered features. Each feature maps to one functional requirement with full traceability.

```
PRD JSON
  ├── executive_summary
  ├── target_users[]        ← U-xxx IDs
  ├── user_stories[]        ← US-xxx IDs (links to U-xxx)
  ├── functional_requirements[] ← FR-xxx IDs (links to US-xxx)
  ├── non_functional_requirements[] ← NFR-xxx IDs (links to FR-xxx or "global")
  └── constraints
        │
        ▼  LLM decomposes
        │
  Feature[] (ordered by priority)
  ├── feat-001: HTML scaffold + design system    → FR-001
  ├── feat-002: Navigation/header                → FR-002
  ├── feat-003: Hero section                     → FR-003
  ├── ...
  └── feat-N: Polish + animations                → FR-xxx
```

Each feature carries traceability:
- `fr_id`: Which functional requirement it implements
- `story_ids`: Which user stories it addresses
- `nfr_ids`: Which non-functional requirements apply
- `acceptance_criteria`: From linked user stories

### Phase 2: Coder (Features → HTML)

For each feature in priority order, the LLM receives the current `index.html` and instructions to add the next section. The complete updated HTML is returned.

```
Feature 1 + empty       → LLM → index.html (scaffold)
Feature 2 + scaffold    → LLM → index.html (+ nav)
Feature 3 + (scaffold+nav) → LLM → index.html (+ hero)
...
Feature N + (everything) → LLM → index.html (+ polish)
```

**Critical**: The LLM always returns the FULL HTML file, not a diff. This ensures the file is always valid and renderable.

## Architectural Decisions

### 1. Single HTML File Output

**Decision**: All output goes into one `index.html` with inline `<style>` and `<script>`.

✅ No build step — serve the file directly
✅ Valid after every feature — enables live preview
✅ Simple iframe embedding — just set `src`
✅ No dependency management
❌ File grows large (5-15KB per section)
❌ No code splitting
❌ Context window pressure on later features

**Mitigation**: For hackathon scope, file size is acceptable. The LLM context window (128K+ tokens) can handle a 100KB HTML file.

### 2. LLM Returns Full File (Not Diffs)

**Decision**: Each feature implementation returns the complete updated HTML, not patches.

✅ Always valid HTML — no merge conflicts
✅ Simpler implementation — no diff/patch logic
✅ LLM sees and maintains full context
❌ Redundant token output
❌ Higher API cost per feature

**Mitigation**: Free-tier models (GLM 4.7 Flash) handle this well. Cost is zero for hackathon.

### 3. In-Memory Session Store

**Decision**: Active autocoder sessions stored in a module-level `Map<string, Session>`.

✅ Zero infrastructure — no Redis needed
✅ Fast access — no I/O
✅ Simple implementation
❌ Lost on server restart
❌ Single-process only

**Mitigation**: Acceptable for hackathon demo. Sessions are short-lived (5-15 minutes). For production, migrate to Prisma-backed sessions.

### 4. Polling Instead of WebSocket for AutoCoder

**Decision**: Client polls `/api/autocoder/status/{id}` every 2 seconds instead of using WebSocket.

✅ Simpler to implement and debug
✅ Works with serverless (Vercel)
✅ No connection management
❌ 2-second delay on updates
❌ Unnecessary requests when idle

**Mitigation**: 2-second polling is fast enough for a feature that takes 15-30 seconds per step. WebSocket can be added later by emitting through the existing `src/lib/websocket/` infrastructure.

## Integration with DNA Pipeline

The AutoCoder is the final stage in the DNA pipeline:

```
Stage 1: Input (idea)
  │
Stage 2: Validation (7 pillars)
  │
Stage 3: Gap Analysis (improve weak pillars)
  │
Stage 4: Business Plan (4 sections)
  │
Stage 5: PRD Generation (FR-xxx, US-xxx, NFR-xxx)
  │
Stage 6: AutoCoder ← NEW
  │  ├── Decompose PRD → Features
  │  ├── Implement features → index.html
  │  └── Live preview in iframe
  │
  ▼
Output: Validated business plan + PRD + Working mockup
```

### Data Flow Between Stages

The PRD object flows from Stage 5 to Stage 6 through React state. The PRD section component stores the generated PRD in page-level state, which the AutoCoderSection reads:

```typescript
// src/app/page.tsx state
const [prdData, setPrdData] = useState<PRD | null>(null);

// Stage 5 sets it:
<PRDSection onGenerate={(prd) => setPrdData(prd)} />

// Stage 6 reads it:
<AutoCoderSection prd={prdData} apiKey={apiKey} />
```

No API call between stages — the PRD is already in memory.

## Model Configuration

The AutoCoder uses the same model configuration as the rest of the app. All model access goes through `src/lib/config/models.ts`:

```typescript
import { callModel } from "@/lib/config/models";

// The decomposer and implementer both call:
const response = await callModel({
  apiKey,
  messages: [...],
  // Uses the default model from config (GLM 4.7 Flash)
});
```

**Do not hardcode model names**. Always use the central config. This ensures the AutoCoder works with whatever free-tier model is currently configured.

## Design System for Generated Mockups

The LLM is prompted to produce distinctive, non-generic designs:

- **Typography**: Google Fonts only, dramatic size contrast (4-8rem headings, 1rem body)
- **Color**: No default purple/blue gradients — use unexpected combos (charcoal + lime, navy + coral)
- **Motion**: CSS animations with IntersectionObserver, cubic-bezier timing
- **Layout**: CSS Grid + Flexbox, occasional grid-breaking for visual interest
- **Backgrounds**: Never plain white — use gradients, noise, geometric patterns
- **Components**: Bold buttons, layered cards, creative navigation

This is enforced through the coder system prompt in `src/lib/autocoder/implementer.ts`.

## Performance Considerations

- **Feature count**: 5-15 features per mockup
- **Time per feature**: 15-30 seconds (depends on model and HTML size)
- **Total pipeline time**: 2-8 minutes for a complete mockup
- **HTML file size**: 50-150KB final (grows ~10KB per feature)
- **Polling interval**: 2 seconds (adjustable)
- **Max retries per feature**: 3 attempts before skipping

## File Structure

```
src/lib/autocoder/
├── types.ts          # Zod schemas: PRD, Feature, events
├── engine.ts         # Pipeline orchestrator (async generator)
├── decomposer.ts     # PRD → Feature[] via LLM
├── implementer.ts    # Feature → HTML section via LLM
└── sessions.ts       # In-memory session store

src/app/api/autocoder/
├── start/route.ts           # POST - start pipeline
├── status/[id]/route.ts     # GET - poll events
└── preview/[id]/route.ts    # GET - serve HTML preview
```
