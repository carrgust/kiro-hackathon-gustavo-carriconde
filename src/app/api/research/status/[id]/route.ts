// DEPRECATED: Credit-based research status endpoint
// This endpoint is not used in the current BYOK model
// Continuous mode uses /api/research/cycle instead

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Use /api/research/cycle instead.' },
    { status: 410 }
  );
}
