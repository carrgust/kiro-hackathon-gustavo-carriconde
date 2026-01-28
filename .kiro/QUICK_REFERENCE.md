# Hybrid Continuous Mode - Quick Reference

## 🚀 Quick Start

```bash
# Start database
npm run db:start

# Start dev server
npm run dev

# Test cycle endpoint
npm run test:cycle
```

## 📡 API Endpoint

### POST /api/research/cycle

**Request:**
```json
{
  "sessionId": "optional-existing-session-id",
  "niche": "AI-powered developer tools",
  "apiKey": "sk-or-v1-..."
}
```

**Response:**
```json
{
  "sessionId": "clxxx...",
  "state": {
    "niche": "...",
    "hypotheses": [...],
    "solutions": [...],
    "requirements": [...]
  },
  "action": "GENERATE_PROBLEM",
  "thought": "Analyzing current state...",
  "nextCycleIn": 15000
}
```

## 🗄️ Database Tables

### ContinuousSession
```sql
SELECT * FROM "ContinuousSession" WHERE enabled = true;
```

### SessionEvent
```sql
SELECT * FROM "SessionEvent" 
WHERE "sessionId" = 'xxx' 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

## 🔒 Advisory Lock

```sql
-- Check if lock is held
SELECT * FROM pg_locks WHERE locktype = 'advisory';

-- Manually release (if needed)
SELECT pg_advisory_unlock(999999);
```

## 🧪 Testing

### Manual Test
```bash
curl -X POST http://localhost:5001/api/research/cycle \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "AI tools",
    "apiKey": "sk-or-v1-..."
  }'
```

### Database Inspection
```bash
# Prisma Studio
npm run db:studio

# Direct SQL
docker exec -it curatos-db psql -U curatos -d curatos_dev
```

## 🎯 Agent Actions

| Action | Description | Parameters |
|--------|-------------|------------|
| GENERATE_PROBLEM | Create problem hypothesis | - |
| GENERATE_SOLUTION | Create solution for problem | problemId |
| GENERATE_REQUIREMENT | Create requirement | solutionId |
| RESEARCH_CARD | Validate hypothesis | cardId |
| THINK | Analyze state | - |
| WAIT | No action | - |

## 📊 Event Types

- `cycle_start` - Cycle begins
- `cycle_complete` - Cycle finishes successfully
- `cycle_error` - Cycle fails
- `pause` - User pauses (Day 2)
- `resume` - User resumes (Day 2)

## 🔧 Troubleshooting

### Lock Stuck
```sql
SELECT pg_advisory_unlock_all();
```

### Session Not Found
Check if session exists:
```sql
SELECT id, niche, enabled FROM "ContinuousSession";
```

### Migration Issues
```bash
npm run db:reset
npm run db:migrate
```

## 📝 Next Steps (Day 2)

1. Create `useContinuousMode` hook
2. Add toggle component
3. Implement polling (15s interval)
4. Add pause/resume controls
5. Display event timeline
