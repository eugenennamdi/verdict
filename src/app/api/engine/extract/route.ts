import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { extractContext } from '@/lib/engine';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const extractedData = await extractContext(url);
    
    return NextResponse.json(extractedData);
  } catch (error: any) {
    console.error('Extract Engine Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: error.message?.includes('not a valid startup') ? 400 : 500 });
  }
}
