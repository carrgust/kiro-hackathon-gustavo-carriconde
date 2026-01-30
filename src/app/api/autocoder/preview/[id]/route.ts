import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/autocoder/sessions';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = sessions.get(params.id);
  if (!session || !session.html) {
    return new NextResponse(
      '<html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:#e0e0e0;font-family:sans-serif"><p>Building your app...</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  return new NextResponse(session.html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
