import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey: process.env.GEMINI_API_KEY || ''
});

function robustJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Attempt to extract JSON from markdown code blocks
    const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      try {
        return JSON.parse(match[1]);
      } catch {}
    }
    // Attempt to find the first '{' and last '}' or '[' and ']'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    
    let start = -1;
    let end = -1;
    
    if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1 && lastBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }
    
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {}
    }
    
    throw e;
  }
}

async function callLLMWithRetry(prompt: string) {
  let retries = 3;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastError: any = null;
  while (retries > 0) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gemini-3.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.0,
        response_format: { type: 'json_object' }
      });
      return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      lastError = e;
      // If we get a 503 Service Unavailable or 504 Gateway Timeout or 429 Rate Limit from Gemini
      if (
        (e.status && [503, 504, 429].includes(e.status)) || 
        (e.message && (e.message.includes('503') || e.message.includes('504') || e.message.includes('429')))
      ) {
        retries--;
        if (retries > 0) {
          await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds and retry
        }
      } else {
        throw e; // throw immediately for other errors
      }
    }
  }
  
  // If we exhausted retries
  if (lastError && (lastError.status === 503 || (lastError.message && lastError.message.includes('503')))) {
    throw new Error('The AI service is currently overloaded (503). Please try again in a few moments.');
  }
  throw lastError;
}

export async function extractContext(url: string) {
  let markdownContext = '';

  // 1. Scrape with Firecrawl
  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  try {
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${firecrawlKey}`,
      },
      body: JSON.stringify({ 
        url, 
        formats: ['markdown'],
        timeout: 25000 // fail faster to trigger fallback
      }),
    });

    if (firecrawlRes.ok) {
      const scrapedData = await firecrawlRes.json();
      markdownContext = scrapedData.data?.markdown || '';
    }
  } catch (e) {
    console.warn("Firecrawl scraping failed or timed out:", e);
  }

  // 2. Fallback to Jina AI if Firecrawl fails or gets blocked
  if (!markdownContext || markdownContext.length < 50) {
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain' },
        signal: AbortSignal.timeout(15000)
      });
      if (jinaRes.ok) {
        markdownContext = await jinaRes.text();
      }
    } catch (e) {
      console.warn("Jina AI fallback failed or timed out:", e);
    }
  }

  // 3. Last Resort Fallback to Native Fetch (Raw HTML)
  if (!markdownContext || markdownContext.length < 50) {
    try {
      const nativeRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(10000)
      });
      if (nativeRes.ok) {
        const html = await nativeRes.text();
        // Extremely crude strip of scripts and styles to avoid massive token count
        markdownContext = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ').trim();
      }
    } catch (e) {
      console.warn("Native fetch fallback failed:", e);
    }
  }

  if (!markdownContext || markdownContext.length < 50) {
    throw new Error('This website took too long to load or is actively blocking our scraper. Please try another URL.');
  }

  // 2. Extract with GLM-5.2
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

  const aiResponse = await callLLMWithRetry(prompt);

  const resultText = aiResponse.choices[0]?.message?.content;
  if (!resultText) {
     throw new Error('No response from glm 5.2');
  }

  let extractedData = robustJsonParse(resultText);
  if (Array.isArray(extractedData) && extractedData.length > 0) {
    extractedData = extractedData[0];
  }

  if (extractedData.is_valid_startup === false) {
    throw new Error(extractedData.invalid_reason || 'This URL is not a valid startup or company website.');
  }

  return extractedData;
}

export async function generateAudit(url: string, extractedContext: Record<string, unknown>) {
  const company_name = extractedContext.company_name as string;
  const inferred_description = extractedContext.inferred_description as string;
  const target_audience = extractedContext.target_audience as string;

  const prompt = `
# ROLE & PERSONA
You are an elite Silicon Valley Growth Consultant, a seasoned YC Partner, and a completely fair, objective Judge. You are the core intelligence engine for Verdict. Your purpose is to provide a highly accurate, dynamic diagnostic assessment of a startup's growth readiness based on web-scraped data. You do not sugarcoat reality, but you are never rude or mocking. You speak with analytical precision and calm, professional authority.

# THE GROWTH READINESS FRAMEWORK (GRF) & SCORING RUBRIC
Evaluate the provided website data across 7 pillars. For each pillar, assign a precise score from 0 to 100.
100 means absolutely flawless execution (rare). 50 means average/mediocre. 0 means complete failure.

CRITICAL INSTRUCTION FOR SCORING:
You must be a completely FAIR and OBJECTIVE judge. Evaluate strictly on merit. If a startup is executing exceptionally well and deserves a 90 or 100, award it that score without hesitation. If a startup is doing poorly and deserves a 20 or 30, score it exactly that. DO NOT default to 100/100 just to be polite, but DO NOT artificially skew low either. Assess the actual evidence on the page and score the reality. Use the full spectrum from 0 to 100 based purely on the quality of execution.

1. Positioning (Weight: 20%) - Is the ICP obvious? Is the value prop specific?
2. Messaging (Weight: 15%) - Is it free of buzzwords? Are there clear outcomes?
3. Website & UX (Weight: 15%) - Is the information hierarchy logical and readable?
4. Conversion (Weight: 15%) - Is the CTA clear? Is pricing transparent?
5. Trust & Credibility (Weight: 10%) - Are there real testimonials, metrics, and team presence?
6. Market & Competition (Weight: 10%) - Do they differentiate from the status quo?
7. Growth Foundation (Weight: 15%) - Is there a scalable acquisition loop visible?

# CONFIDENCE SCORES
For each pillar, assign a Confidence Level (High, Medium, Low). 
- High: The page provided extensive data to make this judgment.
- Low: The judgment is an inference due to missing data on the website.

---
EVALUATE THIS STARTUP:
Company Name: ${company_name}
URL: ${url}
Description: ${inferred_description}
Target Audience: ${target_audience}
---

# OUTPUT SPECIFICATION
You MUST output a strictly formatted JSON object matching the keys below. Do not include markdown blocks outside the JSON. 

{
  "company_name": "${company_name}",
  "score_interpretation": "A 1-sentence meaning of the startup's growth state. You MUST use the name ${company_name} in this sentence.",
  "pillars": {
    "positioning": { "score": 0, "confidence": "High", "reason": "1-sentence justification", "strengths": ["..."], "weaknesses": ["..."] },
    "messaging": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "website_ux": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "conversion": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "trust": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "competition": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "growth_foundation": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] }
  },
  "the_verdict": {
    "status": "e.g., Needs Fundamental Work / Growth Ready",
    "primary_constraint": "e.g., Trust & Credibility",
    "highest_opportunity": "e.g., Un-gate pricing and add testimonials",
    "estimated_impact": "1-sentence explanation of what fixing this achieves."
  },
  "priority_matrix": [
    { "task": "Rewrite hero H1", "impact": "High", "effort": "Low", "why": "Immediate clarity boost" }
  ]
}
  `;

  const aiResponse = await callLLMWithRetry(prompt);

  const resultText = aiResponse.choices[0]?.message?.content;
  if (!resultText) {
     throw new Error('No response from glm 5.2');
  }

  let auditData = robustJsonParse(resultText);
  if (Array.isArray(auditData) && auditData.length > 0) {
    auditData = auditData[0];
  }

  // Calculate overall score from AI's generated pillar scores
  const positioning = auditData.pillars.positioning.score || 0;
  const messaging = auditData.pillars.messaging.score || 0;
  const website = auditData.pillars.website_ux.score || 0;
  const conversion = auditData.pillars.conversion.score || 0;
  const trust = auditData.pillars.trust.score || 0;
  const competition = auditData.pillars.competition.score || 0;
  const growth = auditData.pillars.growth_foundation.score || 0;

  const overallScore = Math.round(
    (positioning * 0.20) + 
    (messaging * 0.15) + 
    (website * 0.15) + 
    (conversion * 0.15) + 
    (trust * 0.10) + 
    (competition * 0.10) + 
    (growth * 0.15)
  );

  return {
    ...auditData,
    overallScore
  };
}

export async function performFullAudit(url: string) {
  let markdownContext = '';

  try {
    const firecrawlRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`
      },
      body: JSON.stringify({ 
        url, 
        formats: ['markdown'],
        timeout: 15000 // fail faster to save time
      }),
    });

    if (firecrawlRes.ok) {
      const scrapedData = await firecrawlRes.json();
      markdownContext = scrapedData.data?.markdown || '';
    }
  } catch (e) {
    console.warn("Firecrawl scraping failed or timed out:", e);
  }

  // Fallback to Jina AI if Firecrawl fails
  if (!markdownContext || markdownContext.length < 50) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (jinaRes.ok) {
        markdownContext = await jinaRes.text();
      }
    } catch (e) {
      console.warn("Jina AI fallback failed or timed out:", e);
    }
  }

  if (!markdownContext || markdownContext.length < 50) {
    throw new Error('This website took too long to load or is actively blocking our scraper. Please try another URL.');
  }

  const prompt = `
# ROLE & PERSONA
You are an elite Silicon Valley Growth Consultant, a seasoned YC Partner, and a ruthless, cynical, yet completely fair Judge. Your purpose is to provide a highly accurate diagnostic assessment of a startup based on web-scraped data.

# INSTRUCTIONS
Based on the following markdown scraped from a landing page, your first task is to determine if this is a valid SaaS, B2B, or B2C startup/company. 
If it is a personal portfolio, blog, github repository, or agency, set "is_valid_startup" to false and provide a professional rejection message in "invalid_reason".
If it is a valid startup, set "is_valid_startup" to true, and evaluate it strictly on merit across 7 pillars. For each pillar, assign a precise score from 0 to 100. DO NOT sugarcoat, DO NOT default to 100.

# PILLARS
1. Positioning (20%) - Is the ICP obvious? Is the value prop specific?
2. Messaging (15%) - Is it free of buzzwords? Clear outcomes?
3. Website & UX (15%) - Logical information hierarchy?
4. Conversion (15%) - Clear CTA? Transparent pricing?
5. Trust & Credibility (10%) - Testimonials, metrics, team?
6. Market & Competition (10%) - Differentiated?
7. Growth Foundation (15%) - Scalable acquisition loop visible?

# CONFIDENCE
For each pillar, assign Confidence (High, Medium, Low). High = lots of data; Low = inferred.

Respond ONLY with a valid JSON object matching this schema:
{
  "is_valid_startup": boolean,
  "invalid_reason": "string (only if false, else empty)",
  "company_name": "string (only if true, else empty)",
  "inferred_description": "string (brutally honest summary, only if true)",
  "target_audience": "string (only if true)",
  "primary_cta": "string (extract the main call to action button text)",
  "score_interpretation": "A 1-sentence meaning of the startup's growth state. You MUST use the company name in this sentence.",
  "pillars": {
    "positioning": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "messaging": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "website_ux": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "conversion": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "trust": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "competition": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] },
    "growth_foundation": { "score": 0, "confidence": "High", "reason": "...", "strengths": ["..."], "weaknesses": ["..."] }
  },
  "the_verdict": {
    "status": "e.g., Needs Fundamental Work / Growth Ready",
    "primary_constraint": "e.g., Trust & Credibility",
    "highest_opportunity": "e.g., Un-gate pricing and add testimonials",
    "estimated_impact": "1-sentence explanation of what fixing this achieves."
  },
  "priority_matrix": [
    { "task": "Rewrite hero H1", "impact": "High", "effort": "Low", "why": "Immediate clarity boost" }
  ]
}

Markdown Content:
${markdownContext}
  `;

  const aiResponse = await callLLMWithRetry(prompt);

  const resultText = aiResponse.choices[0]?.message?.content;
  if (!resultText) {
     throw new Error('No response from glm 5.2');
  }

  let extractedData = robustJsonParse(resultText);
  if (Array.isArray(extractedData) && extractedData.length > 0) {
    extractedData = extractedData[0];
  }

  if (extractedData.is_valid_startup === false) {
    throw new Error(extractedData.invalid_reason || 'This URL is not a valid startup or company website.');
  }

  const positioning = extractedData.pillars?.positioning?.score || 0;
  const messaging = extractedData.pillars?.messaging?.score || 0;
  const website = extractedData.pillars?.website_ux?.score || 0;
  const conversion = extractedData.pillars?.conversion?.score || 0;
  const trust = extractedData.pillars?.trust?.score || 0;
  const competition = extractedData.pillars?.competition?.score || 0;
  const growth = extractedData.pillars?.growth_foundation?.score || 0;

  const overallScore = Math.round(
    (positioning * 0.20) + 
    (messaging * 0.15) + 
    (website * 0.15) + 
    (conversion * 0.15) + 
    (trust * 0.10) + 
    (competition * 0.10) + 
    (growth * 0.15)
  );

  return {
    ...extractedData,
    overallScore
  };
}
