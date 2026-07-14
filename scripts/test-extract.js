import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY
});

async function main() {
  const url = 'https://fluid.io';
  const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}` },
    body: JSON.stringify({ url, formats: ['markdown'], timeout: 25000 })
  });
  const scrapedData = await firecrawlRes.json();
  const markdownContext = scrapedData.data?.markdown || '';
  
  const prompt = `
You are a ruthless, cynical startup auditor.
Based on the following markdown scraped from a landing page, your first task is to determine if this is a valid SaaS, B2B, or B2C startup/company. 
If it is a personal portfolio, blog, github repository, or agency, set "is_valid_startup" to false and provide a professional, elegant rejection message in "invalid_reason" (e.g., "This appears to be a personal portfolio. Verdict is designed specifically for SaaS and startup landing pages. Please provide a valid company URL.").
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

  const aiResponse = await openai.chat.completions.create({
    model: 'gemini-3.5-flash',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.0,
    response_format: { type: 'json_object' }
  });

  const text = aiResponse.choices[0]?.message?.content;
  console.log("RAW LLM OUTPUT:\n" + text);
  try {
    JSON.parse(text);
    console.log("JSON is valid!");
  } catch (e) {
    console.log("JSON is INVALID!", e.message);
  }
}
main();
