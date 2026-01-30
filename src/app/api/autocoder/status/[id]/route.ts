import { NextRequest, NextResponse } from 'next/server';
import { sessions } from '@/lib/autocoder/sessions';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = sessions.get(params.id);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const after = parseInt(req.nextUrl.searchParams.get('after') || '0');
  const newEvents = session.events.slice(after);

  return NextResponse.json({
    status: session.status,
    totalEvents: session.events.length,
    events: newEvents,
  });
}
