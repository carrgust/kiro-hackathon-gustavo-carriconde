# Feature: Scoring System UI Integration

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Integrate the multi-stage scoring system (Zod schemas + gate logic) into the Curatos DNA UI. This enables visual progression through 6 stages: Hypothesis Validation → Problem Quality → Solution Quality → Requirements Quality → PRD Quality → DNA Quality. Each stage has quality gates that must pass before unlocking the next stage.

## User Story

As a **solo developer using Curatos DNA**
I want to **see my progress through validation stages with quality scores**
So that **I understand how close I am to generating a validated DNA document**

## Problem Statement

The scoring system (Zod schemas, gate thresholds, stage progression) exists in code but is not connected to the UI. Users cannot see:
- Individual hypothesis quality scores (severity, frequency, etc.)
- Stage progression status (which stages are unlocked)
- Gate requirements (what score is needed to progress)
- Quality breakdowns for problems, solutions, requirements

## Solution Statement

Wire the scoring system to UI components by:
1. Extending `EngineState` type with stage scores
2. Creating a `StageProgressBar` component showing all 6 stages
3. Updating `HypothesisItem` to show quality breakdown on hover
4. Modifying gate logic to use new scoring thresholds
5. Adding score calculation hooks that compute quality scores

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: `src/types/project.ts`, `src/app/page.tsx`, `src/components/dashboard/*`
**Dependencies**: `zod@3`, `src/lib/scoring/*` (already created)

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `src/lib/scoring/schemas.ts` (lines 1-82) - Why: Zod schemas defining all score types
- `src/lib/scoring/gates.ts` (lines 1-42) - Why: Gate thresholds and progression logic
- `src/types/project.ts` (lines 1-48) - Why: Current types that need extension
- `src/lib/constants.ts` (lines 1-28) - Why: Current SCORES constants to migrate
- `src/app/page.tsx` (lines 1-150) - Why: Main state management, score calculation logic
- `src/components/dashboard/HypothesisColumn.tsx` (lines 1-100) - Why: Column component showing hypotheses
- `src/components/dashboard/HypothesisItem.tsx` (lines 1-45) - Why: Individual item display
- `src/components/dashboard/DNAButton.tsx` (lines 1-90) - Why: DNA unlock button with progress

### New Files to Create

- `src/components/dashboard/StageProgressBar.tsx` - Visual stage progression indicator
- `src/components/dashboard/ScoreBreakdown.tsx` - Tooltip showing score criteria breakdown
- `src/hooks/useScoring.ts` - Hook for computing and validating scores

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- `.kiro/steering/scoring-system.md` - Scoring criteria definitions and thresholds
- Zod documentation: https://zod.dev/?id=basic-usage - Schema validation patterns

### Patterns to Follow

**Naming Conventions:**
- Components: PascalCase (`StageProgressBar.tsx`)
- Hooks: camelCase with `use` prefix (`useScoring.ts`)
- Types: PascalCase (`StageScores`)
- Constants: UPPER_SNAKE_CASE (`GATES`)

**Component Pattern (from HypothesisColumn.tsx):**
```tsx
import { motion } from 'framer-motion';

interface ComponentProps {
  // props
}

export default function Component({ ...props }: ComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* content */}
    </motion.div>
  );
}
```

**State Update Pattern (from page.tsx):**
```tsx
setState(prev => ({
  ...prev,
  fieldToUpdate: newValue
}));
```

**Score Calculation Pattern (from page.tsx lines 115-130):**
```tsx
useEffect(() => {
  const score = items.filter(h => h.state === 'fact')
    .reduce((sum, h) => sum + h.confidence, 0);
  setState(prev => ({ ...prev, score }));
}, [items]);
```

---

## IMPLEMENTATION PLAN

### Phase 1: Type Extensions

Extend existing types to support multi-stage scoring without breaking current functionality.

**Tasks:**
- Add stage score types to `project.ts`
- Import scoring types from `lib/scoring`
- Maintain backward compatibility with existing `problemsScore`/`solutionsScore`

### Phase 2: Scoring Hook

Create a custom hook that computes all stage scores from current state.

**Tasks:**
- Create `useScoring` hook
- Implement score calculation for each stage
- Use Zod schemas for validation
- Return gate status for each stage

### Phase 3: UI Components

Build visual components for stage progression and score display.

**Tasks:**
- Create `StageProgressBar` component
- Create `ScoreBreakdown` tooltip component
- Update `HypothesisItem` with quality indicators

### Phase 4: Integration

Wire components into main dashboard.

**Tasks:**
- Add `StageProgressBar` to header area
- Connect scoring hook to state
- Update DNA unlock logic to use new gates

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: UPDATE `src/types/project.ts`

- **IMPLEMENT**: Add stage score interfaces and extend EngineState
- **PATTERN**: Follow existing interface patterns in file
- **IMPORTS**: `import { ProblemQuality, SolutionQuality, RequirementsQuality, PRDQuality, DNAQuality } from '@/lib/scoring';`
- **GOTCHA**: Keep existing fields for backward compatibility
- **VALIDATE**: `npx tsc --noEmit src/types/project.ts`

```typescript
// Add after existing interfaces:
export interface StageScores {
  hypothesis: { avgConfidence: number; factCount: number };
  problemQuality: ProblemQuality | null;
  solutionQuality: SolutionQuality | null;
  requirementsQuality: RequirementsQuality | null;
  prdQuality: PRDQuality | null;
  dnaQuality: DNAQuality | null;
}

// Add to EngineState:
stageScores: StageScores;
currentStage: 'HYPOTHESIS' | 'PROBLEM_QUALITY' | 'SOLUTION_QUALITY' | 'REQUIREMENTS' | 'PRD' | 'DNA';
```

### Task 2: CREATE `src/hooks/useScoring.ts`

- **IMPLEMENT**: Custom hook for score computation and gate checking
- **PATTERN**: Standard React hook pattern
- **IMPORTS**: `import { useMemo } from 'react'; import { canProgress, GATES, Stage } from '@/lib/scoring';`
- **GOTCHA**: Use `useMemo` to prevent recalculation on every render
- **VALIDATE**: `npx tsc --noEmit src/hooks/useScoring.ts`

```typescript
import { useMemo } from 'react';
import { Hypothesis } from '@/types/project';
import { canProgress, GATES, Stage, STAGE_ORDER, getGateStatus } from '@/lib/scoring';

interface ScoringInput {
  hypotheses: Hypothesis[];
  solutions: Hypothesis[];
  requirements: Hypothesis[];
}

export function useScoring({ hypotheses, solutions, requirements }: ScoringInput) {
  return useMemo(() => {
    // Calculate hypothesis stage
    const problemFacts = hypotheses.filter(h => h.state === 'fact');
    const solutionFacts = solutions.filter(h => h.state === 'fact');
    const avgConfidence = [...problemFacts, ...solutionFacts].length > 0
      ? [...problemFacts, ...solutionFacts].reduce((sum, h) => sum + h.confidence, 0) / [...problemFacts, ...solutionFacts].length
      : 0;
    
    const hypothesisGate = getGateStatus('HYPOTHESIS', avgConfidence, problemFacts.length + solutionFacts.length);
    
    // Determine current stage
    let currentStage: Stage = 'HYPOTHESIS';
    if (hypothesisGate.passed) currentStage = 'PROBLEM_QUALITY';
    // Add more stage checks as scoring is implemented
    
    return {
      stages: {
        HYPOTHESIS: { score: avgConfidence, count: problemFacts.length + solutionFacts.length, ...hypothesisGate },
        PROBLEM_QUALITY: { score: 0, passed: false, threshold: GATES.PROBLEM_QUALITY.threshold, gap: GATES.PROBLEM_QUALITY.threshold },
        SOLUTION_QUALITY: { score: 0, passed: false, threshold: GATES.SOLUTION_QUALITY.threshold, gap: GATES.SOLUTION_QUALITY.threshold },
        REQUIREMENTS: { score: 0, passed: false, threshold: GATES.REQUIREMENTS.threshold, gap: GATES.REQUIREMENTS.threshold },
        PRD: { score: 0, passed: false, threshold: GATES.PRD.threshold, gap: GATES.PRD.threshold },
        DNA: { score: 0, passed: false, threshold: GATES.DNA.threshold, gap: GATES.DNA.threshold },
      },
      currentStage,
      canCreateDNA: currentStage === 'DNA' || (hypothesisGate.passed && problemFacts.length >= 3 && solutionFacts.length >= 3),
    };
  }, [hypotheses, solutions, requirements]);
}
```

### Task 3: CREATE `src/components/dashboard/StageProgressBar.tsx`

- **IMPLEMENT**: Visual 6-stage progress indicator
- **PATTERN**: MIRROR `src/components/dashboard/DNAButton.tsx` for styling
- **IMPORTS**: `import { motion } from 'framer-motion'; import { CheckCircle2, Lock, Circle } from 'lucide-react';`
- **GOTCHA**: Use Tailwind classes matching existing dark theme
- **VALIDATE**: `npx tsc --noEmit src/components/dashboard/StageProgressBar.tsx`

```typescript
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Circle } from 'lucide-react';
import { Stage, STAGE_ORDER } from '@/lib/scoring';

interface StageInfo {
  score: number;
  passed: boolean;
  threshold: number;
  gap: number;
  count?: number;
}

interface StageProgressBarProps {
  stages: Record<Stage, StageInfo>;
  currentStage: Stage;
}

const STAGE_LABELS: Record<Stage, string> = {
  HYPOTHESIS: 'Hypotheses',
  PROBLEM_QUALITY: 'Problems',
  SOLUTION_QUALITY: 'Solutions',
  REQUIREMENTS: 'Requirements',
  PRD: 'PRD',
  DNA: 'DNA',
};

export default function StageProgressBar({ stages, currentStage }: StageProgressBarProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  
  return (
    <div className="flex items-center gap-1 font-mono text-xs">
      {STAGE_ORDER.map((stage, index) => {
        const info = stages[stage];
        const isActive = index === currentIndex;
        const isPassed = info.passed;
        const isLocked = index > currentIndex;
        
        return (
          <div key={stage} className="flex items-center">
            <motion.div
              className={`flex items-center gap-1 px-2 py-1 rounded ${
                isPassed ? 'bg-green-500/20 text-green-400' :
                isActive ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-gray-800 text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              title={`${STAGE_LABELS[stage]}: ${info.score.toFixed(0)}% (need ${info.threshold}%)`}
            >
              {isPassed ? <CheckCircle2 size={12} /> : isLocked ? <Lock size={12} /> : <Circle size={12} />}
              <span className="hidden sm:inline">{STAGE_LABELS[stage]}</span>
              <span className="text-[10px]">{info.score.toFixed(0)}%</span>
            </motion.div>
            {index < STAGE_ORDER.length - 1 && (
              <div className={`w-4 h-px mx-1 ${isPassed ? 'bg-green-500' : 'bg-gray-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### Task 4: CREATE `src/components/dashboard/ScoreBreakdown.tsx`

- **IMPLEMENT**: Tooltip component showing score criteria breakdown
- **PATTERN**: MIRROR tooltip patterns from existing components
- **IMPORTS**: `import { motion, AnimatePresence } from 'framer-motion';`
- **GOTCHA**: Position tooltip to avoid overflow
- **VALIDATE**: `npx tsc --noEmit src/components/dashboard/ScoreBreakdown.tsx`

```typescript
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreBreakdownProps {
  isVisible: boolean;
  scores: {
    label: string;
    value: number;
    max: number;
  }[];
  total: number;
}

export default function ScoreBreakdown({ isVisible, scores, total }: ScoreBreakdownProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute z-50 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl min-w-[200px]"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="text-xs font-mono space-y-2">
            {scores.map(({ label, value, max }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-gray-400">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500" 
                      style={{ width: `${(value / max) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-300 w-8 text-right">{value}</span>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-2 flex justify-between">
              <span className="text-gray-300 font-semibold">Total</span>
              <span className="text-green-400 font-bold">{total}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Task 5: UPDATE `src/components/dashboard/HypothesisItemEnhanced.tsx`

- **IMPLEMENT**: Add quality score indicator to hypothesis items
- **PATTERN**: Extend existing component, don't replace
- **IMPORTS**: Add `import ScoreBreakdown from './ScoreBreakdown';`
- **GOTCHA**: Only show breakdown for facts (state === 'fact')
- **VALIDATE**: `npx tsc --noEmit src/components/dashboard/HypothesisItemEnhanced.tsx`

Add hover state and ScoreBreakdown tooltip for facts showing confidence breakdown.

### Task 6: UPDATE `src/app/page.tsx` - Import and Initialize

- **IMPLEMENT**: Import useScoring hook and StageProgressBar
- **PATTERN**: Follow existing import patterns at top of file
- **IMPORTS**: `import { useScoring } from '@/hooks/useScoring'; import StageProgressBar from '@/components/dashboard/StageProgressBar';`
- **GOTCHA**: Place hook call after state initialization
- **VALIDATE**: `npm run dev` - check for runtime errors

Add after line 70 (after state initialization):
```typescript
const scoring = useScoring({
  hypotheses: state.hypotheses,
  solutions: state.solutions,
  requirements: state.requirements,
});
```

### Task 7: UPDATE `src/app/page.tsx` - Add StageProgressBar to UI

- **IMPLEMENT**: Render StageProgressBar in header area
- **PATTERN**: Place after EnhancedHeader component
- **GOTCHA**: Pass scoring.stages and scoring.currentStage as props
- **VALIDATE**: `npm run dev` - visually verify progress bar appears

Add after EnhancedHeader closing tag:
```tsx
<div className="px-4 py-2 border-b border-gray-800">
  <StageProgressBar 
    stages={scoring.stages} 
    currentStage={scoring.currentStage} 
  />
</div>
```

### Task 8: UPDATE `src/app/page.tsx` - Replace DNA Unlock Logic

- **IMPLEMENT**: Use scoring.canCreateDNA instead of manual calculation
- **PATTERN**: Replace existing dnaUnlocked calculation in useEffect
- **GOTCHA**: Keep backward compatibility with existing unlock behavior
- **VALIDATE**: `npm run dev` - verify DNA button unlocks correctly

Replace the dnaUnlocked calculation in the useEffect (around line 125):
```typescript
const dnaUnlocked = scoring.canCreateDNA;
```

### Task 9: CREATE `src/hooks/index.ts`

- **IMPLEMENT**: Barrel export for hooks
- **PATTERN**: Standard barrel export
- **VALIDATE**: `npx tsc --noEmit src/hooks/index.ts`

```typescript
export * from './useScoring';
```

### Task 10: UPDATE `src/lib/constants.ts`

- **IMPLEMENT**: Add deprecation comment pointing to new scoring system
- **PATTERN**: Keep existing constants for backward compatibility
- **GOTCHA**: Don't remove existing SCORES - other code may depend on it
- **VALIDATE**: `npx tsc --noEmit`

Add comment at top of SCORES:
```typescript
// @deprecated - Use src/lib/scoring/gates.ts for new scoring logic
export const SCORES = {
  // ... existing
};
```

---

## TESTING STRATEGY

### Unit Tests

Create `src/__tests__/scoring/useScoring.test.ts`:
- Test score calculation with empty arrays
- Test score calculation with mixed hypothesis/fact states
- Test gate progression logic
- Test canCreateDNA flag

### Integration Tests

Manual testing:
- Start engine, generate hypotheses
- Verify progress bar updates as hypotheses become facts
- Verify DNA button unlocks at correct threshold
- Verify stage transitions are visually indicated

### Edge Cases

- [ ] Empty state (no hypotheses) - should show 0% on all stages
- [ ] All hypotheses at 79% confidence - should not pass HYPOTHESIS gate
- [ ] Exactly 5 facts at 80%+ - should pass HYPOTHESIS gate
- [ ] Mixed confidence scores - average calculation correct

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style

```bash
npx tsc --noEmit
npm run lint
```

### Level 2: Unit Tests

```bash
npm test -- --testPathPattern=scoring
```

### Level 3: Integration Tests

```bash
npm run dev
# Manual: Navigate to localhost:5001, start engine, verify UI
```

### Level 4: Manual Validation

1. Start dev server: `npm run dev`
2. Connect API (or use demo mode)
3. Enter niche and start engine
4. Verify StageProgressBar appears below header
5. Watch hypotheses generate and validate
6. Confirm progress bar updates as facts are created
7. Verify DNA button unlocks when gates pass

---

## ACCEPTANCE CRITERIA

- [ ] StageProgressBar component renders 6 stages
- [ ] Current stage is visually highlighted
- [ ] Passed stages show green checkmark
- [ ] Locked stages show lock icon
- [ ] Hover on stage shows score tooltip
- [ ] useScoring hook computes scores correctly
- [ ] DNA button uses new scoring logic
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Existing functionality unchanged

---

## COMPLETION CHECKLIST

- [ ] All 10 tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes
- [ ] No linting or type checking errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met
- [ ] Code reviewed for quality and maintainability

---

## NOTES

### Design Decisions

1. **Backward Compatibility**: Kept existing `problemsScore`/`solutionsScore` fields to avoid breaking changes
2. **Hook-based Architecture**: Used custom hook for score computation to enable reuse and testing
3. **Progressive Enhancement**: Stage progression is visual-only initially; full scoring (Problem Quality, etc.) can be added later
4. **Minimal UI Changes**: Added progress bar without restructuring existing layout

### Trade-offs

- **Complexity vs Features**: Initial implementation only shows hypothesis stage scoring. Full quality scoring (severity, frequency, etc.) requires LLM integration and is deferred.
- **Performance**: `useMemo` prevents recalculation but adds memory overhead. Acceptable for current scale.

### Future Enhancements

1. Add LLM-powered quality scoring for problems/solutions
2. Implement score persistence to database
3. Add score history tracking
4. Create detailed score breakdown modals

### Risks

- **LLM Dependency**: Full quality scoring requires LLM calls, adding latency and cost
- **State Complexity**: Adding more score fields increases state management complexity
- **UI Clutter**: Progress bar adds visual elements; may need responsive adjustments

### Confidence Score: 8/10

High confidence due to:
- Clear patterns from existing codebase
- Scoring logic already implemented and tested
- Minimal changes to existing components
- Well-defined acceptance criteria

Risk factors:
- Manual testing required for visual verification
- Some edge cases may surface during implementation
