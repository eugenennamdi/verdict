import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import OpenAI from 'openai';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_API_KEY || ''
});

export async function POST(req: Request) {
  try {
    const { url, company_name, inferred_description, target_audience } = await req.json();

    if (!url || !company_name || !inferred_description || !target_audience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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
       throw new Error('No response from Nvidia NIM');
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

    // Save to Supabase (mapping new GRF schema keys to existing database columns)
    const { data, error } = await supabase
      .from('reports')
      .insert([
        {
          company_name,
          url,
          fdi_buzzword_density: 0,
          fdi_trust_deficit: 0,
          fdi_gatekeeping_friction: 0,
          fdi_feature_ratio: 0,
          fdi_overall_score: overallScore,
          verdict_value_prop: "N/A",
          verdict_evidence_deficit: "N/A",
          verdict_revenue_viability: "N/A",
          verdict_distribution_moat: "N/A",
          verdict_intent_friction: "N/A",
          verdict_competitive_overlap: "N/A",
          verdict_terminal_risk: "N/A",
          executive_summary: auditData.score_interpretation || "N/A",
          first_impression_teardown: "N/A",
          top_5_priorities: auditData.priority_matrix || [],
          key_risks: auditData.the_verdict || {},
          growth_plan_30_day: auditData.pillars || {},
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw new Error('Failed to save report to database');
    }

    return NextResponse.json({ report_id: data.id });
  } catch (error: any) {
    console.error('Audit Engine Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
