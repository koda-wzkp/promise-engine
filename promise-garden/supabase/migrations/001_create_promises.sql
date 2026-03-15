CREATE TABLE promises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  body TEXT NOT NULL,
  domain TEXT NOT NULL CHECK (domain IN ('health', 'work', 'relationships', 'creative', 'financial')),
  status TEXT NOT NULL DEFAULT 'declared' CHECK (status IN ('verified', 'declared', 'degraded', 'violated', 'unverifiable')),
  duration_tier TEXT NOT NULL CHECK (duration_tier IN ('short', 'medium', 'long')),
  stakes_tier TEXT NOT NULL CHECK (stakes_tier IN ('low', 'medium', 'high')),
  check_in_frequency JSONB NOT NULL,
  promisee TEXT NOT NULL DEFAULT 'Self',
  target_date DATE,
  depends_on UUID[] DEFAULT '{}',
  notes TEXT,
  reflection TEXT,
  renegotiated_from TEXT,
  renegotiated_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  reclaimed_by UUID REFERENCES promises(id),
  reclaims UUID REFERENCES promises(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE promises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own promises"
  ON promises FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_promises_user_id ON promises(user_id);
CREATE INDEX idx_promises_domain ON promises(user_id, domain);
CREATE INDEX idx_promises_status ON promises(user_id, status);
