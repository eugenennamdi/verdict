import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { extractContext } from '@/lib/engine';
import { redis } from '@/lib/redis';
import { withX402 } from "@okxweb3/app-x402-next";
import { getPaymentServer } from "@/lib/payment";

const handleRequest = async (req: Request) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Rate Limiting (1 audit per 12 hours)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `rate_limit:${ip}`;
    
    const lastAudit = await redis.get(rateLimitKey);
    
    if (lastAudit) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    const extractedData = await extractContext(url);
    
    // Set rate limit for 12 hours (43200 seconds)
    await redis.set(rateLimitKey, Date.now(), 'EX', 43200);

    return NextResponse.json(extractedData);
  } catch (error: unknown) {
    console.error('Extraction Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

const routeConfig = {
  accepts: [
    {
      scheme: "exact" as const,
      network: "eip155:196" as const,
      asset: "0x1E4a5963aBFD975d8c9021ce480b42188849D41d", // USDT on X Layer
      price: "0.25", // 0.25 USDT
      payTo: process.env.PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000",
    }
  ],
  description: "VERDICT Engine Context Extraction",
  resource: "VERDICT-EXTRACT",
};

export const POST = async (req: Request) => {
  const paymentServer = await getPaymentServer();
  const protectedHandler = withX402(handleRequest as any, routeConfig, paymentServer as any);
  return protectedHandler(req as any);
};
