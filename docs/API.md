# Curatos DNA API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
All endpoints (except `/health`) require an OpenRouter API key passed in the request body.

```json
{
  "apiKey": "sk-or-v1-..."
}
```

For demo mode, use `"apiKey": "demo"`.

---

## Endpoints

### GET /health

Health check endpoint for monitoring service status.

**Request**
```bash
curl http://localhost:5001/api/health
```

**Response (200 OK)**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T12:00:00.000Z",
  "service": "curatos-api",
  "openrouter": {
    "configured": true,
    "note": "API key validation requires client-side key"
  }
}
```

**Response (503 Service Unavailable)**
```json
{
  "status": "unhealthy",
  "error": "Database connection failed",
  "timestamp": "2026-01-15T12:00:00.000Z"
}
```

---

### POST /chat

Send messages to AI models via OpenRouter.

**Request**
```bash
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-or-v1-...",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "model": "deepseek/deepseek-r1-0528:free",
    "provider": "openrouter"
  }'
```

**Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| apiKey | string | Yes | OpenRouter API key |
| messages | Message[] | Yes | Array of chat messages |
| model | string | No | Model ID (default: deepseek-r1) |
| provider | string | No | Provider name (default: openrouter) |

**Message Object**
```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

**Response (200 OK)**
```json
{
  "content": "Hello! How can I help you today?",
  "model": "deepseek/deepseek-r1-0528:free",
  "tokens": {
    "prompt": 25,
    "completion": 12,
    "total": 37
  }
}
```

**Response (400 Bad Request)**
```json
{
  "error": "API key required"
}
```

```json
{
  "error": "Messages array required"
}
```

**Response (500 Internal Server Error)**
```json
{
  "error": "OpenRouter API error: 429 - Rate limit exceeded"
}
```

---

### POST /research/start

Start a new research pipeline for an idea.

**Request**
```bash
curl -X POST http://localhost:5001/api/research/start \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk-or-v1-...",
    "idea": "AI-powered code review tool",
    "niche": "developer tools"
  }'
```

**Request Body**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| apiKey | string | Yes | OpenRouter API key |
| idea | string | Yes | Product idea to research |
| niche | string | Yes | Market niche |

**Response (200 OK)**
```json
{
  "researchId": "clx1234567890",
  "status": "completed",
  "currentEngine": 3,
  "results": [
    {
      "engine": "problem",
      "findings": [...],
      "confidence": 75
    },
    {
      "engine": "solution",
      "findings": [...],
      "confidence": 82
    },
    {
      "engine": "synthesis",
      "summary": "...",
      "confidence": 78
    }
  ],
  "finalScore": 78
}
```

**Response (400 Bad Request)**
```json
{
  "error": "Missing required fields: idea, niche, apiKey"
}
```

**Response (500 Internal Server Error)**
```json
{
  "error": "Insufficient credits"
}
```

---

### GET /research/status/[id]

Get the status of a research pipeline.

**Request**
```bash
curl http://localhost:5001/api/research/status/clx1234567890
```

**Response (200 OK)**
```json
{
  "id": "clx1234567890",
  "title": "AI-powered code review tool",
  "status": "completed",
  "currentEngine": 3,
  "confidenceScore": 78,
  "results": [...],
  "createdAt": "2026-01-15T10:00:00.000Z",
  "completedAt": "2026-01-15T10:05:00.000Z"
}
```

**Pipeline Status Values**
| Status | Description |
|--------|-------------|
| pending | Pipeline created, not started |
| running | Pipeline executing engines |
| completed | All engines finished successfully |
| failed | Pipeline encountered an error |

**Response (404 Not Found)**
```json
{
  "error": "Research not found"
}
```

---

## Error Codes

| HTTP Code | Error Type | Description |
|-----------|------------|-------------|
| 400 | Bad Request | Missing or invalid parameters |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limited | OpenRouter rate limit exceeded |
| 500 | Server Error | Internal error or API failure |
| 503 | Unavailable | Service unhealthy |

## Rate Limits

OpenRouter free tier limits:
- DeepSeek R1: 50 requests/day
- Gemini Flash: 50 requests/day

Rate limit headers returned:
```
x-ratelimit-limit: 50
x-ratelimit-remaining: 45
x-ratelimit-reset: 1705320000
```

## Models

### Available Models
| Model ID | Purpose | Cost |
|----------|---------|------|
| deepseek/deepseek-r1-0528:free | Hypothesis generation | Free |
| google/gemini-2.0-flash-exp:free | Landing page, PRD | Free |
| google/gemini-2.0-flash-exp:free:online | Web search validation | Free |
| meta-llama/llama-3.3-70b-instruct:free | Fallback | Free |

### Web Search
Append `:online` to model ID for Exa.ai web search:
```json
{
  "model": "google/gemini-2.0-flash-exp:free:online"
}
```

Response includes annotations with source URLs:
```json
{
  "content": "...",
  "annotations": [
    {
      "url_citation": {
        "title": "Market Research Report",
        "url": "https://example.com/report"
      }
    }
  ]
}
```

## Client-Side Services

These services run in the browser and call OpenRouter directly:

### HypothesisService
```typescript
const service = new HypothesisService(apiKey);

// Generate hypotheses
const hypotheses = await service.generateHypotheses(
  'fintech',      // niche
  'problems',     // focus: 'problems' | 'solutions'
  3               // count
);

// Research hypothesis
const result = await service.researchHypothesis(hypothesis, 'fintech');
// Returns: { confidence: number, sources: string[] }
```

### StreamingService
```typescript
const service = new StreamingService(apiKey);

// Generate landing page
const html = await service.generateLandingPage(
  'fintech',
  validatedProblems,
  validatedSolutions
);

// Generate PRD
const markdown = await service.generatePRD(
  'fintech',
  validatedProblems,
  validatedSolutions
);
```

## Demo Mode

Use `apiKey: "demo"` to get pre-generated responses without API calls:

```typescript
const service = new StreamingService('demo');
const prd = await service.generatePRD(...); // Returns DEMO_PRD
const html = await service.generateLandingPage(...); // Returns DEMO_LANDING_PAGE
```

## TypeScript Types

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  annotations?: Annotation[];
}

interface Hypothesis {
  id: string;
  text: string;
  state: 'hypothesis' | 'fact';
  confidence: number;
  sources?: string[];
  createdAt: Date;
}

interface PipelineResult {
  researchId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentEngine: number;
  results: EngineResult[];
  finalScore: number;
}
```
