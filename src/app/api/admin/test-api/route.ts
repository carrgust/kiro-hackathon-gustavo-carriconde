import { NextRequest, NextResponse } from 'next/server';
import { MODELS } from '@/lib/config/models';
import { getAPIById } from '@/lib/api-registry';

// Import all API search functions
import { searchWikipedia } from '@/lib/research/apis/wikipedia';
import { searchWikidata } from '@/lib/research/apis/wikidata';
import { searchHackerNews } from '@/lib/research/apis/hackernews';
import { searchOpenAlex } from '@/lib/research/apis/openAlex';
import { searchRemoteOK } from '@/lib/research/apis/remoteok';
import { searchPullPush } from '@/lib/research/apis/pullpush';
import { searchFRED } from '@/lib/research/apis/fred';
import { searchSerper } from '@/lib/research/apis/serper';

export const dynamic = 'force-dynamic';

// Map API IDs to their test functions
const API_TEST_FUNCTIONS: Record<string, (query: string) => Promise<any>> = {
  wikipedia: searchWikipedia,
  wikidata: searchWikidata,
  hackernews: searchHackerNews,
  openalex: searchOpenAlex,
  remoteok: searchRemoteOK,
  pullpush: searchPullPush,
  fred: searchFRED,
  serper: searchSerper,
};

/**
 * Test a specific API connection - returns FULL response details
 */
export async function POST(request: NextRequest) {
  try {
    const { apiId } = await request.json();

    if (!apiId) {
      return NextResponse.json({ error: 'API ID required' }, { status: 400 });
    }

    const apiConfig = getAPIById(apiId);
    if (!apiConfig) {
      return NextResponse.json({ error: 'API not found in registry' }, { status: 404 });
    }

    // Special handling for OpenRouter
    if (apiId === 'openrouter') {
      return await testOpenRouter();
    }

    const testFn = API_TEST_FUNCTIONS[apiId];
    if (!testFn) {
      return NextResponse.json({
        success: false,
        error: 'No test function registered for this API',
        apiId,
        fullResponse: null,
      });
    }

    const start = Date.now();
    const result = await testFn(apiConfig.testQuery);
    const responseTime = Date.now() - start;

    return NextResponse.json({
      success: result.success,
      apiId,
      apiName: apiConfig.name,
      testQuery: apiConfig.testQuery,
      responseTime,
      resultCount: result.data?.length || 0,
      error: result.error || null,
      // Full response details for inspection
      fullResponse: {
        source: result.source,
        success: result.success,
        error: result.error,
        queryTime: result.queryTime,
        dataCount: result.data?.length || 0,
        data: result.data || [],
      },
    });

  } catch (error: any) {
    console.error('API test error:', error.stack);
    return NextResponse.json({
      success: false,
      error: error.message,
      fullResponse: {
        error: error.message,
      },
    }, { status: 500 });
  }
}

/**
 * Test OpenRouter LLM connection - returns FULL response
 */
async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      apiId: 'openrouter',
      error: 'OPENROUTER_API_KEY not configured',
      fullResponse: {
        error: 'Environment variable OPENROUTER_API_KEY is not set',
        keyPresent: false,
      },
    });
  }

  const start = Date.now();
  const requestBody = {
    model: MODELS.GEMINI_LITE,
    messages: [{ role: 'user', content: 'Say "API connection successful" in exactly 4 words.' }],
    max_tokens: 20,
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://curatos-dna.vercel.app',
      },
      body: JSON.stringify(requestBody),
    });

    const responseTime = Date.now() - start;
    const responseText = await response.text();

    let responseJson = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      responseJson = { raw: responseText };
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        apiId: 'openrouter',
        responseTime,
        error: `HTTP ${response.status}`,
        fullResponse: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          request: requestBody,
          response: responseJson,
        },
      });
    }

    const content = responseJson.choices?.[0]?.message?.content || 'No response';

    return NextResponse.json({
      success: true,
      apiId: 'openrouter',
      apiName: 'OpenRouter (LLM)',
      testQuery: 'ping',
      responseTime,
      resultCount: 1,
      fullResponse: {
        status: response.status,
        request: requestBody,
        response: responseJson,
        content,
        model: responseJson.model,
        usage: responseJson.usage,
      },
    });

  } catch (error: any) {
    console.error('OpenRouter test error:', error.stack);
    return NextResponse.json({
      success: false,
      apiId: 'openrouter',
      error: error.message,
      fullResponse: {
        error: error.message,
        request: requestBody,
      },
    });
  }
}

/**
 * Test all APIs at once
 */
export async function GET() {
  const apiIds = ['openrouter', 'serper', 'wikipedia', 'wikidata', 'hackernews', 'openalex', 'remoteok', 'pullpush', 'fred'];

  const promises = apiIds.map(async (apiId) => {
    const apiConfig = getAPIById(apiId);
    if (!apiConfig) return { apiId, success: false, error: 'Not found' };

    try {
      if (apiId === 'openrouter') {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) return { apiId, success: false, error: 'No API key' };

        const start = Date.now();
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: MODELS.GEMINI_LITE,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });
        return {
          apiId,
          apiName: apiConfig.name,
          success: response.ok,
          responseTime: Date.now() - start,
          error: response.ok ? null : `HTTP ${response.status}`,
        };
      }

      const testFn = API_TEST_FUNCTIONS[apiId];
      if (!testFn) return { apiId, success: false, error: 'No test function' };

      const start = Date.now();
      const result = await testFn(apiConfig.testQuery);

      return {
        apiId,
        apiName: apiConfig.name,
        success: result.success,
        responseTime: Date.now() - start,
        resultCount: result.data?.length || 0,
        error: result.error || null,
      };
    } catch (error: any) {
      return { apiId, success: false, error: error.message };
    }
  });

  const allResults = await Promise.all(promises);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalAPIs: apiIds.length,
    successfulAPIs: allResults.filter(r => r.success).length,
    results: allResults,
  });
}
