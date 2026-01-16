# Demo Mode Specification

## Overview
Demo Mode provides a fully functional experience without requiring an API key. It uses pre-generated data to showcase all features while isolating demo behavior from production code paths.

## Purpose
1. **Hackathon Judging**: Allow judges to evaluate features without API setup
2. **User Onboarding**: Let users explore before committing to API key
3. **Testing**: Consistent data for automated tests
4. **Offline Development**: Work without API connectivity

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API KEY CHECK                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  apiKey === 'demo'                                          │
│         │                                                    │
│         ├── YES ──▶ Return pre-generated data               │
│         │           (DEMO_PRD, DEMO_LANDING_PAGE)           │
│         │                                                    │
│         └── NO ───▶ Call OpenRouter API                     │
│                     (Real AI generation)                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Entry Point: APIConnector Component
```typescript
// src/components/dashboard/APIConnector.tsx
const handleDemoMode = () => {
  setApiKey('demo');
  setIsDemoMode(true);
  onConnect('demo');
};
```

### Service-Level Isolation

#### StreamingService
```typescript
// src/lib/api/streaming.ts
async generateLandingPage(...): Promise<string> {
  // Demo mode: return pre-generated data
  if (this.apiKey === 'demo') {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    return DEMO_LANDING_PAGE;
  }
  // Production: call OpenRouter API
  const provider = getProvider('openrouter', this.apiKey);
  // ...
}

async generatePRD(...): Promise<string> {
  if (this.apiKey === 'demo') {
    await new Promise(resolve => setTimeout(resolve, 500));
    return DEMO_PRD;
  }
  // Production: call OpenRouter API
  // ...
}
```

### Pre-Generated Data

#### Location
```
src/lib/demo-data.ts
```

#### Contents
```typescript
export const DEMO_PRD = `# Product Requirements Document: GitHub Intelligence API
...
`;

export const DEMO_LANDING_PAGE = `<!DOCTYPE html>
<html lang="en">
...
</html>`;
```

## Demo Data Specifications

### DEMO_PRD
- **Format**: Markdown
- **Sections**: Executive Summary, Problem Statement, Target Users, Requirements (FR/NFR), Success Metrics
- **Niche**: GitHub Intelligence API (developer tools)
- **Requirements**: 6 functional (FR-001 to FR-006), 4 non-functional (NFR-001 to NFR-004)

### DEMO_LANDING_PAGE
- **Format**: Self-contained HTML with inline CSS
- **Design**: Dark mode, modern SaaS aesthetic
- **Sections**: Hero, Problems, Solutions (implied), CTA
- **Responsive**: Mobile-friendly grid layout

## User Experience

### Activation
1. User clicks "Try Demo Mode" button in APIConnector
2. System sets `apiKey = 'demo'` and `isDemoMode = true`
3. UI shows demo mode indicator
4. All features work with pre-generated data

### Visual Indicators
- Demo mode badge in header
- Different color scheme (optional)
- Clear messaging that data is pre-generated

### Feature Availability
| Feature | Demo Mode | API Mode |
|---------|-----------|----------|
| Hypothesis Generation | Pre-generated | AI-generated |
| Web Validation | Simulated | Real Exa.ai search |
| Landing Page | Pre-generated | AI-generated |
| PRD Generation | Pre-generated | AI-generated |
| Token Tracking | Simulated | Real usage |

## Testing

### Test File
```
src/__tests__/evaluation/demo-mode.test.ts
```

### Test Cases
```typescript
describe('Demo Mode', () => {
  it('should return demo PRD when apiKey is "demo"');
  it('should return demo landing page when apiKey is "demo"');
  it('should simulate realistic delay');
  it('should not make API calls in demo mode');
});
```

### Isolation Verification
```typescript
// Ensure demo mode doesn't leak to production
test('demo mode isolation', async () => {
  const service = new StreamingService('demo');
  const result = await service.generatePRD('test', [], []);
  expect(result).toBe(DEMO_PRD);
  // Verify no network calls were made
});
```

## Maintenance

### Updating Demo Data
1. Edit `src/lib/demo-data.ts`
2. Ensure PRD follows FR-001/NFR-001 format
3. Ensure HTML is self-contained (no external deps)
4. Run tests to verify format

### Adding New Demo Features
1. Add new constant to `demo-data.ts`
2. Add demo check in relevant service
3. Add test case for demo behavior
4. Update this spec

## Security Considerations

- Demo mode has no access to real API keys
- Pre-generated data contains no sensitive information
- Demo API key ('demo') is explicitly checked, not validated against OpenRouter
- No network requests made in demo mode

## Known Limitations

1. **Static Data**: Demo data doesn't change based on niche input
2. **No Streaming**: Demo mode returns complete data, no streaming simulation
3. **Fixed Confidence**: Demo hypotheses have pre-set confidence scores
4. **Single Niche**: Demo data is for "GitHub Intelligence API" niche only
