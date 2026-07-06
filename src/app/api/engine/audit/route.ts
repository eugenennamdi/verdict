import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { generateAudit } from '@/lib/engine';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { url, company_name, inferred_description, target_audience } = await req.json();

    if (!url || !company_name || !inferred_description || !target_audience) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const auditData = await generateAudit(url, { company_name, inferred_description, target_audience });

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

    return NextResponse.json({ report_id: data.id });
  } catch (error: any) {
    console.error('Audit Engine Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
