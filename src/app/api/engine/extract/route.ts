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
  } catch (error: unknown) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
