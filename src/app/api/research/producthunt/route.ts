import { NextRequest, NextResponse } from 'next/server';
import { getProductHuntClient } from '@/lib/api/producthunt';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }
    
    const client = getProductHuntClient();
    if (!client) {
      return NextResponse.json({ products: [] }); // Return empty if no token
    }
    
    const products = await client.searchProducts(query);
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error('[API] Product Hunt error:', error);
    return NextResponse.json({ products: [] }); // Fail gracefully
  }
}
