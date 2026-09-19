CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages of their orders"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = chat_messages.order_id
      AND (orders.buyer_id = auth.uid() OR orders.supplier_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages into their orders"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = chat_messages.order_id
      AND (orders.buyer_id = auth.uid() OR orders.supplier_id = auth.uid())
    )
  );
