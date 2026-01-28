# Day 2: Frontend Integration Plan

**Goal:** Connect UI to cycle endpoint with polling mechanism

## Tasks

### 1. Create Continuous Mode Toggle Component
- [ ] `src/components/dashboard/ContinuousModeToggle.tsx`
- [ ] Toggle switch with ON/OFF states
- [ ] Start/stop polling on toggle
- [ ] Visual indicator when active

### 2. Implement Polling Hook
- [ ] `src/hooks/useContinuousMode.ts`
- [ ] Poll `/api/research/cycle` every 15s
- [ ] Handle session creation/resumption
- [ ] Update local state from server response
- [ ] Error handling and retry logic

### 3. Add Session Controls
- [ ] Pause button
- [ ] Resume button
- [ ] Stop button
- [ ] Cycle counter display

### 4. Real-time State Updates
- [ ] Update hypotheses from server
- [ ] Update solutions from server
- [ ] Update requirements from server
- [ ] Sync agent rationale messages

### 5. Event Timeline Component
- [ ] `src/components/dashboard/EventTimeline.tsx`
- [ ] Fetch events from `/api/session/events/:id`
- [ ] Display recent actions
- [ ] Show confidence scores
- [ ] Timestamp formatting

## API Endpoints Needed

- [x] `POST /api/research/cycle` (Day 1 ✅)
- [ ] `GET /api/session/status/:id`
- [ ] `POST /api/session/pause/:id`
- [ ] `POST /api/session/resume/:id`
- [ ] `GET /api/session/events/:id`

## Testing

- [ ] Manual test with toggle
- [ ] Verify state persistence
- [ ] Test pause/resume
- [ ] Check event logging
- [ ] Validate concurrent access handling
