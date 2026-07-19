import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('fdi_overall_score, attestation_hash, created_at');

    if (error) {
      throw error;
    }

    let total = 70; // Baseline from historical Firecrawl unique queries
    let score0_40 = 20;
    let score41_75 = 42;
    let score76_100 = 8;
    let onchain = 4; // Baseline historical onchain attestations

    const CUTOFF = new Date('2026-07-19T07:20:00Z');

    for (const report of data || []) {
      if (new Date(report.created_at) < CUTOFF) continue;

      total++;
      if (report.attestation_hash) onchain++;
      
      const score = report.fdi_overall_score || 0;
      if (score <= 40) score0_40++;
      else if (score <= 75) score41_75++;
      else score76_100++;
    }

    return NextResponse.json({
      total,
      score0_40,
      score41_75,
      score76_100,
      onchain
    });
  } catch (err: any) {
    console.error("Failed to fetch stats:", err);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
