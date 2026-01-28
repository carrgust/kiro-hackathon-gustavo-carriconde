# Hybrid Continuous Mode Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Day 2)                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ContinuousModeToggle                                       │ │
│  │  [ON] ←→ Poll /api/research/cycle every 15s                │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/research/cycle (Day 1) ✅                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. Acquire PostgreSQL Advisory Lock (999999)              │ │
│  │  2. Load ContinuousSession from DB                         │ │
│  │  3. Build AgentContext from pipelineState                  │ │
│  │  4. Call /api/agent/orchestrate                            │ │
│  │  5. Execute decided action                                 │ │
│  │  6. Update pipelineState in DB                             │ │
│  │  7. Log SessionEvent                                       │ │
│  │  8. Release lock                                           │ │
│  │  9. Return updated state + nextCycleIn                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
    ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐
    │ /api/agent/      │  │ Hypothesis   │  │ PostgreSQL   │
    │ orchestrate      │  │ Service      │  │ Database     │
    │                  │  │              │  │              │
    │ • Decide action  │  │ • Generate   │  │ • Sessions   │
    │ • Return thought │  │ • Research   │  │ • Events     │
    └──────────────────┘  └──────────────┘  └──────────────┘
```

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      ContinuousSession                           │
├─────────────────────────────────────────────────────────────────┤
│ id              TEXT PRIMARY KEY                                 │
│ niche           TEXT                                             │
│ enabled         BOOLEAN (default: false)                         │
│ cycleInterval   INTEGER (default: 15000ms)                       │
│ tokensUsed      INTEGER (default: 0)                             │
│ pipelineState   JSONB (stores full EngineState)                  │
│ createdAt       TIMESTAMP                                        │
│ updatedAt       TIMESTAMP                                        │
│ lastCycleAt     TIMESTAMP                                        │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ 1:N
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SessionEvent                              │
├─────────────────────────────────────────────────────────────────┤
│ id              TEXT PRIMARY KEY                                 │
│ sessionId       TEXT (FK → ContinuousSession.id)                 │
│ eventType       TEXT (cycle_start, cycle_complete, etc.)        │
│ agentAction     TEXT (GENERATE_PROBLEM, RESEARCH_CARD, etc.)    │
│ cardType        TEXT (problem, solution, requirement)           │
│ cardId          TEXT                                             │
│ confidence      FLOAT                                            │
│ errorMessage    TEXT                                             │
│ tokensUsed      INTEGER                                          │
│ metadata        JSONB                                            │
│ createdAt       TIMESTAMP                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Cycle Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         CYCLE START                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │ Try Acquire Lock      │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
            ┌───────────────┐       ┌──────────────┐
            │ Lock Acquired │       │ Lock Failed  │
            └───────┬───────┘       └──────┬───────┘
                    │                      │
                    │                      └──→ Return 409 Conflict
                    ▼
        ┌───────────────────────┐
        │ Load/Create Session   │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Log cycle_start Event │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Build AgentContext    │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Call Orchestrator API │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Execute Action        │
        │ • GENERATE_PROBLEM    │
        │ • GENERATE_SOLUTION   │
        │ • GENERATE_REQUIREMENT│
        │ • RESEARCH_CARD       │
        │ • THINK / WAIT        │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Update pipelineState  │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Log cycle_complete    │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Release Lock          │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │ Return Updated State  │
        └───────────────────────┘
```

## Advisory Lock Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Advisory Lock                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Lock ID: 999999                                                 │
│                                                                  │
│  Acquire:  SELECT pg_try_advisory_lock(999999)                   │
│  Release:  SELECT pg_advisory_unlock(999999)                     │
│                                                                  │
│  Benefits:                                                       │
│  • No table-level locks                                          │
│  • Automatic cleanup on connection close                         │
│  • Fast (in-memory)                                              │
│  • Returns immediately if already locked                         │
│                                                                  │
│  Use Case:                                                       │
│  Prevents concurrent cycle execution when multiple clients       │
│  poll the endpoint simultaneously                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Event Timeline Example

```
Time        Event Type        Action              Card Type    Confidence
────────────────────────────────────────────────────────────────────────
14:45:00    cycle_start       -                   -            -
14:45:01    cycle_complete    GENERATE_PROBLEM    problem      -
14:45:15    cycle_start       -                   -            -
14:45:17    cycle_complete    RESEARCH_CARD       problem      85%
14:45:30    cycle_start       -                   -            -
14:45:32    cycle_complete    GENERATE_SOLUTION   solution     -
14:45:45    cycle_start       -                   -            -
14:45:47    cycle_complete    RESEARCH_CARD       solution     92%
```

## State Persistence

```json
{
  "pipelineState": {
    "niche": "AI-powered developer tools",
    "nicheLocked": true,
    "hypotheses": [
      {
        "id": "1706...",
        "text": "Developers|STRUGGLE_WITH|API testing|daily",
        "state": "fact",
        "confidence": 85,
        "sources": ["https://..."],
        "status": "complete"
      }
    ],
    "solutions": [
      {
        "id": "1706...",
        "text": "APITestSuite|HELPS|developers validate endpoints|pre-deployment",
        "state": "fact",
        "confidence": 92,
        "sources": ["https://..."],
        "parentId": "1706...",
        "status": "complete"
      }
    ],
    "requirements": [],
    "slider": 60,
    "tokensUsed": 1250,
    "agentRationale": [
      "[SEARCHING] Querying Serper API...",
      "[VALIDATED] ✓ FACT 85%"
    ]
  }
}
```
