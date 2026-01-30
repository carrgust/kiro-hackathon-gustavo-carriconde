import { NextRequest, NextResponse } from 'next/server';
import { PRDSchema } from '@/lib/autocoder/types';
import { runAutoCoderPipeline } from '@/lib/autocoder/engine';
import { sessions } from '@/lib/autocoder/sessions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prd } = body;

    const parsed = PRDSchema.safeParse(prd);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid PRD', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { html: '', events: [], features: [], status: 'running' });

    // Fire-and-forget pipeline
    (async () => {
      try {
        for await (const event of runAutoCoderPipeline(parsed.data, sessionId)) {
          const session = sessions.get(sessionId);
          if (!session) break;

          session.events.push(event);

          if (event.type === 'preview_updated' && typeof event.html === 'string') {
            session.html = event.html;
          }
          if (event.type === 'pipeline_completed' || event.type === 'error') {
            session.status = event.type === 'error' ? 'error' : 'completed';
          }
        }
      } catch (error) {
        const session = sessions.get(sessionId);
        if (session) {
          session.status = 'error';
          session.events.push({
            type: 'error',
            timestamp: new Date().toISOString(),
            message: String(error),
          });
        }
      }
    })();

    return NextResponse.json({ sessionId });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start autocoder' }, { status: 500 });
  }
}
