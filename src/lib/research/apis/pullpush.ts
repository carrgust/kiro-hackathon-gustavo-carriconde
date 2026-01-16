import { APIResult } from './types';

export async function searchPullPush(query: string): Promise<APIResult> {
  const start = Date.now();
  try {
    // Use old.reddit.com which is more permissive with server requests
    const url = `https://old.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=8&sort=relevance&t=year`;
    const res = await fetch(url, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (compatible; CuratosDNA/1.0; +https://curatos.dev)',
        'Accept': 'application/json'
      } 
    });
    
    if (!res.ok) {
      // Fallback: try the Pushshift API mirror
      return searchPushshiftFallback(query, start);
    }
    
    const json = await res.json();
    const results = (json.data?.children || []).map((item: any) => ({
      title: item.data?.title || 'Reddit Post',
      snippet: `r/${item.data?.subreddit} • ${item.data?.score || 0} upvotes • ${item.data?.num_comments || 0} comments`,
      url: `https://reddit.com${item.data?.permalink}`
    }));
    console.log(`[PullPush] ✓ ${results.length} results in ${Date.now() - start}ms`);
    return { source: 'Reddit', success: true, data: results, queryTime: Date.now() - start };
  } catch (e: any) {
    console.error(`[PullPush] ✗ ${e.message}`);
    return searchPushshiftFallback(query, start);
  }
}

// Fallback using search.pushshift.io
async function searchPushshiftFallback(query: string, start: number): Promise<APIResult> {
  try {
    const url = `https://api.pushshift.io/reddit/search/submission/?q=${encodeURIComponent(query)}&size=5&sort=score&sort_type=desc`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CuratosDNA/1.0' }
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const json = await res.json();
    const results = (json.data || []).map((item: any) => ({
      title: item.title || 'Reddit Post',
      snippet: `r/${item.subreddit} • ${item.score || 0} upvotes`,
      url: `https://reddit.com${item.permalink}`
    }));
    console.log(`[PullPush/Pushshift] ✓ ${results.length} results in ${Date.now() - start}ms`);
    return { source: 'Reddit', success: true, data: results, queryTime: Date.now() - start };
  } catch (e: any) {
    console.log(`[PullPush] ⚠ Reddit APIs unavailable`);
    return { source: 'Reddit', success: true, data: [], queryTime: Date.now() - start };
  }
}
