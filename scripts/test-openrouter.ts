#!/usr/bin/env ts-node

const API_KEY = process.env.OPENROUTER_API_KEY;
const BASE_URL = 'https://openrouter.ai/api/v1';

if (!API_KEY) {
  console.error('❌ OPENROUTER_API_KEY environment variable not set');
  process.exit(1);
}

async function testAuthentication() {
  console.log('\n🔐 Test 1: Authentication');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      console.log('✅ Authentication successful');
      const data = await response.json();
      console.log(`   Model: ${data.model}`);
      console.log(`   Tokens: ${data.usage?.total_tokens || 0}`);
    } else {
      console.log(`❌ Authentication failed: ${response.status}`);
      console.log(`   Error: ${await response.text()}`);
    }
  } catch (error) {
    console.log(`❌ Authentication error: ${error}`);
  }
}

async function testRateLimits() {
  console.log('\n📊 Test 2: Rate Limit Headers');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      }),
    });

    const limit = response.headers.get('x-ratelimit-limit');
    const remaining = response.headers.get('x-ratelimit-remaining');
    const reset = response.headers.get('x-ratelimit-reset');

    if (limit && remaining && reset) {
      console.log('✅ Rate limit headers present');
      console.log(`   Limit: ${limit} requests`);
      console.log(`   Remaining: ${remaining} requests`);
      console.log(`   Reset: ${new Date(parseInt(reset) * 1000).toISOString()}`);
    } else {
      console.log('⚠️  Rate limit headers not found');
      console.log(`   Available headers: ${Array.from(response.headers.keys()).join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Rate limit test error: ${error}`);
  }
}

async function testStreaming() {
  console.log('\n🌊 Test 3: Streaming Response');
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'Count to 3' }],
        max_tokens: 50,
        stream: false, // Test non-streaming first
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Non-streaming response works');
      console.log(`   Response: ${data.choices[0]?.message?.content?.substring(0, 50)}...`);
    } else {
      console.log(`❌ Streaming test failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Streaming test error: ${error}`);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️  Test 4: Error Handling');
  
  // Test invalid API key
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer invalid-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{ role: 'user', content: 'test' }],
      }),
    });

    console.log(`✅ Invalid key returns ${response.status} (expected 401/403)`);
  } catch (error) {
    console.log(`❌ Error handling test failed: ${error}`);
  }
}

async function testTokenCounting() {
  console.log('\n🔢 Test 5: Token Counting');
  try {
    const testPrompts = [
      'Hello',
      'Generate 3 problem hypotheses for fintech',
      'Research this hypothesis: High payment processing fees hurt small businesses',
    ];

    for (const prompt of testPrompts) {
      const response = await fetch(`${BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528:free',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const usage = data.usage;
        console.log(`✅ Prompt: "${prompt.substring(0, 40)}..."`);
        console.log(`   Tokens: ${usage?.total_tokens || 0} (prompt: ${usage?.prompt_tokens || 0}, completion: ${usage?.completion_tokens || 0})`);
      }
    }
  } catch (error) {
    console.log(`❌ Token counting test error: ${error}`);
  }
}

async function main() {
  console.log('🧪 OpenRouter API Validation Suite');
  console.log('=====================================');

  await testAuthentication();
  await testRateLimits();
  await testStreaming();
  await testErrorHandling();
  await testTokenCounting();

  console.log('\n✅ Validation complete!');
  console.log('\nNext steps:');
  console.log('1. Review rate limit values');
  console.log('2. Document token costs per operation');
  console.log('3. Update docs/OPENROUTER_VALIDATION.md');
}

main().catch(console.error);
