-- ============================================================
-- Migration: 002_rls_policies
-- Bozor-Analitika MVP — Phase 3: Row Level Security
-- ============================================================

-- ── PROFILES ─────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Own read/update
CREATE POLICY "profiles_own_read"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "profiles_admin_all"  ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Buyers/suppliers can see company_name + trust_score of any profile (for listing cards)
-- but NOT phone, TIN, address (those fields are simply not selected in queries)
CREATE POLICY "profiles_public_limited" ON profiles FOR SELECT
  USING (TRUE);   -- column-level restriction enforced at query layer

-- ── LISTINGS ─────────────────────────────────────────────────
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings_public_read"    ON listings FOR SELECT USING (is_active = TRUE);
CREATE POLICY "listings_supplier_all"   ON listings FOR ALL   USING (auth.uid() = supplier_id);
CREATE POLICY "listings_admin_all"      ON listings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── LISTING PRICING TIERS ────────────────────────────────────
ALTER TABLE listing_pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tiers_public_read" ON listing_pricing_tiers FOR SELECT USING (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND is_active = TRUE)
);
CREATE POLICY "tiers_supplier_all" ON listing_pricing_tiers FOR ALL USING (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_id AND supplier_id = auth.uid())
);

-- ── PURCHASE REQUESTS ────────────────────────────────────────
ALTER TABLE purchase_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rfq_buyer_all"   ON purchase_requests FOR ALL   USING (auth.uid() = buyer_id);
CREATE POLICY "rfq_admin_all"   ON purchase_requests FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── MATCH RESULTS ────────────────────────────────────────────
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "matches_buyer_read" ON match_results FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM purchase_requests pr
    WHERE pr.id = match_results.purchase_request_id
    AND pr.buyer_id = auth.uid()
  )
);
CREATE POLICY "matches_admin_all" ON match_results FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── ORDERS ───────────────────────────────────────────────────
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orders_buyer_read"    ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "orders_supplier_read" ON orders FOR SELECT USING (auth.uid() = supplier_id);
CREATE POLICY "orders_supplier_update" ON orders FOR UPDATE USING (auth.uid() = supplier_id);
CREATE POLICY "orders_admin_all"     ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── ORDER TIMELINE ───────────────────────────────────────────
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_order_parties_read" ON order_timeline FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_timeline.order_id
    AND (o.buyer_id = auth.uid() OR o.supplier_id = auth.uid())
  )
);
CREATE POLICY "timeline_admin_all" ON order_timeline FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── FINANCIAL LEDGER ─────────────────────────────────────────
ALTER TABLE financial_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ledger_supplier_read" ON financial_ledger FOR SELECT
  USING (auth.uid() = supplier_id);
CREATE POLICY "ledger_admin_all"     ON financial_ledger FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── RATINGS ──────────────────────────────────────────────────
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_rater_insert" ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);
CREATE POLICY "ratings_public_read"  ON ratings FOR SELECT USING (TRUE);
CREATE POLICY "ratings_admin_all"    ON ratings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ── NOTIFICATIONS ────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_own_read"   ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_own_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_admin_all"  ON notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
