CREATE TABLE check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promise_id UUID REFERENCES promises(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  response TEXT NOT NULL CHECK (response IN ('kept', 'partial', 'missed')),
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(promise_id, date)
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own check-ins"
  ON check_ins FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_check_ins_promise ON check_ins(promise_id, date);
CREATE INDEX idx_check_ins_user_date ON check_ins(user_id, date);
