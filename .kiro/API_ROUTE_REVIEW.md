# API Route Review: generate-business-plan

**Date**: 2026-01-29  
**File**: `src/app/api/validate/generate-business-plan/route.ts`

---

## Summary

✅ **All 4 requirements verified**

1. ✅ Prompt requests all 8 chart_data fields
2. ✅ maxTokens set to 8192
3. ✅ Robust per-field defaults for all chart_data fields
4. ✅ JSON parsing handles markdown code fences

---

## Requirement 1: All 8 chart_data Fields in Prompt ✅

**Prompt Section (Lines 40-95)**:
```typescript
"chart_data": {
  "key_metrics": [...],           // ✅ Field 1
  "market_breakdown": [...],      // ✅ Field 2
  "channels": [...],              // ✅ Field 3
  "competitive_landscape": [...], // ✅ Field 4
  "milestones": [...],            // ✅ Field 5
  "team_composition": [...],      // ✅ Field 6
  "revenue_projections": [...],   // ✅ Field 7
  "financial_table": [...]        // ✅ Field 8
}
```

**Explicit Instruction (Lines 97-106)**:
```
IMPORTANT for chart_data - Generate ALL of these with realistic data:
- key_metrics: 4 highlight cards for executive summary
- market_breakdown: TAM/SAM/SOM numbers (in billions)
- channels: 3-5 go-to-market channels with percentage allocation
- competitive_landscape: 4-6 dimensions comparing "us" vs "competitor_avg"
- milestones: 4-6 quarterly milestones for 12-month roadmap
- team_composition: 3-5 departments with headcount
- revenue_projections: Year 1/2/3 revenue AND cost numbers
- financial_table: 6-10 rows of key financial metrics
```

---

## Requirement 2: maxTokens = 8192 ✅

**Line 127**:
```typescript
const response = await callWithFallback(
  apiKey,
  [
    { role: 'system', content: BUSINESS_PLAN_PROMPT },
    { role: 'user', content: context }
  ],
  { maxTokens: 8192, temperature: 0.4, jsonMode: true }  // ✅ 8192 tokens
);
```

**Why 8192**:
- 4 text sections × ~250 words = ~1,000 words = ~1,300 tokens
- 8 chart_data fields with arrays = ~500 tokens
- JSON structure overhead = ~200 tokens
- Total: ~2,000 tokens
- 8192 provides 4x buffer for detailed responses

---

## Requirement 3: Robust Per-Field Defaults ✅

**Lines 154-217**:

```typescript
// Ensure chart_data exists with defaults if LLM didn't provide it
if (!businessPlan.chart_data) {
  businessPlan.chart_data = {};
}
const cd = businessPlan.chart_data;

// ✅ Field 1: key_metrics
if (!cd.key_metrics) {
  cd.key_metrics = [
    { label: 'TAM', value: '$100B', icon: 'target' },
    { label: 'Year 1 Revenue', value: '$5M', icon: 'dollar' },
    { label: 'Breakeven', value: '24 months', icon: 'clock' },
    { label: 'LTV/CAC Ratio', value: '30x', icon: 'trending' },
  ];
}

// ✅ Field 2: market_breakdown
if (!cd.market_breakdown) {
  cd.market_breakdown = [
    { name: 'TAM', value: 100, color: '#047857' },
    { name: 'SAM', value: 30, color: '#059669' },
    { name: 'SOM', value: 5, color: '#10b981' },
    { name: 'Year 1 Target', value: 0.5, color: '#34d399' },
  ];
}

// ✅ Field 3: channels
if (!cd.channels) {
  cd.channels = [
    { name: 'Direct Sales', percentage: 40 },
    { name: 'Partnerships', percentage: 30 },
    { name: 'Digital Marketing', percentage: 20 },
    { name: 'Referrals', percentage: 10 },
  ];
}

// ✅ Field 4: competitive_landscape
if (!cd.competitive_landscape) {
  cd.competitive_landscape = [
    { name: 'Innovation', us: 85, competitor_avg: 50 },
    { name: 'Market Reach', us: 40, competitor_avg: 70 },
    { name: 'Price Value', us: 80, competitor_avg: 55 },
    { name: 'Technology', us: 90, competitor_avg: 45 },
    { name: 'Support', us: 75, competitor_avg: 60 },
  ];
}

// ✅ Field 5: milestones
if (!cd.milestones) {
  cd.milestones = [
    { quarter: 'Q1', milestone: 'MVP launch and beta testing' },
    { quarter: 'Q2', milestone: 'First 100 paying customers' },
    { quarter: 'Q3', milestone: 'Series A fundraise' },
    { quarter: 'Q4', milestone: 'Scale to 1,000 users' },
  ];
}

// ✅ Field 6: team_composition
if (!cd.team_composition) {
  cd.team_composition = [
    { role: 'Engineering', count: 4, color: '#047857' },
    { role: 'Sales & Marketing', count: 3, color: '#059669' },
    { role: 'Operations', count: 2, color: '#10b981' },
    { role: 'Leadership', count: 2, color: '#34d399' },
  ];
}

// ✅ Field 7: revenue_projections
if (!cd.revenue_projections) {
  cd.revenue_projections = [
    { year: 'Year 1', revenue: 5, costs: 3 },
    { year: 'Year 2', revenue: 12, costs: 7 },
    { year: 'Year 3', revenue: 25, costs: 14 },
  ];
}

// ✅ Field 8: financial_table
if (!cd.financial_table) {
  cd.financial_table = [
    { metric: 'Revenue Target (Y1)', value: '$5M' },
    { metric: 'Revenue Target (Y3)', value: '$25M' },
    { metric: 'CAC', value: '$500' },
    { metric: 'LTV', value: '$15,000' },
    { metric: 'Breakeven', value: '24 months' },
  ];
}
```

**Fallback Strategy**:
- Each field checked individually
- Sensible defaults that match expected schema
- Ensures UI never breaks from missing data
- Defaults are realistic business metrics

---

## Requirement 4: JSON Parsing Handles Markdown Code Fences ✅

**Lines 133-136**:
```typescript
let cleanResponse = response.trim();
if (cleanResponse.startsWith('```json')) {
  cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
}
businessPlan = JSON.parse(cleanResponse);
```

**Handles These Cases**:
```
Case 1: Clean JSON
{"executive_summary": "..."}

Case 2: Markdown code fence
```json
{"executive_summary": "..."}
```

Case 3: Code fence with newline
```json

{"executive_summary": "..."}
```
```

**Regex Breakdown**:
- `/```json\n?/g` - Removes opening fence with optional newline
- `/```\n?/g` - Removes closing fence with optional newline
- `trim()` - Removes leading/trailing whitespace

---

## API Flow

```
POST /api/validate/generate-business-plan
         │
         ├─ Validate input (idea, improvedIdea)
         ├─ Check API key
         │
         ▼
Build context from:
  - Original idea
  - Canonical description
  - 7-pillar improved idea
  - Validation scores
  - Gap analysis
         │
         ▼
Call LLM with fallback chain:
  - System: BUSINESS_PLAN_PROMPT (8 chart fields)
  - User: context
  - Options: maxTokens=8192, jsonMode=true
         │
         ▼
Parse response:
  - Strip markdown code fences
  - Parse JSON
  - Validate 4 text keys exist
         │
         ▼
Apply defaults:
  - Check each of 8 chart_data fields
  - Fill missing fields with sensible defaults
         │
         ▼
Return: { businessPlan }
```

---

## Error Handling

**Input Validation**:
```typescript
if (!idea || !improvedIdea) {
  return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
}
```

**API Key Check**:
```typescript
if (!apiKey) {
  return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
}
```

**JSON Parse Error**:
```typescript
try {
  businessPlan = JSON.parse(cleanResponse);
} catch (parseError) {
  console.error('[GenerateBusinessPlan] JSON parse error:', parseError);
  return NextResponse.json({ error: 'Failed to parse business plan JSON' }, { status: 500 });
}
```

**Missing Text Sections**:
```typescript
const requiredKeys = ['executive_summary', 'market_and_sales', 'team_and_operations', 'financial_plan'];
const missingKeys = requiredKeys.filter(key => !businessPlan[key]);

if (missingKeys.length > 0) {
  return NextResponse.json({ error: `Missing sections: ${missingKeys.join(', ')}` }, { status: 500 });
}
```

**General Error**:
```typescript
catch (error: any) {
  console.error('[GenerateBusinessPlan] Error:', error);
  return NextResponse.json({ error: error.message || 'Failed to generate business plan' }, { status: 500 });
}
```

---

## Prompt Engineering

**Effective Techniques Used**:

1. **Explicit Structure**: JSON schema with all 8 fields shown
2. **Constraints**: "200-250 words MAX", "must sum to 100"
3. **Examples**: Complete example for each chart_data field
4. **Formatting Rules**: Bullet points with `-`, bold with `**`
5. **Repetition**: "IMPORTANT for chart_data - Generate ALL of these"
6. **Specificity**: Icon names, color codes, data ranges

**Temperature = 0.4**:
- Low enough for consistent structure
- High enough for creative content
- Balances reliability and variety

---

## Data Flow to UI

```
API Response
     │
     ├─ executive_summary → BusinessPlanSection (text)
     ├─ market_and_sales → BusinessPlanSection (text)
     ├─ team_and_operations → BusinessPlanSection (text)
     ├─ financial_plan → BusinessPlanSection (text)
     │
     └─ chart_data
          ├─ key_metrics → ExecutiveSummaryCharts (metric cards)
          ├─ market_breakdown → MarketSalesCharts (pie chart)
          ├─ channels → MarketSalesCharts (channel bars)
          ├─ competitive_landscape → MarketSalesCharts (radar chart)
          ├─ milestones → TeamOperationsCharts (timeline)
          ├─ team_composition → TeamOperationsCharts (donut chart)
          ├─ revenue_projections → FinancialPlanCharts (bar chart + table)
          └─ financial_table → FinancialPlanCharts (metrics table)
```

---

## Testing Checklist

- [x] All 8 chart_data fields in prompt
- [x] maxTokens = 8192
- [x] Defaults for all 8 fields
- [x] Markdown code fence handling
- [x] Input validation
- [x] API key check
- [x] JSON parse error handling
- [x] Missing section detection
- [x] Console logging for debugging
- [x] Proper HTTP status codes

---

## Conclusion

The API route is production-ready with:
- ✅ Complete chart_data specification (all 8 fields)
- ✅ Sufficient token budget (8192)
- ✅ Comprehensive fallback defaults
- ✅ Robust JSON parsing
- ✅ Proper error handling
- ✅ Clear logging for debugging
