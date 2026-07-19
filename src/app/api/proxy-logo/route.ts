import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let domain = searchParams.get('domain');

  if (!domain) {
    return new NextResponse('Missing domain', { status: 400 });
  }

  // Clean the domain
  domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
  };

  try {
    let response;

    // Attempt 1: logo.dev (highest quality)
    // You can add LOGO_DEV_TOKEN to your .env.local for authenticated access
    const logoDevToken = process.env.LOGO_DEV_TOKEN || process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'pk_YOUR_TOKEN';
    const logoDevUrl = `https://img.logo.dev/${domain}?token=${logoDevToken}&format=png`;
    response = await fetch(logoDevUrl, { headers });

    // Attempt 2: Clearbit (if logo.dev fails or token is invalid)
    if (!response.ok) {
      const clearbitUrl = `https://logo.clearbit.com/${domain}`;
      response = await fetch(clearbitUrl, { headers });
    }
    
    // Attempt 3: Google Favicon (last resort)
    if (!response.ok) {
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      response = await fetch(googleUrl, { headers });
    }

    if (!response.ok) {
        throw new Error("All image sources failed");
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Logo proxy error:', error);
    // Return a beautiful fallback SVG instead of throwing 500
    const fallbackSvg = `
      <svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" fill="#f8fafc"/>
        <path d="M64 36C48.536 36 36 48.536 36 64C36 79.464 48.536 92 64 92C79.464 92 92 79.464 92 64C92 48.536 79.464 36 64 36ZM74.5 76L64 68.125L53.5 76L57.5 63.625L47 56H60L64 43.625L68 56H81L70.5 63.625L74.5 76Z" fill="#cbd5e1"/>
      </svg>
    `.trim();
    
    return new NextResponse(fallbackSvg, { 
      status: 200, 
      headers: { 
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400'
      } 
    });
  }
}
