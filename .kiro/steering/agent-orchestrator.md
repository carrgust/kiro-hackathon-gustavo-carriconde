# Agent Console Orchestrator Architecture

## Overview

The Agent Console transforms from a passive display component into the central brain that orchestrates the entire hypothesis-to-PRD pipeline. This autonomous system continuously evaluates the current state and executes the next optimal action to progress toward a validated PRD.

**Key Transformation:**
- **Before**: Manual user-driven research with separate components
- **After**: Autonomous AI orchestrator managing the complete pipeline

The Agent Console operates on a 5-8 second evaluation loop, building context from all card data, making decisions through AI reasoning, and executing actions to advance the pipeline systematically.

## Anti-Hallucination Enforcement

### Core Principle
The agent can ONLY use validated card data for decision-making. No training data or general market knowledge is permitted.

### Constraints
- **Data Source**: Only card confidence scores, sources, and metadata
- **Market Insights**: Must trace to specific web sources from research
- **Decision Logic**: Based on quantitative thresholds and card states
- **Validation**: All actions must reference existing card data

### Enforcement Mechanisms
```typescript
// Agent context contains ONLY card data
interface AgentContext {
  problems: Card[]      // With confidence + sources
  solutions: Card[]     // With confidence + sources  
  requirements: Card[]  // With confidence + sources
  stats: PipelineStats  // Derived from card data
  // NO external market data allowed
}
```

## Type Definitions

### AgentContext
```typescript
interface AgentContext {
  // Card Collections
  problems: Card[]
  solutions: Card[]
  requirements: Card[]
  
  // Pipeline Statistics (derived from cards)
  stats: {
    validatedProblems: number      // confidence >= 80%
    validatedSolutions: number     // confidence >= 80%
    validatedRequirements: number  // confidence >= 80%
    totalCards: number
    avgProblemConfidence: number
    avgSolutionConfidence: number
    avgRequirementConfidence: number
    researchProgress: number       // % cards with confidence > 0
  }
  
  // Pipeline State
  pipeline: {
    stage: PipelineStage
    canGeneratePRD: boolean       // 3+ problems, 3+ solutions, 15+ requirements
    blockers: string[]            // What prevents progression
    lastAction: AgentAction
    lastActionTime: number
  }
  
  // Metadata
  niche: string
  timestamp: number
}

interface Card {
  id: string
  type: 'problem' | 'solution' | 'requirement'
  text: string
  confidence: number              // 0-100
  state: 'hypothesis' | 'fact'    // fact when confidence >= 80%
  sources: Source[]               // Web sources from research
  parentId?: string               // For solutions/requirements
  createdAt: number
  researchedAt?: number
}
```

### AgentAction Types
```typescript
enum AgentAction {
  GENERATE_PROBLEM = 'GENERATE_PROBLEM',
  GENERATE_SOLUTION = 'GENERATE_SOLUTION',
  GENERATE_REQUIREMENT = 'GENERATE_REQUIREMENT', 
  RESEARCH_CARD = 'RESEARCH_CARD',
  GENERATE_PRD = 'GENERATE_PRD',
  THINK = 'THINK',
  WAIT = 'WAIT'
}

interface AgentActionResult {
  action: AgentAction
  parameters?: {
    cardId?: string
    problemId?: string
    solutionId?: string
    requirementType?: 'functional' | 'non-functional'
  }
  reasoning: string
  confidence: number
}
```

## Agent Loop Architecture

### Loop Cycle (5-8 seconds)
```typescript
class AgentLoop {
  private interval: NodeJS.Timeout
  private isRunning: boolean = false
  
  async start() {
    this.isRunning = true
    this.interval = setInterval(async () => {
      if (!this.isRunning) return
      
      try {
        // 1. Build context from current card state
        const context = this.buildContext()
        
        // 2. Call agent for decision
        const decision = await this.callAgent(context)
        
        // 3. Display agent reasoning
        this.displayThought(decision.reasoning)
        
        // 4. Execute the decided action
        await this.executeAction(decision)
        
        // 5. Update state and continue
        this.updateLastAction(decision.action)
        
      } catch (error) {
        console.error('Agent loop error:', error)
        // Continue loop despite errors
      }
    }, this.getRandomInterval()) // 5000-8000ms
  }
  
  private getRandomInterval(): number {
    return Math.floor(Math.random() * 3000) + 5000 // 5-8 seconds
  }
}
```

## System Prompt Template

```typescript
const AGENT_SYSTEM_PROMPT = `
You are the Agent Console Orchestrator for Curatos DNA. Your role is to autonomously manage the hypothesis-to-PRD pipeline by analyzing card data and deciding the next optimal action.

CRITICAL CONSTRAINTS:
- You can ONLY use the provided card data (confidence, sources, state)
- You CANNOT use your training data for market insights
- All decisions must be based on validated web sources in the cards
- You must explain your reasoning before choosing an action

AVAILABLE ACTIONS:
- GENERATE_PROBLEM: Create new problem hypothesis
- GENERATE_SOLUTION: Create solution for validated problem
- GENERATE_REQUIREMENT: Create requirement for validated solution
- RESEARCH_CARD: Research unvalidated card via web search
- GENERATE_PRD: Create PRD when thresholds met (3+ problems, 3+ solutions, 15+ requirements)
- THINK: Analyze current state without taking action
- WAIT: No action needed, pipeline progressing well

CONTEXT PROVIDED:
{context}

DECISION PROCESS:
1. Analyze current pipeline state
2. Identify highest priority need
3. Choose optimal action with parameters
4. Explain reasoning based on card data only

Respond in JSON format:
{
  "reasoning": "Your analysis of the current state",
  "action": "CHOSEN_ACTION",
  "parameters": { "cardId": "optional-id" },
  "confidence": 85
}
`;
```

## Decision Logic

### Action Priority Matrix
```typescript
const ACTION_DECISION_LOGIC = {
  // Highest Priority: PRD Generation
  GENERATE_PRD: {
    condition: (ctx: AgentContext) => 
      ctx.stats.validatedProblems >= 3 &&
      ctx.stats.validatedSolutions >= 3 &&
      ctx.stats.validatedRequirements >= 15,
    priority: 100
  },
  
  // High Priority: Research unvalidated cards
  RESEARCH_CARD: {
    condition: (ctx: AgentContext) => {
      const unresearched = [...ctx.problems, ...ctx.solutions, ...ctx.requirements]
        .filter(card => card.confidence === 0)
      return unresearched.length > 0
    },
    priority: 90,
    selectCard: (ctx: AgentContext) => {
      // Prioritize problems, then solutions, then requirements
      const unresearched = [...ctx.problems, ...ctx.solutions, ...ctx.requirements]
        .filter(card => card.confidence === 0)
        .sort((a, b) => {
          const typeOrder = { problem: 0, solution: 1, requirement: 2 }
          return typeOrder[a.type] - typeOrder[b.type]
        })
      return unresearched[0]?.id
    }
  },
  
  // Medium Priority: Generate solutions for validated problems
  GENERATE_SOLUTION: {
    condition: (ctx: AgentContext) => {
      const validatedProblems = ctx.problems.filter(p => p.confidence >= 80)
      const problemsWithoutSolutions = validatedProblems.filter(problem => 
        !ctx.solutions.some(solution => solution.parentId === problem.id)
      )
      return problemsWithoutSolutions.length > 0
    },
    priority: 70,
    selectProblem: (ctx: AgentContext) => {
      const validatedProblems = ctx.problems.filter(p => p.confidence >= 80)
      const problemsWithoutSolutions = validatedProblems.filter(problem => 
        !ctx.solutions.some(solution => solution.parentId === problem.id)
      )
      return problemsWithoutSolutions[0]?.id
    }
  },
  
  // Medium Priority: Generate requirements for validated solutions
  GENERATE_REQUIREMENT: {
    condition: (ctx: AgentContext) => {
      const validatedSolutions = ctx.solutions.filter(s => s.confidence >= 80)
      const solutionsNeedingRequirements = validatedSolutions.filter(solution => {
        const reqCount = ctx.requirements.filter(req => req.parentId === solution.id).length
        return reqCount < 5 // Each solution needs ~5 requirements
      })
      return solutionsNeedingRequirements.length > 0
    },
    priority: 60
  },
  
  // Lower Priority: Generate more problems
  GENERATE_PROBLEM: {
    condition: (ctx: AgentContext) => ctx.problems.length < 8,
    priority: 50
  },
  
  // Lowest Priority: Think or wait
  THINK: {
    condition: (ctx: AgentContext) => true, // Always available
    priority: 20
  },
  
  WAIT: {
    condition: (ctx: AgentContext) => {
      // Wait if recent action or good progress
      const timeSinceLastAction = Date.now() - ctx.pipeline.lastActionTime
      return timeSinceLastAction < 10000 || ctx.stats.researchProgress > 0.8
    },
    priority: 10
  }
}
```

### Decision Algorithm
```typescript
function decideNextAction(context: AgentContext): AgentAction {
  const availableActions = Object.entries(ACTION_DECISION_LOGIC)
    .filter(([_, logic]) => logic.condition(context))
    .sort((a, b) => b[1].priority - a[1].priority)
  
  return availableActions[0]?.[0] as AgentAction || AgentAction.WAIT
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
**Goal**: Basic agent loop with context building

- [ ] `AgentLoop` class implementation
- [ ] `AgentContext` building from current state
- [ ] Basic system prompt and OpenRouter integration
- [ ] Action result parsing and validation
- [ ] 5-8 second interval loop
- [ ] Error handling and recovery

**Deliverables**:
- Agent loop running continuously
- Context correctly built from card data
- Basic THINK action working

### Phase 2: Action Implementation (Week 2)
**Goal**: Core actions for pipeline progression

- [ ] `GENERATE_PROBLEM` action
- [ ] `GENERATE_SOLUTION` action with problem targeting
- [ ] `GENERATE_REQUIREMENT` action with solution targeting
- [ ] `RESEARCH_CARD` action with web search
- [ ] Action parameter handling and validation
- [ ] Integration with existing services

**Deliverables**:
- All generation actions working
- Research action updating confidence scores
- Proper parent-child relationships (solution→problem, requirement→solution)

### Phase 3: Decision Logic (Week 3)
**Goal**: Intelligent action prioritization

- [ ] Decision logic implementation
- [ ] Action priority matrix
- [ ] Card selection algorithms
- [ ] Pipeline progression tracking
- [ ] Threshold validation for PRD generation
- [ ] Anti-hallucination enforcement

**Deliverables**:
- Agent makes optimal decisions based on context
- Pipeline progresses systematically
- PRD generation triggers at correct thresholds

### Phase 4: PRD Generation & Polish (Week 4)
**Goal**: Complete pipeline with PRD output

- [ ] `GENERATE_PRD` action implementation
- [ ] PRD quality validation
- [ ] Agent reasoning display in UI
- [ ] Performance optimization
- [ ] User experience refinements
- [ ] Comprehensive testing

**Deliverables**:
- Complete autonomous pipeline
- High-quality PRD generation
- Polished user experience
- Production-ready system

## Success Criteria

### Functional Requirements
- **Autonomous Operation**: Agent runs continuously without user intervention
- **Pipeline Progression**: Systematic advancement from niche to PRD
- **Anti-Hallucination**: 100% decisions based on card data only
- **Action Accuracy**: Correct action chosen 90%+ of time
- **PRD Quality**: Generated PRDs meet quality thresholds

### Performance Requirements
- **Loop Latency**: 5-8 second cycle time maintained
- **Action Execution**: < 3 seconds per action
- **Context Building**: < 500ms to aggregate card data
- **Memory Usage**: < 100MB for agent state

### User Experience Requirements
- **Transparency**: Users see agent reasoning in real-time
- **Predictability**: Consistent behavior patterns
- **Control**: Users can pause/resume agent
- **Trust**: High confidence in agent decisions

## Risk Mitigation

### Anti-Hallucination Risks
- **Risk**: Agent uses training data instead of card sources
- **Mitigation**: Strict prompt constraints + response validation
- **Detection**: Source attribution checking in all decisions

### Performance Risks
- **Risk**: Loop latency impacts user experience
- **Mitigation**: Async action execution + progress indicators
- **Detection**: Performance monitoring and alerting

### Pipeline Stall Risks
- **Risk**: Agent gets stuck in suboptimal loops
- **Mitigation**: Action cooldowns + fallback strategies
- **Detection**: Progress tracking with timeout handling

This architecture creates a fully autonomous research system that systematically progresses from market niche to validated PRD while maintaining strict anti-hallucination constraints through source-only decision making.
