-- ============================================================
-- Migration: 003_storage_buckets
-- Bozor-Analitika MVP — Phase 6: KYB Documents Storage
-- ============================================================

-- Create the kyb-docs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyb-docs', 'kyb-docs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for kyb-docs
-- Suppliers can upload their own docs (doc name should start with their user_id)
CREATE POLICY "kyb_docs_supplier_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'kyb-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppliers can read their own docs
CREATE POLICY "kyb_docs_supplier_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyb-docs' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can read everything in kyb-docs
CREATE POLICY "kyb_docs_admin_select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'kyb-docs' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
