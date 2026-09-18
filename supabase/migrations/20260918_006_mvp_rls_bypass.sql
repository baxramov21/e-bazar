-- ============================================================
-- Migration: 006_mvp_rls_bypass
-- Bozor-Analitika MVP — Temporarily bypass RLS for ease of testing
-- ============================================================

-- Since the MVP is being tested without active Supabase Auth sessions (auth is bypassed),
-- we will temporarily allow all operations (INSERT, UPDATE, DELETE) for anon users.

CREATE POLICY "mvp_anon_all_purchase_requests" ON purchase_requests FOR ALL USING (true);
CREATE POLICY "mvp_anon_all_orders" ON orders FOR ALL USING (true);
CREATE POLICY "mvp_anon_all_match_results" ON match_results FOR ALL USING (true);
CREATE POLICY "mvp_anon_all_financial_ledger" ON financial_ledger FOR ALL USING (true);
CREATE POLICY "mvp_anon_all_ratings" ON ratings FOR ALL USING (true);
