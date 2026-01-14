# OpenRouter API Integration - Curatos

> **Document Version:** 1.0
> **Last Updated:** January 13, 2026
> **Author:** Gustavo Martini Carriconde
> **Project:** Curatos - Dynamous x Kiro Hackathon

---

## Table of Contents

1. [Overview](#overview)
2. [Legal Compliance](#legal-compliance)
3. [Terms of Service Summary](#terms-of-service-summary)
4. [Privacy & Data Handling](#privacy--data-handling)
5. [Account Setup](#account-setup)
6. [API Integration Details](#api-integration-details)
7. [Attribution Requirements](#attribution-requirements)
8. [Rate Limits & Quotas](#rate-limits--quotas)
9. [Security Best Practices](#security-best-practices)
10. [Compliance Checklist](#compliance-checklist)

---

## Overview

Curatos integrates with [OpenRouter](https://openrouter.ai/) to provide AI-powered hypothesis generation and market research. OpenRouter is a large language model aggregator that provides unified access to 300+ AI models through a single API endpoint.

### Why OpenRouter?

- **Unified API**: Single endpoint for multiple AI providers
- **Free Tier**: Access to powerful models at no cost
- **OpenAI Compatible**: Standard API format
- **No Vendor Lock-in**: Easy to switch models
- **Privacy Options**: User-controlled data logging

---

## Legal Compliance

### Curatos Compliance Status: COMPLIANT

After reviewing OpenRouter's Terms of Service and Privacy Policy, Curatos is **fully compliant** with all requirements.

| Requirement | Curatos Status | Notes |
|-------------|----------------|-------|
| User Authentication | Users provide their own API keys | BYOK model |
| Data Logging | Not enabled by default | Respects user privacy |
| Attribution Headers | Implemented | HTTP-Referer and X-Title set |
| Age Restriction (13+) | User responsibility | Documented in README |
| Prohibited Content | N/A | Research-focused use case |
| Commercial Use | Allowed | No restrictions found |

### No Conflicts Identified

Our integration does NOT:
- Store or resell API keys
- Log prompts without consent
- Bypass rate limits
- Violate prohibited conduct rules
- Infringe on intellectual property

---

## Terms of Service Summary

**Source:** [OpenRouter Terms of Service](https://openrouter.ai/terms)

### Key Points

#### Eligibility
- Minimum age: 13 years old
- Users under 18 require parental consent
- Users must maintain accurate account information

#### Payment & Credits
- Credits required for API calls
- Purchase range: $5–$25,000 per transaction
- Refunds available within 24 hours for unused credits
- Credits expire after 365 days
- Free tier available with rate limits

#### User Content
- Users retain copyright in their inputs
- Output ownership depends on specific AI model terms
- Prompt logging is OPTIONAL (disabled by default)

#### Prohibited Conduct
Users cannot:
- Use the service illegally
- Create false identities
- Bypass technical limits
- Scrape content
- Infringe intellectual property
- Interfere with service operations

#### Dispute Resolution
- Binding arbitration required
- Handled under American Arbitration Association rules
- Location: New York, NY

#### Liability
- Service provided "as is"
- No warranties on accuracy
- Aggregate liability capped at $100 or 12 months of payments

---

## Privacy & Data Handling

**Source:** [OpenRouter Privacy Policy](https://openrouter.ai/privacy)

### Data Collection

OpenRouter collects:
- Account information (email, name)
- Browsing patterns and IP addresses
- Device information
- Usage analytics

### Prompt/Completion Handling

**CRITICAL:** By default, prompts and completions are NOT logged.

- Logging is opt-in only (provides 1% discount)
- OpenRouter does NOT control downstream AI providers
- Users should review individual model provider terms

### Data Retention

- Data retained as long as reasonably necessary
- Deleted upon account termination (unless legally required)
- De-identified data may be used for analytics

### User Rights

Users can:
- Request data access
- Request data correction
- Request data deletion
- Opt out of marketing

---

## Account Setup

### Step 1: Create Account

1. Visit [https://openrouter.ai/sign-up](https://openrouter.ai/sign-up)
2. Sign up with Google, GitHub, or email
3. Verify your email address

### Step 2: Add Credits (Optional)

1. Visit [Credits page](https://openrouter.ai/credits)
2. Add minimum $5 for higher rate limits
3. Or use free tier with 50 requests/day

### Step 3: Create API Key

1. Visit [API Keys page](https://openrouter.ai/settings/keys)
2. Click "Create new secret key"
3. Name your key (e.g., "Curatos Production")
4. Copy and store securely

### Step 4: Configure in Curatos

1. Launch Curatos dashboard
2. Enter your OpenRouter API key
3. Click "Connect"
4. Key is validated and stored locally

---

## API Integration Details

### Base Configuration

```typescript
const OPENROUTER_CONFIG = {
  baseUrl: 'https://openrouter.ai/api/v1',
  defaultModel: 'deepseek/deepseek-r1-0528:free',
  headers: {
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://curatos.app',
    'X-Title': 'Curatos DNA'
  }
};
```

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat/completions` | POST | Generate hypotheses, research |
| `/models` | GET | List available models |

### Models Used in Curatos

| Model | Purpose | Cost |
|-------|---------|------|
| `deepseek/deepseek-r1-0528:free` | Hypothesis generation | Free |
| `google/gemini-2.0-flash-exp:free` | Research analysis | Free |
| `meta-llama/llama-3.3-70b-instruct:free` | Fallback | Free |

### Request Format

```json
{
  "model": "deepseek/deepseek-r1-0528:free",
  "messages": [
    {"role": "system", "content": "You are a market research expert..."},
    {"role": "user", "content": "Generate 3 problem hypotheses..."}
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

### Response Format

```json
{
  "id": "gen-xxxxx",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "[{\"text\": \"High payment fees\"}]"
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 50,
    "total_tokens": 200
  }
}
```

---

## Attribution Requirements

OpenRouter encourages (but does not require) attribution headers:

### Required Headers in Curatos

```typescript
headers: {
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://curatos.app',  // App URL
  'X-Title': 'Curatos DNA'                 // App name
}
```

### Benefits of Attribution

- Appears on OpenRouter leaderboards
- Helps track usage per application
- Supports the OpenRouter ecosystem

---

## Rate Limits & Quotas

### Free Tier Limits

| Condition | Rate Limit |
|-----------|------------|
| No credits purchased | 50 requests/day |
| $10+ credits purchased | 1,000 requests/day |
| Free models | Lower priority routing |

### Free Model Considerations

- Free models have "low rate limits"
- Not recommended for production use
- May have higher latency
- Rate limits reset daily

### Recommendations

1. Purchase minimum $10 credits for hackathon demo
2. Use free models for development
3. Monitor token usage in dashboard
4. Implement graceful error handling

---

## Security Best Practices

### API Key Protection

1. **Never commit keys to repositories**
   - Use environment variables
   - Add to `.gitignore`

2. **Client-side storage**
   - Stored in localStorage (MVP only)
   - Production should use server-side proxy

3. **Key rotation**
   - Regenerate if exposed
   - Use [key settings page](https://openrouter.ai/settings/keys)

### Curatos Security Implementation

```typescript
// Keys stored in localStorage (client-side)
export function storeApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('curatos_api_key', apiKey);
}

// Server-side proxy available at /api/chat
// Recommended for production deployment
```

### GitHub Secret Scanning

OpenRouter partners with GitHub to detect exposed keys. If detected:
1. Notification sent to account owner
2. Delete exposed key immediately
3. Generate new key

---

## Compliance Checklist

### Before Launch

- [x] Reviewed OpenRouter Terms of Service
- [x] Reviewed OpenRouter Privacy Policy
- [x] Implemented attribution headers
- [x] API key validation implemented
- [x] Error handling for rate limits
- [x] No prompt logging enabled
- [x] User provides their own API key (BYOK)
- [x] Documentation created

### For Users

- [ ] User must accept OpenRouter ToS
- [ ] User must be 13+ years old
- [ ] User responsible for API key security
- [ ] User responsible for credit management

---

## References

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Terms of Service](https://openrouter.ai/terms)
- [OpenRouter Privacy Policy](https://openrouter.ai/privacy)
- [OpenRouter API Reference](https://openrouter.ai/docs/api/reference/overview)
- [OpenRouter FAQ](https://openrouter.ai/docs/faq)
- [OpenRouter Free Models](https://openrouter.ai/models?q=free)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | January 13, 2026 | Initial documentation |

---

*This document is part of the Curatos project for the Dynamous x Kiro Hackathon.*
*Prepared by Gustavo Martini Carriconde with assistance from Claude Code.*
