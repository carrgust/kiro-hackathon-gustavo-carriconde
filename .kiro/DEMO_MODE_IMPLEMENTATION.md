# Demo Mode Implementation

**Date**: 2026-01-29  
**Commit**: d061f1c

---

## Summary

Implemented a complete Demo Mode feature that allows users (especially judges) to experience the full Curatos DNA flow without requiring API keys or database setup.

---

## Implementation Details

### 1. Demo Data File (`src/lib/demo-data.ts`)

**Exports**:
- `DEMO_IDEA`: "AI-powered fitness coaching for seniors"
- `DEMO_CANONICAL`: Full canonical description
- `DEMO_VALIDATION_DATA`: Complete 7-pillar validation with scores and sources
- `DEMO_GAP_ANALYSIS`: Gap analysis identifying weak pillars
- `DEMO_IMPROVED_IDEA`: Improved version addressing gaps
- `DEMO_BUSINESS_PLAN`: Full 4-section business plan with chart_data

**Data Structure**:
```typescript
DEMO_VALIDATION_DATA = {
  idea: string,
  canonicalDescription: string,
  pillars: [
    {
      name: string,
      score: number,
      subcategories: [
        {
          name: string,
          score: number,
          sources: Source[]
        }
      ]
    }
  ]
}
```

### 2. Load Demo Function (`src/app/page.tsx`)

**Function**: `loadDemoMode()`

**Actions**:
1. Sets niche to DEMO_IDEA
2. Loads DEMO_VALIDATION_DATA into validationData state
3. Shows validation dashboard (setShowValidation(true))
4. Loads gap analysis data
5. Loads improved idea
6. Loads business plan (4 text sections)
7. Loads chart data
8. Unlocks all relevant sections: INPUT, PROCESSING, BUSINESS_PLAN
9. Navigates to PROCESSING section
10. Shows success toast

**Code**:
```typescript
const loadDemoMode = () => {
  setState(prev => ({ ...prev, niche: DEMO_IDEA }));
  setValidationData(DEMO_VALIDATION_DATA);
  setShowValidation(true);
  setGapAnalysis(DEMO_GAP_ANALYSIS);
  setImprovedIdea(DEMO_IMPROVED_IDEA);
  setBusinessPlanData({
    executive_summary: DEMO_BUSINESS_PLAN.executive_summary,
    market_and_sales: DEMO_BUSINESS_PLAN.market_and_sales,
    team_and_operations: DEMO_BUSINESS_PLAN.team_and_operations,
    financial_plan: DEMO_BUSINESS_PLAN.financial_plan
  });
  setChartData(DEMO_BUSINESS_PLAN.chart_data);
  setUnlockedSections(['INPUT', 'PROCESSING', 'BUSINESS_PLAN']);
  setActiveSection('PROCESSING');
  toast.success('Demo mode loaded');
};
```

### 3. UI Button (`src/components/sections/InputDashboard.tsx`)

**Location**: Below geography selection, before "Validate Idea" button

**Props Added**:
```typescript
interface InputDashboardProps {
  // ... existing props
  onDemoMode?: () => void;
}
```

**Button Component**:
```tsx
{onDemoMode && !showCanonical && (
  <motion.button
    onClick={onDemoMode}
    className="w-full py-3 rounded-lg font-medium text-emerald-400 border-2 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <Play size={20} />
    Try Demo Mode
  </motion.button>
)}
```

**Styling**:
- Emerald outlined button (matches Business Plan theme)
- Play icon from lucide-react
- Hover effects with scale animation
- Full width to match other buttons

---

## User Flow

### Before Demo Mode
1. User lands on INPUT section
2. Must enter business idea
3. Must click "Validate Idea"
4. Must wait for API calls
5. Must have OpenRouter API key configured

### With Demo Mode
1. User lands on INPUT section
2. Clicks "Try Demo Mode" button
3. **Instantly** sees:
   - Populated validation dashboard with 7 pillars
   - All scores and sources loaded
   - Gap analysis available
   - Business plan with charts ready
4. Can navigate between sections immediately
5. Can explore all features without setup

---

## Demo Data Content

### Validation Results
- **7 Pillars**: Market Viability, Technical Feasibility, Revenue Potential, Competitive Landscape, Scalability, Regulatory Risk, Team Fit
- **21 Subcategories**: 3 per pillar
- **105 Sources**: 5 per subcategory (realistic URLs and snippets)
- **Scores**: Range from 65-92 (realistic distribution)

### Gap Analysis
- Identifies 3 lowest-scoring pillars
- Provides diagnosis and recommendations
- Priority levels: High, Medium, Low

### Improved Idea
- Addresses each identified gap
- Structured by pillar
- Actionable improvements

### Business Plan
- **Executive Summary**: 250 words with key metrics
- **Market & Sales**: TAM/SAM/SOM, channels, competition
- **Team & Operations**: Team composition, milestones
- **Financial Plan**: 3-year projections, unit economics

### Chart Data (8 fields)
1. `key_metrics`: 4 metric cards (TAM, Revenue, Breakeven, LTV/CAC)
2. `market_breakdown`: Pie chart data (TAM/SAM/SOM)
3. `channels`: Go-to-market channel percentages
4. `competitive_landscape`: Radar chart (5 dimensions)
5. `milestones`: 4 quarterly milestones
6. `team_composition`: Team roles and headcount
7. `revenue_projections`: 3-year revenue/costs
8. `financial_table`: 8 key financial metrics

---

## Benefits

### For Judges
- **Zero Setup**: No API keys, no database, no configuration
- **Instant Experience**: See full app in seconds
- **Complete Flow**: All features accessible
- **Realistic Data**: Professional-quality demo content

### For Users
- **Try Before Setup**: Explore features before committing
- **Learning Tool**: Understand expected outputs
- **Quick Demo**: Show to stakeholders instantly

### For Development
- **Testing**: Quick way to test UI with full data
- **Screenshots**: Consistent data for documentation
- **Debugging**: Isolated from API/network issues

---

## Technical Notes

### State Management
- Uses existing state setters (no new state)
- Respects current architecture
- Clean separation from live mode

### Type Safety
- All demo data matches production types
- TypeScript validates structure
- No type casting required

### Performance
- Instant load (no API calls)
- No database queries
- Pure client-side operation

### Maintenance
- Single source of truth (demo-data.ts)
- Easy to update demo content
- Versioned with codebase

---

## Future Enhancements

### Potential Additions
- Multiple demo scenarios (different industries)
- Demo mode indicator in UI
- "Exit Demo Mode" button
- Demo data generator script
- Animated transitions on load

### Not Implemented (By Design)
- Demo mode persistence (intentionally ephemeral)
- Demo mode in URL params (keeps UI clean)
- Demo mode analytics (privacy-first)

---

## Testing Checklist

- [x] Demo button appears in INPUT section
- [x] Button styled correctly (emerald outline)
- [x] Click loads all demo data
- [x] Navigates to PROCESSING section
- [x] All 3 sections unlocked
- [x] Validation dashboard shows data
- [x] Gap analysis populated
- [x] Business plan with charts visible
- [x] No console errors
- [x] Build succeeds
- [x] TypeScript compiles

---

## Files Changed

1. **src/lib/demo-data.ts** (NEW)
   - 471 lines of demo data
   - 6 main exports
   - Helper function for source generation

2. **src/app/page.tsx**
   - Import demo data
   - Add loadDemoMode() function
   - Pass onDemoMode prop to InputDashboard
   - Fix TypeScript error in handleUpdateBusinessPlanSection

3. **src/components/sections/InputDashboard.tsx**
   - Add onDemoMode prop to interface
   - Import Play icon
   - Add "Try Demo Mode" button
   - Position before "Validate Idea" button

---

## Commit

```
feat: implement Demo Mode with pre-populated validation data

- Add src/lib/demo-data.ts with complete demo flow data
- Add loadDemoMode() function in page.tsx to populate all state
- Add 'Try Demo Mode' button in InputDashboard with Play icon
- Demo mode unlocks all sections and navigates to PROCESSING
- Allows judges to experience full app flow without API keys
```

**Commit Hash**: d061f1c
