#!/usr/bin/env ts-node

/**
 * Test script for /api/research/cycle endpoint
 * 
 * Usage: npm run test:cycle
 */

async function testCycleEndpoint() {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  
  if (!API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not found in environment');
    process.exit(1);
  }

  const BASE_URL = 'http://localhost:5001';
  
  console.log('🧪 Testing /api/research/cycle endpoint\n');

  try {
    // Test 1: Create new session
    console.log('📝 Test 1: Creating new session...');
    const response1 = await fetch(`${BASE_URL}/api/research/cycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        niche: 'AI-powered developer tools',
        apiKey: API_KEY
      })
    });

    if (!response1.ok) {
      throw new Error(`HTTP ${response1.status}: ${await response1.text()}`);
    }

    const result1 = await response1.json();
    console.log('✅ Session created:', result1.sessionId);
    console.log('   Action:', result1.action);
    console.log('   Thought:', result1.thought?.substring(0, 100) + '...');
    console.log('   Next cycle in:', result1.nextCycleIn, 'ms\n');

    const sessionId = result1.sessionId;

    // Test 2: Execute another cycle
    console.log('📝 Test 2: Executing second cycle...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s

    const response2 = await fetch(`${BASE_URL}/api/research/cycle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        apiKey: API_KEY
      })
    });

    if (!response2.ok) {
      throw new Error(`HTTP ${response2.status}: ${await response2.text()}`);
    }

    const result2 = await response2.json();
    console.log('✅ Second cycle completed');
    console.log('   Action:', result2.action);
    console.log('   Thought:', result2.thought?.substring(0, 100) + '...');
    console.log('   Problems:', result2.state.hypotheses.length);
    console.log('   Solutions:', result2.state.solutions.length);
    console.log('   Requirements:', result2.state.requirements.length);

    console.log('\n✅ All tests passed!');

  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCycleEndpoint();
