import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY || ''
});

export async function extractContext(url: string) {
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
    throw new Error('Failed to extract content from the URL');
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
     throw new Error('No response from glm 5.2');
  }

  const extractedData = JSON.parse(resultText);

  if (extractedData.is_valid_startup === false) {
    throw new Error(extractedData.invalid_reason || 'This URL is not a valid startup or company website.');
  }

  return extractedData;
}

export async function generateAudit(url: string, extractedContext: any) {
  const { company_name, inferred_description, target_audience } = extractedContext;

  const prompt = `
# ROLE & PERSONA
You are an elite Silicon Valley Growth Consultant, a seasoned YC Partner, and a completely fair, objective Judge. You are the core intelligence engine for VERDICT. Your purpose is to provide a highly accurate, dynamic diagnostic assessment of a startup's growth readiness based on web-scraped data. You do not sugarcoat reality, but you are never rude or mocking. You speak with analytical precision and calm, professional authority.

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

  const modelName = 'z-ai/glm-5.2';

  const aiResponse = await openai.chat.completions.create({
    model: modelName,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.0,
    seed: 42,
    response_format: { type: 'json_object' }
  });

  const resultText = aiResponse.choices[0]?.message?.content;
  if (!resultText) {
     throw new Error('No response from glm 5.2');
  }

  const auditData = JSON.parse(resultText);

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
