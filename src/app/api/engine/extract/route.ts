import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // 1. Scrape with Firecrawl
    const firecrawlKey = process.env.FIRECRAWL_API_KEY;
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({ 
        url, 
        formats: ['markdown'],
        timeout: 60000
      }),
    });

    if (!firecrawlRes.ok) {
      if (firecrawlRes.status === 408 || firecrawlRes.statusText.includes('Timeout')) {
        throw new Error('This website took too long to load or is actively blocking our scraper. Please try another URL.');
      }
      throw new Error(`Extraction Error: ${firecrawlRes.statusText}`);
    }

    const scrapedData = await firecrawlRes.json();
    const markdownContext = scrapedData.data?.markdown || '';

    if (!markdownContext) {
      console.error('Firecrawl scrape missing markdown:', scrapedData);
      return NextResponse.json({ error: 'Failed to extract content from the URL' }, { status: 500 });
    }

    // 2. Extract with GLM-5.2
    const prompt = `
You are a ruthless, cynical startup auditor.
Based on the following markdown scraped from a landing page, your first task is to determine if this is a valid SaaS, B2B, or B2C startup/company. 
If it is a personal portfolio, blog, github repository, or agency, set "is_valid_startup" to false and provide a professional, elegant rejection message in "invalid_reason" (e.g., "This appears to be a personal portfolio. VERDICT is designed specifically for SaaS and startup landing pages. Please provide a valid company URL.").
If it is a valid startup, extract the exact company name, a brutally honest inferred description of what they actually do (cut through the marketing fluff), and who their real target audience is.

Respond ONLY with a valid JSON object matching this schema:
{
  "is_valid_startup": boolean,
  "invalid_reason": "string (only if false, else empty string)",
  "company_name": "string (only if true, else empty string)",
  "inferred_description": "string (only if true, else empty string)",
  "target_audience": "string (only if true, else empty string)",
  "primary_cta": "string (extract the main call to action button text)"
}

Markdown Content:
${markdownContext}
    `;

    const modelName = 'z-ai/glm-5.2';

    const aiResponse = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const resultText = aiResponse.choices[0]?.message?.content;
    if (!resultText) {
       throw new Error('No response from Nvidia NIM');
    }

    const extractedData = JSON.parse(resultText);

    if (extractedData.is_valid_startup === false) {
      return NextResponse.json({ error: extractedData.invalid_reason || 'This URL is not a valid startup or company website.' }, { status: 400 });
    }

    return NextResponse.json(extractedData);
  } catch (error: any) {
    console.error('Extract Engine Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
