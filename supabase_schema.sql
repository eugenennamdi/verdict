-- Create reports table for VERDICT
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    url TEXT NOT NULL,
    fdi_buzzword_density INTEGER NOT NULL,
    fdi_trust_deficit INTEGER NOT NULL,
    fdi_gatekeeping_friction INTEGER NOT NULL,
    fdi_feature_ratio INTEGER NOT NULL,
    fdi_overall_score INTEGER NOT NULL,
    verdict_value_prop TEXT NOT NULL,
    verdict_evidence_deficit TEXT NOT NULL,
    verdict_revenue_viability TEXT NOT NULL,
    verdict_distribution_moat TEXT NOT NULL,
    verdict_intent_friction TEXT NOT NULL,
    verdict_competitive_overlap TEXT NOT NULL,
    verdict_terminal_risk TEXT NOT NULL,
    executive_summary TEXT NOT NULL,
    first_impression_teardown TEXT NOT NULL,
    top_5_priorities JSONB NOT NULL,
    key_risks JSONB NOT NULL,
    growth_plan_30_day JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow public read access to reports (since they are shared via UUID)
CREATE POLICY "Allow public read access to reports"
    ON public.reports
    FOR SELECT
    USING (true);

-- Allow public insert access (for the backend API to insert anonymously, though usually backend uses service role. Since we use Anon key for simplicity, we allow insert)
CREATE POLICY "Allow public insert access to reports"
    ON public.reports
    FOR INSERT
    WITH CHECK (true);
