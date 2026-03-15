CREATE TABLE summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  reliability_by_domain JSONB NOT NULL,
  overall_reliability NUMERIC(5,4),
  wildlife_changes JSONB,
  landscape_changes JSONB,
  dependency_insights JSONB,
  narrative TEXT,
  user_reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own summaries"
  ON summaries FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_summaries_user ON summaries(user_id, type, period_end);
