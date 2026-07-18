export const maxDuration = 300;
import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { generateAudit } from '@/lib/engine';
import { supabaseAdmin } from '@/lib/supabase';
import { redis } from '@/lib/redis';
import { submitAttestation } from '@/lib/onchain';
const handleRequest = async (req: Request) => {
  try {
    const { url, company_name, inferred_description, target_audience } = await req.json();

    if (!url || !company_name || !inferred_description || !target_audience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SSRF Protection: Prevent scanning localhost or internal IP ranges
    try {
      const targetUrl = new URL(url);
      const hostname = targetUrl.hostname.toLowerCase();
      
      const isLocalUrl = hostname === 'localhost' || 
                          hostname === '127.0.0.1' || 
                          hostname === '::1' || 
                          hostname.endsWith('.local');
                          
      if (isLocalUrl) {
        return NextResponse.json({ error: 'Invalid URL: Localhost or internal IPs are not allowed' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Rate Limiting for the Audit phase (1 per 12 hours)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitKey = `rate_limit_demo:audit:${ip}`;
    
    const lastAudit = await redis.get(rateLimitKey);
    const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
    
    if (lastAudit && !isLocalhost) {
      return NextResponse.json(
        { error: 'RATE_LIMIT_EXCEEDED' },
        { status: 429 }
      );
    }

    const auditData = await generateAudit(url, { company_name, inferred_description, target_audience });
    
    // Set rate limit for 12 hours (43200 seconds)
    await redis.set(rateLimitKey, Date.now(), 'EX', 43200);

    // Save to Supabase (mapping new GRF schema keys to existing database columns)
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert([
        {
          company_name,
          url,
          fdi_buzzword_density: 0,
          fdi_trust_deficit: 0,
          fdi_gatekeeping_friction: 0,
          fdi_feature_ratio: 0,
          fdi_overall_score: auditData.overallScore,
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

    // Try to log attestation onchain
    try {
      const statusStr = auditData.overallScore >= 70 ? 'Pass' : 'Review Needed';
      const hash = await submitAttestation(data.id, url, auditData.overallScore, statusStr);
      
      // Update the database with the transaction hash
      await supabaseAdmin
        .from('reports')
        .update({ attestation_hash: hash })
        .eq('id', data.id);
        
    } catch (onchainError) {
      console.error('Onchain Attestation Error:', onchainError);
      // Don't fail the entire request if onchain logging fails
    }

    return NextResponse.json({ report_id: data.id });
  } catch (error: unknown) {
    console.error('Audit Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
};

export const POST = handleRequest;
