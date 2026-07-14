import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || ''
});

// We keep the models exact to what the user explicitly tested and proved fast
const MODEL_NAME = 'gemini-3.5-flash';

// Define explicit schemas for the structured outputs
const extractSchema = {
  type: Type.OBJECT,
  properties: {
    is_valid_startup: { type: Type.BOOLEAN },
    invalid_reason: { type: Type.STRING },
    company_name: { type: Type.STRING },
    inferred_description: { type: Type.STRING },
    target_audience: { type: Type.STRING },
    primary_cta: { type: Type.STRING }
  },
  required: ["is_valid_startup", "invalid_reason", "company_name", "inferred_description", "target_audience", "primary_cta"]
};

const pillarSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER },
    confidence: { type: Type.STRING },
    reason: { type: Type.STRING },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["score", "confidence", "reason", "strengths", "weaknesses"]
};

const priorityMatrixItemSchema = {
  type: Type.OBJECT,
  properties: {
    task: { type: Type.STRING },
    impact: { type: Type.STRING },
    effort: { type: Type.STRING },
    why: { type: Type.STRING }
  },
  required: ["task", "impact", "effort", "why"]
};

const auditProperties = {
  company_name: { type: Type.STRING },
  score_interpretation: { type: Type.STRING },
  pillars: {
    type: Type.OBJECT,
    properties: {
      positioning: pillarSchema,
      messaging: pillarSchema,
      website_ux: pillarSchema,
      conversion: pillarSchema,
      trust: pillarSchema,
      competition: pillarSchema,
      growth_foundation: pillarSchema
    },
    required: ["positioning", "messaging", "website_ux", "conversion", "trust", "competition", "growth_foundation"]
  },
  the_verdict: {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING },
      primary_constraint: { type: Type.STRING },
      highest_opportunity: { type: Type.STRING },
      estimated_impact: { type: Type.STRING }
    },
    required: ["status", "primary_constraint", "highest_opportunity", "estimated_impact"]
  },
  priority_matrix: {
    type: Type.ARRAY,
    items: priorityMatrixItemSchema
  }
};

const auditSchema = {
  type: Type.OBJECT,
  properties: auditProperties,
  required: ["company_name", "score_interpretation", "pillars", "the_verdict", "priority_matrix"]
};

const fullAuditSchema = {
  type: Type.OBJECT,
  properties: {
    is_valid_startup: { type: Type.BOOLEAN },
    invalid_reason: { type: Type.STRING },
    ...auditProperties
  },
  required: ["is_valid_startup", "invalid_reason", "company_name", "score_interpretation", "pillars", "the_verdict", "priority_matrix"]
};

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

  // 2. Extract with Gemini
  const prompt = `
You are a ruthless, cynical startup auditor.
Based on the following markdown scraped from a landing page, your first task is to determine if this is a valid SaaS, B2B, or B2C startup/company. 
If it is a personal portfolio, blog, github repository, or agency, set "is_valid_startup" to false and provide a professional, elegant rejection message in "invalid_reason" (e.g., "This appears to be a personal portfolio. Verdict is designed specifically for SaaS and startup landing pages. Please provide a valid company URL.").
If it is a valid startup, extract the exact company name, a brutally honest inferred description of what they actually do (cut through the marketing fluff), and who their real target audience is.

Markdown Content:
${markdownContext}
  `;

  // The native Google GenAI SDK automatically handles standard retries internally.
  const aiResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: extractSchema,
    }
  });

  const resultText = aiResponse.text;
  if (!resultText) {
    throw new Error('No response from AI engine');
  }

  let extractedData;
  try {
    extractedData = JSON.parse(resultText);
  } catch (e) {
    console.warn("[extractContext] JSON parsing failed:", e);
    throw new Error("The AI failed to generate a valid analysis for this website. Please try again.");
  }

  if (extractedData?.is_valid_startup === false) {
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
  `;

  const aiResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: auditSchema,
    }
  });

  const resultText = aiResponse.text;
  if (!resultText) {
    throw new Error('No response from AI engine');
  }

  let auditData;
  try {
    auditData = JSON.parse(resultText);
  } catch (e) {
    console.warn("[generateAudit] JSON parsing failed:", e);
    throw new Error("The AI failed to generate a valid audit for this website. Please try again.");
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
        timeout: 10000 // fail faster to save time
      }),
      signal: AbortSignal.timeout(10000)
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
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: { 'Accept': 'text/plain' },
        signal: AbortSignal.timeout(8000)
      });
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

Markdown Content:
${markdownContext}
  `;

  const aiResponse = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      temperature: 0.0,
      responseMimeType: 'application/json',
      responseSchema: fullAuditSchema,
    }
  });

  const resultText = aiResponse.text;
  if (!resultText) {
    throw new Error('No response from AI engine');
  }

  let extractedData;
  try {
    extractedData = JSON.parse(resultText);
  } catch (e) {
    console.warn("[performFullAudit] JSON parsing failed:", e);
    throw new Error("The AI failed to generate a valid analysis for this website. Please try again.");
  }

  if (extractedData?.is_valid_startup === false) {
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
