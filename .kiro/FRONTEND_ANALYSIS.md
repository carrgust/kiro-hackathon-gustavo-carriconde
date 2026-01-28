# Frontend Analysis for Continuous Mode Integration

## ✅ Build Status
**FIXED**: Build now passes successfully after:
1. Commented out deprecated `ResearchPipeline` class
2. Deprecated `/api/research/start` and `/api/research/status` endpoints
3. Fixed Prisma client version mismatch (6.19.2)
4. Made database client optional during build

---

## Current Frontend Architecture

### State Management (`page.tsx`)
```typescript
const [state, setState] = useState<EngineState>({
  niche: '',
  nicheLocked: false,
  hypotheses: [],
  solutions: [],
  requirements: [],
  slider: 60,
  tokensUsed: 0,
  agentRationale: [],
  // ... other fields
});
```

### Existing Orchestration Loop
**Location**: `page.tsx` lines 486-600

**Current Pattern**:
```typescript
useEffect(() => {
  if (!engineRunning || !hypothesisService) return;

  const interval = setInterval(async () => {
    // 1. Build context from current state
    const context = buildAgentContext(stateRef.current);
    
    // 2. Call orchestrator API
    const response = await fetch('/api/agent/orchestrate', {
      method: 'POST',
      body: JSON.stringify({ context, apiKey })
    });
    
    const { thought, action, parameters } = await response.json();
    
    // 3. Display agent thought
    addRationale(thought);
    
    // 4. Execute action locally
    switch (action) {
      case AgentAction.GENERATE_PROBLEM:
        // Generate and add to state
      case AgentAction.GENERATE_SOLUTION:
        // Generate and add to state
      case AgentAction.RESEARCH_CARD:
        // Research and update state
    }
  }, 8000); // 8 second interval
  
  return () => clearInterval(interval);
}, [engineRunning, hypothesisService]);
```

**Key Observations**:
1. ✅ Already has orchestrator loop with 8s interval
2. ✅ Already calls `/api/agent/orchestrate`
3. ✅ Already builds context with `buildAgentContext()`
4. ✅ Already displays agent thoughts via `addRationale()`
5. ❌ Executes actions **locally** (frontend generates/researches)
6. ❌ No session persistence (state lost on refresh)

---

## What We Can REUSE ✅

### 1. State Structure
- `EngineState` type already matches what backend expects
- `hypotheses`, `solutions`, `requirements` arrays
- `agentRationale` for displaying thoughts
- `tokensUsed` tracking

### 2. UI Components
- `UnifiedAgentConsole` - displays agent rationale
- `HypothesisColumn` - renders problem/solution/requirement cards
- `StopProcessingButton` - pause/stop functionality
- `TokenBar` - token usage display

### 3. Orchestrator Integration
- `/api/agent/orchestrate` endpoint already exists
- `buildAgentContext()` function already used
- Agent thought display already working

### 4. Refs and Tracking
- `stateRef` - tracks current state for intervals
- `orchestratorIntervalRef` - manages interval lifecycle
- `shouldStopRef` - pause/stop signal
- `abortControllersRef` - cancel in-flight requests

---

## What We Need to ADD ❌

### 1. Session Management
**New State**:
```typescript
const [sessionId, setSessionId] = useState<string | null>(null);
const [continuousMode, setContinuousMode] = useState(false);
```

### 2. Cycle Endpoint Integration
**Replace orchestrator loop with**:
```typescript
useEffect(() => {
  if (!continuousMode || !apiKey) return;

  const interval = setInterval(async () => {
    const response = await fetch('/api/research/cycle', {
      method: 'POST',
      body: JSON.stringify({ 
        sessionId,  // Resume existing or create new
        niche: state.niche,
        apiKey 
      })
    });
    
    const { sessionId: newSessionId, state: newState, action, thought } = await response.json();
    
    // Update session ID if new
    if (!sessionId) setSessionId(newSessionId);
    
    // Update state from backend
    setState(prev => ({
      ...prev,
      ...newState,
      agentRationale: [...prev.agentRationale, thought]
    }));
  }, 15000); // 15 second interval (matches backend)
  
  return () => clearInterval(interval);
}, [continuousMode, sessionId, apiKey]);
```

### 3. Mode Toggle UI
**New Component**: `ContinuousModeToggle.tsx`
```typescript
<div className="flex items-center gap-2">
  <span>Manual</span>
  <Switch 
    checked={continuousMode}
    onCheckedChange={setContinuousMode}
    disabled={!apiKey || !state.nicheLocked}
  />
  <span>Continuous</span>
</div>
```

### 4. Controls Update
**Modify existing controls**:
```typescript
// Disable manual generation when continuous mode active
<button 
  onClick={handleGenerateProblem}
  disabled={continuousMode || !apiKey}
>
  Generate Problem
</button>
```

---

## Implementation Strategy

### Phase 1: Minimal Integration (2 hours)
**Goal**: Get continuous mode working with existing UI

1. **Add state variables** (5 min)
   ```typescript
   const [sessionId, setSessionId] = useState<string | null>(null);
   const [continuousMode, setContinuousMode] = useState(false);
   ```

2. **Add mode toggle** (15 min)
   - Simple checkbox or switch in header
   - Enable only when niche is locked and API key exists

3. **Replace orchestrator loop** (1 hour)
   - Keep existing `useEffect` structure
   - Change condition: `if (continuousMode && apiKey)`
   - Replace `/api/agent/orchestrate` with `/api/research/cycle`
   - Update state from response instead of executing locally

4. **Disable manual controls** (15 min)
   - Add `disabled={continuousMode}` to generation buttons
   - Show tooltip: "Disable continuous mode to use manual controls"

5. **Test** (30 min)
   - Start continuous mode
   - Verify cycles execute every 15s
   - Verify state updates from backend
   - Verify pause/resume works

### Phase 2: Enhanced UX (1 hour)
**Goal**: Polish the continuous mode experience

1. **Session indicator** (15 min)
   - Show session ID in UI
   - Show "Next cycle in Xs" countdown

2. **Better thought display** (15 min)
   - Highlight orchestrator thoughts differently
   - Show action being executed

3. **Error handling** (15 min)
   - Handle cycle failures gracefully
   - Show retry countdown

4. **Session persistence** (15 min)
   - Store session ID in localStorage
   - Resume on page reload

---

## Key Differences: Current vs Continuous

| Aspect | Current (Manual) | Continuous Mode |
|--------|------------------|-----------------|
| **Action Execution** | Frontend generates/researches | Backend executes via `/api/research/cycle` |
| **State Updates** | Local state mutations | Backend returns new state |
| **Persistence** | Lost on refresh | Stored in database |
| **Interval** | 8 seconds | 15 seconds |
| **Concurrency** | No protection | PostgreSQL advisory locks |
| **Session** | None | ContinuousSession model |
| **History** | None | SessionEvent log |

---

## Minimal Code Changes Required

### 1. Add Toggle (Header)
```typescript
// In EnhancedHeader or similar
<div className="flex items-center gap-2">
  <label className="text-sm">
    <input 
      type="checkbox"
      checked={continuousMode}
      onChange={(e) => setContinuousMode(e.target.checked)}
      disabled={!apiKey || !state.nicheLocked}
    />
    Continuous Mode
  </label>
</div>
```

### 2. Modify Orchestrator Loop
```typescript
// Replace existing useEffect at line ~486
useEffect(() => {
  if (!continuousMode || !hypothesisService) {
    if (orchestratorIntervalRef.current) {
      clearInterval(orchestratorIntervalRef.current);
      orchestratorIntervalRef.current = null;
    }
    return;
  }

  const interval = setInterval(async () => {
    if (shouldStopRef.current) return;
    
    try {
      const apiKey = getStoredApiKey();
      if (!apiKey) return;
      
      const response = await fetch('/api/research/cycle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId,
          niche: stateRef.current.niche,
          apiKey 
        })
      });
      
      if (!response.ok) return;
      
      const { sessionId: newSessionId, state: newState, action, thought } = await response.json();
      
      // Update session ID if new
      if (!sessionId) setSessionId(newSessionId);
      
      // Update state from backend
      setState(prev => ({
        ...prev,
        hypotheses: newState.hypotheses,
        solutions: newState.solutions,
        requirements: newState.requirements,
        tokensUsed: newState.tokensUsed,
        agentRationale: [...prev.agentRationale, thought]
      }));
      
    } catch (error) {
      console.error('[Continuous Mode] Cycle error:', error);
    }
  }, 15000); // 15 seconds
  
  orchestratorIntervalRef.current = interval;
  return () => clearInterval(interval);
}, [continuousMode, sessionId, hypothesisService]);
```

### 3. Disable Manual Controls
```typescript
// In button components
disabled={continuousMode || !apiKey || !state.nicheLocked}
```

---

## Testing Plan

### Manual Testing
1. **Start continuous mode**
   - Enter niche
   - Lock niche
   - Enable continuous mode toggle
   - Verify cycles start

2. **Verify state updates**
   - Watch cards appear in columns
   - Verify confidence scores update
   - Verify agent thoughts display

3. **Pause/Resume**
   - Disable toggle
   - Verify cycles stop
   - Re-enable toggle
   - Verify cycles resume with same session

4. **Page reload**
   - Refresh page
   - Verify session resumes (if implemented)

### Backend Testing
```bash
# Test cycle endpoint directly
curl -X POST http://localhost:5001/api/research/cycle \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "fintech payments",
    "apiKey": "sk-or-v1-..."
  }'

# Verify session created
# Check database: SELECT * FROM "ContinuousSession";

# Resume session
curl -X POST http://localhost:5001/api/research/cycle \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "clz...",
    "apiKey": "sk-or-v1-..."
  }'
```

---

## Summary

**What's Already There** ✅:
- Orchestrator loop structure
- Agent thought display
- State management
- UI components for cards

**What We Need to Add** ❌:
- Session ID state variable
- Continuous mode toggle
- Replace `/api/agent/orchestrate` with `/api/research/cycle`
- Update state from backend response
- Disable manual controls when continuous

**Estimated Effort**: 3 hours total
- Phase 1 (Minimal): 2 hours
- Phase 2 (Polish): 1 hour

**Risk**: Low - mostly replacing existing logic, not adding new complexity
