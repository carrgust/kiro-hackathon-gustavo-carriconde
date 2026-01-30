import { callWithFallback } from './model-client';

interface QuerySet {
  [sourceKey: string]: string;
}

// Cache: avoids regenerating queries for the same idea
let cachedQueries: { idea: string; queries: Record<string, Record<string, QuerySet>> } | null = null;

export async function buildSmartQueries(
  idea: string,
  geography: string,
  pillars: { key: string; name: string; subcategories: { key: string; name: string }[] }[]
): Promise<Record<string, Record<string, QuerySet>>> {
  if (cachedQueries && cachedQueries.idea === idea) return cachedQueries.queries;

  const pillarList = pillars.map(p =>
    p.key + ': ' + p.subcategories.map(s => s.key).join(', ')
  ).join('\n');

  const prompt = 'You generate search engine queries for business idea validation research.\n\n' +
    'BUSINESS IDEA: ' + idea + '\n' +
    'GEOGRAPHY: ' + geography + '\n\n' +
    'For each pillar and subcategory below, generate ONE short, specific search query (3-8 words) that a researcher would type into Google, Reddit, or Hacker News to find REAL data about this specific business idea. The queries must be directly related to the actual business concept — never generic.\n\n' +
    'PILLARS:\n' + pillarList + '\n\n' +
    'Return JSON: { "[pillarKey]": { "[subcategoryKey]": { "google": "query", "reddit": "query", "hackernews": "query", "wikipedia": "query", "academic": "query" } } }\n' +
    'Return ONLY the JSON object.';

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    // Fallback without API key
    const fallback: Record<string, Record<string, QuerySet>> = {};
    for (const p of pillars) {
      fallback[p.key] = {};
      for (const s of p.subcategories) {
        const baseQuery = idea.substring(0, 60);
        fallback[p.key][s.key] = {
          google: baseQuery + ' ' + s.name,
          reddit: baseQuery + ' ' + s.name,
          hackernews: baseQuery + ' ' + s.name,
          wikipedia: s.name,
          academic: baseQuery + ' research',
        };
      }
    }
    cachedQueries = { idea, queries: fallback };
    return fallback;
  }

  try {
    const response = await callWithFallback(
      apiKey,
      [{ role: 'user', content: prompt }],
      { temperature: 0.3, maxTokens: 2000, jsonMode: true }
    );
    const parsed = JSON.parse(response);
    cachedQueries = { idea, queries: parsed };
    return parsed;
  } catch {
    // Fallback: use idea text directly as query
    const fallback: Record<string, Record<string, QuerySet>> = {};
    for (const p of pillars) {
      fallback[p.key] = {};
      for (const s of p.subcategories) {
        const baseQuery = idea.substring(0, 60);
        fallback[p.key][s.key] = {
          google: baseQuery + ' ' + s.name,
          reddit: baseQuery + ' ' + s.name,
          hackernews: baseQuery + ' ' + s.name,
          wikipedia: s.name,
          academic: baseQuery + ' research',
        };
      }
    }
    cachedQueries = { idea, queries: fallback };
    return fallback;
  }
}

// Legacy wrapper for backward compatibility
export function buildSearchQuery(keyword: string, pillar: string, subcategory: string, source: string): string {
  return keyword + ' ' + subcategory + ' ' + pillar;
}

// Legacy function for old imports (3-param version)
export function buildQuery(pillarKey: string, apiId: string, keywords: { keyword: string; industry: string }): string {
  return keywords.keyword + ' ' + pillarKey;
}
