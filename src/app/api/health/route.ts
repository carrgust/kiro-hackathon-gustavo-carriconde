import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Note: In production, you'd get API key from environment or session
    // For now, return basic health status
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'curatos-api',
      openrouter: {
        configured: !!process.env.OPENROUTER_API_KEY,
        note: 'API key validation requires client-side key',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
