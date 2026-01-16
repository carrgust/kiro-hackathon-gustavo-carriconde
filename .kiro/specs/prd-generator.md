# PRD Generator Specification

## Overview
The PRD (Product Requirements Document) Generator creates comprehensive, structured requirements documents from validated hypotheses. It produces markdown output compatible with Notion, GitHub, Confluence, and other documentation platforms.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRD GENERATOR                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Validated   │───▶│   Gemini     │───▶│   Markdown   │  │
│  │  Hypotheses  │    │   Flash      │    │   Output     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│  Problems (80%+)     AI Generation      FR-001/NFR-001     │
│  Solutions (80%+)    with structure     formatted PRD      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Service Location
```
src/lib/api/streaming.ts → StreamingService.generatePRD()
```

### Method Signature
```typescript
async generatePRD(
  niche: string,
  problems: Hypothesis[],
  solutions: Hypothesis[]
): Promise<string>
```

### Generation Flow

1. **Filter Validated Hypotheses**
```typescript
const problemsList = problems
  .filter(p => p.state === 'fact' && p.confidence >= 80)
  .map(p => `- ${p.text}`)
  .join('\n');

const solutionsList = solutions
  .filter(s => s.state === 'fact' && s.confidence >= 80)
  .map(s => `- ${s.text}`)
  .join('\n');
```

2. **Build AI Prompt**
```typescript
const prompt = `Generate a comprehensive Product Requirements Document (PRD) 
for a SaaS product in the ${niche} niche.

VALIDATED PROBLEMS:
${problemsList}

VALIDATED SOLUTIONS:
${solutionsList}

Create a professional PRD in markdown format...`;
```

3. **Call AI Model**
```typescript
const response = await provider.chat(messages, 'google/gemini-2.0-flash-exp:free');
```

4. **Clean Response**
```typescript
let markdown = response.content.trim();
if (markdown.startsWith('```markdown')) {
  markdown = markdown.replace(/```markdown\n?/, '').replace(/```\s*$/, '');
}
```

## Output Format

### Document Structure
```markdown
# Product Requirements Document: [Product Name]

## Executive Summary
2-3 sentences summarizing the product vision and value proposition.

## Problem Statement
Detailed description of the problems being solved.

## Target Users
Define 2-3 user personas with their needs and pain points.

## Proposed Solution
Comprehensive solution description.

## Requirements

### Functional Requirements
FR-001: [Requirement description]
FR-002: [Requirement description]
FR-003: [Requirement description]
...

### Non-Functional Requirements
NFR-001: [Requirement description]
NFR-002: [Requirement description]
NFR-003: [Requirement description]
...

## Success Metrics
Define 5-7 KPIs to measure product success.

## Timeline Estimate
High-level phases and estimated timeline.

## Risks and Mitigation
Identify 3-5 key risks and mitigation strategies.
```

### Requirement Numbering Convention

| Prefix | Type | Example |
|--------|------|---------|
| FR-XXX | Functional Requirement | FR-001: User authentication via OAuth |
| NFR-XXX | Non-Functional Requirement | NFR-001: 99.9% uptime SLA |

### Typical Counts
- Functional Requirements: 6-8
- Non-Functional Requirements: 4-6
- User Personas: 2-3
- Success Metrics: 5-7
- Risks: 3-5

## UI Component

### Location
```
src/components/dashboard/PRDModal.tsx
```

### Features
- **Preview Tab**: Rendered markdown with styling
- **Raw Tab**: Plain markdown source
- **Copy Button**: Copy to clipboard
- **Download Button**: Save as .md file

### Modal Props
```typescript
interface PRDModalProps {
  isOpen: boolean;
  onClose: () => void;
  prdMarkdown: string;
  isGenerating: boolean;
  onGenerate: () => void;
}
```

## Demo Mode

### Pre-Generated PRD
```typescript
// src/lib/demo-data.ts
export const DEMO_PRD = `# Product Requirements Document: GitHub Intelligence API

## Executive Summary
GitHub Intelligence API is a SaaS platform providing AI-powered repository 
analytics, intelligent code review, and unified team productivity metrics 
for development teams.

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
```

## Integration Points

### Trigger Conditions
PRD generation is available when:
1. DNA modal is open
2. At least 3 validated problems (80%+ confidence)
3. At least 3 validated solutions (80%+ confidence)

### State Management
```typescript
// In page.tsx
const [showPRDModal, setShowPRDModal] = useState(false);
const [prdMarkdown, setPrdMarkdown] = useState('');
const [isGeneratingPRD, setIsGeneratingPRD] = useState(false);

const handleGeneratePRD = async () => {
  setIsGeneratingPRD(true);
  const service = new StreamingService(apiKey);
  const markdown = await service.generatePRD(
    state.niche,
    state.hypotheses,
    state.solutions
  );
  setPrdMarkdown(markdown);
  setIsGeneratingPRD(false);
  setShowPRDModal(true);
};
```

## Error Handling

### Validation Errors
- No validated problems → Show toast: "Need 3+ validated problems"
- No validated solutions → Show toast: "Need 3+ validated solutions"
- Empty niche → Show toast: "Please enter a niche first"

### API Errors
- Rate limit → Show retry message with wait time
- Network error → Show generic error with retry option
- Invalid response → Log error, show user-friendly message

## Performance

- Generation time: ~3-5 seconds
- Output size: ~500-1000 words
- Token usage: ~800-1200 tokens per generation

## Compatibility

### Export Formats
| Platform | Compatibility |
|----------|---------------|
| Notion | ✅ Full support |
| GitHub | ✅ Full support |
| Confluence | ✅ Full support |
| Jira | ⚠️ Partial (no native markdown) |
| Linear | ✅ Full support |

### Markdown Features Used
- Headers (H1, H2, H3)
- Bullet lists
- Numbered lists
- Bold text
- Code blocks (optional)
