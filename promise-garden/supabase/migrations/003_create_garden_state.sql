CREATE TABLE garden_state (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  plants JSONB NOT NULL DEFAULT '[]',
  wildlife JSONB NOT NULL DEFAULT '[]',
  landscape JSONB NOT NULL DEFAULT '{}',
  last_computed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE garden_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own garden state"
  ON garden_state FOR ALL
  USING (auth.uid() = user_id);
