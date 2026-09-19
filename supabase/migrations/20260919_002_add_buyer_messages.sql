CREATE TABLE buyer_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  prediction_signal TEXT, -- e.g. "BUY_NOW", "HOLD", "BUY_LATER"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE buyer_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own messages"
  ON buyer_messages
  FOR SELECT
  USING (auth.uid() = buyer_id);
