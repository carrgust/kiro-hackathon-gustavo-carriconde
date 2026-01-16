import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for og:image URLs
const ogImageCache = new Map<string, string | null>();

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ ogImage: null });
    }

    // Check cache first
    if (ogImageCache.has(url)) {
      return NextResponse.json({ ogImage: ogImageCache.get(url) });
    }

    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CuratosBot/1.0)',
          'Accept': 'text/html',
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        ogImageCache.set(url, null);
        return NextResponse.json({ ogImage: null });
      }

      const html = await res.text();
      
      // Extract og:image or twitter:image
      const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      
      const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

      const ogImage = ogMatch?.[1] || twitterMatch?.[1] || null;
      
      // Cache result
      ogImageCache.set(url, ogImage);
      
      // Limit cache size
      if (ogImageCache.size > 500) {
        const firstKey = ogImageCache.keys().next().value;
        if (firstKey) ogImageCache.delete(firstKey);
      }

      return NextResponse.json({ ogImage });
    } catch (e) {
      clearTimeout(timeout);
      ogImageCache.set(url, null);
      return NextResponse.json({ ogImage: null });
    }
  } catch {
    return NextResponse.json({ ogImage: null });
  }
}
