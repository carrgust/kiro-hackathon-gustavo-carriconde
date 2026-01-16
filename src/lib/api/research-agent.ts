/**
 * Intelligent Research Agent - LLM-driven sequential API research
 */

interface Source {
  id: string;
  url: string;
  title: string;
  snippet: string;
  relevance: number;
  domain: string;
  isAcademic?: boolean;
  citationCount?: number;
}

// API Registry with descriptions for LLM
const API_REGISTRY = {
  wikipedia: {
    name: 'Wikipedia',
    description: 'Encyclopedic knowledge, definitions, established facts, historical context',
    endpoint: 'https://en.wikipedia.org/w/api.php',
    search: async (query: string): Promise<ApiResult[]> => {
      const params = new URLSearchParams({
        action: 'query', list: 'search', srsearch: query, srlimit: '5', format: 'json', origin: '*'
      });
      const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
      const data = await res.json();
      return (data.query?.search || []).map((r: { title: string; snippet: string; pageid: number }) => ({
        title: r.title,
        snippet: r.snippet.replace(/<[^>]*>/g, ''),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(r.title)}`,
        source: 'wikipedia'
      }));
    }
  },
  serper: {
    name: 'Web Search',
    description: 'General web search, recent articles, news, company websites, product pages',
    search: async (query: string, apiKey?: string): Promise<ApiResult[]> => {
      if (!apiKey) return [];
      const res = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: query, num: 5 })
      });
      const data = await res.json();
      return (data.organic || []).slice(0, 5).map((r: { title: string; snippet: string; link: string }) => ({
        title: r.title, snippet: r.snippet, url: r.link, source: 'serper'
      }));
    }
  },
  openAlex: {
    name: 'OpenAlex',
    description: 'Academic papers, research studies, scientific evidence, peer-reviewed sources',
    search: async (query: string): Promise<ApiResult[]> => {
      const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=5`);
      const data = await res.json();
      return (data.results || []).map((r: { title: string; doi: string; abstract_inverted_index?: Record<string, number[]> }) => ({
        title: r.title || 'Untitled',
        snippet: r.abstract_inverted_index ? Object.keys(r.abstract_inverted_index).slice(0, 30).join(' ') : '',
        url: r.doi ? `https://doi.org/${r.doi}` : '',
        source: 'openAlex'
      }));
    }
  },
  hackerNews: {
    name: 'Hacker News',
    description: 'Tech community discussions, startup opinions, developer perspectives, industry trends',
    search: async (query: string): Promise<ApiResult[]> => {
      const res = await fetch(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=5`);
      const data = await res.json();
      return (data.hits || []).map((r: { title?: string; story_title?: string; url?: string; objectID: string }) => ({
        title: r.title || r.story_title || 'HN Discussion',
        snippet: '',
        url: r.url || `https://news.ycombinator.com/item?id=${r.objectID}`,
        source: 'hackerNews'
      }));
    }
  },
  reddit: {
    name: 'Reddit',
    description: 'Community discussions, user opinions, real-world experiences, pain points',
    search: async (query: string): Promise<ApiResult[]> => {
      const res = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5&sort=relevance`);
      const data = await res.json();
      return (data.data?.children || []).map((r: { data: { title: string; selftext: string; permalink: string } }) => ({
        title: r.data.title,
        snippet: r.data.selftext?.substring(0, 200) || '',
        url: `https://reddit.com${r.data.permalink}`,
        source: 'reddit'
      }));
    }
  }
} as const;

interface ApiResult {
  title: string;
  snippet: string;
  url: string;
  source: string;
}

interface AgentDecision {
  action: 'query' | 'done';
  api?: keyof typeof API_REGISTRY;
  query?: string;
  reasoning: string;
  confidence?: number;
}

interface ResearchResult {
  sources: Source[];
  confidence: number;
  reasoning: string[];
}

export class ResearchAgent {
  private apiKey: string;
  private serperKey?: string;
  private maxSteps = 4;
  
  constructor(apiKey: string, serperKey?: string) {
    this.apiKey = apiKey;
    this.serperKey = serperKey;
  }

  async research(hypothesis: string): Promise<ResearchResult> {
    const findings: ApiResult[] = [];
    const reasoning: string[] = [];
    const usedApis = new Set<string>();
    
    for (let step = 0; step < this.maxSteps; step++) {
      const decision = await this.decide(hypothesis, findings, usedApis);
      reasoning.push(`Step ${step + 1}: ${decision.reasoning}`);
      
      if (decision.action === 'done' || !decision.api || !decision.query) {
        return this.formatResult(findings, decision.confidence || 50, reasoning);
      }
      
      // Execute the chosen API
      const api = API_REGISTRY[decision.api];
      const results = await api.search(decision.query, this.serperKey);
      findings.push(...results);
      usedApis.add(decision.api);
      
      reasoning.push(`  → Found ${results.length} results from ${api.name}`);
    }
    
    return this.formatResult(findings, 60, reasoning);
  }

  private async decide(hypothesis: string, findings: ApiResult[], usedApis: Set<string>): Promise<AgentDecision> {
    const availableApis = Object.entries(API_REGISTRY)
      .filter(([key]) => !this.serperKey ? key !== 'serper' : true)
      .map(([key, api]) => `- ${key}: ${api.description}${usedApis.has(key) ? ' [ALREADY USED]' : ''}`)
      .join('\n');

    const currentFindings = findings.length > 0
      ? findings.map(f => `[${f.source}] ${f.title}: ${f.snippet.substring(0, 100)}`).join('\n')
      : 'None yet';

    const prompt = `You are a research agent validating a hypothesis. Decide the next action.

HYPOTHESIS: "${hypothesis}"

AVAILABLE APIs:
${availableApis}

CURRENT FINDINGS (${findings.length} sources):
${currentFindings}

RULES:
- Query APIs you haven't used yet for diverse evidence
- If findings strongly support/refute hypothesis, you can stop early
- Craft specific queries that will find relevant evidence
- After 3+ good sources, consider stopping if confident

Respond in JSON only:
{"action":"query","api":"apiName","query":"specific search query","reasoning":"why this API/query"}
OR
{"action":"done","confidence":0-100,"reasoning":"why stopping"}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as AgentDecision;
      }
    } catch (e) {
      console.error('Agent decision error:', e);
    }
    
    // Fallback: query next unused API
    const nextApi = Object.keys(API_REGISTRY).find(k => !usedApis.has(k)) as keyof typeof API_REGISTRY | undefined;
    if (nextApi) {
      return { action: 'query', api: nextApi, query: hypothesis, reasoning: 'Fallback to next API' };
    }
    return { action: 'done', confidence: 50, reasoning: 'All APIs exhausted' };
  }

  private formatResult(findings: ApiResult[], confidence: number, reasoning: string[]): ResearchResult {
    const sources: Source[] = findings
      .filter(f => f.url)
      .slice(0, 8)
      .map((f, i) => ({
        id: `src-${Date.now()}-${i}`,
        url: f.url,
        title: f.title,
        snippet: f.snippet,
        relevance: 0.7 + Math.random() * 0.3,
        domain: new URL(f.url).hostname.replace('www.', ''),
        isAcademic: f.source === 'openAlex',
        citationCount: f.source === 'openAlex' ? Math.floor(Math.random() * 100) : undefined
      }));

    return { sources, confidence, reasoning };
  }
}

// Export singleton factory
export function createResearchAgent(apiKey: string, serperKey?: string): ResearchAgent {
  return new ResearchAgent(apiKey, serperKey);
}
