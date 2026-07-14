export const maxDuration = 300;
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { extractContext } from '@/lib/engine';
import { redis } from '@/lib/redis';
const handleRequest = async (req: Request) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Rate Limiting (1 audit per 12 hours)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `rate_limit:${ip}`;
    
    // const lastAudit = await redis.get(rateLimitKey);
    
    // if (lastAudit) {
    //   return NextResponse.json(
    //     { error: 'RATE_LIMIT_EXCEEDED' },
    //     { status: 429 }
    //   );
    // }

    const extractedData = await extractContext(url);
    
    // Set rate limit for 12 hours (43200 seconds)
    // await redis.set(rateLimitKey, Date.now(), 'EX', 43200);

    return NextResponse.json(extractedData);
  } catch (error: unknown) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

export const POST = handleRequest;
